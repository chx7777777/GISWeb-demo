import { useEffect, useMemo, useRef, useState } from 'react'
import { strata } from '../../mock/data'
import { activeModel, useModels } from '../model/modelStore'
import { createViewer, thickness, ViewerHandle } from '../model/StrataViewer'
import { calculateQuantity, commonBounds, demoSurvey, downloadText, formatStation, parseSurvey, QuantityResult, stationValues, SurfaceData } from './quantity'
import './workspace.css'
import './channel.css'

type Figure = { name: string; url?: string }
export default function QuantityWorkspace({ mode }: { mode: 'model' | 'survey' }) {
  const models = useModels()
  const initial = activeModel(models)
  const [modelId, setModelId] = useState(initial.record.id)
  const record = models.records.find(r => r.id === modelId && r.versions.length) || initial.record
  const [versionId, setVersionId] = useState(initial.version.id)
  const version = record.versions.find(v => v.id === versionId) || record.versions[record.versions.length - 1]
  const [survey, setSurvey] = useState<SurfaceData | null>(() => mode === 'survey' ? demoSurvey() : null)
  const [design, setDesign] = useState<SurfaceData | null>(null)
  const [designMode, setDesignMode] = useState<'plane' | 'data'>('plane')
  const [surveyRequired, setSurveyRequired] = useState(mode === 'survey')
  const [surveyFigure, setSurveyFigure] = useState<Figure | null>(null)
  const [designFigure, setDesignFigure] = useState<Figure | null>(null)
  const [elevation, setElevation] = useState(-12.5)
  const [overdepth, setOverdepth] = useState(0.3)
  const [bottomWidth, setBottomWidth] = useState(36)
  const [slope, setSlope] = useState(5)
  const [centerX, setCenterX] = useState(0)
  const [startStation, setStartStation] = useState(0)
  const [endStation, setEndStation] = useState(0)
  const [grid, setGrid] = useState(5)
  const [section, setSection] = useState(0.5)
  const [result, setResult] = useState<QuantityResult | null>(null)
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const uploadSerial = useRef(0)
  const [visible, setVisible] = useState(strata.map(() => true))
  const [zoom, setZoom] = useState(1)
  const [hover, setHover] = useState<number | null>(null)
  const box = useRef<HTMLDivElement>(null), viewer = useRef<ViewerHandle | null>(null)
  useEffect(() => () => { if (surveyFigure?.url) URL.revokeObjectURL(surveyFigure.url) }, [surveyFigure])
  useEffect(() => () => { if (designFigure?.url) URL.revokeObjectURL(designFigure.url) }, [designFigure])
  const sourceBounds = useMemo(() => {
    try { return commonBounds(mode === 'model' ? version : undefined, survey || undefined, designMode === 'data' ? design || undefined : undefined) }
    catch { return null }
  }, [mode, version, survey, design, designMode])
  const availableStations = useMemo(() => stationValues(sourceBounds ? sourceBounds.maxY - sourceBounds.minY : 1), [sourceBounds])
  useEffect(() => {
    if (!sourceBounds) return
    const length = sourceBounds.maxY - sourceBounds.minY
    setStartStation(current => current >= length ? 0 : current)
    setEndStation(current => current <= 0 || current > length ? length : current)
  }, [sourceBounds?.minY, sourceBounds?.maxY])
  const preview = useMemo(() => {
    try {
      if (surveyRequired && !survey) throw new Error('现状图件需配套 CSV/TXT 测点数据，才能计算')
      if (designMode === 'data' && !design) throw new Error('请导入设计高程 CSV/TXT 数据')
      return { value: calculateQuantity({
        model: mode === 'model' ? version : undefined,
        survey: survey || undefined,
        design: designMode === 'data' ? design || undefined : undefined,
        channel: { elevation, overdepth, bottomWidth, slope, centerX, startStation, endStation },
        grid,
      }), error: '' }
    } catch (e) { return { value: null, error: (e as Error).message } }
  }, [mode, version, survey, surveyRequired, design, designMode, elevation, overdepth, bottomWidth, slope, centerX, startStation, endStation, grid])
  useEffect(() => { setResult(null); setHover(null) }, [preview])
  useEffect(() => {
    if (mode !== 'model' || !box.current) return
    const v = createViewer(box.current, () => {}, version)
    viewer.current = v
    v.setExploded(false)
    v.setTransparent(true)
    setVisible(strata.map(() => true))
    return () => { v.dispose(); viewer.current = null }
  }, [mode, version.id])
  useEffect(() => {
    const data = preview.value
    const stationMarkers = data ? availableStations.filter(value => value >= startStation && value <= endStation).map(value => {
      const z = data.sourceBounds.minY + value
      const nearest = data.cells.reduce((best, cell) => Math.abs(cell.x - centerX) + Math.abs(cell.y - z) < Math.abs(best.x - centerX) + Math.abs(best.y - z) ? cell : best, data.cells[0])
      return { label: formatStation(value), point: { x: centerX, y: nearest?.design ?? elevation, z } }
    }) : []
    viewer.current?.setSurveySurface(survey && data ? data.cells.map(c => ({ x: c.x, y: c.z, z: c.y })) : [], data?.columns || 0)
    viewer.current?.setDesignSurface(data ? data.cells.map(c => ({ x: c.x, y: c.design, z: c.y })) : [], data?.columns || 0, stationMarkers)
  }, [preview, version.id, availableStations, startStation, endStation, centerX, elevation, survey])
  const data = preview.value
  const row = data ? Math.min(data.rows - 1, Math.round(section * (data.rows - 1))) : 0
  const profile = data?.cells.slice(row * data.columns, (row + 1) * data.columns) || []
  useEffect(() => {
    if (mode !== 'model') return
    viewer.current?.setQuantitySection(
      profile.map(cell => ({ x: cell.x, y: cell.z, z: cell.y })),
      profile.map(cell => ({ x: cell.x, y: cell.design, z: cell.y })),
    )
  }, [mode, data, row])
  const mapRatio = data ? (data.bounds.maxX - data.bounds.minX) / (data.bounds.maxY - data.bounds.minY) : 1
  const mapWidth = Math.min(880, 350 * mapRatio), mapHeight = Math.min(350, 880 / mapRatio)
  const mapX = (1000 - mapWidth) / 2, mapY = 36 + (350 - mapHeight) / 2
  const channelMapLeft = data ? Math.max(data.bounds.minX, centerX - bottomWidth / 2) : 0
  const channelMapRight = data ? Math.min(data.bounds.maxX, centerX + bottomWidth / 2) : 0
  const selected = hover !== null ? data?.cells[hover] : null
  const importFile = async (file: File | undefined, target: 'survey' | 'design') => {
    if (!file) return
    const serial = ++uploadSerial.current
    setError(''); setResult(null); setReading(true)
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Demo 文件大小限制为 5 MB')
      if (/\.(csv|txt)$/i.test(file.name)) {
        if (target === 'survey') { setSurvey(null); setSurveyRequired(true) } else { setDesign(null); setDesignMode('data') }
        const points = parseSurvey(await file.text())
        if (serial !== uploadSerial.current) return
        if (target === 'survey') setSurvey({ name: file.name, points })
        else setDesign({ name: file.name, points })
      } else if (/\.(png|jpe?g|pdf|dwg|dxf)$/i.test(file.name)) {
        const figure = { name: file.name, url: /\.(png|jpe?g)$/i.test(file.name) ? URL.createObjectURL(file) : undefined }
        if (target === 'survey') { setSurveyFigure(figure); setSurvey(null); setSurveyRequired(true) }
        else { setDesignFigure(figure); setDesignMode('plane'); setDesign(null) }
      } else throw new Error('支持 CSV/TXT 测点，以及 PNG/JPG/PDF/DWG/DXF 参考图件')
    } catch (e) { setError((e as Error).message) } finally { if (serial === uploadSerial.current) setReading(false) }
  }
  const exportResult = () => {
    if (!result) return
    const rows: (string | number)[][] = [
      ['项目', mode === 'model' ? version.config.project : '独立水深算量'],
      ['模型', mode === 'model' ? `${version.config.name} v${version.number}.0` : '无'],
      ['现状数据', survey?.name || '模型顶面'],
      ['设计资料', designFigure?.name || design?.name || '参数设计'],
      ['设计底标高 m', elevation], ['设计底宽 m', bottomWidth], ['设计坡比', `1:${slope}`], ['航道中心 X m', centerX], ['超挖 m', overdepth],
      ['计算桩号', `${formatStation(startStation)}～${formatStation(endStation)}`],
      ['实际网格 dx/dy m', `${result.dx}/${result.dy}`], ['面积 m²', result.area], ['挖方 m³', result.cut], ['填方 m³', result.fill], ['净挖方 m³', result.cut - result.fill],
      ['航道底槽挖方 m³', result.zones.bottom], ['左边坡挖方 m³', result.zones.leftSlope], ['右边坡挖方 m³', result.zones.rightSlope],
    ]
    rows.push(['地层 / 航道分区（m³）', '航道底槽', '左边坡', '右边坡', '合计'])
    if (mode === 'model') strata.forEach((s, i) => rows.push([s.name, result.layerZones.bottom[i], result.layerZones.leftSlope[i], result.layerZones.rightSlope[i], result.layers[i]]))
    else rows.push(['现状水深（无地层）', result.zones.bottom, result.zones.leftSlope, result.zones.rightSlope, result.cut])
    rows.push(['合计', result.zones.bottom, result.zones.leftSlope, result.zones.rightSlope, result.cut])
    const safe = (value: string | number) => { const text = String(value); return `"${(typeof value === 'string' && /^[=+@\-]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"` }
    downloadText('土方算量结果.csv', rows.map(r => r.map(safe).join(',')).join('\n'))
  }
  const minZ = profile.length ? Math.min(...profile.map(c => Math.min(c.z, c.design)), -20) - 3 : -25
  const maxZ = profile.length ? Math.max(...profile.map(c => Math.max(c.z, c.design)), 0) + 3 : 3
  const sy = (z: number) => 22 + (maxZ - z) / (maxZ - minZ) * 168
  const sx = (i: number) => 60 + (i + 0.5) / Math.max(1, profile.length) * 880
  const color = (z: number) => `hsl(${175 + Math.min(1, Math.max(0, -z / 25)) * 70} 78% ${55 - Math.min(1, Math.max(0, -z / 25)) * 25}%)`
  const unclassifiedZones = result ? {
    bottom: Math.max(0, result.zones.bottom - result.layerZones.bottom.reduce((sum, value) => sum + value, 0)),
    leftSlope: Math.max(0, result.zones.leftSlope - result.layerZones.leftSlope.reduce((sum, value) => sum + value, 0)),
    rightSlope: Math.max(0, result.zones.rightSlope - result.layerZones.rightSlope.reduce((sum, value) => sum + value, 0)),
  } : { bottom: 0, leftSlope: 0, rightSlope: 0 }
  return <div className="quantity-workspace">
    <div className="quantity-main">
      <section className="quantity-scene panel">
        <div className="quantity-scene-head"><div><b>{mode === 'model' ? '三维地层 · 设计面叠加' : '现状水深 · 数字地形'}</b><div className="t3 f11 mt4">{mode === 'model' ? `${version.config.name} · v${version.number}.0 · 拖动旋转 / 滚轮缩放` : '数据驱动网格 · 悬停查看高程 · 选择断面联动下方视图'}</div></div><span className={'tag ' + (result ? 'tag-green' : 'tag-blue')}>{result ? '计算完成' : '预览 · 待计算'}</span></div>
        <div className="quantity-canvas">
          {mode === 'model' ? <div className="quantity-viewer" ref={box} /> : data ? <svg className="quantity-map" viewBox="0 0 1000 440" role="img" aria-label="可交互现状水深网格图">
            <defs><pattern id="quantity-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#153b51" strokeWidth="0.6" /></pattern><clipPath id="quantity-map-clip"><rect x={mapX} y={mapY} width={mapWidth} height={mapHeight} rx="6" /></clipPath></defs>
            <rect width="1000" height="440" fill="#071b2d" /><rect width="1000" height="440" fill="url(#quantity-grid)" />
            <g clipPath="url(#quantity-map-clip)"><g transform={`translate(${500 * (1 - zoom)},${211 * (1 - zoom)}) scale(${zoom})`}>
              {data.cells.map((c, i) => <rect key={i} x={mapX + i % data.columns / data.columns * mapWidth} y={mapY + Math.floor(i / data.columns) / data.rows * mapHeight} width={mapWidth / data.columns + 0.5} height={mapHeight / data.rows + 0.5} fill={color(c.z)} stroke={hover === i ? '#fff' : 'none'} strokeWidth="2" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setSection(Math.floor(i / data.columns) / Math.max(1, data.rows - 1))}><title>{`X ${c.x.toFixed(1)} Y ${c.y.toFixed(1)} · 高程 ${c.z.toFixed(2)} m`}</title></rect>)}
              {channelMapRight > channelMapLeft && <rect x={mapX + (channelMapLeft - data.bounds.minX) / (data.bounds.maxX - data.bounds.minX) * mapWidth} y={mapY} width={(channelMapRight - channelMapLeft) / (data.bounds.maxX - data.bounds.minX) * mapWidth} height={mapHeight} fill="#37e7ee" opacity="0.12" stroke="#8ffaff" strokeWidth="2" pointerEvents="none" />}
              <line x1={mapX + (centerX - data.bounds.minX) / (data.bounds.maxX - data.bounds.minX) * mapWidth} x2={mapX + (centerX - data.bounds.minX) / (data.bounds.maxX - data.bounds.minX) * mapWidth} y1={mapY} y2={mapY + mapHeight} stroke="#d9ffff" strokeWidth="1.5" strokeDasharray="7 5" pointerEvents="none" />
              <rect x={mapX} y={mapY} width={mapWidth} height={mapHeight} fill="none" stroke="#ffdc86" strokeWidth="3" strokeDasharray="9 5" pointerEvents="none" />
              <line x1={mapX} x2={mapX + mapWidth} y1={mapY + (row + 0.5) / data.rows * mapHeight} y2={mapY + (row + 0.5) / data.rows * mapHeight} stroke="#fff" strokeWidth="2" strokeDasharray="7 4" pointerEvents="none" />
            </g></g>
            {[0, 0.25, 0.5, 0.75, 1].map(t => <text key={t} x={mapX + t * mapWidth} y="411" textAnchor="middle" fill="#86aeca" fontSize="12">{(data.bounds.minX + t * (data.bounds.maxX - data.bounds.minX)).toFixed(0)} m</text>)}
            {[0, 0.5, 1].map(t => <text key={`y-${t}`} x={mapX - 12} y={mapY + t * mapHeight + 4} textAnchor="end" fill="#86aeca" fontSize="12">{(data.bounds.minY + t * (data.bounds.maxY - data.bounds.minY)).toFixed(0)}</text>)}
            <text x="20" y="28" fill="#b6d7e9" fontSize="12">Y ↓</text><text x="950" y="411" fill="#b6d7e9" fontSize="12">X →</text>
          </svg> : <div className="quantity-empty">导入水深测点后生成可交互地形图</div>}
          <div className="quantity-floating">{mode === 'model' ? <span className="quantity-surface-legend">{survey && <i className="survey-dot" />} {survey ? '水深现状面' : '模型现状面'} <i className="design-dot" /> 倒梯形设计面 <i className="section-dot" /> 当前横断面 · {formatStation(startStation)}～{formatStation(endStation)}</span> : <span>● 青色带：航道底槽 / 白虚线：中心线 / 金色：计算范围</span>}{mode === 'model' ? <button className="btn btn-ghost btn-sm" onClick={() => viewer.current?.resetCamera()}>重置视角</button> : <><button className="btn btn-ghost btn-sm" onClick={() => setZoom(Math.min(2.5, zoom + 0.25))}>＋</button><button className="btn btn-ghost btn-sm" onClick={() => setZoom(Math.max(1, zoom - 0.25))}>－</button><button className="btn btn-ghost btn-sm" onClick={() => setZoom(1)}>复位</button></>}</div>
          {selected && <div className="quantity-tip">X {selected.x.toFixed(1)} · Y {selected.y.toFixed(1)}<br />现状 {selected.z.toFixed(2)} m / 设计 {selected.design.toFixed(2)} m</div>}
          {mode === 'survey' && <div className="quantity-colorbar"><span>浅</span><i /><span>深 · 高程 0～−25 m</span></div>}
        </div>
      </section>
      <section className="panel quantity-section"><div className="quantity-section-head"><b>横断面</b><label>位置 <input aria-label="断面位置" type="range" min={0} max={1} step={0.01} value={section} onChange={e => setSection(Number(e.target.value))} /></label><span className="t3">{formatStation(startStation + section * (endStation - startStation))}</span><span style={{ marginLeft: 'auto', color: '#ffbd69' }}>━ 现状</span><span style={{ color: '#67e8f9' }}>┄ 倒梯形设计</span></div>
        <svg viewBox="0 0 1000 230" role="img" aria-label="现状与设计高程断面对比" className="quantity-profile">
          <defs><clipPath id="quantity-profile-clip"><rect x="60" y="22" width="880" height="168" /></clipPath></defs>
          {[0, 1, 2, 3, 4].map(i => { const z = maxZ - i / 4 * (maxZ - minZ); return <g key={i}><line x1="60" x2="940" y1={sy(z)} y2={sy(z)} stroke="#1c3f56" /><text x="52" y={sy(z) + 4} textAnchor="end" fill="#83a6bf" fontSize="11">{z.toFixed(0)}</text></g> })}
          <g clipPath="url(#quantity-profile-clip)">
            {mode === 'model' && strata.map((s, k) => { const top = profile.map((c, i) => `${sx(i)},${sy(-strata.slice(0, k).reduce((sum, _, n) => sum + thickness(n, c.x, c.y, version), 0))}`); const bottom = profile.map((c, i) => `${sx(i)},${sy(-strata.slice(0, k + 1).reduce((sum, _, n) => sum + thickness(n, c.x, c.y, version), 0))}`).reverse(); return <polygon key={s.id} points={[...top, ...bottom].join(' ')} fill={s.color} opacity="0.4" /> })}
            {profile.map((c, i) => <rect key={i} x={60 + i / profile.length * 880} width={880 / profile.length + 0.5} y={sy(Math.max(c.z, c.design))} height={Math.abs(sy(c.z) - sy(c.design))} fill={c.cut > 0 ? '#21c9ee' : '#a78bfa'} opacity="0.45" />)}
            <polyline points={profile.map((c, i) => `${sx(i)},${sy(c.z)}`).join(' ')} fill="none" stroke="#ffbd69" strokeWidth="2.5" />
            <polyline points={profile.map((c, i) => `${sx(i)},${sy(c.design)}`).join(' ')} fill="none" stroke="#b8f5ff" strokeWidth="2" strokeDasharray="6 4" />
          </g><text x="60" y="215" fill="#83a6bf" fontSize="12">高程 m · 底宽 {bottomWidth} m · 坡比 1:{slope} · 青色挖方</text><text x="940" y="215" textAnchor="end" fill="#83a6bf" fontSize="12">{data ? `X ${data.bounds.minX.toFixed(1)} ～ ${data.bounds.maxX.toFixed(1)} m` : '等待数据'}</text>
        </svg>
      </section>
    </div>
    <aside className="quantity-sidebar panel">
      <section><h4>数据来源</h4>
        {mode === 'model' && <><label>地层模型<select className="select" value={record.id} onChange={e => { setModelId(e.target.value); setVersionId('') }}>{models.records.filter(r => r.versions.length).map(r => <option key={r.id} value={r.id}>{r.draft.name}</option>)}</select></label><label>模型版本<select className="select" value={version.id} onChange={e => setVersionId(e.target.value)}>{record.versions.map(v => <option key={v.id} value={v.id}>v{v.number}.0 · {new Date(v.createdAt).toLocaleDateString('zh-CN')}</option>)}</select></label><div className="t3 f11">{version.config.project}</div></>}
        <div className="quantity-upload-title">{mode === 'model' ? '补充现状水深（可选）' : '导入现状水深图 / 测点'}<span>支持 CSV、TXT、PNG、JPG、PDF、DWG、DXF</span></div>
        <label className="quantity-upload quantity-upload-large" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void importFile(e.dataTransfer.files?.[0], 'survey') }}><input aria-label="导入现状水深" type="file" accept=".csv,.txt,.png,.jpg,.jpeg,.pdf,.dwg,.dxf" disabled={reading} onChange={e => { void importFile(e.target.files?.[0], 'survey'); e.target.value = '' }} /><span className="quantity-upload-icon">↥</span><b>点击上传水深文件</b><small>或拖拽文件到此处 · 支持拖拽上传</small></label>
        {(survey || surveyFigure) && <div className="quantity-file-card"><b>✓</b><span>{survey?.name || surveyFigure?.name}</span><small>{survey ? `${survey.points.length} 个测点` : '参考图件'}</small></div>}
        <div className="quantity-source-card"><span>现状面来源</span><b><i className={survey ? 'survey-dot' : 'model-dot'} />{survey ? '水深测点数据' : surveyRequired ? '等待水深测点数据' : '三维模型顶面'}</b><small>{survey ? '三维显示和算量均以水深面为准' : surveyRequired ? '参考图件不能直接算量，请补充 CSV/TXT 测点' : '未导入水深数据，使用当前模型顶面'}</small></div>
        {surveyFigure && <div className="quantity-reference">参考图：{surveyFigure.name}{surveyFigure.url && <img src={surveyFigure.url} alt="导入的现状水深参考图" />}<span>图件未自动解析，请配套导入测点。</span></div>}
        <div className="flex g6 mt8"><button className="btn btn-ghost btn-sm" disabled={reading} onClick={() => { setSurvey(demoSurvey()); setSurveyRequired(true); setError('') }}>载入演示数据</button>{mode === 'model' && <button className="btn btn-ghost btn-sm" disabled={reading} onClick={() => { setSurvey(null); setSurveyRequired(false); setSurveyFigure(null); setError('') }}>使用模型顶面</button>}</div>
        <button className="btn btn-ghost btn-sm mt8" onClick={() => downloadText('水深测点模板.csv', 'x,y,z\n-65,-43,-8\n65,-43,-9\n-65,43,-10\n65,43,-8')}>下载测点模板</button>
      </section>
      <section><h4>设计图与参数</h4><div className="quantity-upload-title">设计文件导入<span>支持 CSV、TXT、PNG、JPG、PDF、DWG、DXF</span></div><label className="quantity-upload quantity-upload-large" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void importFile(e.dataTransfer.files?.[0], 'design') }}><input aria-label="导入设计图" type="file" accept=".csv,.txt,.png,.jpg,.jpeg,.pdf,.dwg,.dxf" disabled={reading} onChange={e => { void importFile(e.target.files?.[0], 'design'); e.target.value = '' }} /><span className="quantity-upload-icon">↥</span><b>点击上传设计文件</b><small>或拖拽文件到此处 · 支持拖拽上传</small></label>
        {(design || designFigure) && <div className="quantity-file-card"><b>✓</b><span>{design?.name || designFigure?.name}</span><small>{design ? `${design.points.length} 个高程点` : '设计参考图'}</small></div>}
        {designFigure && <div className="quantity-reference">设计图：{designFigure.name}{designFigure.url && <img src={designFigure.url} alt="导入的设计参考图" />}<span>已载入为设计依据；下方参数可覆盖图纸中的底标高、底宽和坡比。</span></div>}
        <label>纵向底标高来源<select className="select" value={designMode} onChange={e => setDesignMode(e.target.value as 'plane' | 'data')}><option value="plane">统一设计底标高</option><option value="data">导入设计高程数据</option></select></label>
        {designMode === 'data' && <div className="f11 t3 mb12">{design ? `${design.name} · ${design.points.length} 点；每个桩号读取中心线标高` : '请上传 x,y,z 格式设计高程数据'}</div>}
        <div className="quantity-fields">
          <label>设计底标高（m）<input className="input" type="number" step={0.1} value={Number.isNaN(elevation) ? '' : elevation} onChange={e => setElevation(e.target.valueAsNumber)} /></label>
          <label>航道底宽（m）<input className="input" type="number" min={1} step={1} value={Number.isNaN(bottomWidth) ? '' : bottomWidth} onChange={e => setBottomWidth(e.target.valueAsNumber)} /></label>
          <label>边坡坡比（1:m）<input className="input" type="number" min={0.1} max={20} step={0.5} value={Number.isNaN(slope) ? '' : slope} onChange={e => setSlope(e.target.valueAsNumber)} /></label>
          <label>航道中心 X（m）<input className="input" type="number" step={1} value={Number.isNaN(centerX) ? '' : centerX} onChange={e => setCenterX(e.target.valueAsNumber)} /></label>
          <label>超挖（m）<input className="input" type="number" min={0} max={5} step={0.1} value={Number.isNaN(overdepth) ? '' : overdepth} onChange={e => setOverdepth(e.target.valueAsNumber)} /></label>
          <label>计算网格（m）<input className="input" type="number" min={1} max={50} value={Number.isNaN(grid) ? '' : grid} onChange={e => setGrid(e.target.valueAsNumber)} /></label>
        </div>
        <div className="quantity-channel-sketch"><span>现状面</span><svg viewBox="0 0 240 76" role="img" aria-label="倒梯形航道设计断面示意"><path d="M5 16H235" stroke="#ffbd69" strokeWidth="2" /><path d="M18 16L82 60H158L222 16" fill="rgba(33,201,238,.28)" stroke="#67e8f9" strokeWidth="2" /><text x="120" y="72" textAnchor="middle" fill="#9fc3db" fontSize="10">底宽 {bottomWidth} m</text><text x="33" y="48" fill="#9fc3db" fontSize="10">1:{slope}</text></svg></div>
        <p className="t3 f11">设计面按倒梯形生成：中部为航道底槽，两侧按 1:{slope} 放坡至现状面。导入设计高程时，其中心线高程替代统一底标高，其余参数仍可编辑。</p>
      </section>
      <section><h4>航段选择</h4>
        <div className="quantity-fields"><label>起点桩号<select aria-label="起点桩号" className="select" value={startStation} onChange={e => { const value = Number(e.target.value); setStartStation(value); if (value >= endStation) setEndStation(availableStations.find(item => item > value) ?? availableStations[availableStations.length - 1]) }}>{availableStations.slice(0, -1).map(value => <option key={value} value={value}>{formatStation(value)}</option>)}</select></label><label>终点桩号<select aria-label="终点桩号" className="select" value={endStation} onChange={e => { const value = Number(e.target.value); setEndStation(value); if (value <= startStation) setStartStation([...availableStations].reverse().find(item => item < value) ?? 0) }}>{availableStations.slice(1).map(value => <option key={value} value={value}>{formatStation(value)}</option>)}</select></label></div>
        <div className="quantity-range-summary"><b>{formatStation(startStation)} → {formatStation(endStation)}</b><span>长度 {(endStation - startStation).toFixed(0)} m</span></div>
        <div className="quantity-segments">{availableStations.slice(0, -1).map((value, index) => <button key={value} className={startStation === value && endStation === availableStations[index + 1] ? 'active' : ''} onClick={() => { setStartStation(value); setEndStation(availableStations[index + 1]) }}>{formatStation(value)}～{formatStation(availableStations[index + 1])}</button>)}</div>
        <div className="t3 f11 mt8">{mode === 'model' ? '三维模型显示所选范围内的桩号' : '平面图显示所选航段和航道底槽'}，计算仅包含起止桩号之间。</div>
      </section>
      {mode === 'model' && <section><h4>地层显示</h4><div className="quantity-layers">{strata.map((s, i) => <label key={s.id}><input type="checkbox" checked={visible[i]} onChange={e => { const next = visible.map((v, n) => n === i ? e.target.checked : v); setVisible(next); viewer.current?.setLayerVisible(i, e.target.checked) }} /><i style={{ background: s.color }} />{s.name}</label>)}</div><div className="t3 f11">显隐仅影响三维展示，算量包含所有地层。</div></section>}
      <section><h4>计算与成果</h4><div className="t3 f11 mb12">Demo：IDW 插值 + 规则网格中点积分。按倒梯形底槽和两侧边坡分类；尚未处理弯曲中心线、不规则边界及水位基准转换。</div>
        {(error || preview.error) && <div className="quantity-error" role="alert">{error || preview.error}</div>}
        <button className="btn btn-primary" style={{ width: '100%' }} disabled={reading || !data || !!error} onClick={() => { setResult(data); setError('') }}>{reading ? '正在读取数据…' : '开始计算'}</button>
        {result && <><div className="quantity-results">{[['挖方量', result.cut, 'm³'], ['填方量', result.fill, 'm³'], ['净挖方', result.cut - result.fill, 'm³'], ['计算面积', result.area, 'm²']].map(([label, value, unit]) => <div key={String(label)}><span>{label}</span><b>{Number(value).toLocaleString('zh-CN', { maximumFractionDigits: 2 })}</b><small>{unit}</small></div>)}</div>
          <div className="quantity-matrix-title">地层 × 航道分区挖方（m³）</div><div className="quantity-matrix-wrap"><table className="tbl quantity-matrix"><thead><tr><th>地层</th><th>航道底槽</th><th>左边坡</th><th>右边坡</th><th>合计</th></tr></thead><tbody>{mode === 'model' ? <>{strata.map((s, i) => <tr key={s.id}><td><i style={{ background: s.color }} />{s.name}</td><td>{result.layerZones.bottom[i].toFixed(2)}</td><td>{result.layerZones.leftSlope[i].toFixed(2)}</td><td>{result.layerZones.rightSlope[i].toFixed(2)}</td><td>{result.layers[i].toFixed(2)}</td></tr>)}{result.unclassified > 0.001 && <tr><td>模型外未分类</td><td>{unclassifiedZones.bottom.toFixed(2)}</td><td>{unclassifiedZones.leftSlope.toFixed(2)}</td><td>{unclassifiedZones.rightSlope.toFixed(2)}</td><td>{result.unclassified.toFixed(2)}</td></tr>}</> : <tr><td>现状水深</td><td>{result.zones.bottom.toFixed(2)}</td><td>{result.zones.leftSlope.toFixed(2)}</td><td>{result.zones.rightSlope.toFixed(2)}</td><td>{result.cut.toFixed(2)}</td></tr>}<tr><td>合计</td><td>{result.zones.bottom.toFixed(2)}</td><td>{result.zones.leftSlope.toFixed(2)}</td><td>{result.zones.rightSlope.toFixed(2)}</td><td>{result.cut.toFixed(2)}</td></tr></tbody></table></div>
          <button className="btn btn-ghost mt12" style={{ width: '100%' }} onClick={exportResult}>导出结果 CSV</button>
        </>}
      </section>
    </aside>
  </div>
}
