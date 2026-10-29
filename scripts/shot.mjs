import { spawn } from 'node:child_process'
import fs from 'node:fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9333
const URL = process.argv[2] || 'http://127.0.0.1:5173/'
const OUT = process.argv[3] || 'shots'
const W = Number(process.argv[4] || 1440)
const H = Number(process.argv[5] || 900)
const USER_DIR = 'C:/Users/c4444/AppData/Local/Temp/edge-shot-profile'

fs.mkdirSync(OUT, { recursive: true })

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--proxy-server=http://127.0.0.1:7897',
    '--enable-unsafe-swiftshader',
    '--use-angle=swiftshader',
    '--hide-scrollbars',
    '--disable-extensions',
    'about:blank',
  ],
  { stdio: 'ignore' }
)

async function waitForPage() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/list`)
      const list = await r.json()
      const page = list.find((t) => t.type === 'page')
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl
    } catch {
      /* 端口还没起 */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('CDP 端口未就绪')
}

const wsUrl = await waitForPage()
const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let msgId = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)
  }
})

function send(method, params = {}) {
  const id = ++msgId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

await send('Page.enable')
await send('Runtime.enable')
await send('Network.enable')
await send('Network.setCacheDisabled', { cacheDisabled: true })
await send('Emulation.setDeviceMetricsOverride', {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: false,
})

await send('Page.navigate', { url: URL })
await sleep(9000)
await send('Runtime.evaluate', {
  expression: `try{localStorage.clear()}catch(e){}; document.documentElement.dataset.theme='dark';`,
})
await sleep(1200)

async function capture(name) {
  const metrics = await send('Page.getLayoutMetrics')
  const size = metrics.cssContentSize || metrics.contentSize
  const width = Math.ceil(size.width)
  const height = Math.ceil(size.height)
  const { data } = await send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  })
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'))
  console.log(`saved ${name}.png  ${width}x${height}`)
}

await capture('desktop-dark')

await send('Runtime.evaluate', {
  expression: `document.documentElement.dataset.theme='light'`,
})
await sleep(900)
await capture('desktop-light')

await send('Runtime.evaluate', {
  expression: `document.documentElement.dataset.theme='dark'`,
})
await send('Emulation.setDeviceMetricsOverride', {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
})
await sleep(900)
await capture('mobile-dark')

ws.close()
edge.kill()
process.exit(0)
