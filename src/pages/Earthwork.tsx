import { useEffect, useState, type ReactNode } from 'react'
import QuantityWorkspace from './earthwork/QuantityWorkspace'
import UploadBox from '../components/UploadBox'
import { IconPlay, IconDownload } from '../components/icons'
import { earthworkResult, earthworkSummary } from '../mock/data'

type CalcStage = 'idle' | 'running' | 'done'

const earthworkStyles = `
.earthwork-page{height:100%;min-height:0;display:flex;gap:10px;padding:0;background:var(--bg-page);overflow:hidden}
.earthwork-main{flex:1;min-width:0;min-height:0;display:grid;grid-template-rows:minmax(0,1.55fr) minmax(220px,.9fr);gap:10px}
.ew-window{position:relative;min-width:0;min-height:0;overflow:hidden;border:1px solid var(--border);border-radius:8px;background:#07182c;box-shadow:0 4px 16px rgba(0,0,0,.18)}
.ew-map-window{isolation:isolate;background:#07182a}
.ew-map-svg{position:absolute;inset:0;width:100%;height:100%;display:block}.ew-map-backdrop{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block}.ew-map-dim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,14,29,.12),rgba(2,14,29,.02) 55%,rgba(2,14,29,.2));pointer-events:none}
.ew-map-svg text{font-family:var(--font);user-select:none}.ew-map-pick{cursor:pointer}.ew-map-pick:focus{outline:none}.ew-map-pick:focus circle{stroke:#fff;stroke-width:4}.ew-map-select-mode{border-color:#4b8dff!important;background:#174b9a!important;color:#fff!important}
.ew-map-toolbar{position:absolute;z-index:3;top:10px;left:10px;right:auto;display:flex;align-items:center;gap:5px;padding:5px 7px;border:1px solid rgba(106,161,204,.28);border-radius:7px;background:rgba(6,28,48,.88);backdrop-filter:blur(6px)}.ew-map-toolbar .ew-tool-btn{white-space:nowrap}.ew-map-selects{display:flex;align-items:center;gap:5px;color:#d9eaff;font-size:12px}.ew-map-selects select{height:28px;min-width:100px;border:1px solid #315d83;border-radius:5px;background:#0b2742;color:#e8f4ff;padding:0 8px;font:inherit}.ew-map-separator{padding:0 2px;color:#9ebbd4}.ew-map-legend{position:absolute;z-index:3;top:56px;left:10px;width:132px;padding:12px 12px 10px;border:1px solid rgba(94,150,193,.38);border-radius:7px;background:rgba(5,25,43,.9);box-shadow:0 5px 18px rgba(0,0,0,.2);color:#e8f3ff}.ew-map-legend-title{font-size:12px;font-weight:700;margin-bottom:8px}.ew-map-legend-row{display:flex;align-items:center;gap:9px;height:24px;font-size:12px}.ew-map-legend-color{width:27px;height:21px;border-radius:3px;flex:none}.ew-map-compass{position:absolute;z-index:3;top:10px;right:10px;width:74px;height:74px;border:1px solid rgba(94,150,193,.35);border-radius:6px;background:rgba(5,25,43,.82);display:flex;align-items:center;justify-content:center}.ew-map-scale{position:absolute;z-index:3;left:15px;bottom:12px;display:flex;align-items:flex-end;gap:0;padding:5px 8px;border-radius:5px;background:rgba(5,25,43,.78);color:#e8f3ff;font-size:11px}.ew-map-scale-part{min-width:50px;text-align:center;border-bottom:2px solid #e8f3ff;padding-bottom:3px}.ew-map-scale-part+ .ew-map-scale-part{border-left:1px solid #e8f3ff}.ew-map-status{z-index:3;max-width:calc(100% - 270px)}
.ew-tool-btn{height:29px;min-width:30px;padding:0 9px;display:inline-flex;align-items:center;justify-content:center;gap:5px;color:#dce9ff;background:rgba(7,24,46,.88);border:1px solid rgba(76,123,190,.72);border-radius:5px;font-size:11px;cursor:pointer;backdrop-filter:blur(5px)}
.ew-tool-btn:hover{border-color:#4385ff;background:rgba(20,63,123,.94)}
.ew-map-status{position:absolute;left:12px;bottom:10px;z-index:2;display:flex;align-items:center;gap:7px;padding:5px 8px;border:1px solid rgba(77,120,175,.55);border-radius:5px;background:rgba(6,21,41,.83);color:#c8d9f4;font-size:11px;backdrop-filter:blur(5px)}.ew-map-status{left:auto;right:112px;bottom:12px}
.ew-live-dot{width:6px;height:6px;border-radius:50%;background:#2fce85;box-shadow:0 0 8px rgba(47,206,133,.75)}
.ew-scale{position:absolute;right:14px;bottom:13px;z-index:2;color:#e3edff;font-size:10px;text-shadow:0 1px 4px #06162a}
.ew-scale-line{display:inline-block;width:76px;height:7px;margin-left:6px;border:1px solid #dce9ff;border-top:0;vertical-align:middle}
.ew-section-window{display:flex;flex-direction:column;background:#07182c}
.ew-section-head{height:36px;flex:none;display:flex;align-items:center;gap:10px;padding:0 12px;background:linear-gradient(180deg,#0e2342,#0b1d37);border-bottom:1px solid var(--border);font-size:12px;font-weight:600}
.ew-section-head select{height:24px;max-width:115px;font-size:11px}
.ew-soil-toggle{height:25px;padding:0 9px;border:1px solid #315b82;border-radius:5px;background:#0b2742;color:#dcecff;font-size:11px;white-space:nowrap;cursor:pointer}
.ew-soil-toggle:hover{border-color:#4b8dff;background:#123b68}
.ew-soil-toggle.active{border-color:#27c7ed;background:#0d5275;color:#fff;box-shadow:inset 0 0 0 1px rgba(39,199,237,.15)}
.ew-soil-legend{display:flex;align-items:center;gap:8px;margin-left:8px;min-width:0;overflow:hidden;color:#cbdcf4;font-size:10px;font-weight:400;white-space:nowrap}
.ew-soil-legend-item{display:inline-flex;align-items:center;gap:4px;min-width:0}
.ew-soil-legend-swatch{display:inline-block;width:9px;height:9px;flex:none;border-radius:2px}
.ew-soil-label{font-size:10px!important;font-weight:700;paint-order:stroke;stroke:#07182c;stroke-width:2px}
@media(max-width:1050px){.ew-soil-legend{display:none}.ew-section-legend{gap:7px}.ew-soil-toggle{padding:0 6px}}

.ew-section-legend{display:flex;align-items:center;gap:13px;margin-left:auto;color:var(--text-2);font-size:11px;font-weight:400;white-space:nowrap}
.ew-legend-item{display:inline-flex;align-items:center;gap:5px}
.ew-legend-line{display:inline-block;width:14px;height:2px}
.ew-legend-fill{display:inline-block;width:10px;height:9px;border-radius:1px;background:#29c9f3}
.ew-section-canvas{position:relative;flex:1;min-height:0;padding:4px 8px 2px;background:radial-gradient(ellipse at 50% 15%,rgba(0,139,191,.2),transparent 65%),#06172b}
.ew-section-svg{display:block;width:100%;height:100%;min-height:0}
.ew-section-svg text{font-family:var(--font);fill:#c4d5ef;font-size:12px}
.ew-section-tooltip{position:absolute;left:50%;top:7px;transform:translateX(-50%);z-index:2;padding:7px 10px;border:1px solid rgba(48,120,177,.6);border-radius:5px;background:rgba(5,25,48,.94);box-shadow:0 5px 16px rgba(0,0,0,.22);font-size:11px;line-height:1.65;color:#d9e8ff;white-space:nowrap;pointer-events:none}
.ew-section-tooltip b{color:#fff;font-weight:600}
.ew-sidebar{width:clamp(252px,18vw,310px);flex:none;min-height:0;display:flex;flex-direction:column;overflow:auto;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel)}
.ew-collapse{flex:none;border-bottom:1px solid rgba(36,80,138,.62)}
.ew-collapse:last-child{border-bottom:0}
.ew-collapse-head{height:36px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;color:#e6efff;font-size:12px;font-weight:600;cursor:pointer;background:linear-gradient(180deg,rgba(18,42,78,.45),rgba(12,29,56,.15))}
.ew-collapse-head:hover{background:rgba(46,111,255,.08)}
.ew-collapse-arrow{color:var(--text-3);font-size:11px;transition:transform .15s}
.ew-collapse.closed .ew-collapse-arrow{transform:rotate(-90deg)}
.ew-collapse-body{padding:8px 11px 10px}
.ew-collapse.closed .ew-collapse-body{display:none}
.ew-format-note{font-size:11px;color:var(--text-3);line-height:1.55;margin-bottom:8px}
.ew-file-line{display:flex;align-items:center;gap:7px;min-width:0;margin-top:7px;padding:7px 8px;border:1px solid var(--border);border-radius:5px;background:rgba(7,24,46,.65);font-size:11px}
.ew-file-check{color:var(--green);font-weight:700}
.ew-file-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-1)}
.ew-file-size{margin-left:auto;flex:none;color:var(--text-3)}
.ew-field-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px 8px}
.ew-field{display:flex;flex-direction:column;gap:5px;min-width:0}
.ew-field label{color:var(--text-3);font-size:11px;white-space:nowrap}
.ew-field .select{width:100%;height:26px;font-size:11px;padding-left:7px;padding-right:22px}
.ew-segments{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.ew-segment{height:24px;padding:0 8px;border:1px solid var(--border-light);border-radius:4px;background:transparent;color:var(--text-2);font-size:10px;cursor:pointer;white-space:nowrap}
.ew-segment:hover{border-color:var(--primary)}
.ew-segment.active{color:#fff;background:var(--primary);border-color:var(--primary)}
.ew-calc-btn{width:100%;height:33px;margin-top:2px}
.ew-calc-status{margin-top:8px;color:var(--green);font-size:11px;line-height:1.5}
.ew-progress{height:5px;overflow:hidden;border-radius:5px;background:#152d50;margin-top:7px}
.ew-progress i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#2e6fff,#22d3ee);transition:width .15s}
.ew-result-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px}
.ew-result-card{min-width:0;padding:7px 8px;border:1px solid rgba(27,58,102,.55);border-radius:5px;background:rgba(7,24,46,.68)}
.ew-result-label{color:var(--text-3);font-size:10px}
.ew-result-value{margin-top:3px;color:#f0f6ff;font-size:13px;font-weight:700;white-space:nowrap}
.ew-result-value small{font-size:10px;color:var(--text-3);font-weight:400;margin-left:2px}
.ew-table-wrap{margin-top:8px;overflow:auto;max-height:170px}
.ew-table-wrap table.tbl th,.ew-table-wrap table.tbl td{padding:6px 7px;font-size:10px}
.ew-export{width:100%;margin-top:8px}
@media(max-width:1100px){.earthwork-page{gap:7px}.earthwork-main{gap:7px;grid-template-rows:minmax(0,1.3fr) minmax(210px,.85fr)}.ew-sidebar{width:245px}.ew-section-legend{gap:7px;font-size:10px}.ew-section-tooltip{font-size:10px}}
@media(max-width:780px){body{overflow:auto}.earthwork-page{height:auto;min-height:100%;overflow:visible;flex-direction:column;padding:8px}.earthwork-main{grid-template-rows:minmax(300px,48vh) minmax(240px,35vh)}.ew-sidebar{width:100%;max-height:none;overflow:visible}.ew-map-window{min-height:300px}.ew-section-legend{gap:8px}.ew-section-tooltip{left:auto;right:8px;transform:none}}
@media(max-width:520px){.ew-section-head{padding:0 8px;gap:6px}.ew-section-legend{gap:6px}.ew-section-legend .ew-legend-item:nth-child(2){display:none}.ew-section-tooltip{display:none}.ew-map-toolbar{top:6px;right:6px}.ew-tool-btn{height:26px;padding:0 7px}}
`

