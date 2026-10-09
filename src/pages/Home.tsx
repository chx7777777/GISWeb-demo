import { useNavigate } from 'react-router-dom'
import EChart from '../components/EChart'
import { IconAI, IconBox, IconCalc, IconChart, IconDrill, IconMap, IconReport, IconDb } from '../components/icons'
import { countryRank, monthlyTrend, projectFeed, projectTypes, worldProjects } from '../mock/data'

const quickEntries = [
  { name: '项目地图', icon: <IconMap size={20} color="#6ea0ff" />, bg: 'rgba(46,111,255,.18)', to: '/borehole' },
  { name: '钻孔管理', icon: <IconDrill size={20} color="#22d3ee" />, bg: 'rgba(34,211,238,.15)', to: '/borehole' },
  { name: '三维建模', icon: <IconBox size={20} color="#2fce85" />, bg: 'rgba(47,206,133,.15)', to: '/model' },
  { name: '土方计算', icon: <IconCalc size={20} color="#f5a623" />, bg: 'rgba(245,166,35,.15)', to: '/earthwork' },
  { name: '成果报告', icon: <IconReport size={20} color="#b98cff" />, bg: 'rgba(142,79,158,.2)', to: '/report' },
  { name: '资料管理', icon: <IconDb size={20} color="#6ea0ff" />, bg: 'rgba(46,111,255,.18)', to: '/data' },
  { name: 'AI识别', icon: <IconAI size={20} color="#22d3ee" />, bg: 'rgba(34,211,238,.15)', to: '/data/pdf' },
  { name: '数据统计', icon: <IconChart size={20} color="#2fce85" />, bg: 'rgba(47,206,133,.15)', to: '/report' },
]

/* 世界地图底图：项目点位通过经纬度换算到等经纬度 SVG 上 */
function WorldMap() {
  return (
    <img
      className="world-map-bg"
      src="/assets/world-map.svg"
      alt="世界地图"
    />
  )
}

