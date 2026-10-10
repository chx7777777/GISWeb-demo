import { useEffect, useRef, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import ModelParameters from './ModelParameters'
import { activeModel, useModels, saveModel, selectModel, methodName, interpolationName, sourceSummary } from './modelStore'
import EChart from '../../components/EChart'
import SideMenu from '../../components/SideMenu'
import {
  IconBox, IconChart, IconDetail, IconEdit, IconLayer, IconMeasure,
  IconModel, IconReset, IconScreen, IconSlice, IconWalk,
} from '../../components/icons'
import { layerVolumeLegend, strata } from '../../mock/data'
import { createViewer, ViewerHandle, MeasurementPoint, PickInfo, SectionPoint, SectionProfile, calculateSectionProfile } from './StrataViewer'

const menuItems = [
  { to: '/model', label: '模型总览', icon: <IconModel size={15} />, end: true },
  { to: '/model/build', label: '地层建模', icon: <IconBox size={15} /> },
  { to: '/model/precision', label: '模型精度分析', icon: <IconChart size={15} /> },
]

function ModelInfo() {
  const { record, version } = activeModel(useModels())
  return <div className="side-block"><h4>模型信息</h4><div className="f12" style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowWrap: 'anywhere' }}>
    {[['模型名称', version.config.name], ['所属项目', version.config.project], ['版本', `v${version.number}.0 / 共 ${record.versions.length} 版`], ['建模数据', sourceSummary(version.config)], ['建模方法', methodName(version.config.method)], ['插值方法', interpolationName(version.config.interpolation)], ['建模时间', new Date(version.createdAt).toLocaleString('zh-CN')]].map(([label, value]) => <div key={label}><span className="t3">{label}：</span>{value}</div>)}
    <span className="tag tag-blue">演示模型</span>
  </div></div>
}

export default function ModelLayout() {
  return (
    <>
      <SideMenu title="地层模型" items={menuItems}><ModelInfo /></SideMenu>
      <div className="app-main"><Outlet /></div>
    </>
  )
}

function Collapse({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={'collapse' + (open ? ' open' : '')}>
      <div className="collapse-head" onClick={() => setOpen(!open)}>
        {title}<span className="arr">▾</span>
      </div>
      <div className="collapse-body">{children}</div>
    </div>
  )
}

