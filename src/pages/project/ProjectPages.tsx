import { useMemo, useState } from 'react'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import UploadBox from '../../components/UploadBox'
import {
  IconDb, IconDetail, IconDownload, IconEdit, IconEye, IconFileOther, IconFilePdf,
  IconFolder, IconImage, IconPlus, IconTrash, IconUpload,
} from '../../components/icons'

type ProjectStatus = '进行中' | '未开始' | '已完成' | '暂停'
type Project = {
  id: number
  code: string
  name: string
  type: string
  stage: string
  owner: string
  leader: string
  region: string
  crs: string
  epsg: string
  verticalDatum: string
  area: string
  status: ProjectStatus
  updatedAt: string
  description: string
}
type ProjectDocument = {
  id: number
  projectId: number
  name: string
  type: string
  category: string
  size: string
  uploadedAt: string
  status: string
}

const initialProjects: Project[] = [
  { id: 1, code: 'GZ-NANSHA-2025-001', name: '广州港南沙港区航道治理工程', type: '航道疏浚', stage: '施工阶段', owner: '广州航道局', leader: '张工', region: '广东省广州市南沙区', crs: 'CGCS2000 / 3-degree Gauss-Kruger CM 114E', epsg: 'EPSG:4547', verticalDatum: '1985国家高程基准', area: '约 36.8 km²', status: '进行中', updatedAt: '2026-10-08 16:20', description: '航道测深、疏浚设计、地质资料管理及分层土方测算。' },
  { id: 2, code: 'HM-MATOU-2025-002', name: '虎门港区码头扩建工程', type: '港口建设', stage: '勘察阶段', owner: '广州航道局', leader: '李工', region: '广东省东莞市虎门镇', crs: 'CGCS2000 / 3-degree Gauss-Kruger CM 114E', epsg: 'EPSG:4547', verticalDatum: '1985国家高程基准', area: '约 12.4 km²', status: '进行中', updatedAt: '2026-10-07 10:35', description: '码头扩建及港池疏浚相关地质勘察与空间数据管理。' },
  { id: 3, code: 'ZJ-RECLAMATION-2025-003', name: '湛江港区吹填造陆工程', type: '吹填工程', stage: '前期准备', owner: '项目管理部', leader: '王工', region: '广东省湛江市', crs: 'WGS 84 / UTM zone 49N', epsg: 'EPSG:32649', verticalDatum: '1985国家高程基准', area: '约 8.6 km²', status: '未开始', updatedAt: '2026-10-05 09:10', description: '吹填区域规划、地形测量及地质资料归档。' },
  { id: 4, code: 'SZ-CHANNEL-2024-004', name: '深圳港航道维护疏浚工程', type: '航道疏浚', stage: '验收阶段', owner: '深圳项目部', leader: '陈工', region: '广东省深圳市', crs: 'CGCS2000 / 3-degree Gauss-Kruger CM 114E', epsg: 'EPSG:4547', verticalDatum: '1985国家高程基准', area: '约 21.3 km²', status: '已完成', updatedAt: '2026-09-28 15:40', description: '航道维护、测量成果整理与工程验收资料管理。' },
]

const initialDocuments: ProjectDocument[] = [
  { id: 1, projectId: 1, name: '南沙港区地质勘察资料', type: '文件夹', category: '勘察资料', size: '—', uploadedAt: '2026-10-08 16:20', status: '目录已建立' },
  { id: 2, projectId: 1, name: 'ZK101-ZK120_勘察报告.pdf', type: 'PDF文件', category: '地质报告', size: '45.6 MB', uploadedAt: '2026-10-08 15:32', status: '已识别' },
  { id: 3, projectId: 1, name: '南沙港区测深成果_202610.csv', type: 'CSV文件', category: '测量数据', size: '8.2 MB', uploadedAt: '2026-10-08 14:15', status: '待入库' },
  { id: 4, projectId: 1, name: '航道设计图.dwg', type: 'CAD图纸', category: '设计文件', size: '12.3 MB', uploadedAt: '2026-10-07 17:40', status: '已归档' },
  { id: 5, projectId: 1, name: 'DEM_南沙港区_0.5m.tif', type: '影像文件', category: '地形数据', size: '2.34 GB', uploadedAt: '2026-10-07 10:20', status: '已发布' },
]