export default function Home() {
  const nav = useNavigate()

  const donutOption = {
    tooltip: { trigger: 'item' as const, backgroundColor: '#0f2444', borderColor: '#24508a', textStyle: { color: '#e8f1ff', fontSize: 11 } },
    legend: { orient: 'vertical' as const, left: '52%', top: 'middle', icon: 'circle', itemWidth: 7, itemHeight: 7, itemGap: 7, textStyle: { color: '#b9cbe8', fontSize: 10 }, formatter: (n: string) => {
      const it = projectTypes.find(p => p.name === n)!
      return `${n}  ${it.value} (${(it.value / 1.26).toFixed(1)}%)`
    } },
    series: [{
      type: 'pie' as const, radius: ['46%', '66%'], center: ['25%', '50%'],
      label: { show: true, position: 'center' as const, formatter: '总计\n126', color: '#fff', fontSize: 15, fontWeight: 600, lineHeight: 21 },
      itemStyle: { borderColor: '#0c1d38', borderWidth: 2 },
      data: projectTypes.map(p => ({ name: p.name, value: p.value, itemStyle: { color: p.color } })),
    }],
  }

  const lineOption = {
    grid: { left: 40, right: 16, top: 20, bottom: 26 },
    tooltip: { trigger: 'axis' as const, backgroundColor: '#0f2444', borderColor: '#24508a', textStyle: { color: '#e8f1ff', fontSize: 11 } },
    xAxis: { type: 'category' as const, data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: '#24508a' } }, axisLabel: { color: '#7f97bd', fontSize: 10 } },
    yAxis: { type: 'value' as const, splitLine: { lineStyle: { color: 'rgba(36,80,138,.35)' } }, axisLabel: { color: '#7f97bd', fontSize: 10 } },
    series: [{
      type: 'line' as const, data: monthlyTrend, smooth: true, symbol: 'circle', symbolSize: 5,
      lineStyle: { color: '#2e6fff', width: 2 }, itemStyle: { color: '#2e6fff' },
      areaStyle: { color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(46,111,255,.35)' }, { offset: 1, color: 'rgba(46,111,255,0)' }] } },
    }],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="home-grid" style={{ flex: 1 }}>
        {/* 左列 */}
        <div className="home-col">
          <div className="panel">
            <div className="panel-head">项目统计</div>
            <div className="panel-body no-pad" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 12px 0', fontSize: 12, color: 'var(--text-3)' }}>项目类型分布</div>
              <EChart option={donutOption} height={190} />
              <div style={{ display: 'flex', gap: 10, padding: '4px 14px 10px', fontSize: 11, color: 'var(--text-3)' }}>
                <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#5b7295', marginRight: 4 }} />未开始</span>
                <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#2e6fff', marginRight: 4 }} />进行中</span>
                <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#2fce85', marginRight: 4 }} />已完工</span>
              </div>
              <div style={{ display: 'flex', padding: '0 14px 12px', gap: 12 }}>
                {[['12', '#8ba3c7'], ['58', '#2e6fff'], ['56', '#2fce85']].map(([v, c], i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v} <span style={{ fontSize: 11, color: 'var(--green)' }}>↑</span></div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)' }}>
                <span>合计</span><b style={{ fontSize: 18, color: '#fff' }}>126</b>
              </div>
            </div>
          </div>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-head">项目排行榜 <span className="t3 f11" style={{ fontWeight: 400 }}>(按项目数量)</span></div>
            <div className="panel-body">
              {countryRank.map((c, i) => (
                <div className="rank-row" key={c.name}>
                  <span className="rk-no">{i + 1}</span>
                  <span className="rk-name">{c.name}</span>
                  <span className="rk-bar"><i style={{ width: (c.value / 56 * 100) + '%' }} /></span>
                  <span className="rk-val">{c.value} 个</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中列 */}
        <div className="home-col">
          <div className="panel" style={{ flex: 1.4 }}>
            <div className="panel-head">
              全球项目分布
              <div className="toolbar" style={{ marginLeft: 'auto', fontWeight: 400 }}>
                <select className="select" style={{ height: 26, fontSize: 12 }}><option>全部区域</option></select>
                <select className="select" style={{ height: 26, fontSize: 12 }}><option>全部国家</option></select>
                <select className="select" style={{ height: 26, fontSize: 12 }}><option>全部类型</option></select>
                <select className="select" style={{ height: 26, fontSize: 12 }}><option>全部状态</option></select>
                <input className="input" style={{ height: 26, width: 120, fontSize: 12 }} placeholder="请输入项目名称" />
              </div>
            </div>
            <div className="panel-body no-pad home-world-map" style={{ position: 'relative', flex: 1, minHeight: 0 }}>
              <WorldMap />
              <div style={{ position: 'absolute', right: 14, top: 10, zIndex: 5, display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-3)' }}>
                <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#5b7295', marginRight: 4 }} />未开始</span>
                <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#2e6fff', marginRight: 4 }} />进行中</span>
                <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#2fce85', marginRight: 4 }} />已完工</span>
              </div>
              {worldProjects.map(p => (
                <div
                  key={p.name}
                  className="world-project"
                  title={p.name}
                  style={{ left: p.left, top: p.top }}
                >
                  <span
                    className="world-marker"
                    style={{ background: p.color, boxShadow: `0 0 12px ${p.color}` }}
                  />
                  <span className="world-project-name">{p.name}</span>
                </div>
              ))}
              <div className="map-toolbar">
                <span className="mt-btn">+</span><span className="mt-btn">−</span>
              </div>
              <div className="map-scale"><span>2000 km</span><span className="bar" /></div>
            </div>
          </div>
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-head">工程量统计（本年）</div>
            <div className="panel-body no-pad" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="kpi-row" style={{ padding: '14px 16px 4px' }}>
                {[
                  { label: '钻孔总数', value: '12,368', unit: '个', rate: '+15.6%' },
                  { label: '土方总量', value: '2,568.45', unit: '万 m³', rate: '+22.3%' },
                  { label: '报告总数', value: '356', unit: '份', rate: '+12.4%' },
                ].map(k => (
                  <div className="kpi-item" key={k.label}>
                    <div className="ki-label">{k.label}</div>
                    <div className="ki-value">{k.value}<small>{k.unit}</small></div>
                    <div className="ki-sub">较去年 <span className="up">{k.rate} ↑</span></div>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 10px', flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '4px 6px 0' }}>月度工程量趋势（万 m³）</div>
                <EChart option={lineOption} height={120} />
              </div>
            </div>
          </div>
        </div>

        {/* 右列 */}
        <div className="home-col">
          <div className="panel" style={{ flex: 1 }}>
            <div className="panel-head">项目动态 <span className="more">更多 &gt;</span></div>
            <div className="panel-body">
              {projectFeed.map((f, i) => (
                <div className="feed-item" key={i}>
                  <span className="fd-dot" style={{ background: f.color }} />
                  <div className="fd-body">
                    <div className="fd-status" style={{ color: f.color }}>{f.status}</div>
                    <div className="fd-title">{f.title}</div>
                    <div className="fd-sub">{f.sub}</div>
                  </div>
                  <span className="fd-time">{f.time}</span>
                </div>
              ))}
              <div className="flex jcb aic mt12 f11 t3">
                <span>共 5 条</span>
                <span className="flex g6">
                  <span className="pg-btn disabled">&lt;</span>
                  <span className="pg-btn active">1</span>
                  <span className="pg-btn">&gt;</span>
                </span>
              </div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">快捷入口</div>
            <div className="panel-body">
              <div className="quick-grid">
                {quickEntries.map(q => (
                  <div className="quick-item" key={q.name} onClick={() => nav(q.to)}>
                    <span className="qi-icon" style={{ background: q.bg }}>{q.icon}</span>
                    <span className="qi-name">{q.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="status-strip">
        <span>系统状态：<span className="ok">● 运行正常</span></span>
        <span>数据库：PostgreSQL 15 + PostGIS 3.4</span>
        <span>地图服务：GeoServer 2.23.1</span>
        <span className="right">技术支持：中交华南勘察测绘科技有限公司</span>
      </div>
    </div>
  )
}