function Collapse({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={`ew-collapse${open ? '' : ' closed'}`}>
      <div className="ew-collapse-head" onClick={() => setOpen(value => !value)} role="button" tabIndex={0}
        onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setOpen(value => !value) }}>
        <span>{title}</span><span className="ew-collapse-arrow">▾</span>
      </div>
      <div className="ew-collapse-body">{children}</div>
    </section>
  )
}

function ChannelMap({
  onReset,
  startChainage,
  endChainage,
  onStartChange,
  onEndChange,
}: {
  onReset: () => void
  startChainage: string
  endChainage: string
  onStartChange: (value: string) => void
  onEndChange: (value: string) => void
}) {
  const [pickMode, setPickMode] = useState<'start' | 'end'>('start')
  const chainages = ['K0+000', 'K1+000', 'K2+000', 'K3+000']
  const stationPositions = [
    { x: 250, y: 20 },
    { x: 440, y: 175 },
    { x: 650, y: 355 },
    { x: 875, y: 555 },
  ]
  const startIndex = Math.max(0, chainages.indexOf(startChainage))
  const endIndex = Math.max(0, chainages.indexOf(endChainage))
  const lowIndex = Math.min(startIndex, endIndex)
  const highIndex = Math.max(startIndex, endIndex)

  const selectChainage = (value: string) => {
    if (pickMode === 'start') {
      onStartChange(value)
      if (chainages.indexOf(value) >= chainages.indexOf(endChainage)) {
        onEndChange(chainages[Math.min(chainages.length - 1, chainages.indexOf(value) + 1)])
      }
      setPickMode('end')
    } else {
      onEndChange(value)
      if (chainages.indexOf(value) <= chainages.indexOf(startChainage)) {
        onStartChange(chainages[Math.max(0, chainages.indexOf(value) - 1)])
      }
      setPickMode('start')
    }
  }

  const channelPath = 'M 205 -35 C 285 55 390 140 475 230 S 660 390 790 505 S 880 580 925 635'

  return (
    <div className="ew-window ew-map-window">
      <img className="ew-map-backdrop" src="/assets/earthwork-map.jpg" alt="航道水深分布工程图底图" />
      <div className="ew-map-dim" />
      <svg className="ew-map-svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" role="img" aria-label="航道水深分布图，可选择航段起止桩号">
        <defs>
          <linearGradient id="selectedChannelRange" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5fffe0" />
            <stop offset="100%" stopColor="#6fc6ff" />
          </linearGradient>
          <filter id="selectedRangeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        {/* The image provides the real-looking channel plan; this overlay adds interactive station/range information. */}
        <path d={channelPath} fill="none" stroke="#081a2c" strokeWidth="50" opacity=".18" />
        <path
          d={channelPath}
          pathLength="1000"
          fill="none"
          stroke="#62e9ff"
          strokeWidth="58"
          strokeDasharray={`${Math.max(1, (highIndex - lowIndex) * 250)} 1000`}
          strokeDashoffset={-(lowIndex * 250)}
          strokeLinecap="round"
          opacity=".26"
          filter="url(#selectedRangeGlow)"
          pointerEvents="none"
        />
        <path
          d={channelPath}
          pathLength="1000"
          fill="none"
          stroke="url(#selectedChannelRange)"
          strokeWidth="3.5"
          strokeDasharray={`${Math.max(1, (highIndex - lowIndex) * 250)} 1000`}
          strokeDashoffset={-(lowIndex * 250)}
          strokeLinecap="round"
          opacity=".98"
          pointerEvents="none"
        />
        <path d={channelPath} fill="none" stroke="#e5f4ff" strokeWidth="1.4" strokeDasharray="7 8" opacity=".9" />

        {[0, 1, 2, 3, 4].map(index => {
          const x = 310 + index * 155
          const y = 85 + index * 115
          return (
            <g key={`survey-${index}`} pointerEvents="none">
              <line x1={x - 62} y1={y - 95} x2={x + 62} y2={y + 95} stroke="#fff0b8" strokeWidth="1.6" opacity=".92" />
              <circle cx={x} cy={y} r="3.4" fill="#fff8df" stroke="#244866" strokeWidth="1" />
            </g>
          )
        })}

        {chainages.map((chainage, index) => {
          const point = stationPositions[index]
          const isStart = chainage === startChainage
          const isEnd = chainage === endChainage
          const selected = isStart || isEnd
          return (
            <g
              key={chainage}
              className="ew-map-pick"
              role="button"
              tabIndex={0}
              aria-label={`选择${chainage}作为${pickMode === 'start' ? '航段起点' : '航段终点'}`}
              onClick={() => selectChainage(chainage)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  selectChainage(chainage)
                }
              }}
            >
              <circle cx={point.x} cy={point.y} r={selected ? 8 : 5.5} fill={isStart ? '#28e0aa' : isEnd ? '#ffc85a' : '#2379ff'} stroke="#f5fbff" strokeWidth={selected ? 2.2 : 1.1} />
              <text x={point.x + 12} y={point.y - 12} fontSize="16" fontWeight="800" fill="#fff" stroke="#09213a" strokeWidth="4" paintOrder="stroke">{chainage}</text>
              {isStart && <text x={point.x + 12} y={point.y + 17} fontSize="11" fontWeight="700" fill="#63f4c5" stroke="#09213a" strokeWidth="3" paintOrder="stroke">起点</text>}
              {isEnd && <text x={point.x + 12} y={point.y + 17} fontSize="11" fontWeight="700" fill="#ffdc8a" stroke="#09213a" strokeWidth="3" paintOrder="stroke">终点</text>}
            </g>
          )
        })}
      </svg>

      <div className="ew-map-toolbar">
        <button className="ew-tool-btn" onClick={() => setPickMode(pickMode === 'start' ? 'end' : 'start')}>⚒ 定位</button>
        <span className="ew-map-selects">
          <strong>航段选择：</strong>
          <select aria-label="航段起点" value={startChainage} onChange={event => { onStartChange(event.target.value); if (chainages.indexOf(event.target.value) >= chainages.indexOf(endChainage)) onEndChange(chainages[Math.min(3, chainages.indexOf(event.target.value) + 1)]) }}>
            {chainages.slice(0, 3).map(value => <option key={value} value={value}>{value}</option>)}
          </select>
          <span className="ew-map-separator">～</span>
          <select aria-label="航段终点" value={endChainage} onChange={event => { onEndChange(event.target.value); if (chainages.indexOf(event.target.value) <= chainages.indexOf(startChainage)) onStartChange(chainages[Math.max(0, chainages.indexOf(event.target.value) - 1)]) }}>
            {chainages.slice(1).map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </span>
        <button className={`ew-tool-btn${pickMode === 'start' ? ' ew-map-select-mode' : ''}`} onClick={() => setPickMode('start')} title="点击地图桩号设置起点">起</button>
        <button className={`ew-tool-btn${pickMode === 'end' ? ' ew-map-select-mode' : ''}`} onClick={() => setPickMode('end')} title="点击地图桩号设置终点">止</button>
        <button className="ew-tool-btn" onClick={onReset} title="恢复默认航段">⇄</button>
      </div>

      <div className="ew-map-legend">
        <div className="ew-map-legend-title">水深/高程（m）</div>
        {[
          ['#f32732', '-5'],
          ['#ff8b19', '-10'],
          ['#ffe42c', '-15'],
          ['#45d84f', '-20'],
          ['#24d6c9', '-25'],
          ['#0875f3', '-30'],
        ].map(([color, label]) => (
          <div className="ew-map-legend-row" key={label}>
            <span className="ew-map-legend-color" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="ew-map-compass" aria-label="指北针">
        <svg viewBox="0 0 80 80" width="68" height="68" role="img" aria-label="N E S W compass">
          <circle cx="40" cy="40" r="26" fill="none" stroke="#b8d8f0" strokeOpacity=".42" />
          <circle cx="40" cy="40" r="17" fill="none" stroke="#b8d8f0" strokeOpacity=".25" />
          <path d="M40 10 L45 37 L40 32 L35 37 Z" fill="#f6fbff" />
          <path d="M40 70 L35 43 L40 48 L45 43 Z" fill="#6fa3ce" />
          <path d="M10 40 L37 35 L32 40 L37 45 Z" fill="#6fa3ce" />
          <path d="M70 40 L43 45 L48 40 L43 35 Z" fill="#6fa3ce" />
          <circle cx="40" cy="40" r="3.2" fill="#f7fbff" />
          <g fill="#edf6ff" fontSize="9" fontWeight="700" textAnchor="middle">
            <text x="40" y="8">N</text><text x="73" y="43">E</text><text x="40" y="79">S</text><text x="7" y="43">W</text>
          </g>
        </svg>
      </div>

      <div className="ew-map-scale">
        <span className="ew-map-scale-part">0</span>
        <span className="ew-map-scale-part">500</span>
        <span className="ew-map-scale-part">1,000 m</span>
      </div>
      <div className="ew-map-status">
        <span className="ew-live-dot" />
        航道水深图 · 已选航段 {startChainage} — {endChainage}
      </div>
    </div>
  )
}

function SectionView({ station, bottomLevel, onStationChange }: { station: string; bottomLevel: string; onStationChange: (value: string) => void }) {
  const [cursorX, setCursorX] = useState(600)
  const [showSoilTypes, setShowSoilTypes] = useState(false)
  const terrain = 'M58 45 C82 53 99 70 128 80 L170 80 C194 81 202 93 232 94 L265 105 L303 133 L340 158 L390 158 L438 156 L490 159 L545 157 L596 158 L646 157 L688 159 L722 155 L755 158 L782 151 L810 137 L845 122 L884 109 L918 95 L950 84 L985 76 L1020 54 L1055 45 L1095 43 L1140 37 L1140 224 L58 224 Z'
  // SVG 坐标的 y 值越大，屏幕位置越靠下；设计高程低于现状地形时，白色设计线应位于红线下方。
  const designY = Math.max(164, Math.min(204, 176 + (Math.abs(Number(bottomLevel)) - 12.5) * 4))
  const digArea = `M285 126 L303 133 L340 158 L390 158 L438 156 L490 159 L545 157 L596 158 L646 157 L688 159 L722 155 L755 158 L782 151 L810 137 L845 122 L884 109 L884 ${designY} L285 ${designY} Z`
  const selectedDistance = Math.round((cursorX - 58) / (1140 - 58) * 1200)
  const selectedDepth = (Math.abs(Number(bottomLevel)) - 8.32).toFixed(2)
  const soilColors = ['#8c6bd8', '#c99a56', '#d6bd73', '#8b9caa', '#7fba8a', '#b87969']
  const soilRows = earthworkResult.map((row, index) => ({
    ...row,
    color: soilColors[index % soilColors.length],
  }))
  const soilTotal = soilRows.reduce((sum, row) => sum + Math.max(0, row.volume), 0) || 1

  return (
    <section className="ew-window ew-section-window">
      <div className="ew-section-head">
        <span>断面视图</span>
        <select className="select" value={station} onChange={event => onStationChange(event.target.value)} aria-label="选择断面桩号">
          <option>K1+500</option><option>K1+400</option><option>K1+300</option><option>K1+200</option><option>K1+600</option>
        </select>
        <button
          type="button"
          className={`ew-soil-toggle${showSoilTypes ? ' active' : ''}`}
          aria-pressed={showSoilTypes}
          onClick={() => setShowSoilTypes(value => !value)}
        >
          {showSoilTypes ? '隐藏土层类型' : '显示土层类型'}
        </button>
        {showSoilTypes && (
          <div className="ew-soil-legend" aria-label="土层类型图例">
            {soilRows.map(row => (
              <span className="ew-soil-legend-item" key={row.type} title={`${row.type}：${row.volume.toFixed(2)} 万m³，占比 ${row.ratio}`}>
                <i className="ew-soil-legend-swatch" style={{ background: row.color }} />
                {row.type}
              </span>
            ))}
          </div>
        )}
        <div className="ew-section-legend">
          <span className="ew-legend-item"><i className="ew-legend-line" style={{ background: '#f5533b' }} />现状地形</span>
          <span className="ew-legend-item"><i className="ew-legend-line" style={{ background: '#e8f1ff' }} />设计高程</span>
          <span className="ew-legend-item"><i className="ew-legend-fill" />开挖范围</span>
        </div>
      </div>
      <div className="ew-section-canvas" onMouseMove={event => {
        const bounds = event.currentTarget.getBoundingClientRect()
        const x = Math.max(58, Math.min(1140, ((event.clientX - bounds.left - 8) / Math.max(1, bounds.width - 16)) * 1200))
        setCursorX(x)
      }}>
        <div className="ew-section-tooltip"><b>桩号：{station}</b><br />距离：{selectedDistance} m<br />现状高程：-8.32 m<br />设计高程：{Number(bottomLevel).toFixed(2)} m<br />开挖深度：{selectedDepth} m</div>
        <svg className="ew-section-svg" viewBox="0 0 1200 270" preserveAspectRatio="none" role="img" aria-label={showSoilTypes ? '航道横断面高程及土层类型分布图' : '航道横断面高程图'}>
          <defs>
            <linearGradient id="terrainFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#66717e"/><stop offset="100%" stopColor="#3c4858"/></linearGradient>
            <linearGradient id="cutFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#39d5ff" stopOpacity=".96"/><stop offset="100%" stopColor="#139bcf" stopOpacity=".9"/></linearGradient>
            <clipPath id="soilDistributionClip"><path d={digArea} /></clipPath>
          </defs>
          <rect x="58" y="22" width="1082" height="202" fill="rgba(0,100,148,.12)" />
          {[22,62,102,142,182,224].map((y, i) => <g key={`gy${y}`}><line x1="58" y1={y} x2="1140" y2={y} stroke="rgba(114,155,202,.2)" strokeWidth="1"/><text x="48" y={y + 4} textAnchor="end">{10 - i * 10}</text></g>)}
          {[58,238,418,598,778,958,1140].map((x, i) => <g key={`gx${x}`}><line x1={x} y1="22" x2={x} y2="224" stroke="rgba(114,155,202,.15)" strokeWidth="1"/><text x={x} y="246" textAnchor="middle">{i * 200}</text></g>)}
          <path d={terrain} fill="url(#terrainFill)" stroke="#f5533b" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
          {!showSoilTypes && <path d={digArea} fill="url(#cutFill)" opacity=".95" />}
          {showSoilTypes && (
            <g clipPath="url(#soilDistributionClip)">
              {soilRows.map((row, index) => {
                const bandHeight = (designY - 116) * (Math.max(0, row.volume) / soilTotal)
                const y = 116 + soilRows.slice(0, index).reduce((sum, previous) => sum + (designY - 116) * (Math.max(0, previous.volume) / soilTotal), 0)
                return (
                  <g key={row.type}>
                    <rect x="285" y={y} width="600" height={Math.max(0, bandHeight)} fill={row.color} opacity=".94" />
                    {bandHeight > 13 && <text className="ew-soil-label" x="585" y={y + bandHeight / 2 + 3} textAnchor="middle" fill="#fff">{row.type}</text>}
                  </g>
                )
              })}
            </g>
          )}
          <path d={`M285 ${designY} L884 ${designY}`} stroke="#e8f1ff" strokeWidth="2.2" strokeDasharray="6 4" vectorEffect="non-scaling-stroke" />
          <line x1={cursorX} y1="22" x2={cursorX} y2="224" stroke="#f5f9ff" strokeWidth="1" strokeDasharray="4 4" opacity=".8" vectorEffect="non-scaling-stroke" />
          <circle cx={cursorX} cy={designY} r="4" fill="#fff" stroke="#29c9f3" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <text x="600" y="265" textAnchor="middle">距离（m）</text>
          <text x="14" y="126" transform="rotate(-90 14 126)" textAnchor="middle">高程（m）</text>
        </svg>
      </div>
    </section>
  )
}

function LegacyEarthwork() {
  const [stage, setStage] = useState<CalcStage>('done')
  const [progress, setProgress] = useState(100)
  const [seg, setSeg] = useState('K1+000 ~ K2+000')
  const [station, setStation] = useState('K1+500')
  const [bottomLevel, setBottomLevel] = useState('-12.50')
  const [slope, setSlope] = useState('1:5')
  const [overbreak, setOverbreak] = useState('0.30')
  const [excavation, setExcavation] = useState('疏浚开挖')
  const [startChainage, setStartChainage] = useState('K1+000')
  const [endChainage, setEndChainage] = useState('K2+000')
  const [uploadedFile, setUploadedFile] = useState('航道设计图.dwg')

  useEffect(() => {
    if (stage !== 'running') return
    const timer = window.setInterval(() => {
      setProgress(current => Math.min(100, current + 7 + Math.round(Math.random() * 10)))
    }, 160)
    return () => window.clearInterval(timer)
  }, [stage])

  useEffect(() => {
    if (stage === 'running' && progress >= 100) {
      const timer = window.setTimeout(() => setStage('done'), 250)
      return () => window.clearTimeout(timer)
    }
  }, [progress, stage])

  const start = () => {
    if (stage === 'running') return
    setProgress(0)
    setStage('running')
  }

  const resetView = () => {
    setStation('K1+500')
    setSeg('K1+000 ~ K2+000')
  }

  const exportResult = () => {
    const rows = [
      ['项目', '数值'], ['航段', seg], ['断面桩号', station], ['设计底高程(m)', bottomLevel],
      ['设计边坡', slope], ['超挖厚度(m)', overbreak], ['开挖方式', excavation],
      ['挖方量(万m³)', String(earthworkSummary.dig)], ['填方量(万m³)', String(earthworkSummary.fill)],
      ['净方量(万m³)', String(earthworkSummary.net)], ['计算面积(km²)', String(earthworkSummary.area)],
      ...earthworkResult.map(row => [row.type, `${row.volume.toFixed(2)} 万m³`]),
    ]
    const csv = '\uFEFF' + rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = '分层土方计算结果.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="earthwork-page">
      <style>{earthworkStyles}</style>
      <main className="earthwork-main">
        <ChannelMap onReset={resetView} startChainage={startChainage} endChainage={endChainage} onStartChange={setStartChainage} onEndChange={setEndChainage} />
        <SectionView station={station} bottomLevel={bottomLevel} onStationChange={setStation} />
      </main>

      <aside className="ew-sidebar">
        <Collapse title="设计文件导入">
          <div className="ew-format-note">支持格式：DWG、DXF、TIN、SHP、CSV、TID、TXT</div>
          <UploadBox accept=".dwg,.dxf,.tin,.shp,.csv,.tid,.txt" hint="支持拖拽上传" onChange={files => {
            const latest = files[files.length - 1]
            if (latest) setUploadedFile(latest.name)
          }} />
          <div className="ew-file-line">
            <span className="ew-file-check">✓</span>
            <span className="ew-file-name">{uploadedFile}</span>
            <span className="ew-file-size">{uploadedFile === '航道设计图.dwg' ? '12.3 MB' : '已选择'}</span>
          </div>
        </Collapse>

        <Collapse title="设计参数设置">
          <div className="ew-field-grid">
            <div className="ew-field"><label>设计底高程 (m)</label><select className="select" value={bottomLevel} onChange={event => setBottomLevel(event.target.value)}><option>-12.50</option><option>-13.00</option><option>-14.00</option></select></div>
            <div className="ew-field"><label>设计边坡</label><select className="select" value={slope} onChange={event => setSlope(event.target.value)}><option>1:5</option><option>1:4</option><option>1:6</option></select></div>
            <div className="ew-field"><label>超挖厚度 (m)</label><select className="select" value={overbreak} onChange={event => setOverbreak(event.target.value)}><option>0.30</option><option>0.50</option><option>0.00</option></select></div>
            <div className="ew-field"><label>开挖方式</label><select className="select" value={excavation} onChange={event => setExcavation(event.target.value)}><option>疏浚开挖</option><option>爆破开挖</option><option>机械开挖</option></select></div>
          </div>
        </Collapse>

        <Collapse title="航段选择">
          <div className="ew-field-grid">
            <div className="ew-field"><label>航段起点</label><select className="select" value={startChainage} onChange={event => setStartChainage(event.target.value)}><option>K0+000</option><option>K1+000</option><option>K2+000</option></select></div>
            <div className="ew-field"><label>航段终点</label><select className="select" value={endChainage} onChange={event => setEndChainage(event.target.value)}><option>K1+000</option><option>K2+000</option><option>K3+000</option></select></div>
          </div>
          <div className="ew-segments">
            {['K0+000 ~ K1+000', 'K1+000 ~ K2+000', 'K2+000 ~ K3+000'].map(value => (
              <button key={value} className={`ew-segment${seg === value ? ' active' : ''}`} onClick={() => {
                setSeg(value)
                const [startValue, endValue] = value.split(' ~ ')
                setStartChainage(startValue)
                setEndChainage(endValue)
              }}>{value}</button>
            ))}
          </div>
        </Collapse>

        <Collapse title="计算与成果">
          <button className="btn btn-primary ew-calc-btn" disabled={stage === 'running'} onClick={start}>
            <IconPlay size={14} />{stage === 'running' ? '正在计算…' : '开始计算'}
          </button>
          {stage === 'running' && <><div className="ew-calc-status">正在进行断面分析与土方量计算…</div><div className="ew-progress"><i style={{ width: `${progress}%` }} /></div><div className="ew-format-note" style={{ textAlign: 'right', marginTop: 4 }}>{progress}%</div></>}
          {stage === 'done' && <>
            <div className="ew-calc-status">✓ 计算完成（{seg}）</div>
            <div className="ew-result-grid">
              {[
                ['挖方量', `${earthworkSummary.dig}`, '万m³'], ['填方量', `${earthworkSummary.fill}`, '万m³'],
                ['净方量', `${earthworkSummary.net}`, '万m³'], ['计算面积', `${earthworkSummary.area}`, 'km²'],
                ['最大挖深', `${earthworkSummary.maxDig}`, 'm'], ['最大填高', `${earthworkSummary.maxFill}`, 'm'],
              ].map(([label, value, unit]) => <div className="ew-result-card" key={label}><div className="ew-result-label">{label}</div><div className="ew-result-value">{value}<small>{unit}</small></div></div>)}
            </div>
            <div className="ew-table-wrap">
              <table className="tbl"><thead><tr><th>土层类型</th><th>方量 (万m³)</th><th>占比</th></tr></thead><tbody>
                {earthworkResult.map(row => <tr key={row.type}><td className="cell-main">{row.type}</td><td>{row.volume.toFixed(2)}</td><td>{row.ratio}</td></tr>)}
                <tr><td className="cell-main bold">合计</td><td className="bold cell-main">297.57</td><td className="bold cell-main">100%</td></tr>
              </tbody></table>
            </div>
            <button className="btn btn-ghost ew-export" onClick={exportResult}><IconDownload size={13} />导出计算结果 CSV</button>
          </>}
        </Collapse>
      </aside>
    </div>
  )
}


export default function Earthwork() {
  const [mode, setMode] = useState<'legacy' | 'model' | 'survey'>('legacy')
  return <div className="quantity-shell">
    <div className="quantity-modes">
      {([['legacy', '现有航段算量'], ['model', '地层模型算量'], ['survey', '水深数据算量']] as const).map(([value, label]) => <button key={value} className={'btn btn-sm ' + (mode === value ? 'btn-primary' : 'btn-ghost')} onClick={() => setMode(value)}>{label}</button>)}
      <span className="t3 f11" style={{ marginLeft: 'auto' }}>土方算量工作台 · 演示</span>
    </div>
    <div className={'quantity-content' + (mode !== 'legacy' ? ' quantity-mode-hidden' : '')}><LegacyEarthwork /></div>
    {mode !== 'legacy' && <div className="quantity-content"><QuantityWorkspace key={mode} mode={mode} /></div>}
  </div>
}