/* 剖切结果：由当前 Demo 地层网格使用的同一套厚度函数计算生成。 */
function SectionResult({ profile, onClose, onRedraw }: { profile: SectionProfile; onClose: () => void; onRedraw: () => void }) {
  const width = 1000
  const height = 390
  const left = 58
  const right = 978
  const top = 38
  const bottom = 330
  const plotWidth = right - left
  const plotHeight = bottom - top
  const maxDepth = Math.max(1, profile.maxDepth)
  const xAt = (i: number) => left + (i / Math.max(1, profile.samples.length - 1)) * plotWidth
  const yAt = (depth: number) => top + (depth / maxDepth) * plotHeight
  const pointString = (layerIndex: number, field: 'topDepth' | 'bottomDepth') => profile.samples.map((sample, i) => `${xAt(i).toFixed(1)},${yAt(sample.layers[layerIndex][field]).toFixed(1)}`)
  const averageThickness = strata.map((layer, layerIndex) => ({
    ...layer,
    average: profile.samples.reduce((sum, sample) => sum + sample.layers[layerIndex].bottomDepth - sample.layers[layerIndex].topDepth, 0) / profile.samples.length,
  }))
  const tickCount = 5
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(2, 8, 20, .78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div className="panel" style={{ width: 'min(1180px, 96vw)', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.45)' }}>
        <div className="panel-head" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconSlice size={16} />
          <span>地质剖面 A—B</span>
          <span className="tag tag-blue">演示模型计算结果</span>
          <span style={{ flex: 1 }} />
          <button className="btn btn-ghost btn-sm" onClick={onRedraw}>重新绘制</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="panel-body" style={{ overflow: 'auto' }}>
          <div className="grid2" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
            {[
              ['剖切线长度', `${profile.length.toFixed(1)} m`],
              ['最大计算深度', `${profile.maxDepth.toFixed(1)} m`],
              ['剖面钻孔', `${profile.boreholes.length} 个`],
            ].map(([label, value]) => (
              <div key={label} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', background: 'var(--bg-panel)' }}>
                <div className="f11 t3">{label}</div><div className="f16 bold mt4">{value}</div>
              </div>
            ))}
          </div>
          <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="地层剖面图" style={{ width: '100%', minHeight: 250, background: '#071426', border: '1px solid var(--border)', borderRadius: 8, display: 'block' }}>
            <rect width={width} height={height} fill="#071426" />
            {Array.from({ length: tickCount + 1 }, (_, i) => {
              const depth = maxDepth * i / tickCount
              const y = yAt(depth)
              return <g key={`grid-${i}`}><line x1={left} y1={y} x2={right} y2={y} stroke="#1c3557" strokeDasharray="4 4" /><text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#8ba5ca">-{depth.toFixed(0)} m</text></g>
            })}
            {strata.map((layer, layerIndex) => {
              const upper = pointString(layerIndex, 'topDepth')
              const lower = pointString(layerIndex, 'bottomDepth').reverse()
              const points = [...upper, ...lower].join(' ')
              return <polygon key={layer.id} points={points} fill={layer.color} fillOpacity=".88" stroke="#071426" strokeWidth="1.5" />
            })}
            {profile.boreholes.map((hole, index) => {
              const x = left + (hole.distance / Math.max(profile.length, 1)) * plotWidth
              const yBottom = yAt(Math.min(hole.depth, maxDepth))
              return <g key={`${hole.id}-${index}`}>
                <line x1={x} y1={top} x2={x} y2={yBottom} stroke="#e5edf9" strokeWidth="2" />
                <rect x={x - 34} y={top - 23} width="68" height="17" rx="3" fill="#102a49" stroke="#4b76a8" />
                <text x={x} y={top - 11} textAnchor="middle" fontSize="10" fill="#dbeafe">{hole.id}</text>
              </g>
            })}
            <line x1={left} y1={top} x2={left} y2={bottom} stroke="#8ba5ca" />
            <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="#8ba5ca" />
            <text x={left} y={height - 15} fontSize="11" fill="#8ba5ca">A（起点）</text>
            <text x={right} y={height - 15} textAnchor="end" fontSize="11" fill="#8ba5ca">B（终点）</text>
            <text x={right} y={18} textAnchor="end" fontSize="11" fill="#8ba5ca">水平距离：{profile.length.toFixed(1)} m</text>
          </svg>
          <div className="flex aic g12 mt10" style={{ flexWrap: 'wrap' }}>
            {strata.map(layer => <span key={layer.id} className="flex aic g6 f11 t2"><i style={{ width: 10, height: 10, borderRadius: 2, background: layer.color, display: 'inline-block' }} />{layer.name}</span>)}
          </div>
          <div className="table-wrap mt12" style={{ maxHeight: 180 }}>
            <table className="tbl">
              <thead><tr><th>地层编号</th><th>地层名称</th><th>剖面平均厚度 (m)</th><th>剖面最大深度 (m)</th></tr></thead>
              <tbody>{averageThickness.map((layer, i) => <tr key={layer.id}><td>{layer.id}</td><td className="cell-main">{layer.name}</td><td>{layer.average.toFixed(2)}</td><td>{profile.samples.reduce((max, sample) => Math.max(max, sample.layers[i].bottomDepth), 0).toFixed(2)}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="f11 t3 mt8">说明：当前结果依据 Demo 程序生成的程序化地层曲面计算，用于验证交互流程；不是实测地质成果，暂不用于工程计量或正式报告。</div>
        </div>
      </div>
    </div>
  )
}

/* ================= 模型总览（三维） ================= */
export function ModelOverview() {
  const models = useModels()
  const { record: currentModel, version: currentVersion } = activeModel(models)
  const [parameterDraft, setParameterDraft] = useState(currentVersion.config)
  const [parameterMessage, setParameterMessage] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerHandle | null>(null)
  const [pick, setPick] = useState<PickInfo | null>(null)
  const [visible, setVisible] = useState<boolean[]>(strata.map(() => true))
  const [opacities, setOpacities] = useState<number[]>(strata.map(() => 1))
  const [displayMode, setDisplayMode] = useState<'分层显示' | '地层透明' | '实体显示'>('分层显示')
  const [roaming, setRoaming] = useState(false)
  const [tab, setTab] = useState('地层统计')
  const [sectionMode, setSectionMode] = useState(false)
  const [sectionPoints, setSectionPoints] = useState<SectionPoint[]>([])
  const sectionPointsRef = useRef<SectionPoint[]>([])
  const [sectionProfile, setSectionProfile] = useState<SectionProfile | null>(null)
  const [showSectionResult, setShowSectionResult] = useState(false)

  const [measuring, setMeasuring] = useState(false)
  const [measurementConfirmed, setMeasurementConfirmed] = useState(false)
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([])
  const previousDisplayMode = useRef(displayMode)
  const measurement = measurementPoints.length === 2 ? {
    distance: Math.hypot(measurementPoints[1].x - measurementPoints[0].x, measurementPoints[1].y - measurementPoints[0].y, measurementPoints[1].z - measurementPoints[0].z),
    horizontal: Math.hypot(measurementPoints[1].x - measurementPoints[0].x, measurementPoints[1].z - measurementPoints[0].z),
    elevation: measurementPoints[1].y - measurementPoints[0].y,
  } : null

  const editMeasurement = (points = measurementPoints) => {
    setMeasurementConfirmed(false)
    setMeasurementPoints(points)
    viewerRef.current?.setMeasurement(true, true, points, setMeasurementPoints)
  }
  const exitMeasurement = () => {
    viewerRef.current?.setMeasurement(false, false, [])
    setMeasuring(false)
    setMeasurementPoints([])
    setMeasurementConfirmed(false)
    changeMode(previousDisplayMode.current)
  }
  const toggleMeasurement = () => {
    if (measuring) { exitMeasurement(); return }
    previousDisplayMode.current = displayMode
    viewerRef.current?.setSectionMode(false)
    updateSectionPoints([])
    setSectionMode(false)
    setSectionProfile(null)
    setShowSectionResult(false)
    setPick(null)
    setRoaming(false)
    viewerRef.current?.setAutoRotate(false)
    changeMode('实体显示')
    setMeasuring(true)
    editMeasurement([])
  }
  const confirmMeasurement = () => {
    if (!measurement || measurement.distance < 0.01) return
    setMeasurementConfirmed(true)
    viewerRef.current?.setMeasurement(true, false, measurementPoints)
  }

  const updateSectionPoints = (points: SectionPoint[]) => {
    sectionPointsRef.current = points
    setSectionPoints(points)
    viewerRef.current?.setSectionLine(points[0] || null, points[1] || null)
  }

  const beginSection = (reset = false) => {
    if (measuring) exitMeasurement()
    setShowSectionResult(false)
    setPick(null)
    setRoaming(false)
    viewerRef.current?.setAutoRotate(false)
    if (reset) updateSectionPoints([])
    setSectionMode(true)
    viewerRef.current?.setSectionMode(true, point => {
      const previous = sectionPointsRef.current
      if (previous.length < 2) updateSectionPoints([...previous, point])
    }, updateSectionPoints)
  }

  const toggleSection = () => {
    if (sectionMode) {
      viewerRef.current?.setSectionMode(false)
      setSectionMode(false)
      updateSectionPoints([])
      setSectionProfile(null)
      return
    }
    beginSection()
  }

  const confirmSection = () => {
    const [start, end] = sectionPointsRef.current
    if (!start || !end || Math.hypot(end.x - start.x, end.z - start.z) < 4) return
    setSectionProfile(calculateSectionProfile(start, end, 61, currentVersion))
    viewerRef.current?.setSectionMode(false)
    setSectionMode(false)
    setShowSectionResult(true)
  }

  const redrawSection = () => beginSection(true)
  const sectionLength = sectionPoints.length === 2 ? Math.hypot(sectionPoints[1].x - sectionPoints[0].x, sectionPoints[1].z - sectionPoints[0].z) : 0

  useEffect(() => {
    if (!boxRef.current) return
    const v = createViewer(boxRef.current, setPick, currentVersion)
    viewerRef.current = v
    v.setExploded(true)
    setDisplayMode('分层显示')
    setVisible(strata.map(() => true))
    setOpacities(strata.map(() => 1))
    setRoaming(false)
    setMeasuring(false)
    setMeasurementPoints([])
    setMeasurementConfirmed(false)
    setSectionMode(false)
    setSectionPoints([])
    sectionPointsRef.current = []
    setSectionProfile(null)
    setShowSectionResult(false)
    setPick(null)
    setParameterDraft(currentVersion.config)
    setParameterMessage('')
    return () => v.dispose()
  }, [currentVersion.id])

  const changeMode = (m: typeof displayMode) => {
    setDisplayMode(m)
    const v = viewerRef.current
    if (!v) return
    v.setExploded(m === '分层显示')
    v.setTransparent(m === '地层透明')
    if (m !== '地层透明') opacities.forEach((opacity, i) => v.setLayerOpacity(i, opacity))
  }

  const toggleLayer = (i: number) => {
    const next = visible.map((x, idx) => (idx === i ? !x : x))
    setVisible(next)
    viewerRef.current?.setLayerVisible(i, next[i])
  }

  const changeOpacity = (i: number, o: number) => {
    const next = opacities.map((x, idx) => (idx === i ? o : x))
    setOpacities(next)
    if (displayMode !== '地层透明') viewerRef.current?.setLayerOpacity(i, o)
  }

  const rebuild = () => {
    try { saveModel(parameterDraft, currentModel.id, true) }
    catch (error) { setParameterMessage((error as Error).message) }
  }

  const toggleRoaming = () => {
    setRoaming(!roaming)
    viewerRef.current?.setAutoRotate(!roaming)
  }

  const fullscreen = () => {
    const el = boxRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  const donutOption = {
    tooltip: { trigger: 'item' as const, backgroundColor: '#0f2444', borderColor: '#24508a', textStyle: { color: '#e8f1ff', fontSize: 11 } },
    legend: { orient: 'vertical' as const, right: 0, top: 'middle', icon: 'circle', itemWidth: 7, itemHeight: 7,
      textStyle: { color: '#7f97bd', fontSize: 10 }, formatter: (n: string) => {
        const it = layerVolumeLegend.find(l => l.name === n)!
        return `${n}  ${(it.value / 1e6).toFixed(1)}×10⁶ (${it.ratio}%)`
      } },
    series: [{
      type: 'pie' as const, radius: ['50%', '72%'], center: ['28%', '50%'],
      label: { show: true, position: 'center' as const, formatter: '总量\n1,255,342,180 m³', color: '#fff', fontSize: 11, lineHeight: 16 },
      itemStyle: { borderColor: '#0c1d38', borderWidth: 2 },
      data: layerVolumeLegend.map(l => ({ name: l.name, value: l.value, itemStyle: { color: l.color } })),
    }],
  }

  const toolBtns = [
    { name: '测量', icon: <IconMeasure size={13} /> },
    { name: '剖切', icon: <IconSlice size={13} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div className="f11 t3">演示建模：参数驱动三维形态；下方体积、厚度及精度表为固定示例统计，不代表当前版本的计算成果。</div>
      {/* 顶部控制条 */}
      <div className="flex aic g12" style={{ flexWrap: 'wrap' }}>
        <span className="f12 t3">模型选择</span>
        <select aria-label="模型选择" className="select" value={currentModel.id} onChange={e => selectModel(e.target.value)}>{models.records.filter(r => r.versions.length).map(r => <option value={r.id} key={r.id}>{r.draft.name}</option>)}</select>
        <select aria-label="模型版本" className="select" value={currentVersion.id} onChange={e => selectModel(currentModel.id, e.target.value)}>{currentModel.versions.map(v => <option value={v.id} key={v.id}>v{v.number}.0 · {new Date(v.createdAt).toLocaleDateString('zh-CN')}</option>)}</select>
        <span className="f12 t3">显示模式</span>
        <span className="flex g6">
          {(['分层显示', '地层透明', '实体显示'] as const).map(m => (
            <button key={m} className={'btn btn-sm' + (displayMode === m ? ' btn-primary' : ' btn-ghost')} disabled={measuring} onClick={() => changeMode(m)}>{m}</button>
          ))}
        </span>
        <span style={{ flex: 1 }} />
        <span className="flex g6">
          {toolBtns.map(t => <button key={t.name} className={'btn btn-sm' + ((t.name === '剖切' && sectionMode || t.name === '测量' && measuring) ? ' btn-primary' : ' btn-ghost')} onClick={t.name === '剖切' ? toggleSection : t.name === '测量' ? toggleMeasurement : undefined}>{t.icon} {t.name === '测量' && measuring ? '退出测量' : t.name === '剖切' && sectionMode ? '取消剖切' : t.name === '剖切' && sectionProfile ? '调整剖切' : t.name}</button>)}
          <button className={'btn btn-sm' + (roaming ? ' btn-primary' : ' btn-ghost')} disabled={sectionMode || measuring} onClick={toggleRoaming}><IconWalk size={13} /> 漫游</button>
          <button className="btn btn-sm btn-ghost" onClick={fullscreen}><IconScreen size={13} /> 全屏</button>
          <button className="btn btn-sm btn-ghost" onClick={() => viewerRef.current?.resetCamera()}><IconReset size={13} /> 重置</button>
        </span>
      </div>

      <div className="flex" style={{ flex: 1, minHeight: 0, gap: 12 }}>
        {/* 三维视图 */}
        <div className="viewer-wrap" ref={boxRef}>
          {measuring && <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 30, padding: '10px 14px', border: '1px solid #398da6', borderRadius: 8, background: 'rgba(8,20,38,.94)', color: '#e7f0ff', fontSize: 12 }}>
            <div>{measurementConfirmed ? '测量已确认 · 可旋转、缩放查看结果' : measurementPoints.length === 0 ? '① 请在可见地层表面选择起点 A' : measurementPoints.length === 1 ? '② 请选择终点 B，可旋转模型选择侧面' : '③ 拖动 A / B 贴合地层表面调整，然后确认测量'}</div>
            <div className="t3 mt4">已合拢地层，按模型原始坐标测量 · 空白处不落点 · 演示模型 1 单位 = 1 m</div>
            {measurement && <div className="flex g12 mt8" style={{ flexWrap: 'wrap', color: '#67e8f9' }}>
              <span>空间距离：{measurement.distance.toFixed(2)} m</span>
              <span>水平距离：{measurement.horizontal.toFixed(2)} m</span>
              <span>B 相对 A：{Math.abs(measurement.elevation) < 0.005 ? '等高' : `${measurement.elevation > 0 ? '升高' : '降低'} ${Math.abs(measurement.elevation).toFixed(2)} m`}</span>
              {measurement.distance < 0.01 && <span style={{ color: '#fb7185' }}>两点重合，请调整端点</span>}
            </div>}
            <div className="flex aic g6 mt8" style={{ flexWrap: 'wrap' }}>
              <span className="t3">拖动空白区域旋转 · 滚轮缩放</span><span style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm" onClick={() => editMeasurement([])}>重新测量</button>
              <button className="btn btn-ghost btn-sm" disabled={!measurementPoints.length} onClick={() => editMeasurement([])}>清除</button>
              {measurementConfirmed ? <button className="btn btn-primary btn-sm" onClick={() => editMeasurement()}>调整端点</button> : <button className="btn btn-primary btn-sm" disabled={!measurement || measurement.distance < 0.01} onClick={confirmMeasurement}>确认测量</button>}
              <button className="btn btn-ghost btn-sm" onClick={exitMeasurement}>退出</button>
            </div>
          </div>}
          {sectionMode && <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 30, padding: '10px 14px', border: '1px solid #4b76a8', borderRadius: 8, background: 'rgba(8,20,38,.94)', color: '#e7f0ff', fontSize: 12 }}>
            <div>{sectionPoints.length === 0 ? '① 点击模型设置 A 点，再点击设置 B 点' : sectionPoints.length === 1 ? '② A 点已设置，可拖动调整；点击模型设置 B 点' : '③ 拖动 A / B 调整端点，拖动黄色连线整体移动，然后确认'}</div>
            <div className="flex aic g8 mt8" style={{ flexWrap: 'wrap' }}>
              <span className="t3">拖动空白区域旋转视角 · 滚轮缩放</span>
              {sectionPoints.length === 2 && <span style={{ color: sectionLength < 4 ? '#fb7185' : '#ffcf5a' }}>{sectionLength < 4 ? '端点过近，请拉开至至少 4 m' : `剖切长度 ${sectionLength.toFixed(1)} m`}</span>}
              <span style={{ flex: 1 }} />
              <button className="btn btn-ghost btn-sm" onClick={redrawSection}>重新选点</button>
              <button className="btn btn-primary btn-sm" disabled={sectionPoints.length !== 2 || sectionLength < 4} onClick={confirmSection}>确认剖切</button>
            </div>
          </div>}
          {pick && (
            <div className="viewer-tip" style={{ left: Math.min(pick.x + 12, (boxRef.current?.clientWidth || 400) - 170), top: pick.y + 8 }}
              dangerouslySetInnerHTML={{ __html: pick.html }} />
          )}
          {/* 图例 */}
          <div className="legend-float">
            <h5>地层图例</h5>
            {strata.map(s => (
              <div className="lg-row" key={s.id}>
                <span className="sw" style={{ background: s.color, opacity: visible[s.id - 1] ? 1 : 0.25 }} />
                <span style={{ opacity: visible[s.id - 1] ? 1 : 0.4 }}>{s.id} {s.name}</span>
              </div>
            ))}
          </div>
          <div className="map-scale" style={{ color: 'var(--text-3)' }}><span>500 m</span><span className="bar" /></div>
          <div className="map-coord">X: 464896.31&nbsp;&nbsp;Y: 2513305.99&nbsp;&nbsp;Z: -28.50</div>
        </div>

        {/* 右侧控制面板 */}
        <div className="panel" style={{ width: 250, flex: 'none' }}>
          <div className="panel-body no-pad scroll">
            <Collapse title="图层控制">
              <div className="form-row" style={{ marginBottom: 8 }}>
                <label className="f11 t3">地层分组</label>
                <select className="select" style={{ height: 26 }}><option>全部地层</option><option>软土层</option><option>砂土层</option><option>岩层</option></select>
              </div>
              {strata.map((s, i) => (
                <div className="layer-row" key={s.id}>
                  <input type="checkbox" checked={visible[i]} onChange={() => toggleLayer(i)} style={{ accentColor: 'var(--primary)' }} />
                  <span className="sw" style={{ background: s.color }} />
                  <span className="nm">{s.id} {s.name}</span>
                  <input type="range" className="slider" min={0.1} max={1} step={0.05} value={opacities[i]}
                    style={{ '--val': (opacities[i] * 100) + '%' } as any}
                    onChange={e => changeOpacity(i, Number(e.target.value))} />
                  <span className="pct">{Math.round(opacities[i] * 100)}%</span>
                </div>
              ))}
            </Collapse>
            <Collapse title="模型参数">
              <div className="f11 t3 mb12">当前 v{currentVersion.number}.0 · {sourceSummary(currentVersion.config)}</div>
              <ModelParameters config={parameterDraft} onChange={setParameterDraft} />
              {parameterMessage && <div role="alert" style={{ color: '#fb7185' }}>{parameterMessage}</div>}
              <button className="btn btn-primary mt12" style={{ width: '100%' }} onClick={rebuild}>重新建模 · 生成 v{currentModel.versions.length + 1}.0</button>
              <button className="btn btn-ghost mt8" style={{ width: '100%' }} onClick={() => { setParameterDraft(currentVersion.config); setParameterMessage('') }}>恢复当前版本参数</button>
            </Collapse>
          </div>
        </div>
      </div>

      {/* 底部统计 */}
      <div className="grid2" style={{ flex: 'none', minHeight: 220, gridTemplateColumns: '1.25fr 1fr' }}>
        <div className="panel">
          <div className="tabs">
            {['地层统计', '模型精度', '模型日志'].map(t => (
              <div key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>{t}</div>
            ))}
          </div>
          <div className="table-wrap" style={{ maxHeight: 190 }}>
            {tab === '地层统计' ? (
              <table className="tbl">
                <thead><tr><th>地层编号</th><th>地层名称</th><th>平均厚度(m)</th><th>最小厚度(m)</th><th>最大厚度(m)</th><th>体积(m³)</th><th>体积占比(%)</th></tr></thead>
                <tbody>
                  {strata.map(s => (
                    <tr key={s.id}>
                      <td><span className="flex aic g6"><i style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />{s.id}</span></td>
                      <td className="cell-main">{s.name}</td>
                      <td>{s.avgThickness ? s.avgThickness.toFixed(2) : '-'}</td>
                      <td>{s.minThickness ? s.minThickness.toFixed(2) : '-'}</td>
                      <td>{s.maxThickness ? s.maxThickness.toFixed(2) : '-'}</td>
                      <td>{s.volume.toLocaleString()}</td><td>{s.ratio.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr><td colSpan={5} className="cell-main bold">合计</td><td className="bold cell-main">1,255,342,180</td><td className="bold cell-main">100.00</td></tr>
                </tbody>
              </table>
            ) : tab === '模型精度' ? (
              <table className="tbl">
                <thead><tr><th>评价指标</th><th>数值</th><th>等级</th></tr></thead>
                <tbody>
                  {[['层面平均误差', '0.32 m', '优'], ['体积计算误差', '1.8 %', '优'], ['钻孔吻合率', '96.4 %', '优'], ['插值置信度', '0.91', '良'], ['整体精度等级', '良', '良']].map((r, i) => (
                    <tr key={i}><td className="cell-main">{r[0]}</td><td>{r[1]}</td><td><span className={'tag ' + (r[2] === '优' ? 'tag-green' : 'tag-blue')}>{r[2]}</span></td></tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="tbl">
                <thead><tr><th>时间</th><th>操作</th><th>操作人</th></tr></thead>
                <tbody>
                  {currentModel.versions.slice().reverse().map(v => [new Date(v.createdAt).toLocaleString('zh-CN'), `生成演示模型 v${v.number}.0 · ${methodName(v.config.method)}`, 'admin']).map((r, i) => (
                    <tr key={i}><td>{r[0]}</td><td className="cell-main">{r[1]}</td><td>{r[2]}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">地层体积占比（示例统计）</div>
          <div className="panel-body no-pad"><EChart option={donutOption} height={210} /></div>
        </div>
      </div>
      {showSectionResult && sectionProfile && <SectionResult profile={sectionProfile} onClose={() => setShowSectionResult(false)} onRedraw={redrawSection} />}
    </div>
  )
}

/* ================= 地层剖面 ================= */
export function ModelSection() {
  const lines = [
    { color: strata[0].color, pts: '0,60 120,64 260,58 420,66 600,60 760,68 900,62 900,0 0,0' },
    { color: strata[1].color, pts: '0,96 120,104 260,94 420,110 600,100 760,112 900,102 900,62 760,68 600,60 420,66 260,58 120,64 0,60' },
    { color: strata[2].color, pts: '0,146 120,158 260,142 420,164 600,150 760,166 900,152 900,102 760,112 600,100 420,110 260,94 120,104 0,96' },
    { color: strata[3].color, pts: '0,188 120,200 260,184 420,206 600,192 760,208 900,194 900,152 760,166 600,150 420,164 260,142 120,158 0,146' },
    { color: strata[4].color, pts: '0,232 120,244 260,226 420,248 600,234 760,250 900,236 900,194 760,208 600,192 420,206 260,184 120,200 0,188' },
    { color: strata[5].color, pts: '0,266 120,276 260,262 420,280 600,268 760,282 900,270 900,236 760,250 600,234 420,248 260,226 120,244 0,232' },
    { color: strata[6].color, pts: '0,300 900,300 900,270 760,282 600,268 420,280 260,262 120,276 0,266' },
  ]
  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-head">地层剖面
        <div className="toolbar" style={{ marginLeft: 'auto', fontWeight: 400 }}>
          <span className="f12 t3">剖面选择</span>
          <select className="select" style={{ height: 28 }}><option>剖面 1-1′（K0+000 ~ K3+000）</option><option>剖面 2-2′</option></select>
          <button className="btn btn-primary btn-sm">导出剖面图</button>
        </div>
      </div>
      <div className="panel-body">
        <svg viewBox="0 0 900 330" style={{ width: '100%', height: 'calc(100% - 40px)', background: '#081426', borderRadius: 8 }}>
          <rect width="900" height="330" fill="#081426" />
          {lines.map((l, i) => <polygon key={i} points={l.pts} fill={l.color} opacity="0.85" stroke="#0c1d38" />)}
          {/* 钻孔线 */}
          {[100, 230, 370, 520, 660, 800].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={52 + (i % 3) * 4} x2={x} y2={290} stroke="#e8ecf2" strokeWidth="2.5" />
              <rect x={x - 38} y={30} width="76" height="16" rx="3" fill="rgba(8,20,38,.9)" stroke="#3a6db5" strokeWidth="0.8" />
              <text x={x} y={42} textAnchor="middle" fontSize="9" fill="#cfe0ff">ZK250512-0{i + 1}</text>
            </g>
          ))}
          <text x="14" y="24" fontSize="11" fill="#7f97bd">剖面 1-1′　比例 1:2000　高程(m)</text>
        </svg>
        <div className="flex g12 mt8 f12 t2" style={{ flexWrap: 'wrap' }}>
          {strata.slice(0, 7).map(s => (
            <span key={s.id} className="flex aic g6"><i style={{ width: 10, height: 10, borderRadius: 2, background: s.color, display: 'inline-block' }} />{s.name}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================= 其他子页面（简化演示） ================= */
const subContent: Record<string, { title: string; desc: string; rows: string[][] }> = {
  precision: { title: '模型精度分析', desc: '基于交叉验证的模型精度评价。', rows: [['层面平均误差', '0.32 m'], ['体积计算误差', '1.8 %'], ['钻孔吻合率', '96.4 %'], ['整体精度等级', '良']] },
  export: { title: '模型导出', desc: '将三维模型导出为通用格式。', rows: [['导出格式', 'GLTF / OBJ / IFC'], ['导出范围', '全部地层'], ['坐标系统', 'CGCS2000 / 3 度带']] },
  setting: { title: '模型设置', desc: '模型显示与计算参数设置。', rows: [['垂向 exaggeration', '1.0 ×'], ['默认显示模式', '分层显示'], ['自动保存', '每 10 分钟']] },
}

export function ModelSimple() {
  const { sub } = useParams()
  const c = subContent[sub || ''] || subContent.setting
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="panel">
        <div className="panel-head">{c.title}</div>
        <div className="panel-body">
          <div className="t2 f12 mb12" style={{ lineHeight: 1.8 }}>{c.desc}</div>
          <table className="tbl">
            <tbody>
              {c.rows.map((r, i) => (
                <tr key={i}><td style={{ width: 140 }} className="t3">{r[0]}</td><td className="cell-main">{r[1]}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="flex g10 mt12">
            <button className="btn btn-primary">{sub === 'export' ? '开始导出' : sub === 'build' ? '开始建模' : '应用'}</button>
            <button className="btn btn-ghost">重置</button>
          </div>
        </div>
      </div>
    </div>
  )
}
