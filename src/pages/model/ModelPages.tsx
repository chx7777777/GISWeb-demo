import { useEffect, useRef, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import EChart from '../../components/EChart'
import SideMenu from '../../components/SideMenu'
import {
  IconBox, IconChart, IconDetail, IconEdit, IconExport, IconLayer, IconMeasure,
  IconModel, IconReset, IconScreen, IconSetting, IconSlice, IconTag, IconWalk,
} from '../../components/icons'
import { layerVolumeLegend, strata } from '../../mock/data'
import { createViewer, ViewerHandle, PickInfo } from './StrataViewer'

const menuItems = [
  { to: '/model', label: '模型总览', icon: <IconModel size={15} />, end: true },
  { to: '/model/build', label: '地层建模', icon: <IconBox size={15} /> },
  { to: '/model/manage', label: '模型管理', icon: <IconDetail size={15} /> },
  { to: '/model/precision', label: '模型精度分析', icon: <IconChart size={15} /> },
  { to: '/model/section', label: '地层剖面', icon: <IconSlice size={15} /> },
  { to: '/model/export', label: '模型导出', icon: <IconExport size={15} /> },
  { to: '/model/setting', label: '模型设置', icon: <IconSetting size={15} /> },
]

function ModelInfo() {
  return (
    <div className="side-block">
      <h4>模型信息</h4>
      <div className="f12" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[['模型名称', '南沙港区地层模型_202505'], ['建模范围', '48.12 km²'], ['钻孔数量', '2,568 个'], ['地层数量', '8 层'],
          ['地层体积', '1,256,342,180 m³'], ['创建时间', '2025-05-12 14:30'], ['更新时间', '2025-05-13 09:15'], ['模型版本', 'v1.2'], ['精度等级', '良']].map(([l, v]) => (
          <div key={l} className="flex jcb"><span className="t3">{l}</span><span>{v}</span></div>
        ))}
      </div>
      <button className="btn btn-ghost btn-sm mt8" style={{ width: '100%' }}>模型说明</button>
    </div>
  )
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

/* ================= 模型总览（三维） ================= */
export function ModelOverview() {
  const boxRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<ViewerHandle | null>(null)
  const [pick, setPick] = useState<PickInfo | null>(null)
  const [visible, setVisible] = useState<boolean[]>(strata.map(() => true))
  const [opacities, setOpacities] = useState<number[]>(strata.map(() => 1))
  const [displayMode, setDisplayMode] = useState<'分层显示' | '地层透明' | '实体显示'>('分层显示')
  const [roaming, setRoaming] = useState(false)
  const [tab, setTab] = useState('地层统计')
  const [rebuilding, setRebuilding] = useState(false)
  const [smooth, setSmooth] = useState(0.35)

  useEffect(() => {
    if (!boxRef.current) return
    const v = createViewer(boxRef.current, setPick)
    viewerRef.current = v
    v.setExploded(true)
    return () => v.dispose()
  }, [])

  const changeMode = (m: typeof displayMode) => {
    setDisplayMode(m)
    const v = viewerRef.current
    if (!v) return
    v.setExploded(m === '分层显示')
    v.setTransparent(m === '地层透明')
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
    if (rebuilding) return
    setRebuilding(true)
    setTimeout(() => setRebuilding(false), 1800)
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
    { name: '标注', icon: <IconTag size={13} /> },
    { name: '剖切', icon: <IconSlice size={13} /> },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* 顶部控制条 */}
      <div className="flex aic g12" style={{ flexWrap: 'wrap' }}>
        <span className="f12 t3">模型选择</span>
        <select className="select"><option>南沙港区地层模型_202505</option><option>虎门港区地层模型_202504</option></select>
        <span className="f12 t3">显示模式</span>
        <span className="flex g6">
          {(['分层显示', '地层透明', '实体显示'] as const).map(m => (
            <button key={m} className={'btn btn-sm' + (displayMode === m ? ' btn-primary' : ' btn-ghost')} onClick={() => changeMode(m)}>{m}</button>
          ))}
        </span>
        <span className="f12 t3">视角控制</span>
        <span className="flex g6">
          <button className="btn btn-sm btn-primary">横拟</button>
          <button className="btn btn-sm btn-ghost">正交</button>
        </span>
        <span style={{ flex: 1 }} />
        <span className="flex g6">
          {toolBtns.map(t => <button key={t.name} className="btn btn-sm btn-ghost">{t.icon} {t.name}</button>)}
          <button className={'btn btn-sm' + (roaming ? ' btn-primary' : ' btn-ghost')} onClick={toggleRoaming}><IconWalk size={13} /> 漫游</button>
          <button className="btn btn-sm btn-ghost" onClick={fullscreen}><IconScreen size={13} /> 全屏</button>
          <button className="btn btn-sm btn-ghost" onClick={() => viewerRef.current?.resetCamera()}><IconReset size={13} /> 重置</button>
        </span>
      </div>

      <div className="flex" style={{ flex: 1, minHeight: 0, gap: 12 }}>
        {/* 三维视图 */}
        <div className="viewer-wrap" ref={boxRef}>
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
              {[['模型范围', '自定义范围'], ['水平网格间距', '10.0 m'], ['垂向分层厚度', '0.5 m'], ['插值方法', '自适应克里金']].map(([l, v]) => (
                <div className="form-row" key={l} style={{ marginBottom: 8 }}>
                  <label className="f11 t3">{l}</label>
                  {l === '插值方法' || l === '模型范围'
                    ? <select className="select" style={{ height: 26 }}><option>{v}</option></select>
                    : <input className="input" style={{ height: 26 }} defaultValue={v} />}
                </div>
              ))}
              <div className="form-row" style={{ marginBottom: 8 }}>
                <label className="f11 t3">数据平滑系数</label>
                <div className="flex aic g6">
                  <input type="range" className="slider" min={0} max={1} step={0.05} value={smooth}
                    style={{ '--val': (smooth * 100) + '%' } as any}
                    onChange={e => setSmooth(Number(e.target.value))} />
                  <span className="f11 t2" style={{ width: 30 }}>{smooth.toFixed(2)}</span>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} disabled={rebuilding} onClick={rebuild}>
                {rebuilding ? '正在建模…' : '重新建模'}
              </button>
            </Collapse>
          </div>
        </div>
      </div>

      {/* 底部统计 */}
      <div className="grid2" style={{ flex: 'none', minHeight: 220, gridTemplateColumns: '1.25fr 1fr' }}>
        <div className="panel">
          <div className="tabs">
            {['地层统计', '体积统计', '精度评价', '模型日志'].map(t => (
              <div key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>{t}</div>
            ))}
          </div>
          <div className="table-wrap" style={{ maxHeight: 190 }}>
            {tab === '地层统计' || tab === '体积统计' ? (
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
            ) : tab === '精度评价' ? (
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
                  {[['2025-05-13 09:15', '更新模型参数并重新建模', 'admin'], ['2025-05-12 16:40', '导入钻孔数据 2,568 个', 'admin'], ['2025-05-12 14:30', '创建模型 v1.0', '张工']].map((r, i) => (
                    <tr key={i}><td>{r[0]}</td><td className="cell-main">{r[1]}</td><td>{r[2]}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">地层体积占比</div>
          <div className="panel-body no-pad"><EChart option={donutOption} height={210} /></div>
        </div>
      </div>
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
  build: { title: '地层建模', desc: '选择建模数据源与参数，系统将基于钻孔数据自动构建三维分层地质模型。', rows: [['建模数据', '钻孔 2,568 个 · 剖面 12 条'], ['建模方法', '钻孔+剖面联合约束建模'], ['插值方法', '自适应克里金插值'], ['输出格式', '三维地层实体模型 (GLTF)']] },
  manage: { title: '模型管理', desc: '管理已构建的三维地质模型版本。', rows: [['南沙港区地层模型_202505', 'v1.2 · 2025-05-13 · 当前版本'], ['南沙港区地层模型_202504', 'v1.1 · 2025-04-28 · 历史版本'], ['虎门港区地层模型_202504', 'v1.0 · 2025-04-15 · 已发布']] },
  precision: { title: '模型精度分析', desc: '基于交叉验证的模型精度评价。', rows: [['层面平均误差', '0.32 m'], ['体积计算误差', '1.8 %'], ['钻孔吻合率', '96.4 %'], ['整体精度等级', '良']] },
  export: { title: '模型导出', desc: '将三维模型导出为通用格式。', rows: [['导出格式', 'GLTF / OBJ / IFC'], ['导出范围', '全部地层'], ['坐标系统', 'CGCS2000 / 3 度带']] },
  setting: { title: '模型设置', desc: '模型显示与计算参数设置。', rows: [['垂向 exaggeration', '1.0 ×'], ['默认显示模式', '分层显示'], ['自动保存', '每 10 分钟']] },
}

export function ModelSimple() {
  const { sub } = useParams()
  const c = subContent[sub || ''] || subContent.build
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
