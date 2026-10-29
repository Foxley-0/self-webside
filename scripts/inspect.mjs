import { spawn } from 'node:child_process'

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const PORT = 9334
const URL = process.argv[2] || 'http://127.0.0.1:5173/'
const EXPR = process.argv[3] || '1+1'
const USER_DIR = 'C:/Users/c4444/AppData/Local/Temp/edge-inspect-profile'

const edge = spawn(
  EDGE,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DIR}`,
    '--no-first-run',
    '--no-default-browser-check',
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
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  throw new Error('CDP 未就绪')
}

const ws = new WebSocket(await waitForPage())
await new Promise((r) => ws.addEventListener('open', r, { once: true }))

let id = 0
const pending = new Map()
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data)
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id)
    pending.delete(m.id)
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result)
  }
})
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const _id = ++id
    pending.set(_id, { resolve, reject })
    ws.send(JSON.stringify({ id: _id, method, params }))
  })

await send('Page.enable')
await send('Runtime.enable')
const VW = Number(process.argv[4] || 1440)
const VH = Number(process.argv[5] || 900)
await send('Emulation.setDeviceMetricsOverride', {
  width: VW, height: VH, deviceScaleFactor: 1, mobile: false,
})
await send('Page.navigate', { url: URL })
await new Promise((r) => setTimeout(r, 3000))

const res = await send('Runtime.evaluate', {
  expression: EXPR,
  returnByValue: true,
  awaitPromise: true,
})
console.log(JSON.stringify(res.result.value, null, 2))

ws.close()
edge.kill()
process.exit(0)
