// Resolume SMPTE Timecode WebSocket client (CommonJS)
const { ipcMain, webContents } = require('electron')
const WebSocket = require('ws')

function createLogger(prefix) {
  return {
    info: (...args) => console.log(`[Timecode] ${prefix}`, ...args),
    warn: (...args) => console.warn(`[Timecode] ${prefix}`, ...args),
    error: (...args) => console.error(`[Timecode] ${prefix}`, ...args),
  }
}

function buildWsUrl({ host, port, path }) {
  const h = host || '127.0.0.1'
  const p = port || 8080
  const base = path.startsWith('/') ? path : `/${path}`
  return `ws://${h}:${p}${base}`
}

function extractTimecode(payload) {
  try {
    const obj = typeof payload === 'string' ? JSON.parse(payload) : payload
    const keys = JSON.stringify(obj).toLowerCase()
    const hasTimecode = keys.includes('smpte') || keys.includes('timecode') || keys.includes('transport')
    if (!hasTimecode) return null

    let timecodeStr = obj?.smpte?.timecode || obj?.timecode?.value || obj?.transport?.timecode || obj?.timecode
    let frames = obj?.smpte?.frames ?? obj?.transport?.frames ?? obj?.frames
    let running = obj?.smpte?.running ?? obj?.transport?.running ?? obj?.running

    if (typeof timecodeStr !== 'string') {
      const h = obj?.smpte?.hours ?? obj?.hours
      const m = obj?.smpte?.minutes ?? obj?.minutes
      const s = obj?.smpte?.seconds ?? obj?.seconds
      const f = obj?.smpte?.frames ?? obj?.frames
      if ([h, m, s, f].every((v) => typeof v === 'number')) {
        timecodeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(f).padStart(2, '0')}`
      }
    }

    if (!timecodeStr) return null
    return { timecode: timecodeStr, frames, running: !!running }
  } catch {
    return null
  }
}

class ResolumeTimecodeClient {
  constructor(config) {
    this.config = config || {}
    this.ws = null
    this._reconnectTimer = null
    this._lastSentTs = 0
    this._throttleMs = config.throttleMs ?? 75
    this._paths = config.paths || ['/api/v1/events', '/api/events', '/events']
    this._pathIndex = 0
    this.log = createLogger('client')
  }

  start() {
    this.stop()
  const url = buildWsUrl({ host: this.config.host, port: this.config.port, path: this._paths[this._pathIndex] })
    this.log.info('Connecting to Resolume events:', url)

    try {
      this.ws = new WebSocket(url)
    } catch (e) {
      this.log.error('Failed to construct WebSocket:', e.message)
      this._scheduleReconnect()
      return
    }

    this.ws.on('open', () => {
      this.log.info('Connected to Resolume events')
      this._broadcast({ connected: true })
    })

    this.ws.on('message', (data) => {
      this.log.info('Event:', typeof data === 'string' ? data.slice(0, 256) : data)
      const tc = extractTimecode(data)
      if (tc) {
        const now = Date.now()
        if (now - this._lastSentTs >= this._throttleMs) {
          this._lastSentTs = now
          this._broadcast({ connected: true, ...tc })
        }
      }
    })

    this.ws.on('close', (code, reason) => {
      this.log.warn('Resolume events closed:', code, reason?.toString?.())
      this._broadcast({ connected: false })
      this._advancePathOnError(code)
      this._scheduleReconnect()
    })

    this.ws.on('error', (err) => {
      this.log.error('Resolume events error:', err.message)
      this._broadcast({ connected: false })
      this._advancePathOnError(err?.code)
      this._scheduleReconnect()
    })
  }

  stop() {
    if (this._reconnectTimer) {
      clearTimeout(this._reconnectTimer)
      this._reconnectTimer = null
    }
    if (this.ws) {
      try { this.ws.close() } catch {}
      this.ws = null
    }
  }

  _scheduleReconnect() {
    if (this._reconnectTimer) return
    const delay = this.config.reconnectMs ?? 4000
    this.log.info('Reconnecting in', delay, 'ms')
    this._reconnectTimer = setTimeout(() => {
      this._reconnectTimer = null
      this.start()
    }, delay)
  }

  _advancePathOnError(code) {
    // If 404 or connection issues, try next candidate path
    const indicative = [404, '404', 'ECONNREFUSED']
    if (indicative.includes(code)) {
      this._pathIndex = (this._pathIndex + 1) % this._paths.length
      this.log.info('Switching events path to', this._paths[this._pathIndex])
    }
  }

  _broadcast(payload) {
    for (const wc of webContents.getAllWebContents()) {
      wc.send('resolume-timecode-update', payload)
    }
  }
}

module.exports = { ResolumeTimecodeClient }
