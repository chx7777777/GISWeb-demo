import { useMemo, useState } from 'react'
import { Outlet } from 'react-router-dom'
import EChart from '../../components/EChart'
import SideMenu from '../../components/SideMenu'
import Modal, { ConfirmModal } from '../../components/Modal'
import Pagination from '../../components/Pagination'
import UploadBox from '../../components/UploadBox'
import {
  IconDb, IconDetail, IconDownload, IconEdit, IconEye, IconFileOther, IconFilePdf,
  IconFolder, IconImage, IconImport, IconMore, IconPlus, IconTrash, IconUpload,
} from '../../components/icons'
import { dataFiles as initialFiles, DataFile } from '../../mock/data'

const menuItems = [
  { to: '/data/library', label: '资料库', icon: <IconDb size={15} /> },
  { to: '/data/pdf', label: 'PDF管理', icon: <IconFilePdf size={15} /> },
  { to: '/data/image', label: '影像文件', icon: <IconImage size={15} /> },
  { to: '/data/records', label: '数据入库记录', icon: <IconDetail size={15} /> },
  { to: '/data/recycle', label: '回收站', icon: <IconTrash size={15} /> },
]

function LibStats() {
  const option = {
    tooltip: { trigger: 'item' as const, backgroundColor: '#0f2444', borderColor: '#24508a', textStyle: { color: '#e8f1ff', fontSize: 11 } },
    series: [{
      type: 'pie' as const, radius: ['48%', '70%'], center: ['50%', '44%'],
      label: { show: false }, itemStyle: { borderColor: '#0c1d38', borderWidth: 2 },
      data: [
        { name: 'PDF文件', value: 8542, itemStyle: { color: '#2e6fff' } },
        { name: '影像文件', value: 2156, itemStyle: { color: '#f5a623' } },
        { name: '其他文件', value: 1670, itemStyle: { color: '#2fce85' } },
      ],
    }],
  }
  return (
    <div className="side-block">
      <h4>资料库统计</h4>
      <EChart option={option} height={130} />
      {[['PDF文件', '69.1%', '#2e6fff'], ['影像文件', '17.4%', '#f5a623'], ['其他文件', '13.5%', '#2fce85']].map(([n, v, c]) => (
        <div className="side-stat" key={n}><i style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{n}<b>{v}</b></div>
      ))}
    </div>
  )
}

export default function DataLayout() {
  return (
    <>
      <SideMenu title="资料管理" items={menuItems}><LibStats /></SideMenu>
      <div className="app-main"><Outlet /></div>
    </>
  )
}

