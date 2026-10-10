import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/Modal'
import { boreholes } from '../../mock/data'
import ModelParameters from './ModelParameters'
import { ModelConfig, ModelRecord, defaultConfig, useModels, saveModel, selectModel, projects, sections, modelingPlugins, interpolationPlugins, methodName, interpolationName, sourceSummary } from './modelStore'

const blankFilters = { keyword: '', project: '', from: '', to: '', method: '', interpolation: '' }
export default function ModelBuild() {
  const { records } = useModels()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(blankFilters)
  const [query, setQuery] = useState(blankFilters)
  const [editing, setEditing] = useState<{ id?: string; config: ModelConfig } | null>(null)
  const [history, setHistory] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [holeSearch, setHoleSearch] = useState('')
  const open = (record?: ModelRecord) => { setEditing({ id: record?.id, config: JSON.parse(JSON.stringify(record?.draft || { ...defaultConfig, name: '', boreholeIds: [] })) }); setError(''); setHoleSearch('') }
  const patch = (value: Partial<ModelConfig>) => { if (editing) setEditing({ ...editing, config: { ...editing.config, ...value } }) }
  const save = (build: boolean) => {
    if (!editing) return
    try { saveModel(editing.config, editing.id, build); setEditing(null); setNotice(build ? '演示建模完成，已生成新版本，可在模型总览查看。' : '草稿已保存，已有版本不受影响。') } catch (e) { setError((e as Error).message) }
  }
  const rebuild = (record: ModelRecord) => {
    try { saveModel(record.draft, record.id, true); setNotice(`${record.draft.name} 已生成 v${record.versions.length + 1}.0`) } catch (e) { setNotice((e as Error).message) }
  }
  const show = (id: string, version?: string) => { selectModel(id, version); navigate('/model') }
  const filtered = records.filter(record => {
    const latest = record.versions[record.versions.length - 1]
    const c = latest?.config || record.draft
    const date = latest ? new Date(latest.createdAt).toLocaleDateString('sv-SE') : ''
    return record.draft.name.toLowerCase().includes(query.keyword.toLowerCase()) && (!query.project || c.project === query.project) && (!query.method || c.method === query.method) && (!query.interpolation || c.interpolation === query.interpolation) && (!query.from || date >= query.from) && (!query.to || !!date && date <= query.to)
  })
  const currentHistory = records.find(r => r.id === history)
  const availableHoles = boreholes.filter(b => b.project === editing?.config.project && b.id.toLowerCase().includes(holeSearch.toLowerCase()))
  return <div style={{ height: '100%', overflow: 'auto', paddingBottom: 20 }}>
    <div className="flex aic jcb mb12"><div><h3 style={{ margin: 0 }}>地层建模</h3><div className="f12 t3 mt8">选择建模数据与算法，管理模型草稿和版本。数据保存在当前浏览器。</div></div><button className="btn btn-primary" onClick={() => open()}>＋ 新增建模</button></div>
    <div className="panel mb12"><div className="panel-body">
      <div className="flex g10" style={{ flexWrap: 'wrap', alignItems: 'end' }}>
        <label>模型名称<input aria-label="查询模型名称" className="input" value={filters.keyword} onChange={e => setFilters({ ...filters, keyword: e.target.value })} placeholder="搜索模型" /></label>
        <label>所属项目<select aria-label="查询所属项目" className="select" value={filters.project} onChange={e => setFilters({ ...filters, project: e.target.value })}><option value="">全部项目</option>{projects.map(p => <option key={p}>{p}</option>)}</select></label>
        <label>建模开始日期<input className="input" type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></label>
        <label>建模结束日期<input className="input" type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></label>
        <label>建模方法<select className="select" value={filters.method} onChange={e => setFilters({ ...filters, method: e.target.value })}><option value="">全部方法</option>{[...modelingPlugins.values()].map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>插值方法<select className="select" value={filters.interpolation} onChange={e => setFilters({ ...filters, interpolation: e.target.value })}><option value="">全部插值</option>{[...interpolationPlugins.values()].map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <button className="btn btn-primary" onClick={() => { if (filters.from && filters.to && filters.from > filters.to) { setNotice('开始日期不能晚于结束日期'); return } setQuery(filters); setNotice('') }}>查询</button>
        <button className="btn btn-ghost" onClick={() => { setFilters(blankFilters); setQuery(blankFilters); setNotice('') }}>重置</button>
      </div><div className="f11 t3 mt8">按最新建模版本的所属项目、时间及方法查询；未建模草稿无建模时间。</div>
    </div></div>
    {notice && <div role="status" className="panel mb12" style={{ padding: 12 }}>{notice}</div>}
    <div className="f12 t3 mb12">共 {filtered.length} 个模型</div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: 14 }}>
      {filtered.map(record => { const latest = record.versions[record.versions.length - 1]; const c = latest?.config || record.draft; const changed = latest && JSON.stringify(latest.config) !== JSON.stringify(record.draft); return <div className="panel" key={record.id}>
        <div className="panel-head"><span style={{ overflowWrap: 'anywhere' }}>{record.draft.name}</span><span className="tag tag-blue" style={{ marginLeft: 'auto' }}>{latest ? `v${latest.number}.0` : '草稿'}</span></div>
        <div className="panel-body"><div className="f12 t2" style={{ lineHeight: 2 }}>
          <div>所属项目：{c.project}</div><div>建模数据：{sourceSummary(c)}</div><div>建模方法：{methodName(c.method)}</div><div>插值方法：{interpolationName(c.interpolation)}</div><div>建模时间：{latest ? new Date(latest.createdAt).toLocaleString('zh-CN') : '尚未建模'}</div>
          <div className="t3">{changed ? '草稿已修改，重新建模后生效' : `共 ${record.versions.length} 个版本 · 演示模型`}</div>
        </div><div className="flex g6 mt12" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" disabled={!latest} onClick={() => show(record.id)}>查看模型</button>
          <button className="btn btn-ghost btn-sm" onClick={() => open(record)}>编辑</button>
          <button className="btn btn-ghost btn-sm" onClick={() => rebuild(record)}>{latest ? '重新建模' : '开始建模'}</button>
          <button className="btn btn-ghost btn-sm" disabled={!latest} onClick={() => setHistory(record.id)}>版本记录</button>
        </div></div>
      </div> })}
    </div>
    {!filtered.length && <div className="panel" style={{ padding: 36, textAlign: 'center' }}>没有符合条件的模型，请调整筛选条件或新增建模。</div>}
    <Modal open={!!editing} title={editing?.id ? '编辑模型草稿' : '新增建模'} width={900} onClose={() => setEditing(null)} footer={<><button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button><button className="btn btn-ghost" onClick={() => save(false)}>保存草稿</button><button className="btn btn-primary" onClick={() => save(true)}>保存并建模</button></>}>
      {editing && <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div><label className="form-row">模型名称<input className="input" maxLength={80} value={editing.config.name} onChange={e => patch({ name: e.target.value })} placeholder="请输入模型名称" /></label>
          <label className="form-row">所属项目<select className="select" value={editing.config.project} onChange={e => patch({ project: e.target.value, boreholeIds: [], sectionId: '' })}>{projects.map(p => <option key={p}>{p}</option>)}</select></label>
          <label className="form-row">建模数据类型<select className="select" value={editing.config.source} onChange={e => { const source = e.target.value as ModelConfig['source']; patch({ source, method: modelingPlugins.get(editing.config.method)?.sources.includes(source) ? editing.config.method : 'layer' }) }}><option value="boreholes">选择钻孔</option><option value="section">选择一个剖面</option><option value="combined">钻孔 + 剖面</option></select></label>
          {editing.config.source !== 'boreholes' && <label className="form-row">剖面<select className="select" value={editing.config.sectionId} onChange={e => patch({ sectionId: e.target.value })}><option value="">请选择剖面</option>{sections.filter(s => s.project === editing.config.project).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
          {editing.config.source !== 'section' && <><div className="flex aic jcb mb12"><span>已选 {editing.config.boreholeIds.length} 个钻孔</span><button className="btn btn-ghost btn-sm" onClick={() => patch({ boreholeIds: [...new Set([...editing.config.boreholeIds, ...availableHoles.map(b => b.id)])] })}>全选查询结果</button><button className="btn btn-ghost btn-sm" onClick={() => patch({ boreholeIds: [] })}>清空</button></div>
            <input className="input mb12" placeholder="搜索钻孔编号" value={holeSearch} onChange={e => setHoleSearch(e.target.value)} />
            <div style={{ maxHeight: 230, overflow: 'auto', border: '1px solid var(--border)', padding: 10 }}>
              {availableHoles.map(b => <label className="flex aic g10" key={b.id} style={{ padding: '7px 0' }}><input type="checkbox" checked={editing.config.boreholeIds.includes(b.id)} onChange={e => patch({ boreholeIds: e.target.checked ? [...editing.config.boreholeIds, b.id] : editing.config.boreholeIds.filter(id => id !== b.id) })} /><span>{b.id}</span><span className="t3">{b.depth} m · {b.status}</span></label>)}
              {!availableHoles.length && <div className="t3">没有匹配的钻孔</div>}
            </div></>}
          <div className="t3 f11 mt12">钻孔使用现有演示数据；剖面为项目关联的演示目录。模型形态用于交互验证。</div>
        </div><div><ModelParameters config={editing.config} onChange={config => setEditing({ ...editing, config })} /></div>
      </div>}
      {error && <div role="alert" style={{ color: '#fb7185', marginTop: 12 }}>{error}</div>}
    </Modal>
    <Modal open={!!currentHistory} title={`${currentHistory?.draft.name || ''} · 版本记录`} width={900} onClose={() => setHistory(null)}>
      <table className="tbl"><thead><tr><th>版本</th><th>建模时间</th><th>数据</th><th>建模方法 / 插值</th><th>参数</th><th>操作</th></tr></thead><tbody>{currentHistory?.versions.slice().reverse().map(v => <tr key={v.id}><td>v{v.number}.0</td><td>{new Date(v.createdAt).toLocaleString('zh-CN')}</td><td>{sourceSummary(v.config)}</td><td>{methodName(v.config.method)}<br />{interpolationName(v.config.interpolation)}</td><td>网格 {v.config.grid} m<br />垂向 {v.config.vertical} m<br />平滑 {v.config.smooth}</td><td><button className="btn btn-ghost btn-sm" onClick={() => show(currentHistory.id, v.id)}>查看此版本</button></td></tr>)}</tbody></table>
    </Modal>
  </div>
}
