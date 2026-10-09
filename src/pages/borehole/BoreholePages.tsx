import { useMemo, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import SideMenu from '../../components/SideMenu'
import Modal, { ConfirmModal } from '../../components/Modal'
import Pagination from '../../components/Pagination'
import UploadBox from '../../components/UploadBox'
import {
  IconAudit, IconBack, IconDetail, IconDownload, IconEdit, IconExport, IconEye, IconImport,
  IconList, IconMap, IconMore, IconPlus, IconReport, IconTrash, IconUpload,
} from '../../components/icons'
import { boreholes, strata } from '../../mock/data'

const menuItems = [
  { to: '/borehole/list', label: '钻孔列表', icon: <IconList size={15} /> },
  { to: '/borehole/detail/ZK250512-01', label: '钻孔详情', icon: <IconDetail size={15} /> },
  { to: '/borehole/import', label: '钻孔导入', icon: <IconImport size={15} /> },
  { to: '/borehole/audit', label: '钻孔审核', icon: <IconAudit size={15} /> },
  { to: '/borehole/export', label: '钻孔导出', icon: <IconExport size={15} /> },
  { to: '/borehole/recycle', label: '回收站', icon: <IconTrash size={15} /> },
]

function SideStats() {
  return (
    <div className="side-block">
      <h4>钻孔汇总</h4>
      <div className="side-kpi">2,568</div>
      <div className="side-kpi-sub">较上月 <span className="up">+156 ↑</span></div>
      <div className="side-stat"><IconDetail size={13} color="#6ea0ff" />总钻孔数<b>2,568</b></div>
      <div className="side-stat"><IconAudit size={13} color="#2fce85" />已审核<b>2,345</b></div>
      <div className="side-stat"><IconEdit size={13} color="#f5a623" />未审核<b>223</b></div>
    </div>
  )
}

export default function BoreholeLayout() {
  return (
    <>
      <SideMenu title="钻孔管理" items={menuItems}><SideStats /></SideMenu>
      <div className="app-main"><Outlet /></div>
    </>
  )
}

/* 钻孔分布图（模拟） */
export function BoreholeMap({ activeId, onPick, height }: { activeId?: string; onPick?: (id: string) => void; height?: number | string }) {
  const [popup, setPopup] = useState<string | null>(null)
  const pts = boreholes.map((b, i) => ({
    id: b.id,
    left: 12 + ((i * 37) % 72) + ((i * 13) % 9),
    top: 16 + ((i * 29) % 62) + ((i * 7) % 8),
  }))
  return (
    <div className="map-box" style={{ height: height || '100%', minHeight: 200 }}>
      <div className="map-grid" />
      {/* 模拟水系 */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M0 62 Q 25 55 45 60 T 100 52 L 100 78 Q 60 86 30 80 T 0 84 Z" fill="rgba(14,52,84,.85)" />
        <path d="M55 0 Q 60 20 52 35 T 58 70 L 48 72 Q 42 40 48 20 T 44 0 Z" fill="rgba(14,52,84,.7)" />
      </svg>
      {pts.map(p => (
        <div key={p.id} className={'map-marker' + (p.id === activeId ? ' active' : '')}
          style={{ left: p.left + '%', top: p.top + '%' }}
          onClick={() => { setPopup(popup === p.id ? null : p.id); onPick?.(p.id) }}>
          <span className="mk-label">{p.id}</span>
          <span className="mk-pin" />
        </div>
      ))}
      {popup && (() => {
        const b = boreholes.find(x => x.id === popup)!
        const p = pts.find(x => x.id === popup)!
        return (
          <div className="map-popup" style={{ left: `min(${p.left + 3}%, 70%)`, top: p.top + '%' }}>
            <h5>{b.id}</h5>
            <div className="pp-row"><span>孔深</span><b>{b.depth.toFixed(2)} m</b></div>
            <div className="pp-row"><span>孔口高程</span><b>{b.elevation.toFixed(2)} m</b></div>
            <div className="pp-row"><span>状态</span><b>{b.status}</b></div>
          </div>
        )
      })()}
      <div className="map-toolbar">
        <span className="mt-btn">+</span><span className="mt-btn">−</span><span className="mt-btn"><IconMap size={13} /></span>
      </div>
      <div className="map-scale"><span>200 m</span><span className="bar" style={{ width: 60 }} /></div>
      <div className="map-coord">X: 464896.31&nbsp;&nbsp;Y: 2513305.99</div>
    </div>
  )
}

/* 岩芯照片（风格化 SVG） */
export function CorePhoto() {
  const colors = ['#9b8e7a', '#8a8272', '#a89a80', '#7d7668', '#b0a48c', '#948b76']
  return (
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="320" height="130" fill="#3d2f22" />
      <rect x="6" y="6" width="308" height="118" rx="3" fill="#5a4632" stroke="#2e2318" strokeWidth="2" />
      {[0, 1, 2].map(row => (
        <g key={row}>
          <rect x="12" y={12 + row * 40} width="296" height="34" rx="2" fill="#6b543c" />
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i}>
              <rect x={16 + i * 49} y={15 + row * 40} width="44" height="28" rx="13"
                fill={colors[(row * 3 + i) % colors.length]} stroke="#4a3a28" strokeWidth="1" />
              <ellipse cx={22 + i * 49} cy={29 + row * 40} rx="4" ry="12" fill="rgba(255,255,255,.12)" />
            </g>
          ))}
        </g>
      ))}
      <rect x="118" y="48" width="84" height="34" rx="2" fill="#f2ead8" stroke="#cbbfa5" />
      <text x="160" y="62" textAnchor="middle" fontSize="9" fill="#4a3a28">ZK250512-01</text>
      <text x="160" y="74" textAnchor="middle" fontSize="8" fill="#7a6a52">第 3 回次 9.0-10.5m</text>
    </svg>
  )
}