const projectTypes = ['航道疏浚', '港口建设', '吹填工程', '围堰工程', '道路工程', '地质勘察', '其他工程']
const coordinateSystems = [
  { label: 'CGCS2000 / 3度带高斯-克吕格（中央经线 114°E）', epsg: 'EPSG:4547' },
  { label: 'CGCS2000 / 3度带高斯-克吕格（中央经线 117°E）', epsg: 'EPSG:4549' },
  { label: 'CGCS2000 地理坐标系', epsg: 'EPSG:4490' },
  { label: 'WGS 84 地理坐标系', epsg: 'EPSG:4326' },
  { label: 'WGS 84 / UTM 49N', epsg: 'EPSG:32649' },
  { label: 'WGS 84 / UTM 50N', epsg: 'EPSG:32650' },
]
const statusColor: Record<ProjectStatus, string> = {
  '进行中': '#2fce85', '未开始': '#7d9abb', '已完成': '#4e91ff', '暂停': '#f5a623',
}

const styles = `
.pm-page{height:100%;min-height:0;display:flex;gap:10px;background:var(--bg-page);color:var(--text-1);overflow:hidden}
.pm-side{width:156px;flex:none;display:flex;flex-direction:column;background:var(--bg-panel);border:1px solid var(--border);border-radius:8px;overflow:hidden}
.pm-side-title{height:40px;display:flex;align-items:center;padding:0 14px;font-size:13px;font-weight:700;border-bottom:1px solid var(--border);color:#eaf2ff}
.pm-side-nav{padding:7px;display:flex;flex-direction:column;gap:4px}
.pm-side-nav button{height:36px;border:0;border-radius:5px;padding:0 10px;display:flex;align-items:center;gap:9px;background:transparent;color:var(--text-2);font-size:12px;text-align:left;cursor:pointer}
.pm-side-nav button:hover,.pm-side-nav button.active{background:rgba(46,111,255,.2);color:#fff}
.pm-side-note{margin-top:auto;padding:13px 12px;border-top:1px solid var(--border);font-size:11px;line-height:1.9;color:var(--text-3)}
.pm-main{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;gap:11px;overflow:auto}
.pm-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:31px}
.pm-heading-title{font-size:15px;font-weight:700;color:#edf4ff}
.pm-heading-sub{font-size:11px;color:var(--text-3);margin-top:4px}
.pm-actions{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
.pm-btn{height:30px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 11px;border:1px solid var(--border);border-radius:5px;background:#0b2140;color:#dce9ff;font-size:11px;cursor:pointer;white-space:nowrap}
.pm-btn.primary{background:#2e6fff;border-color:#2e6fff;color:#fff}.pm-btn:hover{filter:brightness(1.12)}
.pm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.pm-stat{display:flex;align-items:center;gap:12px;min-height:76px;padding:13px 15px;background:var(--bg-panel);border:1px solid var(--border);border-radius:7px}
.pm-stat-icon{width:39px;height:39px;display:flex;align-items:center;justify-content:center;border-radius:8px;flex:none}
.pm-stat-label{font-size:11px;color:var(--text-3)}.pm-stat-value{font-size:23px;line-height:1.25;font-weight:750;color:#f1f6ff}.pm-stat-sub{font-size:10px;color:var(--text-3);margin-top:3px}
.pm-panel{min-height:0;background:var(--bg-panel);border:1px solid var(--border);border-radius:7px;overflow:hidden;display:flex;flex-direction:column}
.pm-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border);font-size:12px;font-weight:700}
.pm-filter{display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:10px 11px;border-bottom:1px solid rgba(36,80,138,.45)}
.pm-input,.pm-select,.pm-textarea{height:30px;min-width:0;padding:0 9px;border:1px solid #244777;border-radius:5px;background:#081a32;color:#e5efff;font-size:11px;outline:none}
.pm-input:focus,.pm-select:focus,.pm-textarea:focus{border-color:#4d8dff}.pm-input::placeholder,.pm-textarea::placeholder{color:#7188a8}
.pm-table-wrap{overflow:auto;flex:1}
.pm-table{width:100%;border-collapse:collapse;font-size:11px;white-space:nowrap}
.pm-table th{height:31px;text-align:left;padding:0 10px;background:#102747;color:#8faed7;font-weight:500;position:sticky;top:0}
.pm-table td{height:39px;padding:0 10px;border-bottom:1px solid rgba(37,77,128,.42);color:#c9d9f1}
.pm-table tbody tr:hover{background:rgba(46,111,255,.08)}.pm-name{color:#e6f0ff;font-weight:600}.pm-code{font-size:10px;color:#7fa1d2;margin-top:3px}
.pm-status{display:inline-flex;align-items:center;gap:5px;padding:3px 7px;border-radius:4px;background:rgba(47,206,133,.1);font-size:10px}
.pm-status i{width:5px;height:5px;border-radius:50%;display:inline-block}
.pm-row-actions{display:flex;gap:9px;color:#7f9abd}.pm-icon-action{cursor:pointer;display:inline-flex}.pm-icon-action:hover{color:#fff}
.pm-empty{padding:36px;text-align:center;color:var(--text-3)}
.pm-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:12px}
.pm-detail-item{padding:10px;border:1px solid rgba(37,77,128,.6);border-radius:5px;background:rgba(6,23,45,.45);min-width:0}
.pm-detail-label{font-size:10px;color:var(--text-3);margin-bottom:6px}.pm-detail-value{font-size:12px;color:#dceaff;overflow-wrap:anywhere}
.pm-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 14px}
.pm-form-field{display:flex;flex-direction:column;gap:6px;min-width:0}.pm-form-field.full{grid-column:1/-1}
.pm-form-field label{font-size:11px;color:#a9bedc}.pm-form-field label span{color:#ff7777;margin-left:3px}
.pm-form-field .pm-input,.pm-form-field .pm-select{width:100%;height:34px}.pm-textarea{width:100%;height:76px;padding:8px;resize:vertical}
.pm-form-hint{font-size:10px;color:#728eaf;line-height:1.6}
.pm-modal-footer{display:flex;justify-content:flex-end;gap:8px}
.pm-doc-category{display:inline-block;padding:3px 6px;border-radius:4px;background:rgba(46,111,255,.12);color:#9fc2ff;font-size:10px}
@media(max-width:1150px){.pm-side{width:135px}.pm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-detail-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pm-heading{align-items:flex-start;flex-direction:column}}
`