/* ================= 资料库 ================= */
export function DataLibrary() {
  const [files, setFiles] = useState<DataFile[]>(initialFiles)
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState('全部类型')
  const [page, setPage] = useState(1)
  const [checked, setChecked] = useState<number[]>([])
  const [showNew, setShowNew] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [delId, setDelId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('文件夹')
  const pageSize = 10

  const filtered = useMemo(() => files.filter(f =>
    (type === '全部类型' || f.kind === type) &&
    (!keyword || f.name.includes(keyword))
  ), [files, keyword, type])

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize)

  const statCards = [
    { label: '资料总数', value: '12,368', sub: '+356', up: true, icon: <IconFolder size={22} color="#6ea0ff" />, bg: 'rgba(46,111,255,.18)' },
    { label: 'PDF文件', value: '8,542', sub: '+253', up: true, icon: <IconFilePdf size={22} color="#2fce85" />, bg: 'rgba(47,206,133,.15)' },
    { label: '影像文件', value: '2,156', sub: '+78', up: true, icon: <IconImage size={22} color="#f5a623" />, bg: 'rgba(245,166,35,.15)' },
    { label: '其他文件', value: '1,670', sub: '-12', up: false, icon: <IconFileOther size={22} color="#b98cff" />, bg: 'rgba(142,79,158,.2)' },
  ]

  const kindIcon = (k: string) => k === '文件夹' ? <IconFolder size={15} color="#f5a623" />
    : k === 'PDF文件' ? <IconFilePdf size={15} color="#f5533b" />
    : k === '影像文件' ? <IconImage size={15} color="#22d3ee" /> : <IconFileOther size={15} color="#b98cff" />

  const addFile = () => {
    if (!newName.trim()) return
    setFiles([{ id: Date.now(), name: newName.trim(), kind: newType as any, project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2026-09-24 08:50', size: '-', status: newType === 'PDF文件' ? '待识别' : undefined }, ...files])
    setShowNew(false); setNewName('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div className="flex jcb aic">
        <span className="bold" style={{ fontSize: 15 }}>资料库</span>
        <div className="toolbar">
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><IconPlus size={14} /> 新建资料</button>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}><IconUpload size={14} /> 批量上传</button>
          <button className="btn btn-primary" onClick={() => setShowImport(true)}><IconImport size={14} /> 导入目录</button>
          <button className="btn btn-ghost">更多 ▾</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {statCards.map(c => (
          <div className="stat-card" key={c.label}>
            <span className="sc-icon" style={{ background: c.bg }}>{c.icon}</span>
            <div>
              <div className="sc-label">{c.label}</div>
              <div className="sc-value">{c.value}</div>
              <div className="sc-sub">较上月 <span className={c.up ? 'up' : 'down'}>{c.sub} {c.up ? '↑' : '↓'}</span></div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ flex: 1 }}>
        <div className="filter-bar">
          <select className="select" value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
            {['全部类型', '文件夹', 'PDF文件', '影像文件', '其他文件'].map(t => <option key={t}>{t}</option>)}
          </select>
          <input className="input" style={{ width: 180 }} placeholder="请输入关键词搜索" value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1) }} />
          <input className="input" style={{ width: 190 }} placeholder="开始日期  ~  结束日期" />
          <select className="select"><option>全部项目</option><option>广州港南沙港区航道治理工程</option></select>
          <select className="select"><option>全部来源</option><option>内部上传</option><option>项目上传</option></select>
          <button className="btn btn-primary">搜索</button>
          <button className="btn btn-ghost" onClick={() => { setKeyword(''); setType('全部类型') }}>重置</button>
          <button className="btn btn-text">高级搜索 ▾</button>
        </div>
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 32 }}><input type="checkbox"
                  checked={checked.length === pageData.length && pageData.length > 0}
                  onChange={e => setChecked(e.target.checked ? pageData.map(f => f.id) : [])} /></th>
                <th>资料名称</th><th>资料类型</th><th>所属项目</th><th>来源</th><th>上传时间</th><th>大小</th><th>状态</th><th style={{ width: 120 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(f => (
                <tr key={f.id}>
                  <td><input type="checkbox" checked={checked.includes(f.id)}
                    onChange={e => setChecked(e.target.checked ? [...checked, f.id] : checked.filter(c => c !== f.id))} /></td>
                  <td><span className="flex aic g6"><span style={{ display: 'flex' }}>{kindIcon(f.kind)}</span><span className="cell-main">{f.name}</span></span></td>
                  <td>{f.kind}</td><td>{f.project}</td><td>{f.source}</td><td>{f.time}</td><td>{f.size}</td>
                  <td>{f.status ? <span className={'tag ' + (f.status === '已识别' ? 'tag-green' : f.status === '已发布' ? 'tag-blue' : 'tag-orange')}>{f.status}</span> : '-'}</td>
                  <td>
                    <span className="flex g10" style={{ color: 'var(--text-3)' }}>
                      <span style={{ cursor: 'pointer', display: 'flex' }} title="查看"><IconEye size={14} /></span>
                      <span style={{ cursor: 'pointer', display: 'flex' }} title="编辑"><IconEdit size={14} /></span>
                      <span style={{ cursor: 'pointer', display: 'flex' }} title="下载"><IconDownload size={14} /></span>
                      <span style={{ cursor: 'pointer', display: 'flex' }} title="删除" onClick={() => setDelId(f.id)}><IconTrash size={14} /></span>
                      <span style={{ cursor: 'pointer', display: 'flex' }}><IconMore size={14} /></span>
                    </span>
                  </td>
                </tr>
              ))}
              {!pageData.length && <tr><td colSpan={9}><div className="empty-tip">暂无数据</div></td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={setPage} />
      </div>

      {/* 新建资料 */}
      <Modal open={showNew} title="新建资料" onClose={() => setShowNew(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowNew(false)}>取消</button>
          <button className="btn btn-primary" onClick={addFile}>确定</button></>}>
        <div className="form-row"><label>资料名称<span className="req">*</span></label>
          <input className="input" placeholder="请输入资料名称" value={newName} onChange={e => setNewName(e.target.value)} /></div>
        <div className="form-row"><label>资料类型</label>
          <select className="select" value={newType} onChange={e => setNewType(e.target.value)}>
            {['文件夹', 'PDF文件', '影像文件', '其他文件'].map(t => <option key={t}>{t}</option>)}
          </select></div>
        <div className="form-row"><label>所属项目</label>
          <select className="select"><option>广州港南沙港区航道治理工程</option><option>虎门港区码头扩建工程</option></select></div>
        <div className="form-row"><label>备注</label>
          <textarea className="input" rows={3} placeholder="请输入备注信息" /></div>
      </Modal>

      {/* 批量上传 */}
      <Modal open={showUpload} title="批量上传" onClose={() => setShowUpload(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowUpload(false)}>取消</button>
          <button className="btn btn-primary" onClick={() => setShowUpload(false)}>开始上传</button></>}>
        <UploadBox hint="支持 PDF / TIF / SHP / DWG 等格式" />
        <div className="form-row mt12"><label>上传至</label>
          <select className="select"><option>资料库 / 南沙港区地质勘察资料</option><option>资料库 / AI识别结果资料</option></select></div>
      </Modal>

      {/* 导入目录 */}
      <Modal open={showImport} title="导入目录" width={440} onClose={() => setShowImport(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowImport(false)}>取消</button>
          <button className="btn btn-primary" onClick={() => setShowImport(false)}>导入</button></>}>
        <div className="form-row"><label>选择目录模板</label>
          <select className="select"><option>标准地质勘察资料目录</option><option>航道工程资料目录</option></select></div>
        <div className="form-row"><label>目标位置</label>
          <select className="select"><option>资料库根目录</option></select></div>
        <div className="f12 t3" style={{ lineHeight: 1.8 }}>导入后将按模板自动创建目录结构，已存在的同名目录将跳过。</div>
      </Modal>

      <ConfirmModal open={delId !== null} content="确定要删除该资料吗？删除后将移入回收站。"
        onCancel={() => setDelId(null)}
        onOk={() => { setFiles(files.filter(f => f.id !== delId)); setDelId(null) }} />
    </div>
  )
}

/* ================= PDF 管理 —— AI 智能解析演示 ================= */
type ParseStage = 'idle' | 'parsing' | 'done'

export function PdfAI() {
  const [file, setFile] = useState<string[]>(['ZK101-ZK120_勘察报告.pdf'])
  const [stage, setStage] = useState<ParseStage>('idle')
  const [progress, setProgress] = useState([0, 0, 0])
  const [showResult, setShowResult] = useState(false)

  const steps = ['OCR文字识别', '表格结构识别', '地质数据结构化提取']

  const start = () => {
    if (!file.length || stage === 'parsing') return
    setStage('parsing'); setProgress([0, 0, 0])
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = [...prev]
        for (let i = 0; i < 3; i++) {
          if (i === 0 || next[i - 1] >= 100) next[i] = Math.min(100, next[i] + Math.round(4 + Math.random() * 8))
        }
        if (next.every(p => p >= 100)) { clearInterval(timer); setTimeout(() => setStage('done'), 300) }
        return next
      })
    }, 120)
  }

  const resultRows = [
    ['ZK101', '465102.33', '2513102.55', '2.78', '42.50', '7'],
    ['ZK102', '465228.91', '2513236.18', '2.85', '45.60', '7'],
    ['ZK103', '465355.42', '2513371.84', '2.66', '38.20', '6'],
    ['ZK104', '465481.07', '2513508.29', '2.91', '41.80', '7'],
    ['ZK105', '465608.66', '2513642.71', '2.74', '35.60', '6'],
    ['ZK106', '465735.20', '2513779.36', '2.80', '44.30', '7'],
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      <div className="flex jcb aic">
        <span className="bold" style={{ fontSize: 15 }}>PDF管理 · 地质PDF智能解析入库</span>
        <span className="tag tag-blue">多模态AI引擎 v2.3</span>
      </div>
      <div className="grid2" style={{ flex: 1, minHeight: 0 }}>
        {/* 左：上传与解析 */}
        <div className="panel">
          <div className="panel-head">文件上传与解析</div>
          <div className="panel-body">
            <UploadBox accept=".pdf" hint="仅支持 PDF 格式"
              onChange={fs => { setFile(fs.map(f => f.name)); setStage('idle'); setProgress([0, 0, 0]) }} />
            {file.length > 0 && stage === 'idle' && (
              <div className="file-item"><span className="fi-name">{file[file.length - 1]}</span><span className="fi-size">待解析</span></div>
            )}
            <button className="btn btn-primary mt12" style={{ width: '100%', height: 34 }} disabled={!file.length || stage === 'parsing'} onClick={start}>
              {stage === 'parsing' ? '正在解析…' : stage === 'done' ? '重新解析' : '开始解析'}
            </button>

            {(stage !== 'idle') && (
              <div className="mt12" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {steps.map((s, i) => (
                  <div className="progress-line" key={s}>
                    <span style={{ width: 130 }}>{s}</span>
                    <div className="progress"><i style={{ width: progress[i] + '%' }} /></div>
                    <span className="pct">{progress[i]}%</span>
                  </div>
                ))}
              </div>
            )}

            {stage === 'done' && (
              <div className="mt12" style={{ background: 'rgba(47,206,133,.08)', border: '1px solid rgba(47,206,133,.3)', borderRadius: 8, padding: 14 }}>
                <div className="flex aic g6" style={{ color: 'var(--green)', fontWeight: 600 }}>✓ 解析完成</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
                  {[['钻孔数量', '32'], ['地层数量', '8'], ['剖面数量', '12']].map(([l, v]) => (
                    <div key={l} style={{ textAlign: 'center', background: 'var(--bg-input)', borderRadius: 8, padding: '10px 4px' }}>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div>
                      <div className="f11 t3">{l}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary mt12" style={{ width: '100%' }} onClick={() => setShowResult(true)}>查看结果</button>
              </div>
            )}
          </div>
        </div>

        {/* 右：解析记录 */}
        <div className="panel">
          <div className="panel-head">解析记录</div>
          <div className="panel-body no-pad table-wrap">
            <table className="tbl">
              <thead><tr><th>文件名称</th><th>解析时间</th><th>耗时</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {[
                  ['ZK101-ZK120_勘察报告.pdf', '2025-05-12 10:35', '3分26秒', '已完成'],
                  ['ZK121-ZK150_勘察报告.pdf', '2025-05-12 10:28', '3分41秒', '已完成'],
                  ['土工试验报告_202505.pdf', '2025-05-11 16:25', '1分52秒', '已完成'],
                  ['原位测试报告_202505.pdf', '2025-05-11 16:18', '2分07秒', '已完成'],
                  ['地质剖面图集_202504.pdf', '2025-05-10 09:42', '4分15秒', '已完成'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="cell-main">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td>
                    <td><span className="tag tag-green">{r[3]}</span></td>
                    <td><button className="btn-text" onClick={() => setShowResult(true)}>查看结果</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 解析结果 */}
      <Modal open={showResult} title="AI解析结果 — 钻孔信息表" width={720} onClose={() => setShowResult(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowResult(false)}>关闭</button>
          <button className="btn btn-primary" onClick={() => setShowResult(false)}>确认入库</button></>}>
        <table className="tbl">
          <thead><tr><th>钻孔编号</th><th>孔口坐标X</th><th>孔口坐标Y</th><th>孔口高程(m)</th><th>孔深(m)</th><th>地层数</th></tr></thead>
          <tbody>
            {resultRows.map((r, i) => (
              <tr key={i}>{r.map((c, j) => <td key={j} className={j === 0 ? 'cell-main' : ''}>{c}</td>)}</tr>
            ))}
          </tbody>
        </table>
        <div className="f11 t3 mt8">共识别 32 个钻孔，当前显示前 6 条。置信度均值 96.8%。</div>
      </Modal>
    </div>
  )
}

/* ================= 简单子页面 ================= */
export function DataSimple({ kind }: { kind: string }) {
  const isRecord = kind === '入库记录'
  const isRecycle = kind === '回收站'
  const rows = isRecord
    ? [['ZK101-ZK120_勘察报告.pdf', 'AI智能解析', '2025-05-12 10:35', '成功'], ['土工试验报告_202505.pdf', 'AI智能解析', '2025-05-11 16:25', '成功'], ['钻孔点位.shp', '空间数据导入', '2025-05-10 11:16', '成功'], ['DEM_南沙港区_0.5m.tif', '影像发布', '2025-05-10 14:32', '成功']]
    : isRecycle
    ? [['旧版勘察报告_2023.pdf', 'PDF文件', '2025-04-28 15:20', '30天后清除'], ['废弃测线数据.csv', '其他文件', '2025-04-25 09:10', '30天后清除']]
    : [['DEM_南沙港区_0.5m.tif', '2.34 GB', '2025-05-10 14:30', '已发布'], ['影像_南沙港区_202504.tif', '1.12 GB', '2025-05-10 14:25', '已发布'], ['影像_虎门港区_202503.tif', '0.86 GB', '2025-04-18 10:12', '已发布']]
  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-head">{kind}
        <div className="toolbar" style={{ marginLeft: 'auto', fontWeight: 400 }}>
          <input className="input" style={{ height: 28, width: 180 }} placeholder="请输入关键词" />
          <button className="btn btn-primary btn-sm">搜索</button>
          {isRecycle && <button className="btn btn-danger btn-sm">清空回收站</button>}
        </div>
      </div>
      <div className="panel-body no-pad table-wrap">
        <table className="tbl">
          <thead><tr><th>名称</th><th>{isRecord ? '入库方式' : isRecycle ? '类型' : '大小'}</th><th>时间</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="cell-main">{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td>
                <td><span className={'tag ' + (isRecycle ? 'tag-gray' : 'tag-green')}>{r[3]}</span></td>
                <td>{isRecycle
                  ? <><button className="btn-text">还原</button><button className="btn-text danger">彻底删除</button></>
                  : <><button className="btn-text">查看</button><button className="btn-text">下载</button></>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
