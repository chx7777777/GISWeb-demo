import { ModelConfig, modelingPlugins, interpolationPlugins } from './modelStore'

export default function ModelParameters({ config, onChange }: { config: ModelConfig; onChange: (config: ModelConfig) => void }) {
  const patch = (value: Partial<ModelConfig>) => onChange({ ...config, ...value })
  return <>
    <label className="form-row">建模方法<select className="select" value={config.method} onChange={e => patch({ method: e.target.value })}>{[...modelingPlugins.values()].map(p => <option key={p.id} value={p.id} disabled={!p.sources.includes(config.source)}>{p.name}</option>)}</select></label>
    <label className="form-row">插值方法<select className="select" value={config.interpolation} onChange={e => patch({ interpolation: e.target.value })}>{[...interpolationPlugins.values()].map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label className="form-row">模型范围<select className="select" value={config.range} onChange={e => patch({ range: e.target.value as ModelConfig['range'] })}><option value="full">完整演示范围（130 × 86 m）</option><option value="custom">自定义中心矩形范围</option></select></label>
    {config.range === 'custom' && <>{(['width', 'depth'] as const).map((key, i) => <label className="form-row" key={key}>{i === 0 ? '范围宽度' : '范围长度'}（m）<input className="input" type="number" min={10} max={500} value={Number.isNaN(config[key]) ? '' : config[key]} onChange={e => patch({ [key]: e.target.valueAsNumber })} /></label>)}</>}
    {(['grid', 'vertical'] as const).map((key, i) => <label className="form-row" key={key}>{i === 0 ? '水平网格间距' : '垂向采样间距'}（m）<input className="input" type="number" min={i === 0 ? 1 : 0.1} max={i === 0 ? 50 : 10} step={i === 0 ? 1 : 0.1} value={Number.isNaN(config[key]) ? '' : config[key]} onChange={e => patch({ [key]: e.target.valueAsNumber })} /></label>)}
    <label className="form-row">平滑系数 {config.smooth.toFixed(2)}<input type="range" min={0} max={1} step={0.05} value={config.smooth} onChange={e => patch({ smooth: Number(e.target.value) })} /></label>
    <div className="f11 t3" style={{ lineHeight: 1.7 }}>参数在重新建模后生效，生成新版本；保留历史版本。当前算法为演示适配器。</div>
  </>
}
