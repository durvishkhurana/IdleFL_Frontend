import { useEffect, useLayoutEffect, useRef, useState } from 'react'

const STAGE_W = 900
const STAGE_H = 500

const DEVICE_RIGHT = 164
const DEV_Y = [90, 250, 410]
const COORD_CENTER = { x: 450, y: 250 }
const COORD_R = 40
const COORD_LEFT = COORD_CENTER.x - COORD_R
const COORD_ANCHOR = { x: COORD_LEFT, y: COORD_CENTER.y }

function deltaToDevice(i) {
  const y = DEV_Y[i]
  return { x: DEVICE_RIGHT - COORD_ANCHOR.x, y: y - COORD_ANCHOR.y }
}

const D0 = deltaToDevice(0)
const D1 = deltaToDevice(1)
const D2 = deltaToDevice(2)

/** Visual diagram loop = one FL round (8s); counter cycles 01–10 over 10 rounds. */
const DIAGRAM_ROUNDS = 10
const DIAGRAM_ROUND_PERIOD_S = 8
const DIAGRAM_FULL_CYCLE_S = DIAGRAM_ROUNDS * DIAGRAM_ROUND_PERIOD_S

function buildRoundCounterKeyframesCss(totalRounds, cycleSeconds) {
  const seg = 100 / totalRounds
  const eps = 0.02
  let out = `
    .ffd-rc-n {
      position: absolute;
      right: 0;
      top: 0;
      white-space: nowrap;
      opacity: 0;
    }
  `
  for (let n = 1; n <= totalRounds; n++) {
    const lo = (n - 1) * seg
    const hi = n * seg
    out += `@keyframes ffd-round-n-${n} {\n`
    if (n === 1) {
      out += `  0%, ${(hi - eps).toFixed(3)}% { opacity: 1; }\n`
      out += `  ${hi.toFixed(3)}%, 100% { opacity: 0; }\n`
    } else if (n === totalRounds) {
      out += `  0%, ${(lo - eps).toFixed(3)}% { opacity: 0; }\n`
      out += `  ${lo.toFixed(3)}%, 100% { opacity: 1; }\n`
    } else {
      out += `  0%, ${(lo - eps).toFixed(3)}% { opacity: 0; }\n`
      out += `  ${lo.toFixed(3)}%, ${(hi - eps).toFixed(3)}% { opacity: 1; }\n`
      out += `  ${hi.toFixed(3)}%, 100% { opacity: 0; }\n`
    }
    out += `}\n`
    out += `.ffd-root.is-visible .ffd-rc-n-${n}.ffd-run {\n`
    out += `  animation: ffd-round-n-${n} ${cycleSeconds}s linear infinite;\n`
    out += `}\n`
  }
  return out
}

