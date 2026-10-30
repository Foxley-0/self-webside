import { spawn } from 'node:child_process'
import fs from 'node:fs'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9333
const URL = process.argv[2] || 'http://127.0.0.1:5173/'
const OUT = process.argv[3] || 'shots'
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

async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' })
  fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'))
  console.log(`saved ${name}.png`)
}

async function setTheme(theme) {
  await send('Runtime.evaluate', {
    expression: `document.documentElement.dataset.theme='${theme}'`,
  })
  await sleep(800)
}

async function open(w, h, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: w,
    height: h,
    deviceScaleFactor: 1,
    mobile,
  })
  await send('Page.navigate', { url: URL })
  await sleep(3200)
}

async function toTop() {
  await send('Runtime.evaluate', { expression: 'window.scrollTo(0,0)' })
  await sleep(700)
}

async function toBottom() {
  await send('Runtime.evaluate', {
    expression: 'window.scrollTo(0, document.body.scrollHeight)',
  })
  await sleep(700)
}

// ---------- 1920 暗色 ----------
await open(1920, 1080)
await setTheme('dark')
await shot('fhd-hero-dark')
await toBottom()
await shot('fhd-footer-dark')

// ---------- 1920 亮色 ----------
await setTheme('light')
await toTop()
await shot('fhd-hero-light')
await toBottom()
await shot('fhd-footer-light')

// ---------- 1080 横屏 ----------
await open(1080, 585)
await setTheme('dark')
await toBottom()
await shot('landscape-footer-dark')

// ---------- 390 移动端 ----------
await open(390, 844, true)
await setTheme('dark')
await shot('mobile-hero-dark')
await toBottom()
await shot('mobile-footer-dark')

ws.close()
edge.kill()
process.exit(0)
