import { useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import EChart from '../../components/EChart'
import SideMenu from '../../components/SideMenu'
import Modal from '../../components/Modal'
import { IconDetail, IconDownload, IconEdit, IconEye, IconPlus, IconReport, IconTemplate } from '../../components/icons'
import { monthlyTrend, reports, strata } from '../../mock/data'

const menuItems = [
  { to: '/report/list', label: '报告列表', icon: <IconReport size={15} /> },
  { to: '/report/template', label: '报告模板', icon: <IconTemplate size={15} /> },
  { to: '/report/edit', label: '报告编制', icon: <IconEdit size={15} /> },
]

function ReportStats() {
  return (
    <div className="side-block">
      <h4>报告统计</h4>
      <div className="side-stat">总报告数<b>36</b></div>
      <div className="side-stat">本月生成<b>8</b></div>
      <div className="side-stat">本月导出<b>12</b></div>
      <h4 style={{ marginTop: 14 }}>关键成果摘要</h4>
      <div className="grid2" style={{ gap: 8 }}>
        {[['钻孔总数', '2,568'], ['地层数量', '8 层'], ['建模范围', '48.12 km²'], ['总开挖方量', '1,255,342.18 m³']].map(([l, v]) => (
          <div key={l} style={{ background: 'var(--bg-input)', borderRadius: 6, padding: '6px 8px' }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div>
            <div className="f11 t3">{l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportLayout() {
  return (
    <>
      <SideMenu title="成果报告" items={menuItems}><ReportStats /></SideMenu>
      <div className="app-main"><Outlet /></div>
    </>
  )
}

export function ReportList() {
  const [activeId, setActiveId] = useState(1)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [showNew, setShowNew] = useState(false)
  const [showTemplate, setShowTemplate] = useState(false)
  const active = reports.find(r => r.id === activeId) || reports[0]
  const filtered = reports.filter(r => !keyword || r.name.includes(keyword))

  const donutOption = {
    tooltip: { trigger: 'item' as const, backgroundColor: '#0f2444', borderColor: '#24508a', textStyle: { color: '#e8f1ff', fontSize: 11 } },
    legend: { orient: 'vertical' as const, right: 0, top: 'middle', icon: 'circle', itemWidth: 7, itemHeight: 7,
      textStyle: { color: '#7f97bd', fontSize: 10 }, formatter: (n: string) => {
        const it = strata.find(s => s.name === n)!
        return `${n}  ${(it.volume / 1e6).toFixed(1)}×10⁶ (${it.ratio}%)`
      } },
    series: [{
      type: 'pie' as const, radius: ['48%', '70%'], center: ['30%', '50%'],
      label: { show: true, position: 'center' as const, formatter: '总量\n1,255,342.18 m³', color: '#fff', fontSize: 11, lineHeight: 16 },
      itemStyle: { borderColor: '#0c1d38', borderWidth: 2 },
      data: strata.map(s => ({ name: s.name, value: s.volume, itemStyle: { color: s.color } })),
    }],
  }

  const lineOption = {
    grid: { left: 36, right: 12, top: 16, bottom: 24 },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0f2444', borderColor: '#24508a', textStyle: { color: '#e8f1ff', fontSize: 11 } },
    xAxis: { type: 'category' as const, data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: '#24508a' } }, axisLabel: { color: '#7f97bd', fontSize: 10 } },
    yAxis: { type: 'value' as const, splitLine: { lineStyle: { color: 'rgba(36,80,138,.35)' } }, axisLabel: { color: '#7f97bd', fontSize: 10 } },
    series: [{ type: 'line' as const, data: monthlyTrend, smooth: true, symbol: 'circle', symbolSize: 4,
      lineStyle: { color: '#2e6fff', width: 2 }, itemStyle: { color: '#2e6fff' },
      areaStyle: { color: 'rgba(46,111,255,.18)' } }],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* 筛选条 */}
      <div className="panel" style={{ flex: 'none' }}>
        <div className="filter-bar">
          <input className="input" style={{ width: 180 }} placeholder="请输入报告名称/编号" value={keyword} onChange={e => setKeyword(e.target.value)} />
          <span className="f12 t3">报告类型</span><select className="select"><option>全部类型</option><option>地质建模报告</option><option>土方计算报告</option></select>
          <span className="f12 t3">报告状态</span><select className="select"><option>全部状态</option><option>正式版</option><option>草稿</option></select>
          <span className="f12 t3">生成时间</span><input className="input" style={{ width: 190 }} placeholder="2025-05-01 ~ 2025-05-12" />
          <button className="btn btn-primary">查询</button>
          <button className="btn btn-ghost" onClick={() => setKeyword('')}>重置</button>
          <span style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><IconPlus size={14} /> 新建报告</button>
          <button className="btn btn-primary" onClick={() => setShowTemplate(true)}><IconTemplate size={14} /> 使用模板创建</button>
          <button className="btn btn-primary"><IconDownload size={14} /> 批量导出</button>
        </div>
      </div>

      <div className="flex" style={{ flex: 1, minHeight: 0, gap: 12 }}>
        {/* 报告列表 */}
        <div className="panel" style={{ width: 300, flex: 'none' }}>
          <div className="panel-head">报告列表（Word文件）<span className="more">⚙</span></div>
          <div className="panel-body no-pad scroll" style={{ padding: 8 }}>
            {filtered.map(r => (
              <div key={r.id} className={'report-item' + (r.id === activeId ? ' active' : '')} onClick={() => setActiveId(r.id)}>
                <span className="ri-icon">W</span>
                <div className="ri-body">
                  <div className="flex aic jcb">
                    <span className="ri-name">{r.name}</span>
                    <span className="tag tag-green" style={{ flex: 'none' }}>{r.version}</span>
                  </div>
                  <div className="ri-meta">编号：{r.code}</div>
                  <div className="ri-meta">生成时间：{r.time}</div>
                  <div className="ri-meta">类型：{r.type}</div>
                  <div className="ri-ops">
                    <span title="预览"><IconEye size={14} /></span>
                    <span title="下载"><IconDownload size={14} /></span>
                    <span title="详情"><IconDetail size={14} /></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 报告预览 */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="panel" style={{ flex: 1, minHeight: 0 }}>
            <div className="panel-head">
              报告预览（Word）
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400 }} className="f12 t3">
                <span className="pg-btn">&lt;</span>
                <span style={{ border: '1px solid var(--border-light)', borderRadius: 4, padding: '2px 8px', background: 'var(--bg-input)' }}>{page}</span> / 23
                <span className="pg-btn">&gt;</span>
                <span>−</span><span>100%</span><span>+</span>
                <button className="btn btn-ghost btn-sm">适应宽度</button>
                <button className="btn btn-ghost btn-sm">适应页面</button>
                <button className="btn btn-primary btn-sm"><IconDownload size={12} /> 下载</button>
              </span>
            </div>
            <div className="panel-body scroll" style={{ background: '#060f1f' }}>
              <div className="report-paper">
                <div className="rp-logo">中交广州航道局有限公司<br />CCCC GUANGZHOU DREDGING CO., LTD.</div>
                <h2>南沙港区航道治理工程</h2>
                <h3>地质建模与土方计算成果报告</h3>
                <div className="rp-meta">
                  报告编号：{active.code}<br />
                  报告类型：{active.type}<br />
                  编制单位：勘测技术中心<br />
                  编制日期：{active.time.split(' ')[0]}
                </div>
                <div className="rp-sec">1 项目概况</div>
                <div className="rp-p">南沙港区航道治理工程位于广州市南沙区，航道全长约 12.8 km，设计底宽 280 m，设计底高程 -16.0 m。工程内容主要包括航道疏浚、吹填、护岸及配套设施等。</div>
                <div className="rp-img" />
              </div>
              <div className="f11 t3 mt8" style={{ textAlign: 'center' }}>第 1 页，共 23 页</div>
            </div>
          </div>

          <div className="grid2" style={{ flex: 'none', minHeight: 180 }}>
            <div className="panel">
              <div className="panel-head">土方量统计（本项目）</div>
              <div className="panel-body no-pad"><EChart option={donutOption} height={170} /></div>
            </div>
            <div className="panel">
              <div className="panel-head">月度工程量趋势（万 m³）</div>
              <div className="panel-body no-pad"><EChart option={lineOption} height={170} /></div>
            </div>
          </div>
        </div>
      </div>

      {/* 新建报告 */}
      <Modal open={showNew} title="新建报告" onClose={() => setShowNew(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowNew(false)}>取消</button>
          <button className="btn btn-primary" onClick={() => setShowNew(false)}>创建</button></>}>
        <div className="form-row"><label>报告名称<span className="req">*</span></label><input className="input" placeholder="请输入报告名称" /></div>
        <div className="form-row"><label>报告类型</label>
          <select className="select"><option>地质建模+土方计算报告</option><option>工程地质分析报告</option><option>土方计算专项报告</option></select></div>
        <div className="form-row"><label>关联项目</label>
          <select className="select"><option>广州港南沙港区航道治理工程</option><option>虎门港区码头扩建工程</option></select></div>
        <div className="form-row"><label>包含内容</label>
          <div className="flex g12" style={{ flexWrap: 'wrap' }}>
            {['项目概况', '钻孔数据', '地层模型', '土方计算', '成果图表', '结论建议'].map(c => (
              <label className="checkbox" key={c}><input type="checkbox" defaultChecked /> {c}</label>
            ))}
          </div></div>
      </Modal>

      {/* 模板创建 */}
      <Modal open={showTemplate} title="使用模板创建" width={560} onClose={() => setShowTemplate(false)}
        footer={<><button className="btn btn-ghost" onClick={() => setShowTemplate(false)}>取消</button>
          <button className="btn btn-primary" onClick={() => setShowTemplate(false)}>使用所选模板</button></>}>
        <div className="grid2">
          {['航道工程地质成果报告模板', '土方计算专项报告模板', '地层对比分析报告模板', '综合勘察成果报告模板'].map((t, i) => (
            <label key={t} className="flex g10 aic" style={{ border: `1px solid ${i === 0 ? 'var(--primary)' : 'var(--border-light)'}`, borderRadius: 8, padding: 12, cursor: 'pointer' }}>
              <input type="radio" name="tpl" defaultChecked={i === 0} style={{ accentColor: 'var(--primary)' }} />
              <span className="f12">{t}</span>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export function ReportSimple() {
  const { sub } = useParams()
  const isTpl = sub === 'template'
  return (
    <div className="panel" style={{ height: '100%' }}>
      <div className="panel-head">{isTpl ? '报告模板' : '报告编制'}
        {isTpl && <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}><IconPlus size={13} /> 新建模板</button>}
      </div>
      <div className="panel-body">
        {isTpl ? (
          <div className="grid2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 900 }}>
            {['航道工程地质成果报告模板', '土方计算专项报告模板', '地层对比分析报告模板', '综合勘察成果报告模板', '钻孔数据汇总报告模板', '月度工程简报模板'].map(t => (
              <div key={t} className="panel" style={{ cursor: 'pointer' }}>
                <div style={{ height: 110, background: 'linear-gradient(160deg, #12294a, #0c1d38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconReport size={38} color="#3a6db5" />
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <div className="f12 bold">{t}</div>
                  <div className="f11 t3 mt8">最近使用：2025-05-10</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ maxWidth: 720 }}>
            <div className="t2 f12 mb12" style={{ lineHeight: 1.8 }}>选择数据源与模板，一键编制成果报告（演示）。</div>
            <div className="form-row"><label>报告模板</label><select className="select"><option>航道工程地质成果报告模板</option></select></div>
            <div className="form-row"><label>数据源</label>
              <div className="flex g12">
                <label className="checkbox"><input type="checkbox" defaultChecked /> 钻孔数据库</label>
                <label className="checkbox"><input type="checkbox" defaultChecked /> 三维地层模型</label>
                <label className="checkbox"><input type="checkbox" defaultChecked /> 土方计算结果</label>
              </div></div>
            <div className="form-row"><label>报告名称</label><input className="input" placeholder="南沙港区航道治理工程地质成果报告" /></div>
            <button className="btn btn-primary">开始编制</button>
          </div>
        )}
      </div>
    </div>
  )
}