export default function FederatedFlowDiagram() {
  const rootRef = useRef(null)
  const scaleWrapRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useLayoutEffect(() => {
    const el = scaleWrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setScale(w >= STAGE_W ? 1 : w / STAGE_W)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const css = `
    .ffd-scope {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      box-sizing: border-box;
    }
    .ffd-scope *, .ffd-scope *::before, .ffd-scope *::after { box-sizing: border-box; }

    .ffd-scale-wrap {
      width: 100%;
      max-width: ${STAGE_W}px;
      margin-left: auto;
      margin-right: auto;
    }

    .ffd-stage-holder {
      width: 100%;
      overflow: hidden;
      height: calc(${STAGE_H}px * var(--ffd-scale, 1));
    }

    .ffd-mobile-inner {
      width: ${STAGE_W}px;
      height: ${STAGE_H}px;
      margin-left: auto;
      margin-right: auto;
      transform-origin: top center;
      transform: scale(var(--ffd-scale));
    }

    @media (max-width: 767px) {
      .ffd-mobile-inner {
        transform: scale(calc(var(--ffd-scale) * 0.65));
      }
      .ffd-stage-holder {
        height: calc(${STAGE_H}px * var(--ffd-scale, 1) * 0.65);
      }
      .ffd-caption-shift {
        margin-top: -120px;
      }
    }

    .ffd-stage {
      position: relative;
      width: ${STAGE_W}px;
      height: ${STAGE_H}px;
      background: #080404;
      border: 1px solid rgba(255,107,107,0.12);
      border-radius: 8px;
      overflow: hidden;
    }

    .ffd-grid {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(255,107,107,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,107,107,0.04) 1px, transparent 1px);
      background-size: 28px 28px;
      z-index: 0;
    }

    .ffd-round-counter {
      position: absolute;
      top: 14px;
      right: 18px;
      z-index: 6;
      font-size: 10px;
      letter-spacing: 1px;
      color: rgba(255,107,107,0.5);
    }

    .ffd-rc-wrap {
      position: relative;
      height: 14px;
      min-width: 76px;
      padding-right: 4px;
    }

    ${buildRoundCounterKeyframesCss(DIAGRAM_ROUNDS, DIAGRAM_FULL_CYCLE_S)}

    .ffd-svg-lines {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .ffd-lanes {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: grid;
      grid-template-columns: 200px 220px 1fr;
      align-items: stretch;
      pointer-events: none;
    }

    .ffd-col-devices {
      padding: 38px 0 38px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: flex-start;
    }

    .ffd-device-row {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 6px;
    }

    .ffd-device-card {
      width: 140px;
      height: 70px;
      padding: 10px 14px;
      border-radius: 6px;
      background: #1a0808;
      border: 1px solid rgba(255,107,107,0.2);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .ffd-device-name {
      font-size: 11px;
      font-weight: 600;
      color: #ffe8e8;
    }

    .ffd-badge {
      font-size: 9px;
      padding: 2px 6px;
      border-radius: 3px;
      align-self: flex-start;
    }

    .ffd-badge-cuda {
      background: rgba(0,255,136,0.1);
      color: #00ff88;
      border: 1px solid rgba(0,255,136,0.3);
    }
    .ffd-badge-mps {
      background: rgba(0,212,255,0.1);
      color: #00d4ff;
      border: 1px solid rgba(0,212,255,0.3);
    }
    .ffd-badge-cpu {
      background: rgba(255,107,107,0.1);
      color: #ff6b6b;
      border: 1px solid rgba(255,107,107,0.3);
    }

    .ffd-train-track {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 4px;
      background: rgba(255,107,107,0.06);
    }

    .ffd-train-fill {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 100%;
      transform-origin: left center;
      transform: scaleX(0);
    }

    .ffd-fill-green { background: #00ff88; }
    .ffd-fill-cyan { background: #00d4ff; }
    .ffd-fill-coral { background: #ff6b6b; }

    .ffd-training-hint {
      font-size: 8px;
      color: #8a5555;
      margin-top: 2px;
      opacity: 0;
      height: 10px;
    }

    .data-locked {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 9px;
      color: #4a2a2a;
      user-select: none;
    }

    .ffd-col-coordinator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .ffd-co-label {
      font-size: 9px;
      color: #ff6b6b;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .ffd-co-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: radial-gradient(circle, #2d1515 0%, #0f0808 100%);
      border: 2px solid #ff6b6b;
      box-shadow: 0 0 20px rgba(255,107,107,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 3;
    }

    .ffd-fedavg-formula {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #8a5555;
      text-align: center;
      padding: 4px;
      line-height: 1.2;
      opacity: 0;
      pointer-events: none;
      z-index: 4;
    }

    .ffd-co-status {
      margin-top: 10px;
      min-height: 12px;
      position: relative;
      width: 140px;
      text-align: center;
    }

    .ffd-status-layer {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      font-size: 9px;
      color: #8a5555;
    }

    .ffd-col-global {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 28px;
    }

    .ffd-global-card {
      width: 134px;
      padding: 14px 12px;
      border-radius: 6px;
      background: #120808;
      border: 1px solid rgba(255,107,107,0.18);
      text-align: center;
    }

    .ffd-global-label {
      font-size: 8px;
      letter-spacing: 1.5px;
      color: rgba(255,107,107,0.45);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .ffd-global-main {
      font-size: 11px;
      font-weight: 600;
      color: #ffe8e8;
      line-height: 1.35;
    }

    .ffd-anim-layer {
      position: absolute;
      inset: 0;
      z-index: 4;
      pointer-events: none;
    }

    .ffd-packet {
      position: absolute;
      width: 24px;
      height: 14px;
      margin-left: -12px;
      margin-top: -7px;
      background: rgba(255,107,107,0.2);
      border: 1px solid #ff6b6b;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7px;
      color: #ff6b6b;
      left: ${COORD_ANCHOR.x}px;
      top: ${COORD_ANCHOR.y}px;
      opacity: 0;
    }

    .ffd-orb-up {
      position: absolute;
      width: 10px;
      height: 10px;
      margin-left: -5px;
      margin-top: -5px;
      border-radius: 50%;
      left: ${DEVICE_RIGHT}px;
      opacity: 0;
    }

    .ffd-orb-up-label {
      position: absolute;
      left: 50%;
      top: -12px;
      transform: translateX(-50%);
      font-size: 7px;
      white-space: nowrap;
      opacity: 0;
    }

    .ffd-orb-green {
      background: #00ff88;
      box-shadow: 0 0 8px #00ff88;
    }
    .ffd-orb-cyan {
      background: #00d4ff;
      box-shadow: 0 0 8px #00d4ff;
    }
    .ffd-orb-coral {
      background: #ff6b6b;
      box-shadow: 0 0 8px #ff6b6b;
    }

    .ffd-o1 { top: ${DEV_Y[0]}px; }
    .ffd-o2 { top: ${DEV_Y[1]}px; }
    .ffd-o3 { top: ${DEV_Y[2]}px; }

    .ffd-broadcast-orb {
      position: absolute;
      width: 16px;
      height: 16px;
      margin-left: -8px;
      margin-top: -8px;
      border-radius: 50%;
      background: #ff6b6b;
      box-shadow: 0 0 14px rgba(255,107,107,0.85), 0 0 28px rgba(255,107,107,0.35);
      left: ${COORD_ANCHOR.x}px;
      top: ${COORD_ANCHOR.y}px;
      opacity: 0;
    }

    .ffd-caption {
      text-align: center;
      font-size: 12px;
      color: #8a5555;
      margin-top: 24px;
      padding: 0 12px;
      line-height: 1.6;
    }

    .ffd-caption strong {
      color: #ff6b6b;
      font-weight: 600;
    }

    .ffd-root:not(.is-visible) .ffd-run {
      animation-play-state: paused !important;
    }

    @keyframes ffd-dev-card {
      0% { opacity: 0; box-shadow: none; border-color: rgba(255,107,107,0.2); }
      6% { opacity: 1; }
      10% { box-shadow: 0 0 12px rgba(255,107,107,0.4); border-color: rgba(255,107,107,0.45); }
      14% { box-shadow: none; border-color: rgba(255,107,107,0.2); }
      100% { opacity: 1; }
    }

    @keyframes ffd-dev-flash-green {
      0%, 87% { border-color: rgba(255,107,107,0.2); box-shadow: none; }
      91% { border-color: rgba(0,255,136,0.65); box-shadow: 0 0 14px rgba(0,255,136,0.25); }
      95%, 100% { border-color: rgba(255,107,107,0.2); box-shadow: none; }
    }

    .ffd-root.is-visible .ffd-dev-1.ffd-run {
      animation: ffd-dev-card 8s ease-out infinite, ffd-dev-flash-green 8s linear infinite;
    }
    .ffd-root.is-visible .ffd-dev-2.ffd-run {
      animation: ffd-dev-card 8s ease-out infinite, ffd-dev-flash-green 8s linear infinite;
      animation-delay: 0.2s, 0s;
    }
    .ffd-root.is-visible .ffd-dev-3.ffd-run {
      animation: ffd-dev-card 8s ease-out infinite, ffd-dev-flash-green 8s linear infinite;
      animation-delay: 0.4s, 0s;
    }

    @keyframes ffd-pkt-0 {
      0%, 12.5% { opacity: 0; transform: translate(0, 0); }
      13% { opacity: 1; }
      24.5% { opacity: 1; transform: translate(${D0.x}px, ${D0.y}px); }
      25%, 100% { opacity: 0; transform: translate(${D0.x}px, ${D0.y}px); }
    }
    @keyframes ffd-pkt-1 {
      0%, 14.375% { opacity: 0; transform: translate(0, 0); }
      14.9% { opacity: 1; }
      24.5% { opacity: 1; transform: translate(${D1.x}px, ${D1.y}px); }
      25%, 100% { opacity: 0; transform: translate(${D1.x}px, ${D1.y}px); }
    }
    @keyframes ffd-pkt-2 {
      0%, 16.25% { opacity: 0; transform: translate(0, 0); }
      16.8% { opacity: 1; }
      24.5% { opacity: 1; transform: translate(${D2.x}px, ${D2.y}px); }
      25%, 100% { opacity: 0; transform: translate(${D2.x}px, ${D2.y}px); }
    }

    .ffd-root.is-visible .ffd-pkt-0.ffd-run { animation: ffd-pkt-0 8s linear infinite; }
    .ffd-root.is-visible .ffd-pkt-1.ffd-run { animation: ffd-pkt-1 8s linear infinite; }
    .ffd-root.is-visible .ffd-pkt-2.ffd-run { animation: ffd-pkt-2 8s linear infinite; }

    @keyframes ffd-train-bar-a {
      0%, 25% { transform: scaleX(0); }
      50% { transform: scaleX(1); }
      100% { transform: scaleX(1); }
    }
    @keyframes ffd-train-bar-b {
      0%, 28.75% { transform: scaleX(0); }
      53.75% { transform: scaleX(1); }
      100% { transform: scaleX(1); }
    }
    @keyframes ffd-train-bar-c {
      0%, 32.5% { transform: scaleX(0); }
      56.25% { transform: scaleX(1); }
      100% { transform: scaleX(1); }
    }

    .ffd-root.is-visible .ffd-tfill-1.ffd-run { animation: ffd-train-bar-a 8s linear infinite; }
    .ffd-root.is-visible .ffd-tfill-2.ffd-run { animation: ffd-train-bar-b 8s linear infinite; }
    .ffd-root.is-visible .ffd-tfill-3.ffd-run { animation: ffd-train-bar-c 8s linear infinite; }

    @keyframes ffd-train-hint {
      0%, 24% { opacity: 0; }
      28% { opacity: 1; }
      54% { opacity: 1; }
      58% { opacity: 0; }
      100% { opacity: 0; }
    }
    @keyframes ffd-train-hint-b {
      0%, 27.75% { opacity: 0; }
      31.75% { opacity: 1; }
      54% { opacity: 1; }
      58% { opacity: 0; }
      100% { opacity: 0; }
    }
    @keyframes ffd-train-hint-c {
      0%, 31.5% { opacity: 0; }
      35.5% { opacity: 1; }
      56% { opacity: 1; }
      59% { opacity: 0; }
      100% { opacity: 0; }
    }

    .ffd-root.is-visible .ffd-thint-1.ffd-run { animation: ffd-train-hint 8s linear infinite; }
    .ffd-root.is-visible .ffd-thint-2.ffd-run { animation: ffd-train-hint-b 8s linear infinite; }
    .ffd-root.is-visible .ffd-thint-3.ffd-run { animation: ffd-train-hint-c 8s linear infinite; }

    @keyframes ffd-orb-0 {
      0%, 56.25% { opacity: 0; transform: translate(0, 0); }
      57% { opacity: 1; }
      72% { opacity: 1; transform: translate(${-D0.x}px, ${-D0.y}px); }
      73%, 100% { opacity: 0; transform: translate(${-D0.x}px, ${-D0.y}px); }
    }
    @keyframes ffd-orb-1 {
      0%, 57.75% { opacity: 0; transform: translate(0, 0); }
      58.5% { opacity: 1; }
      72.5% { opacity: 1; transform: translate(${-D1.x}px, ${-D1.y}px); }
      73.5%, 100% { opacity: 0; transform: translate(${-D1.x}px, ${-D1.y}px); }
    }
    @keyframes ffd-orb-2 {
      0%, 59.25% { opacity: 0; transform: translate(0, 0); }
      60% { opacity: 1; }
      73% { opacity: 1; transform: translate(${-D2.x}px, ${-D2.y}px); }
      74%, 100% { opacity: 0; transform: translate(${-D2.x}px, ${-D2.y}px); }
    }

    @keyframes ffd-orb-label {
      0%, 56% { opacity: 0; }
      58% { opacity: 1; }
      68% { opacity: 1; }
      72%, 100% { opacity: 0; }
    }

    .ffd-root.is-visible .ffd-o1.ffd-run { animation: ffd-orb-0 8s linear infinite; }
    .ffd-root.is-visible .ffd-o2.ffd-run { animation: ffd-orb-1 8s linear infinite; }
    .ffd-root.is-visible .ffd-o3.ffd-run { animation: ffd-orb-2 8s linear infinite; }

    .ffd-root.is-visible .ffd-o1 .ffd-orb-up-label.ffd-run {
      animation: ffd-orb-label 8s linear infinite;
    }

    @keyframes ffd-co-pulse {
      0%, 71% { box-shadow: 0 0 20px rgba(255,107,107,0.3); transform: scale(1); }
      74% { box-shadow: 0 0 36px rgba(255,107,107,0.55); transform: scale(1.03); }
      77%, 84% { box-shadow: 0 0 40px rgba(255,107,107,0.6); transform: scale(1.05); }
      88% { box-shadow: 0 0 24px rgba(255,107,107,0.35); transform: scale(1); }
      100% { box-shadow: 0 0 20px rgba(255,107,107,0.3); transform: scale(1); }
    }

    .ffd-root.is-visible .ffd-co-circle.ffd-run {
      animation: ffd-co-pulse 8s ease-in-out infinite;
    }

    @keyframes ffd-formula {
      0%, 75% { opacity: 0; }
      76% { opacity: 1; }
      86%, 100% { opacity: 0; }
    }

    .ffd-root.is-visible .ffd-fedavg-formula.ffd-run {
      animation: ffd-formula 8s linear infinite;
    }

    @keyframes ffd-st-wait {
      0%, 74% { opacity: 1; }
      76%, 100% { opacity: 0; }
    }
    @keyframes ffd-st-merge {
      0%, 74% { opacity: 0; }
      75%, 82% { opacity: 1; }
      83%, 100% { opacity: 0; }
    }
    @keyframes ffd-st-done {
      0%, 82% { opacity: 0; }
      83%, 100% { opacity: 1; }
    }

    .ffd-root.is-visible .ffd-st-wait.ffd-run { animation: ffd-st-wait 8s linear infinite; }
    .ffd-root.is-visible .ffd-st-merge.ffd-run { animation: ffd-st-merge 8s linear infinite; }
    .ffd-root.is-visible .ffd-st-done.ffd-run { animation: ffd-st-done 8s linear infinite; }

    @keyframes ffd-global-pulse {
      0%, 74% { border-color: rgba(255,107,107,0.18); box-shadow: none; }
      77%, 86% { border-color: rgba(255,107,107,0.45); box-shadow: 0 0 18px rgba(255,107,107,0.15); }
      100% { border-color: rgba(255,107,107,0.18); box-shadow: none; }
    }

    .ffd-root.is-visible .ffd-global-card.ffd-run {
      animation: ffd-global-pulse 8s ease-in-out infinite;
    }

    @keyframes ffd-bcast-0 {
      0%, 87.5% { opacity: 0; transform: translate(0, 0); }
      88% { opacity: 1; }
      96% { opacity: 1; transform: translate(${D0.x}px, ${D0.y}px); }
      97%, 100% { opacity: 0; transform: translate(${D0.x}px, ${D0.y}px); }
    }
    @keyframes ffd-bcast-1 {
      0%, 87.5% { opacity: 0; transform: translate(0, 0); }
      88% { opacity: 1; }
      96% { opacity: 1; transform: translate(${D1.x}px, ${D1.y}px); }
      97%, 100% { opacity: 0; transform: translate(${D1.x}px, ${D1.y}px); }
    }
    @keyframes ffd-bcast-2 {
      0%, 87.5% { opacity: 0; transform: translate(0, 0); }
      88% { opacity: 1; }
      96% { opacity: 1; transform: translate(${D2.x}px, ${D2.y}px); }
      97%, 100% { opacity: 0; transform: translate(${D2.x}px, ${D2.y}px); }
    }

    .ffd-root.is-visible .ffd-bc-0.ffd-run { animation: ffd-bcast-0 8s linear infinite; }
    .ffd-root.is-visible .ffd-bc-1.ffd-run { animation: ffd-bcast-1 8s linear infinite; }
    .ffd-root.is-visible .ffd-bc-2.ffd-run { animation: ffd-bcast-2 8s linear infinite; }
  `

  return (
    <div
      ref={rootRef}
      className={`ffd-root ffd-scope ${isVisible ? 'is-visible' : ''}`}
      style={{ '--ffd-scale': scale }}
    >
      <style>{css}</style>

      <div ref={scaleWrapRef} className="ffd-scale-wrap">
        <div className="ffd-stage-holder">
          <div className="ffd-mobile-inner">
            <div className="ffd-stage">
              <div className="ffd-grid" />

              <div className="ffd-round-counter">
                <div className="ffd-rc-wrap">
                  {Array.from({ length: DIAGRAM_ROUNDS }, (_, i) => {
                    const n = i + 1
                    return (
                      <span key={n} className={`ffd-rc-n ffd-rc-n-${n} ffd-run`}>
                        ROUND {String(n).padStart(2, '0')}
                      </span>
                    )
                  })}
                </div>
              </div>

              <svg className="ffd-svg-lines" viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} preserveAspectRatio="xMidYMid meet">
                <line x1={DEVICE_RIGHT} y1={DEV_Y[0]} x2={COORD_LEFT} y2={COORD_CENTER.y} stroke="rgba(255,107,107,0.15)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={DEVICE_RIGHT} y1={DEV_Y[1]} x2={COORD_LEFT} y2={COORD_CENTER.y} stroke="rgba(255,107,107,0.15)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={DEVICE_RIGHT} y1={DEV_Y[2]} x2={COORD_LEFT} y2={COORD_CENTER.y} stroke="rgba(255,107,107,0.15)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={COORD_CENTER.x + COORD_R} y1={COORD_CENTER.y} x2={736} y2={250} stroke="rgba(255,107,107,0.12)" strokeWidth={1} strokeDasharray="4 4" />
              </svg>

              <div className="ffd-lanes">
                <div className="ffd-col-devices">
                  <div className="ffd-device-row">
                    <div className="ffd-device-card ffd-dev-1 ffd-run">
                      <span className="ffd-device-name">WINDOWS-01</span>
                      <span className="ffd-badge ffd-badge-cuda">CUDA · GPU</span>
                      <div className="ffd-train-track">
                        <div className="ffd-train-fill ffd-fill-green ffd-tfill-1 ffd-run" />
                      </div>
                    </div>
                    <div className="ffd-training-hint ffd-thint-1 ffd-run">training...</div>
                    <div className="data-locked">
                      <span aria-hidden>▦</span>
                      <span>local data</span>
                    </div>
                  </div>

                  <div className="ffd-device-row">
                    <div className="ffd-device-card ffd-dev-2 ffd-run">
                      <span className="ffd-device-name">MACBOOK-02</span>
                      <span className="ffd-badge ffd-badge-mps">MPS · Apple Silicon</span>
                      <div className="ffd-train-track">
                        <div className="ffd-train-fill ffd-fill-cyan ffd-tfill-2 ffd-run" />
                      </div>
                    </div>
                    <div className="ffd-training-hint ffd-thint-2 ffd-run">training...</div>
                    <div className="data-locked">
                      <span aria-hidden>▦</span>
                      <span>local data</span>
                    </div>
                  </div>

                  <div className="ffd-device-row">
                    <div className="ffd-device-card ffd-dev-3 ffd-run">
                      <span className="ffd-device-name">LINUX-03</span>
                      <span className="ffd-badge ffd-badge-cpu">CPU · x86</span>
                      <div className="ffd-train-track">
                        <div className="ffd-train-fill ffd-fill-coral ffd-tfill-3 ffd-run" />
                      </div>
                    </div>
                    <div className="ffd-training-hint ffd-thint-3 ffd-run">training...</div>
                    <div className="data-locked">
                      <span aria-hidden>▦</span>
                      <span>local data</span>
                    </div>
                  </div>
                </div>

                <div className="ffd-col-coordinator">
                  <div className="ffd-co-label">COORDINATOR</div>
                  <div className="ffd-co-circle ffd-run">
                    <span className="ffd-fedavg-formula ffd-run">W_global = Σ(n_k/N)·W_k</span>
                  </div>
                  <div className="ffd-co-status">
                    <span className="ffd-status-layer ffd-st-wait ffd-run">waiting...</span>
                    <span className="ffd-status-layer ffd-st-merge ffd-run">FedAvg merging...</span>
                    <span className="ffd-status-layer ffd-st-done ffd-run">round complete</span>
                  </div>
                </div>

                <div className="ffd-col-global">
                  <div className="ffd-global-card ffd-run">
                    <div className="ffd-global-label">Global model</div>
                    <div className="ffd-global-main">W_global</div>
                  </div>
                </div>
              </div>

              <div className="ffd-anim-layer">
                <div className="ffd-packet ffd-pkt-0 ffd-run">shard</div>
                <div className="ffd-packet ffd-pkt-1 ffd-run">shard</div>
                <div className="ffd-packet ffd-pkt-2 ffd-run">shard</div>

                <div className="ffd-orb-up ffd-orb-green ffd-o1 ffd-run">
                  <span className="ffd-orb-up-label ffd-run" style={{ color: '#00ff88' }}>~3KB</span>
                </div>
                <div className="ffd-orb-up ffd-orb-cyan ffd-o2 ffd-run" />
                <div className="ffd-orb-up ffd-orb-coral ffd-o3 ffd-run" />

                <div className="ffd-broadcast-orb ffd-bc-0 ffd-run" />
                <div className="ffd-broadcast-orb ffd-bc-1 ffd-run" />
                <div className="ffd-broadcast-orb ffd-bc-2 ffd-run" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="ffd-caption ffd-caption-shift">
        Three devices · three local datasets · one global model ·{' '}
        <strong>zero raw data shared</strong>
      </p>
    </div>
  )
}
