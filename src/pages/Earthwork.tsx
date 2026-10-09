import { useState } from 'react'
import UploadBox from '../components/UploadBox'
import { IconPlay, IconDownload } from '../components/icons'
import { earthworkResult, earthworkSummary } from '../mock/data'

type CalcStage = 'idle' | 'running' | 'done'

function Collapse({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={'collapse' + (open ? ' open' : '')}>
      <div className="collapse-head" onClick={() => setOpen(!open)}>{title}<span className="arr">▾</span></div>
      <div className="collapse-body">{children}</div>
    </div>
  )
}

/* 航道水深渲染图 */
function ChannelMap() {
  return (
    <div className="map-box" style={{ height: '100%' }}>
      <img src="/assets/earthwork-map.jpg" alt="航道水深渲染图"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
    </div>
  )
}

/* 断面视图 */
function SectionView() {
  return (
    <img src="/assets/earthwork-section.png" alt="断面视图"
      style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }} />
  )
}

export default function Earthwork() {
  const [stage, setStage] = useState<CalcStage>('done')
  const [progress, setProgress] = useState(100)
  const [seg, setSeg] = useState('K1+000 ~ K2+000')

  const start = () => {
    if (stage === 'running') return
    setStage('running'); setProgress(0)
    const t = setInterval(() => {
      setProgress(p => {
        const n = Math.min(100, p + Math.round(6 + Math.random() * 12))
        if (n >= 100) { clearInterval(t); setTimeout(() => setStage('done'), 300) }
        return n
      })
    }, 140)
  }

  return (
    <div className="flex" style={{ gap: 12, height: '100%' }}>
      {/* 左中：地图 + 断面 */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ flex: 1.5, minHeight: 0 }}><ChannelMap /></div>
        <div className="panel" style={{ flex: 1, minHeight: 0 }}>
          <div className="panel-head">
            断面视图
            <select className="select" style={{ height: 24, fontSize: 12, marginLeft: 10 }}><option>K1+500</option><option>K1+400</option><option>K1+300</option></select>
            <span className="more">›</span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontWeight: 400 }} className="f11 t2">
              <span className="flex aic g6"><i style={{ width: 14, height: 2, background: '#f5533b', display: 'inline-block' }} />现状地形</span>
              <span className="flex aic g6"><i style={{ width: 14, height: 2, background: '#e8f1ff', display: 'inline-block' }} />设计高程</span>
              <span className="flex aic g6"><i style={{ width: 10, height: 8, background: 'rgba(34,211,238,.5)', display: 'inline-block' }} />开挖范围</span>
            </span>
          </div>
          <div className="panel-body no-pad"><SectionView /></div>
        </div>
      </div>

      {/* 右侧控制 */}
      <div className="panel" style={{ width: 268, flex: 'none' }}>
        <div className="panel-body no-pad scroll">
          <Collapse title="设计文件导入">
            <div className="f11 t3 mb8">支持格式：DWG、DXF、TIN、SHP、CSV、TID、TXT</div>
            <UploadBox hint="" />
            <div className="file-item">
              <span className="fi-ok">✓</span>
              <span className="fi-name">航道设计图.dwg</span>
              <span className="fi-size">12.3 MB</span>
            </div>
          </Collapse>
          <Collapse title="设计参数设置">
            <div className="grid2" style={{ gap: 8 }}>
              <div className="form-row" style={{ marginBottom: 8 }}><label className="f11 t3">设计底高程 (m)</label>
                <select className="select" style={{ height: 26 }}><option>-12.50</option><option>-13.00</option><option>-14.00</option></select></div>
              <div className="form-row" style={{ marginBottom: 8 }}><label className="f11 t3">设计边坡</label>
                <select className="select" style={{ height: 26 }}><option>1:5</option><option>1:4</option><option>1:6</option></select></div>
              <div className="form-row" style={{ marginBottom: 8 }}><label className="f11 t3">超挖厚度 (m)</label>
                <select className="select" style={{ height: 26 }}><option>0.30</option><option>0.50</option></select></div>
              <div className="form-row" style={{ marginBottom: 8 }}><label className="f11 t3">开挖方式</label>
                <select className="select" style={{ height: 26 }}><option>疏浚开挖</option><option>爆破开挖</option></select></div>
            </div>
          </Collapse>
          <Collapse title="航段选择">
            <div className="grid2" style={{ gap: 8 }}>
              <div className="form-row" style={{ marginBottom: 8 }}><label className="f11 t3">航段起点</label>
                <select className="select" style={{ height: 26 }}><option>K1+000</option><option>K0+000</option></select></div>
              <div className="form-row" style={{ marginBottom: 8 }}><label className="f11 t3">航段终点</label>
                <select className="select" style={{ height: 26 }}><option>K2+000</option><option>K3+000</option></select></div>
            </div>
            <div className="flex g6" style={{ flexWrap: 'wrap' }}>
              {['K0+000 ~ K1+000', 'K1+000 ~ K2+000', 'K2+000 ~ K3+000'].map(s => (
                <button key={s} className={'btn btn-sm' + (seg === s ? ' btn-primary' : ' btn-ghost')} onClick={() => setSeg(s)}>{s}</button>
              ))}
            </div>
          </Collapse>
          <Collapse title="计算">
            <button className="btn btn-primary" style={{ width: '100%', height: 34 }} disabled={stage === 'running'} onClick={start}>
              <IconPlay size={14} /> {stage === 'running' ? '正在计算…' : '开始计算'}
            </button>
            {stage === 'running' && (
              <div className="progress-line mt8">
                <span style={{ width: 60 }}>计算中</span>
                <div className="progress"><i style={{ width: progress + '%' }} /></div>
                <span className="pct">{progress}%</span>
              </div>
            )}
            {stage === 'done' && (
              <>
                <div className="f12 mt8" style={{ color: 'var(--green)' }}>✓ 计算完成（{seg}）</div>
                <div className="grid2 mt8" style={{ gap: 6 }}>
                  {[['挖方量', earthworkSummary.dig + ' 万m³'], ['填方量', earthworkSummary.fill + ' 万m³'],
                    ['净方量', earthworkSummary.net + ' 万m³'], ['计算面积', earthworkSummary.area + ' km²'],
                    ['最大挖深', earthworkSummary.maxDig + ' m'], ['最大填高', earthworkSummary.maxFill + ' m']].map(([l, v]) => (
                    <div key={l} style={{ background: 'var(--bg-input)', borderRadius: 6, padding: '6px 8px' }}>
                      <div className="f11 t3">{l}</div><div className="f12 bold mt8" style={{ marginTop: 2 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <table className="tbl mt8">
                  <thead><tr><th>土层类型</th><th>方量 (万m³)</th><th>占比</th></tr></thead>
                  <tbody>
                    {earthworkResult.map(r => (
                      <tr key={r.type}><td className="cell-main">{r.type}</td><td>{r.volume.toFixed(2)}</td><td>{r.ratio}</td></tr>
                    ))}
                    <tr><td className="cell-main bold">合计</td><td className="bold cell-main">297.57</td><td className="bold cell-main">100%</td></tr>
                  </tbody>
                </table>
                <button className="btn btn-ghost mt8" style={{ width: '100%' }}><IconDownload size={13} /> 导出结果</button>
              </>
            )}
          </Collapse>
        </div>
      </div>
    </div>
  )
}
