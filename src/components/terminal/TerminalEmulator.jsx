import { useEffect, useRef } from 'react'
import socket from '../../socket/socket'

export default function TerminalEmulator({ deviceId, deviceName }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitAddonRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !deviceId) return

    let term = null
    let fitAddon = null

    async function init() {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')

      await import('@xterm/xterm/css/xterm.css')

      term = new Terminal({
        theme: {
          background: '#0a0a0f',
          foreground: '#00ff88',
          cursor: '#00ff88',
          cursorAccent: '#0a0a0f',
          selection: 'rgba(0,255,136,0.3)',
          black: '#0a0a0f',
          green: '#00ff88',
          brightGreen: '#00ff88',
          white: '#e0e0e0',
        },
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13,
        lineHeight: 1.4,
        cursorBlink: true,
        cursorStyle: 'block',
        scrollback: 1000,
      })

      fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.open(containerRef.current)
      fitAddon.fit()

      termRef.current = term
      fitAddonRef.current = fitAddon

      // Welcome message
      term.writeln(`\x1b[38;5;240m┌───────────────────────────────────────┐\x1b[0m`)
      term.writeln(`\x1b[38;5;240m│\x1b[0m \x1b[32mConnecting to ${deviceName || deviceId}...\x1b[0m           \x1b[38;5;240m│\x1b[0m`)
      term.writeln(`\x1b[38;5;240m└───────────────────────────────────────┘\x1b[0m`)
      term.write('\r\n\x1b[32m$\x1b[0m ')

      // Handle user input → emit to socket
      term.onData((data) => {
        socket.emit('terminal:input', { deviceId, data })
        // Local echo
        term.write(data)
      })

      // Socket output → write to terminal
      const onOutput = (payload) => {
        if (payload.deviceId === deviceId) {
          term.write(payload.data)
        }
      }

      const onDisconnect = () => {
        if (term) {
          term.writeln('\r\n\x1b[31mConnection lost. Device disconnected.\x1b[0m')
        }
      }

      socket.on('terminal:output', onOutput)
      socket.on('disconnect', onDisconnect)

      // Cleanup stored for effect return
      return () => {
        socket.off('terminal:output', onOutput)
        socket.off('disconnect', onDisconnect)
        term.dispose()
        termRef.current = null
      }
    }

    let cleanup = () => {}
    init().then((result) => { if (result) cleanup = result })

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (fitAddonRef.current) fitAddonRef.current.fit()
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      cleanup()
    }
  }, [deviceId])

  return (
    <div
      ref={containerRef}
      className="xterm-container w-full h-full"
      style={{ minHeight: 400 }}
    />
  )
}