export default function ProjectManagement() {
  const [section, setSection] = useState<'projects' | 'documents'>('projects')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [documents, setDocuments] = useState<ProjectDocument[]>(initialDocuments)
  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('全部状态')
  const [typeFilter, setTypeFilter] = useState('全部类型')
  const [page, setPage] = useState(1)
  const [selectedProjectId, setSelectedProjectId] = useState(1)
  const [showCreate, setShowCreate] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newDocumentName, setNewDocumentName] = useState('')
  const [docKeyword, setDocKeyword] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('全部类型')
  const [docProjectFilter, setDocProjectFilter] = useState('全部项目')
  const [showUpload, setShowUpload] = useState(false)
  const [form, setForm] = useState({
    name: '', code: '', type: '航道疏浚', stage: '勘察阶段', owner: '广州航道局', leader: '',
    region: '', crs: coordinateSystems[0].label, epsg: coordinateSystems[0].epsg,
    verticalDatum: '1985国家高程基准', status: '未开始' as ProjectStatus, description: '',
    startDate: '', endDate: '',
  })

  const selectedProject = projects.find(project => project.id === selectedProjectId) || projects[0]
  const filteredProjects = useMemo(() => projects.filter(project =>
    (!keyword || `${project.name}${project.code}${project.region}`.toLowerCase().includes(keyword.toLowerCase())) &&
    (statusFilter === '全部状态' || project.status === statusFilter) &&
    (typeFilter === '全部类型' || project.type === typeFilter)
  ), [projects, keyword, statusFilter, typeFilter])
  const pageSize = 8
  const pageProjects = filteredProjects.slice((page - 1) * pageSize, page * pageSize)
  // Demo permission scope: admin can view all projects. When connected to Spring Security,
  // replace this list with the current user's project permissions returned by the backend.
  const currentUserRole = 'admin'
  const accessibleProjects = currentUserRole === 'admin'
    ? projects
    : projects.filter(project => project.id === selectedProjectId)
  const filteredDocs = documents.filter(doc =>
    accessibleProjects.some(project => project.id === doc.projectId) &&
    (docProjectFilter === '全部项目' || String(doc.projectId) === docProjectFilter) &&
    (!docKeyword || `${doc.name}${doc.category}`.toLowerCase().includes(docKeyword.toLowerCase())) &&
    (docTypeFilter === '全部类型' || doc.type === docTypeFilter)
  )
  const visibleDocuments = documents.filter(doc =>
    accessibleProjects.some(project => project.id === doc.projectId) &&
    (docProjectFilter === '全部项目' || String(doc.projectId) === docProjectFilter)
  )

  const resetForm = () => setForm({
    name: '', code: '', type: '航道疏浚', stage: '勘察阶段', owner: '广州航道局', leader: '',
    region: '', crs: coordinateSystems[0].label, epsg: coordinateSystems[0].epsg,
    verticalDatum: '1985国家高程基准', status: '未开始', description: '',
    startDate: '', endDate: '',
  })

  const openCreate = (project?: Project) => {
    if (project) {
      setEditingId(project.id)
      setForm({
        name: project.name, code: project.code, type: project.type, stage: project.stage, owner: project.owner, leader: project.leader,
        region: project.region, crs: project.crs, epsg: project.epsg, verticalDatum: project.verticalDatum,
        status: project.status, description: project.description,
        startDate: '', endDate: '',
      })
    } else {
      setEditingId(null)
      resetForm()
    }
    setShowCreate(true)
  }

  const saveProject = () => {
    if (!form.name.trim() || !form.region.trim() || !form.leader.trim()) return
    const record: Project = {
      id: editingId ?? Date.now(), code: editingId !== null ? (projects.find(item => item.id === editingId)?.code || form.code.trim()) : `GEO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Date.now()).slice(-4)}`, name: form.name.trim(), type: form.type,
      stage: form.stage, owner: form.owner.trim() || '未指定', leader: form.leader.trim() || '未指定', region: form.region.trim(),
      crs: form.crs, epsg: form.epsg, verticalDatum: form.verticalDatum, area: '未填写',
      status: form.status, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
      description: form.description.trim(),
    }
    setProjects(current => editingId === null ? [record, ...current] : current.map(item => item.id === editingId ? record : item))
    setSelectedProjectId(record.id)
    setShowCreate(false)
    setSection('projects')
    setPage(1)
  }

  const exportProjects = () => {
    const rows = [
      ['项目编号', '项目名称', '项目类型', '项目阶段', '建设单位', '项目负责人', '项目区域', '坐标系', '高程基准', '状态'],
      ...filteredProjects.map(p => [p.code, p.name, p.type, p.stage, p.owner, p.leader, p.region, p.crs, p.verticalDatum, p.status]),
    ]
    const csv = '\\uFEFF' + rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\\r\\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = '项目清单.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const saveDocument = () => {
    if (!newDocumentName.trim()) return
    setDocuments(current => [{
      id: Date.now(), name: newDocumentName.trim(), type: '文件夹', category: '项目资料',
      size: '—', uploadedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'), status: '目录已建立',
    }, ...current])
    setNewDocumentName('')
  }

  const statCards = [
    { label: '项目总数', value: projects.length.toLocaleString(), sub: '纳入平台统一管理', icon: <IconFolder size={21} />, color: '#6ea0ff', bg: 'rgba(46,111,255,.18)' },
    { label: '进行中项目', value: projects.filter(p => p.status === '进行中').length.toString(), sub: '勘察、设计及施工阶段', icon: <IconDetail size={21} />, color: '#2fce85', bg: 'rgba(47,206,133,.15)' },
    { label: '项目资料', value: visibleDocuments.length.toLocaleString(), sub: '关联项目的资料与成果', icon: <IconDb size={21} />, color: '#f5a623', bg: 'rgba(245,166,35,.15)' },
    { label: '坐标系覆盖', value: new Set(projects.map(p => p.epsg)).size.toString(), sub: '已配置的空间参考系统', icon: <IconImage size={21} />, color: '#b98cff', bg: 'rgba(142,79,158,.2)' },
  ]

  return (
    <div className="pm-page">
      <style>{styles}</style>
      <aside className="pm-side">
        <div className="pm-side-title">项目管理</div>
        <nav className="pm-side-nav">
          <button className={section === 'projects' ? 'active' : ''} onClick={() => setSection('projects')}><IconFolder size={15} />项目列表</button>
          <button className={section === 'documents' ? 'active' : ''} onClick={() => setSection('documents')}><IconDb size={15} />资料管理</button>
        </nav>
        <div className="pm-side-note">
          <div style={{ color: '#dce9ff', fontWeight: 700, marginBottom: 5 }}>项目空间基准</div>
          <div>坐标系：{selectedProject?.crs || '未设置'}</div>
          <div>高程基准：{selectedProject?.verticalDatum || '未设置'}</div>
          <div>数据组织：项目独立归档</div>
        </div>
      </aside>

      <main className="pm-main">
        {section === 'projects' ? (
          <>
            <div className="pm-heading">
              <div><div className="pm-heading-title">项目管理 / 项目列表</div><div className="pm-heading-sub">统一维护项目基本信息、空间参考、工程范围及项目资料</div></div>
              <div className="pm-actions">
                <button className="pm-btn" onClick={exportProjects}><IconDownload size={13} />导出项目清单</button>
                <button className="pm-btn primary" onClick={() => openCreate()}><IconPlus size={14} />新建项目</button>
              </div>
            </div>

            <div className="pm-stats">
              {statCards.map(card => <div className="pm-stat" key={card.label}><span className="pm-stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</span><div><div className="pm-stat-label">{card.label}</div><div className="pm-stat-value">{card.value}</div><div className="pm-stat-sub">{card.sub}</div></div></div>)}
            </div>

            <section className="pm-panel" style={{ flex: '1 1 auto' }}>
              <div className="pm-panel-head"><span>项目清单</span><span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>共 {filteredProjects.length} 个项目</span></div>
              <div className="pm-filter">
                <input className="pm-input" style={{ width: 230 }} placeholder="搜索项目名称、编号或区域" value={keyword} onChange={event => { setKeyword(event.target.value); setPage(1) }} />
                <select className="pm-select" value={typeFilter} onChange={event => { setTypeFilter(event.target.value); setPage(1) }}><option>全部类型</option>{projectTypes.map(type => <option key={type}>{type}</option>)}</select>
                <select className="pm-select" value={statusFilter} onChange={event => { setStatusFilter(event.target.value); setPage(1) }}><option>全部状态</option>{(['进行中', '未开始', '已完成', '暂停'] as ProjectStatus[]).map(status => <option key={status}>{status}</option>)}</select>
                <button className="pm-btn primary" onClick={() => setPage(1)}>查询</button>
                <button className="pm-btn" onClick={() => { setKeyword(''); setTypeFilter('全部类型'); setStatusFilter('全部状态'); setPage(1) }}>重置</button>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead><tr><th>项目名称 / 编号</th><th>项目类型</th><th>项目负责人</th><th>项目区域</th><th>坐标系</th><th>高程基准</th><th>项目阶段</th><th>状态</th><th>更新时间</th><th>操作</th></tr></thead>
                  <tbody>
                    {pageProjects.map(project => <tr key={project.id}>
                      <td><div className="pm-name">{project.name}</div><div className="pm-code">{project.code}</div></td>
                      <td>{project.type}</td><td>{project.leader}</td><td>{project.region}</td><td><span title={project.crs}>{project.crs}</span></td>
                      <td>{project.verticalDatum}</td><td>{project.stage}</td>
                      <td><span className="pm-status" style={{ color: statusColor[project.status] }}><i style={{ background: statusColor[project.status] }} />{project.status}</span></td>
                      <td>{project.updatedAt}</td>
                      <td><div className="pm-row-actions">
                        <span className="pm-icon-action" title="查看项目" onClick={() => { setSelectedProjectId(project.id); setShowDetail(true) }}><IconEye size={14} /></span>
                        <span className="pm-icon-action" title="编辑项目" onClick={() => openCreate(project)}><IconEdit size={14} /></span>
                        <span className="pm-icon-action" title="项目资料" onClick={() => { setSelectedProjectId(project.id); setSection('documents') }}><IconDb size={14} /></span>
                      </div></td>
                    </tr>)}
                    {!pageProjects.length && <tr><td colSpan={10}><div className="pm-empty">没有找到符合条件的项目</div></td></tr>}
                  </tbody>
                </table>
              </div>
              <Pagination total={filteredProjects.length} page={page} pageSize={pageSize} onChange={setPage} />
            </section>

            {selectedProject && <section className="pm-panel">
              <div className="pm-panel-head"><span>当前选中项目 · {selectedProject.name}</span><button className="pm-btn" onClick={() => setSection('documents')}><IconFolder size={13} />查看项目资料</button></div>
              <div className="pm-detail-grid">
                {[['项目编号', selectedProject.code], ['项目区域', selectedProject.region], ['项目坐标系', selectedProject.crs], ['垂直基准', selectedProject.verticalDatum], ['项目负责人', selectedProject.leader]].map(([label, value]) => <div className="pm-detail-item" key={label}><div className="pm-detail-label">{label}</div><div className="pm-detail-value">{value}</div></div>)}
              </div>
            </section>}
          </>
        ) : (
          <>
            <div className="pm-heading">
              <div><div className="pm-heading-title">项目管理 / 资料管理</div><div className="pm-heading-sub">当前项目：{selectedProject?.name || '未选择项目'} · 资料独立归档并保留文件类型、来源和入库状态</div></div>

            </div>
            <div className="pm-stats">
              {[
                { label: '项目资料总数', value: visibleDocuments.length, icon: <IconFolder size={21} />, color: '#6ea0ff', bg: 'rgba(46,111,255,.18)' },
                { label: 'PDF / 报告', value: visibleDocuments.filter(d => /PDF|报告/.test(d.type + d.category)).length, icon: <IconFilePdf size={21} />, color: '#2fce85', bg: 'rgba(47,206,133,.15)' },
                { label: '影像 / 地形', value: visibleDocuments.filter(d => /影像|地形/.test(d.type + d.category)).length, icon: <IconImage size={21} />, color: '#f5a623', bg: 'rgba(245,166,35,.15)' },
                { label: '待处理资料', value: visibleDocuments.filter(d => /待|识别/.test(d.status)).length, icon: <IconFileOther size={21} />, color: '#b98cff', bg: 'rgba(142,79,158,.2)' },
              ].map(card => <div className="pm-stat" key={card.label}><span className="pm-stat-icon" style={{ background: card.bg, color: card.color }}>{card.icon}</span><div><div className="pm-stat-label">{card.label}</div><div className="pm-stat-value">{card.value}</div><div className="pm-stat-sub">项目级资料统计</div></div></div>)}
            </div>
            <section className="pm-panel" style={{ flex: 1 }}>
              <div className="pm-panel-head"><span>项目资料库</span><span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>支持 PDF、Office、CAD、SHP、CSV、TIF 等常见格式</span></div>
              <div className="pm-filter">
                <input className="pm-input" style={{ width: 220 }} placeholder="搜索资料名称或分类" value={docKeyword} onChange={event => setDocKeyword(event.target.value)} />
                <select className="pm-select" value={docProjectFilter} onChange={event => setDocProjectFilter(event.target.value)} aria-label="所属项目筛选">
                  <option value="全部项目">全部可访问项目</option>
                  {accessibleProjects.map(project => <option key={project.id} value={String(project.id)}>{project.name}</option>)}
                </select>
                <select className="pm-select" value={docTypeFilter} onChange={event => setDocTypeFilter(event.target.value)}><option>全部类型</option>{Array.from(new Set(documents.filter(doc => accessibleProjects.some(project => project.id === doc.projectId)).map(doc => doc.type))).map(type => <option key={type}>{type}</option>)}</select>
                <button className="pm-btn" onClick={() => { setDocKeyword(''); setDocTypeFilter('全部类型'); setDocProjectFilter('全部项目') }}>重置</button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input className="pm-input" style={{ width: 230 }} placeholder="输入新建资料目录名称" value={newDocumentName} onChange={event => setNewDocumentName(event.target.value)} />
                  <button className="pm-btn" onClick={saveDocument}><IconPlus size={13} />新建目录</button>
                </div>
              </div>
              <div className="pm-table-wrap">
                <table className="pm-table"><thead><tr><th>资料名称</th><th>所属项目</th><th>资料分类</th><th>文件类型</th><th>大小</th><th>上传时间</th><th>状态</th><th>操作</th></tr></thead>
                  <tbody>{filteredDocs.map(doc => <tr key={doc.id}>
                    <td><div className="pm-name" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>{doc.type === '文件夹' ? <IconFolder size={15} color="#f5a623" /> : /PDF/.test(doc.type) ? <IconFilePdf size={15} color="#f5533b" /> : /影像|TIF/.test(doc.type) ? <IconImage size={15} color="#22d3ee" /> : <IconFileOther size={15} color="#b98cff" />}{doc.name}</div></td>
                    <td>{projects.find(project => project.id === doc.projectId)?.name || '未知项目'}</td><td><span className="pm-doc-category">{doc.category}</span></td><td>{doc.type}</td><td>{doc.size}</td><td>{doc.uploadedAt}</td>
                    <td><span className="pm-status" style={{ color: /已/.test(doc.status) ? '#2fce85' : '#f5a623' }}><i style={{ background: /已/.test(doc.status) ? '#2fce85' : '#f5a623' }} />{doc.status}</span></td>
                    <td><div className="pm-row-actions"><span className="pm-icon-action" title="查看"><IconEye size={14} /></span><span className="pm-icon-action" title="下载"><IconDownload size={14} /></span><span className="pm-icon-action" title="删除" onClick={() => setDocuments(current => current.filter(item => item.id !== doc.id))}><IconTrash size={14} /></span></div></td>
                  </tr>)}
                  {!filteredDocs.length && <tr><td colSpan={8}><div className="pm-empty">暂无匹配资料</div></td></tr>}</tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      <Modal open={showCreate} title={editingId === null ? '新建项目' : '编辑项目'} width={760} onClose={() => setShowCreate(false)}
        footer={<div className="pm-modal-footer"><button className="pm-btn" onClick={() => setShowCreate(false)}>取消</button><button className="pm-btn primary" onClick={saveProject}>保存项目</button></div>}>
        <div style={{ maxHeight: '66vh', overflow: 'auto', paddingRight: 4 }}>
          <div style={{ fontSize: 11, color: '#79aaff', fontWeight: 700, marginBottom: 10 }}>一、项目基本信息</div>
          <div className="pm-form-grid">
            <div className="pm-form-field"><label>项目名称<span>*</span></label><input className="pm-input" placeholder="请输入完整项目名称" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></div>
            <div className="pm-form-field"><label>项目类型</label><select className="pm-select" value={form.type} onChange={event => setForm({ ...form, type: event.target.value })}>{projectTypes.map(type => <option key={type}>{type}</option>)}</select></div>
            <div className="pm-form-field"><label>项目阶段</label><select className="pm-select" value={form.stage} onChange={event => setForm({ ...form, stage: event.target.value })}>{['前期准备', '勘察阶段', '设计阶段', '施工阶段', '验收阶段', '已归档'].map(stage => <option key={stage}>{stage}</option>)}</select></div>
            <div className="pm-form-field"><label>建设 / 业主单位</label><input className="pm-input" value={form.owner} onChange={event => setForm({ ...form, owner: event.target.value })} /></div>
            <div className="pm-form-field"><label>项目负责人<span>*</span></label><input className="pm-input" placeholder="请输入项目负责人姓名" value={form.leader} onChange={event => setForm({ ...form, leader: event.target.value })} /></div>
            <div className="pm-form-field"><label>项目状态</label><select className="pm-select" value={form.status} onChange={event => setForm({ ...form, status: event.target.value as ProjectStatus })}>{(['未开始', '进行中', '已完成', '暂停'] as ProjectStatus[]).map(status => <option key={status}>{status}</option>)}</select></div>
            <div className="pm-form-field full"><label>项目所在区域 / 地址<span>*</span></label><input className="pm-input" placeholder="省、市、区县或工程位置描述" value={form.region} onChange={event => setForm({ ...form, region: event.target.value })} /></div>
            <div className="pm-form-field"><label>计划开始日期</label><input className="pm-input" type="date" value={form.startDate} onChange={event => setForm({ ...form, startDate: event.target.value })} /></div>
            <div className="pm-form-field"><label>计划结束日期</label><input className="pm-input" type="date" value={form.endDate} onChange={event => setForm({ ...form, endDate: event.target.value })} /></div>
          </div>
          <div style={{ fontSize: 11, color: '#79aaff', fontWeight: 700, margin: '18px 0 10px' }}>二、空间参考与高程基准</div>
          <div className="pm-form-grid">
            <div className="pm-form-field full"><label>坐标参考系统（CRS）<span>*</span></label><select className="pm-select" value={form.crs} onChange={event => { const selected = coordinateSystems.find(item => item.label === event.target.value); setForm({ ...form, crs: event.target.value, epsg: selected?.epsg || '' }) }}>{coordinateSystems.map(system => <option key={system.epsg} value={system.label}>{system.label}</option>)}</select><div className="pm-form-hint">请根据测量成果或设计图纸选择坐标系；不同数据入库前需统一或执行坐标转换。</div></div>
            <div className="pm-form-field"><label>垂直 / 高程基准</label><select className="pm-select" value={form.verticalDatum} onChange={event => setForm({ ...form, verticalDatum: event.target.value })}>{['1985国家高程基准', '当地理论最低潮面', '当地平均海平面', '吴淞高程基准', '其他（需备注）'].map(datum => <option key={datum}>{datum}</option>)}</select></div>
            <div className="pm-form-field full"><label>项目说明</label><textarea className="pm-textarea" placeholder="填写工程范围、数据要求、特殊坐标约定或备注" value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></div>
          </div>
          <div className="pm-form-hint" style={{ marginTop: 10 }}>带 * 为必填项。当前为前端原型，保存后数据暂存于页面状态；后续将由 Java 后端校验并写入 PostgreSQL/PostGIS。</div>
        </div>
      </Modal>

      <Modal open={showDetail} title="项目详情" width={650} onClose={() => setShowDetail(false)}
        footer={<div className="pm-modal-footer"><button className="pm-btn" onClick={() => setShowDetail(false)}>关闭</button><button className="pm-btn primary" onClick={() => { setShowDetail(false); if (selectedProject) openCreate(selectedProject) }}><IconEdit size={13} />编辑项目</button></div>}>
        {selectedProject && <div className="pm-detail-grid" style={{ gridTemplateColumns: 'repeat(2,minmax(0,1fr))' }}>
          {[['项目名称', selectedProject.name], ['项目编号', selectedProject.code], ['项目类型', selectedProject.type], ['项目阶段', selectedProject.stage], ['建设单位', selectedProject.owner], ['项目区域', selectedProject.region], ['坐标参考系', selectedProject.crs], ['高程基准', selectedProject.verticalDatum], ['项目面积', selectedProject.area], ['项目状态', selectedProject.status], ['项目说明', selectedProject.description || '暂无说明']].map(([label, value]) => <div className="pm-detail-item" key={label}><div className="pm-detail-label">{label}</div><div className="pm-detail-value">{value}</div></div>)}
        </div>}
      </Modal>

      <Modal open={showUpload} title="上传项目资料" width={560} onClose={() => setShowUpload(false)}
        footer={<div className="pm-modal-footer"><button className="pm-btn" onClick={() => setShowUpload(false)}>取消</button><button className="pm-btn primary" onClick={() => setShowUpload(false)}>完成</button></div>}>
        <div className="pm-form-field"><label>关联项目</label><select className="pm-select" defaultValue={selectedProject?.id}>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></div>
        <div style={{ marginTop: 12 }}><UploadBox hint="支持 PDF、Word、Excel、DWG、DXF、SHP、CSV、TIF、TID 等格式" /></div>
        <div className="pm-form-hint" style={{ marginTop: 9 }}>原始文件应存储于对象存储服务，数据库只保存文件元数据、项目关联、坐标参考和解析状态。</div>
      </Modal>
    </div>
  )
}