/* 钻孔柱状图（SVG）：刻度、色带、地层文字分栏布局，避免名称与编号重叠 */
export function StrataColumn({ layers, depth }: { layers: { top: number; bottom: number; name: string; code: string }[]; depth: number }) {
  const H = 380
  const W = 300
  const topPad = 22
  const bottomPad = 12
  const plotH = H - topPad - bottomPad
  const tickX = 42
  const colX = 54
  const colW = 54
  const labelX = 122
  const safeDepth = Math.max(depth, 1)
  const scale = plotH / safeDepth
  const colorOf = (name: string) => strata.find(s => name.includes(s.name.replace('质黏土', '')))?.color
    || strata.find(s => s.name.includes(name.slice(0, 2)))?.color || '#5b7295'
  const ticks = [...new Set([0, 5, 10, 15, 20, 30, 40, depth].filter(t => t >= 0 && t <= depth))].sort((a, b) => a - b)
  const wrapName = (name: string) => name.length > 8 ? [name.slice(0, 8), name.slice(8)] : [name]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMin meet"
      style={{ width: '100%', height: '100%', minHeight: 300, display: 'block' }}>
      <text x={tickX} y={13} textAnchor="end" fontSize="10" fill="#7f97bd">深度(m)</text>
      {ticks.map(t => {
        const y = topPad + t * scale
        return (
          <g key={t}>
            <text x={tickX} y={y + 3} textAnchor="end" fontSize="10" fill="#7f97bd">{t.toFixed(1)}</text>
            <line x1={colX - 4} y1={y} x2={W - 8} y2={y} stroke="#1b3a66" strokeWidth="0.6" />
          </g>
        )
      })}
      {layers.map((l, i) => {
        const y = topPad + l.top * scale
        const layerH = Math.max(2, (l.bottom - l.top) * scale)
        const centerY = y + layerH / 2
        const lines = wrapName(l.name)
        const compact = layerH < 28
        return (
          <g key={i}>
            <rect x={colX} y={y} width={colW} height={layerH}
              fill={colorOf(l.name)} stroke="#0c1d38" strokeWidth="1" opacity="0.9" />
            {compact ? (
              <>
                <text x={labelX} y={centerY - 3} fontSize="10" fill="#b9cbe8">{l.name}</text>
                <text x={labelX} y={centerY + 9} fontSize="9" fill="#7f97bd">{l.code}</text>
              </>
            ) : (
              <>
                {lines.map((line, lineIndex) => (
                  <text key={lineIndex} x={labelX} y={centerY - (lines.length === 1 ? 5 : 10) + lineIndex * 13}
                    fontSize="10" fill="#b9cbe8">{line}</text>
                ))}
                <text x={labelX} y={centerY + (lines.length === 1 ? 10 : 17)} fontSize="9" fill="#7f97bd">{l.code}</text>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ================= 钻孔列表 ================= */
export function BoreholeList() {
  const nav = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('全部状态')
  const [project, setProject] = useState('全部项目')
  const [page, setPage] = useState(1)
  const [activeId, setActiveId] = useState('ZK250512-01')
  const [showNew, setShowNew] = useState(false)
  const [delId, setDelId] = useState<string | null>(null)
  const [list, setList] = useState(boreholes)
  const pageSize = 8

  const filtered = useMemo(() => list.filter(b =>
    (status === '全部状态' || b.status === status) &&
    (project === '全部项目' || b.project === project) &&
    (!keyword || b.id.includes(keyword))
  ), [list, keyword, status, project])
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)
  const active = list.find(b => b.id === activeId) || list[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div className="flex jcb aic">
        <span className="bold" style={{ fontSize: 15 }}>钻孔列表</span>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><IconPlus size={14} /> 新建钻孔</button>
          <button className="btn btn-primary" onClick={() => nav('/borehole/import')}><IconImport size={14} /> 钻孔导入</button>
          <button className="btn btn-primary"><IconDownload size={14} /> 导出Excel</button>
          <button className="btn btn-ghost">更多 ▾</button>
        </div>
      </div>

      <div className="panel" style={{ flex: 1.15 }}>
        <div className="filter-bar">
          <input className="input" style={{ width: 180 }} placeholder="请输入钻孔编号/名称" value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }} />
          <select className="select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            {['全部状态', '已审核', '待审核'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="select"><option>全部孔深</option><option>0-30m</option><option>30-50m</option></select>
          <select className="select" value={project} onChange={e => { setProject(e.target.value); setPage(1) }}>
            <option>全部项目</option>
            {[...new Set(list.map(b => b.project).filter(Boolean))].map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <select className="select"><option>全部类型</option><option>勘察孔</option><option>观测孔</option></select>
          <button className="btn btn-text">高级搜索 ▾</button>
        </div>
        <div className="flex" style={{ flex: 1, minHeight: 0, gap: 0 }}>
          <div className="table-wrap" style={{ flex: 1.35 }}>
            <table className="tbl">
              <thead><tr>
                <th style={{ width: 30 }}><input type="checkbox" /></th>
                <th>钻孔编号</th><th>所属项目</th><th>孔口坐标(X)</th><th>孔口坐标(Y)</th><th>孔口高程(m)</th><th>孔深(m)</th><th>状态</th><th style={{ width: 86 }}>操作</th>
              </tr></thead>
              <tbody>
                {pageData.map(b => (
                  <tr key={b.id} className={b.id === activeId ? 'selected' : ''} onClick={() => setActiveId(b.id)} style={{ cursor: 'pointer' }}>
                    <td onClick={e => e.stopPropagation()}><input type="checkbox" /></td>
                    <td className="cell-main">{b.id}</td><td>{b.project}</td>
                    <td>{b.x.toFixed(2)}</td><td>{b.y.toFixed(2)}</td>
                    <td>{b.elevation.toFixed(2)}</td><td>{b.depth.toFixed(2)}</td>
                    <td><span className={'tag ' + (b.status === '已审核' ? 'tag-green' : 'tag-orange')}>{b.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <span className="flex g6" style={{ color: 'var(--text-3)' }}>
                        <span style={{ cursor: 'pointer', display: 'flex' }} title="查看" onClick={() => nav(`/borehole/detail/${b.id}`)}><IconEye size={14} /></span>
                        <span style={{ cursor: 'pointer', display: 'flex' }} title="编辑" onClick={() => setShowNew(true)}><IconEdit size={14} /></span>
                        <span style={{ cursor: 'pointer', display: 'flex' }} title="删除" onClick={() => setDelId(b.id)}><IconTrash size={14} /></span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={setPage} />
          </div>
          <div style={{ flex: 1, padding: '0 12px 12px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div className="f12 bold mb8 t2">钻孔分布图</div>
            <BoreholeMap activeId={activeId} onPick={id => { setActiveId(id) }} />
          </div>
        </div>
      </div>

      {/* 底部：基本信息 + 钻孔图片 */}
      <div className="grid2" style={{ flex: 0.85, minHeight: 0 }}>
        <div className="panel">
          <div className="panel-head">基本信息
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}
              onClick={() => nav(`/borehole/detail/${active.id}`)}>查看详情</button>
          </div>
          <div className="panel-body">
            <div className="desc-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {[
                ['所属项目', active.project], ['钻孔编号', active.id], ['开孔日期', active.startDate],
                ['孔口坐标', `X: ${active.x.toFixed(2)}, Y: ${active.y.toFixed(2)}`], ['完成日期', active.endDate],
                ['孔口高程', active.elevation.toFixed(2) + ' m'], ['施工单位', '中交华南勘察测绘科技有限公司'],
                ['孔 深', active.depth.toFixed(2) + ' m'], ['勘察阶段', '初勘'],
                ['钻孔类型', active.type], ['坐标系', 'CGCS2000 / 3 度带'],
                ['钻机型号', active.model], ['高程系统', '85 高程基准'],
                ['钻孔方法', active.method], ['地质报告', '已关联'],
                ['孔径(mm)', '127'], ['备 注', '-'],
              ].map(([l, v]) => (
                <div className="dg-item" key={l}><span className="dg-label">{l}</span>
                  <span className="dg-value" style={v === '已关联' ? { color: 'var(--green)' } : undefined}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">钻孔图片</div>
          <div className="panel-body" style={{ position: 'relative' }}>
            <CorePhoto />
            <div className="flex aic" style={{ justifyContent: 'center', gap: 5, marginTop: 8 }}>
              {[0, 1, 2].map(i => <i key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === 0 ? '#2e6fff' : '#24508a', display: 'inline-block' }} />)}
            </div>
          </div>
        </div>
      </div>

      {/* 新建钻孔 */}
      <Modal open={showNew} title="新建钻孔" onClose={() => setShowNew(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowNew(false)}>取消</button>
          <button className="btn btn-primary" onClick={() => setShowNew(false)}>保存</button></>}>
        <div className="grid2">
          <div className="form-row"><label>所属项目<span className="req">*</span></label><select className="select" defaultValue="广州港南沙港区航道治理工程"><option>广州港南沙港区航道治理工程</option><option>厦门港区码头扩建工程</option><option>湛江港区吹填工程</option><option>深圳港航道维护疏浚工程</option></select></div>
          <div className="form-row"><label>钻孔编号<span className="req">*</span></label><input className="input" placeholder="如 ZK250512-11" /></div>
          <div className="form-row"><label>钻孔类型</label><select className="select"><option>勘察孔</option><option>观测孔</option></select></div>
          <div className="form-row"><label>孔口坐标 X</label><input className="input" placeholder="466000.00" /></div>
          <div className="form-row"><label>孔口坐标 Y</label><input className="input" placeholder="2514000.00" /></div>
          <div className="form-row"><label>孔口高程 (m)</label><input className="input" placeholder="2.80" /></div>
          <div className="form-row"><label>孔深 (m)</label><input className="input" placeholder="40.00" /></div>
          <div className="form-row"><label>钻机型号</label><select className="select"><option>XY-3</option><option>XY-2</option></select></div>
          <div className="form-row"><label>钻孔方法</label><select className="select"><option>回转钻进</option><option>冲击钻进</option></select></div>
        </div>
      </Modal>

      <ConfirmModal open={delId !== null} content={`确定要删除钻孔 ${delId} 吗？删除后该钻孔将移入回收站。`}
        onCancel={() => setDelId(null)}
        onOk={() => { setList(list.filter(b => b.id !== delId)); setDelId(null) }} />
    </div>
  )
}

/* ================= 钻孔详情 ================= */
export function BoreholeDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const b = boreholes.find(x => x.id === id) || boreholes[0]
  const [tab, setTab] = useState('地层数据')
  const [delLayer, setDelLayer] = useState<number | null>(null)
  const [layers, setLayers] = useState(b.layers)
  const [showEdit, setShowEdit] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const tabs = ['地层数据', '原位试验', '室内试验', '取样记录', '钻孔轨迹', '历史记录']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto' }}>
      <div className="f12 t3">钻孔管理 / 钻孔列表 / <span className="t2">钻孔详情</span></div>
      <div className="flex jcb aic">
        <span className="flex aic g10">
          <span className="bold" style={{ fontSize: 16 }}>钻孔详情&nbsp;&nbsp;{b.id}</span>
          <span className={'tag ' + (b.status === '已审核' ? 'tag-green' : 'tag-orange')}>{b.status}</span>
        </span>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={() => setShowEdit(true)}><IconEdit size={14} /> 编辑</button>
          <button className="btn btn-danger" onClick={() => nav('/borehole/list')}><IconTrash size={14} /> 删除</button>
          <button className="btn btn-primary" onClick={() => setShowReport(true)}><IconReport size={14} /> 查看原始钻孔报告</button>
          <button className="btn btn-ghost" onClick={() => nav('/borehole/list')}><IconBack size={14} /> 返回列表</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 0.85fr', gap: 12, flex: 'none', minHeight: 300 }}>
        {/* 基本信息 */}
        <div className="panel">
          <div className="panel-head">基本信息</div>
          <div className="panel-body">
            <div className="desc-grid" style={{ gridTemplateColumns: '1fr' }}>
              {[
                ['所属项目', b.project], ['钻孔编号', b.id], ['孔口坐标', `X: ${b.x.toFixed(2)}, Y: ${b.y.toFixed(2)}`],
                ['孔口高程', b.elevation.toFixed(2) + ' m'], ['孔 深', b.depth.toFixed(2) + ' m'],
                ['钻孔类型', b.type], ['钻机型号', b.model], ['钻孔方法', b.method],
                ['开孔日期', b.startDate], ['完成日期', b.endDate],
                ['施工单位', '中交华南勘察测绘科技有限公司'], ['坐标系', 'CGCS2000 / 3 度带'],
                ['高程系统', '85 高程基准'], ['地质报告', '已关联'], ['备 注', '-'],
              ].map(([l, v]) => (
                <div className="dg-item" key={l}><span className="dg-label">{l}</span>
                  <span className="dg-value" style={v === '已关联' ? { color: 'var(--green)' } : undefined}>{v}</span></div>
              ))}
            </div>
          </div>
        </div>
        {/* 空间位置 */}
        <div className="panel">
          <div className="panel-head">空间位置</div>
          <div className="panel-body" style={{ display: 'flex', flexDirection: 'column' }}>
            <BoreholeMap activeId={b.id} height="100%" />
          </div>
        </div>
        {/* 钻孔柱状图 */}
        <div className="panel">
          <div className="panel-head">钻孔柱状图</div>
          <div className="panel-body" style={{ minHeight: 260 }}>
            <StrataColumn layers={layers} depth={b.depth} />
          </div>
        </div>
      </div>

      {/* 数据 Tabs */}
      <div className="panel" style={{ flex: 'none' }}>
        <div className="tabs">
          {tabs.map(t => <div key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>{t}</div>)}
        </div>
        <div className="table-wrap" style={{ maxHeight: 260 }}>
          {tab === '地层数据' ? (
            <table className="tbl">
              <thead><tr><th>序号</th><th>顶深(m)</th><th>底深(m)</th><th>层厚(m)</th><th>地层名称</th><th>岩土分类</th><th>地层编号</th><th>描述</th><th style={{ width: 90 }}>操作</th></tr></thead>
              <tbody>
                {layers.map((l, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td><td>{l.top.toFixed(2)}</td><td>{l.bottom.toFixed(2)}</td>
                    <td>{(l.bottom - l.top).toFixed(2)}</td><td className="cell-main">{l.name}</td>
                    <td>{l.cls}</td><td>{l.code}</td><td>{l.desc}</td>
                    <td><button className="btn-text" onClick={() => setShowEdit(true)}>编辑</button>
                      <button className="btn-text danger" onClick={() => setDelLayer(i)}>删除</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="tbl">
              <thead><tr><th>序号</th><th>深度(m)</th><th>{tab === '原位试验' ? '试验类型' : tab === '室内试验' ? '试验项目' : tab === '取样记录' ? '样品编号' : tab === '钻孔轨迹' ? '测斜方位' : '操作类型'}</th><th>结果/数值</th><th>备注</th></tr></thead>
              <tbody>
                {(tab === '原位试验'
                  ? [['1', '3.20', '标准贯入试验', 'N = 4 击', '淤泥质黏土'], ['2', '12.50', '标准贯入试验', 'N = 9 击', '软塑黏土'], ['3', '22.80', '静力触探', 'qc = 2.8 MPa', '中密砂']]
                  : tab === '室内试验'
                  ? [['1', '5.00-5.40', '含水率', 'w = 62.3 %', ''], ['2', '5.00-5.40', '液塑限', 'WL = 48.5 %', ''], ['3', '15.20-15.60', '直剪试验', 'c = 18 kPa, φ = 12°', '']]
                  : tab === '取样记录'
                  ? [['1', '2.00-2.40', 'ZK01-T1', '原状样', '淤泥'], ['2', '8.50-8.90', 'ZK01-T2', '原状样', '淤泥质黏土'], ['3', '19.00-19.40', 'ZK01-T3', '扰动样', '中密砂']]
                  : tab === '钻孔轨迹'
                  ? [['1', '0.00', '0°00\'', '垂直度 0.02%', ''], ['2', '20.00', '12°30\'', '偏斜 0.15m', ''], ['3', '40.00', '15°10\'', '偏斜 0.32m', '']]
                  : [['1', '-', '新建钻孔', '2025-05-12 09:30', 'admin'], ['2', '-', 'AI识别导入地层', '2025-05-12 10:40', 'system'], ['3', '-', '审核通过', '2025-05-14 14:22', '张工']]
                ).map((r, i) => (
                  <tr key={i}>{r.map((c, j) => <td key={j} className={j === 2 ? 'cell-main' : ''}>{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 底部：钻孔照片 + 相关文档；相关文档仅保留在照片右侧面板，不放入上方数据标签 */}
      <div className="grid2" style={{ flex: 'none', minHeight: 240, gridTemplateColumns: '1fr 1fr' }}>
        <div className="panel">
          <div className="panel-head">钻孔照片</div>
          <div className="panel-body"><CorePhoto />
            <div className="flex aic" style={{ justifyContent: 'center', gap: 5, marginTop: 8 }}>
              {[0, 1, 2].map(i => <i key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === 0 ? '#2e6fff' : '#24508a', display: 'inline-block' }} />)}
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">相关文档 <span className="t3" style={{ marginLeft: 'auto', fontSize: 11 }}>更多 &gt;</span></div>
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>文件名称</th><th>文件类型</th><th>上传时间</th><th>操作</th></tr></thead>
              <tbody>
                {[
                  [`${b.id}_勘察报告.pdf`, 'PDF', '2025-05-14'],
                  [`${b.id}_柱状图.png`, '图片', '2025-05-14'],
                  [`${b.id}_取样照片.zip`, '压缩包', '2025-05-15'],
                ].map(([name, type, date]) => (
                  <tr key={name}>
                    <td className="cell-main">{name}</td><td>{type}</td><td>{date}</td>
                    <td><button className="btn-text" onClick={() => window.alert(`演示环境：${name}`)}>↓ 下载</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 编辑弹窗 */}
      <Modal open={showEdit} title="编辑钻孔信息" onClose={() => setShowEdit(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowEdit(false)}>取消</button>
          <button className="btn btn-primary" onClick={() => setShowEdit(false)}>保存</button></>}>
        <div className="grid2">
          <div className="form-row"><label>所属项目</label><select className="select" defaultValue={b.project}><option>广州港南沙港区航道治理工程</option><option>厦门港区码头扩建工程</option><option>湛江港区吹填工程</option><option>深圳港航道维护疏浚工程</option></select></div>
          <div className="form-row"><label>钻孔编号</label><input className="input" defaultValue={b.id} /></div>
          <div className="form-row"><label>孔深 (m)</label><input className="input" defaultValue={b.depth.toFixed(2)} /></div>
          <div className="form-row"><label>孔口高程 (m)</label><input className="input" defaultValue={b.elevation.toFixed(2)} /></div>
          <div className="form-row"><label>钻孔类型</label><select className="select" defaultValue={b.type}><option>勘察孔</option><option>观测孔</option></select></div>
        </div>
        <div className="form-row"><label>备注</label><textarea className="input" rows={2} placeholder="请输入备注" /></div>
      </Modal>

      {/* 原始钻孔报告 */}
      <Modal open={showReport} title="原始钻孔报告 — ZK250512-01" width={620} onClose={() => setShowReport(false)}
        footer={<button className="btn btn-primary" onClick={() => setShowReport(false)}>关闭</button>}>
        <div className="report-paper" style={{ minHeight: 300 }}>
          <div className="rp-logo">中交广州航道局有限公司</div>
          <h2 style={{ fontSize: 15 }}>钻孔地质柱状图报告</h2>
          <div className="rp-meta">钻孔编号：{b.id}&nbsp;&nbsp;&nbsp;&nbsp;孔深：{b.depth.toFixed(2)} m&nbsp;&nbsp;&nbsp;&nbsp;开孔日期：{b.startDate}</div>
          <div className="rp-sec">地层概况</div>
          <div className="rp-p">本孔共揭示地层 {layers.length} 层，自上而下依次为：{layers.map(l => l.name).join('、')}。孔位处覆盖层以软土及砂土为主，下伏花岗岩风化层。</div>
        </div>
      </Modal>

      <ConfirmModal open={delLayer !== null} content="确定要删除该地层记录吗？"
        onCancel={() => setDelLayer(null)}
        onOk={() => { setLayers(layers.filter((_, i) => i !== delLayer)); setDelLayer(null) }} />
    </div>
  )
}

/* ================= 钻孔导入 ================= */
export function BoreholeImport() {
  const [files, setFiles] = useState<string[]>([])
  const [importMode, setImportMode] = useState<'excel' | 'ai'>('excel')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [showExample, setShowExample] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [basic, setBasic] = useState({
    project: '广州港南沙港区航道治理工程', id: 'ZK250512-11', x: '464896.31', y: '2513305.99',
    elevation: '2.85', depth: '45.60', type: '勘察孔', date: '2025-05-12', method: '回转钻进',
  })
  const [layers, setLayers] = useState([
    { start: '0.00', end: '5.00', name: '淤泥', code: 'S1' },
    { start: '5.00', end: '9.20', name: '淤泥质黏土', code: 'S2-S3' },
    { start: '9.20', end: '17.60', name: '软塑黏土', code: 'S4-S6' },
    { start: '17.60', end: '25.30', name: '中密砂', code: 'S7-S8' },
    { start: '25.30', end: '38.40', name: '密实砂砾', code: 'S9-S11' },
    { start: '38.40', end: '45.60', name: '强风化花岗岩', code: 'S12-S14' },
  ])

  const start = () => {
    if (!files.length || importing) return
    setImporting(true); setDone(false); setProgress(0)
    const t = setInterval(() => {
      setProgress(p => {
        const n = Math.min(100, p + Math.round(5 + Math.random() * 10))
        if (n >= 100) { clearInterval(t); setTimeout(() => { setImporting(false); setDone(true) }, 300) }
        return n
      })
    }, 150)
  }

  const showDemo = () => {
    setShowExample(true)
    setConfirmed(false)
    setDone(false)
  }

  const confirmAndImport = () => {
    if (!showExample || importing || done) return
    setConfirmed(true)
    setImporting(true); setProgress(100)
    setTimeout(() => { setImporting(false); setDone(true) }, 450)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%', minHeight: 0 }}>
      <span className="bold" style={{ fontSize: 15 }}>钻孔导入</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 0.82fr) minmax(520px, 1.18fr)', gap: 12, flex: 1, minHeight: 0 }}>
        <div className="panel" style={{ alignSelf: 'start' }}>
          <div className="panel-head">批量导入钻孔数据</div>
          <div className="panel-body">
            <div className="form-row"><label>导入方式</label>
              <div className="flex g12" style={{ flexWrap: 'wrap' }}>
                <label className="checkbox"><input type="radio" name="imp" checked={importMode === 'excel'} onChange={() => { setImportMode('excel'); setShowExample(false); setDone(false) }} /> Excel 模板导入</label>
                <label className="checkbox"><input type="radio" name="imp" checked={importMode === 'ai'} onChange={() => { setImportMode('ai'); setDone(false) }} /> AI 解析结果导入</label>
              </div>
            </div>
            <UploadBox accept={importMode === 'excel' ? '.xlsx,.xls' : '.pdf,.doc,.docx,.jpg,.jpeg,.png,.tif,.tiff,.xlsx,.xls'}
              hint={importMode === 'excel' ? '仅支持 Excel 模板文件' : '支持 PDF、Word、扫描图片、Excel 等地质资料'}
              onChange={fs => { setFiles(fs.map(f => f.name)); setDone(false); setProgress(0); setShowExample(false); setConfirmed(false) }} />
            {importMode === 'ai' && <div className="panel mt12" style={{ background: 'rgba(6,22,43,.42)' }}>
              <div className="panel-body" style={{ fontSize: 12, lineHeight: 1.9 }}>
                <b>AI 解析流程（Demo）</b><br />① 上传原始资料　→　② 提取钻孔与地层信息<br />③ 人工核对并确认　→　④ 导入正式钻孔数据
                <div className="f11 mt8" style={{ color: 'var(--text-3)' }}>注意：本页面为交互原型，示例数据为模拟结果，不会调用真实 AI，也不会写入数据库。</div>
              </div>
            </div>}
            <div className="flex g10 mt12" style={{ flexWrap: 'wrap' }}>
              {importMode === 'excel' ? <>
                <button className="btn btn-ghost"><IconDownload size={14} /> 下载导入模板</button>
                <button className="btn btn-primary" disabled={!files.length || importing} onClick={start}>{importing ? '正在导入…' : '开始导入'}</button>
              </> : <>
                <button className="btn btn-ghost" onClick={showDemo}>显示示例</button>
                <button className="btn btn-ghost" disabled={!showExample} onClick={() => { setShowExample(false); setConfirmed(false); setDone(false) }}>重新解析</button>
                <button className="btn btn-primary" disabled={!showExample || importing} onClick={confirmAndImport}>{done ? '已完成导入' : importing ? '正在模拟导入…' : '确认结果并导入钻孔'}</button>
              </>}
            </div>
            {(importing || done) && importMode === 'excel' && <div className="mt12">
              <div className="progress-line"><span style={{ width: 90 }}>{done ? '导入完成' : '导入进度'}</span><div className="progress"><i style={{ width: progress + '%' }} /></div><span className="pct">{progress}%</span></div>
              {done && <div className="mt8 f12" style={{ color: 'var(--green)' }}>✓ 成功导入钻孔 24 个、地层记录 168 条，失败 0 条。<Link to="/borehole/list" style={{ color: 'var(--primary)' }}>前往钻孔列表查看 →</Link></div>}
            </div>}
            {done && importMode === 'ai' && <div className="mt12 f12" style={{ color: 'var(--green)' }}>✓ Demo：已模拟确认并导入 1 个钻孔及 {layers.length} 条地层记录。<Link to="/borehole/list" style={{ color: 'var(--primary)' }}>前往钻孔列表查看 →</Link></div>}
          </div>
        </div>

        <div className="panel" style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="panel-head">AI解析结果校核 <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontWeight: 400 }}>可编辑示例 · 人工确认后导入</span></div>
          {!showExample ? <div style={{ minHeight: 260, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-3)', padding: 24 }}>
            <div><div style={{ fontSize: 24, color: 'var(--primary)', marginBottom: 12 }}>⇢</div><div style={{ color: 'var(--text-1)', marginBottom: 8 }}>选择“AI 解析结果导入”并点击“显示示例”</div><div className="f12">解析后的钻孔基本信息与地层数据将在此显示</div></div>
          </div> : <div className="panel-body" style={{ overflow: 'auto', minHeight: 0 }}>
            <div className="flex aic jcb mb12" style={{ gap: 8, flexWrap: 'wrap' }}><b style={{ color: 'var(--green)' }}>✓ 示例解析完成</b><span className={done ? "tag tag-green" : "tag tag-orange"}>{done ? "已确认并导入（Demo）" : "待人工确认"}</span></div>
            <div className="bold mb8">一、钻孔基本信息</div>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
              <div className="form-row"><label>所属项目</label><input className="input" value={basic.project} onChange={e => setBasic({ ...basic, project: e.target.value })} /></div>
              <div className="form-row"><label>钻孔编号</label><input className="input" value={basic.id} onChange={e => setBasic({ ...basic, id: e.target.value })} /></div>
              <div className="form-row"><label>孔口坐标 X</label><input className="input" value={basic.x} onChange={e => setBasic({ ...basic, x: e.target.value })} /></div>
              <div className="form-row"><label>孔口坐标 Y</label><input className="input" value={basic.y} onChange={e => setBasic({ ...basic, y: e.target.value })} /></div>
              <div className="form-row"><label>孔口高程（m）</label><input className="input" value={basic.elevation} onChange={e => setBasic({ ...basic, elevation: e.target.value })} /></div>
              <div className="form-row"><label>孔深（m）</label><input className="input" value={basic.depth} onChange={e => setBasic({ ...basic, depth: e.target.value })} /></div>
              <div className="form-row"><label>钻孔类型</label><input className="input" value={basic.type} onChange={e => setBasic({ ...basic, type: e.target.value })} /></div>
              <div className="form-row"><label>开孔日期</label><input className="input" value={basic.date} onChange={e => setBasic({ ...basic, date: e.target.value })} /></div>
              <div className="form-row" style={{ gridColumn: '1 / -1' }}><label>钻进方法</label><input className="input" value={basic.method} onChange={e => setBasic({ ...basic, method: e.target.value })} /></div>
            </div>
            <div className="flex aic jcb mt16 mb8" style={{ gap: 8 }}><b>二、地层分层数据</b><button className="btn btn-ghost btn-sm" onClick={() => setLayers([...layers, { start: '', end: '', name: '', code: '' }])}><IconPlus size={13} />添加地层</button></div>
            <div className="table-wrap"><table className="tbl"><thead><tr><th>层底起始深度(m)</th><th>层底终止深度(m)</th><th>地层名称</th><th>地层编号</th><th>操作</th></tr></thead><tbody>
              {layers.map((layer, index) => <tr key={index}>
                <td><input className="input" value={layer.start} onChange={e => setLayers(layers.map((item, i) => i === index ? { ...item, start: e.target.value } : item))} /></td>
                <td><input className="input" value={layer.end} onChange={e => setLayers(layers.map((item, i) => i === index ? { ...item, end: e.target.value } : item))} /></td>
                <td><input className="input" value={layer.name} onChange={e => setLayers(layers.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} /></td>
                <td><input className="input" value={layer.code} onChange={e => setLayers(layers.map((item, i) => i === index ? { ...item, code: e.target.value } : item))} /></td>
                <td><button className="btn-text danger" onClick={() => setLayers(layers.filter((_, i) => i !== index))}>删除</button></td>
              </tr>)}
            </tbody></table></div>
            <div className="flex aic jcb mt12" style={{ gap: 8, flexWrap: 'wrap' }}><span className="f11" style={{ color: 'var(--text-3)' }}>当前为模拟识别数据；修改仅保存在当前页面状态。</span><button className="btn btn-primary" onClick={confirmAndImport}>{done ? '已模拟导入' : importing ? '正在模拟导入…' : '确认修改并导入'}</button></div>
            {confirmed && done && <div className="f12 mt8" style={{ color: 'var(--green)' }}>✓ 当前修改内容已确认，Demo 模拟导入完成。</div>}
          </div>}
        </div>
      </div>
    </div>
  )
}

/* ================= 简单子页面 ================= */
export function BoreholeSimple({ kind }: { kind: string }) {
  const [list, setList] = useState(boreholes.filter(b => kind !== '钻孔审核' || b.status === '待审核'))
  const isRecycle = kind === '回收站'
  const isExport = kind === '钻孔导出'
  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-head">{kind}
        <div className="toolbar" style={{ marginLeft: 'auto', fontWeight: 400 }}>
          {isExport && <>
            <label className="checkbox"><input type="checkbox" defaultChecked /> 基本信息</label>
            <label className="checkbox"><input type="checkbox" defaultChecked /> 地层数据</label>
            <label className="checkbox"><input type="checkbox" /> 试验数据</label>
            <button className="btn btn-primary btn-sm"><IconExport size={13} /> 导出Excel</button>
          </>}
          {kind === '钻孔审核' && <button className="btn btn-primary btn-sm">批量通过</button>}
          {isRecycle && <button className="btn btn-danger btn-sm">清空回收站</button>}
        </div>
      </div>
      <div className="panel-body no-pad table-wrap">
        <table className="tbl">
          <thead><tr>
            <th style={{ width: 32 }}><input type="checkbox" /></th>
            <th>钻孔编号</th><th>孔深(m)</th><th>孔口高程(m)</th><th>状态</th><th>操作</th>
          </tr></thead>
          <tbody>
            {(isRecycle ? list.slice(0, 3) : list).map(b => (
              <tr key={b.id}>
                <td><input type="checkbox" /></td>
                <td className="cell-main">{b.id}</td><td>{b.depth.toFixed(2)}</td><td>{b.elevation.toFixed(2)}</td>
                <td><span className={'tag ' + (isRecycle ? 'tag-gray' : b.status === '已审核' ? 'tag-green' : 'tag-orange')}>{isRecycle ? '已删除' : b.status}</span></td>
                <td>
                  {kind === '钻孔审核' && <><button className="btn-text" onClick={() => setList(list.map(x => x.id === b.id ? { ...x, status: '已审核' as const } : x))}>通过</button><button className="btn-text danger">驳回</button></>}
                  {isExport && <button className="btn-text">导出</button>}
                  {isRecycle && <><button className="btn-text">还原</button><button className="btn-text danger">彻底删除</button></>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
