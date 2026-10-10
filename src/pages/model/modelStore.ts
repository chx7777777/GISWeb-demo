import { useSyncExternalStore } from 'react'
import { boreholes } from '../../mock/data'

export type SourceKind = 'boreholes' | 'section' | 'combined'
export interface ModelConfig {
  name: string; project: string; source: SourceKind; boreholeIds: string[]; sectionId: string
  method: string; interpolation: string; range: 'full' | 'custom'
  width: number; depth: number; grid: number; vertical: number; smooth: number
}
export interface DemoShape { amplitude: number; phase: number }
export interface ModelingPlugin {
  id: string; name: string; sources: SourceKind[]; build: (config: ModelConfig) => DemoShape
}
export interface InterpolationPlugin {
  id: string; name: string; interpolate: (value: number) => number
}
// 扩展点：注册插件即可出现在表单中。当前实现是形态演示，不是真实地质算法。
export const modelingPlugins = new Map<string, ModelingPlugin>()
export const interpolationPlugins = new Map<string, InterpolationPlugin>()
export function registerModelingPlugin(plugin: ModelingPlugin) { modelingPlugins.set(plugin.id, plugin) }
export function registerInterpolationPlugin(plugin: InterpolationPlugin) { interpolationPlugins.set(plugin.id, plugin) }
const phase = (c: ModelConfig) => [...c.boreholeIds.join(',') + c.sectionId].reduce((n, ch) => n + ch.charCodeAt(0), 0) % 97 / 10
registerModelingPlugin({ id: 'layer', name: '分层曲面建模', sources: ['boreholes', 'section', 'combined'], build: c => ({ amplitude: 1, phase: phase(c) }) })
registerModelingPlugin({ id: 'solid', name: '地层实体建模', sources: ['boreholes', 'section', 'combined'], build: c => ({ amplitude: 0.8, phase: phase(c) + 1 }) })
registerModelingPlugin({ id: 'joint', name: '钻孔与剖面联合约束', sources: ['combined'], build: c => ({ amplitude: 0.65, phase: phase(c) + 2 }) })
registerInterpolationPlugin({ id: 'kriging', name: '自适应克里金（演示）', interpolate: v => v * 0.8 })
registerInterpolationPlugin({ id: 'idw', name: '反距离加权 IDW（演示）', interpolate: v => Math.sign(v) * Math.pow(Math.abs(v), 1.2) })
registerInterpolationPlugin({ id: 'rbf', name: '径向基函数 RBF（演示）', interpolate: v => Math.sin(v) })
export const projects = [...new Set(boreholes.map(b => b.project))]
export const sections = projects.flatMap((project, i) => [1, 2].map(n => ({ id: `section-${i}-${n}`, project, name: `剖面 ${n}-${n}′（演示）` })))
export const defaultConfig: ModelConfig = { name: '南沙港区地层模型', project: projects[0], source: 'boreholes', boreholeIds: boreholes.filter(b => b.project === projects[0]).map(b => b.id), sectionId: '', method: 'layer', interpolation: 'kriging', range: 'full', width: 130, depth: 86, grid: 5, vertical: 0.5, smooth: 0.35 }
export function validateConfig(c: ModelConfig): string {
  if (!c.name.trim()) return '请输入模型名称'
  if (!projects.includes(c.project)) return '请选择所属项目'
  if (!modelingPlugins.get(c.method)?.sources.includes(c.source)) return '当前建模方法不支持此数据类型，请更换方法'
  if (!interpolationPlugins.has(c.interpolation)) return '请选择有效的插值方法'
  if (c.source !== 'section' && (!c.boreholeIds.length || c.boreholeIds.some(id => !boreholes.some(b => b.id === id && b.project === c.project)))) return '请至少选择一个本项目钻孔'
  if (c.source !== 'boreholes' && !sections.some(s => s.id === c.sectionId && s.project === c.project)) return '请选择本项目剖面'
  for (const [label, value, min, max] of [['范围宽度', c.width, 10, 500], ['范围长度', c.depth, 10, 500], ['水平网格间距', c.grid, 1, 50], ['垂向采样间距', c.vertical, 0.1, 10], ['平滑系数', c.smooth, 0, 1]] as const) {
    if (!Number.isFinite(value) || value < min || value > max) return `${label}应在 ${min}～${max} 之间`
  }
  return ''
}
export interface ModelVersion { id: string; number: number; createdAt: string; config: ModelConfig; shape: DemoShape }
export interface ModelRecord { id: string; draft: ModelConfig; versions: ModelVersion[] }
interface ModelState { records: ModelRecord[]; selectedModelId: string; selectedVersionId: string }
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value))
const firstVersion: ModelVersion = { id: 'initial-v1', number: 1, createdAt: '2025-05-12T06:30:00.000Z', config: copy(defaultConfig), shape: modelingPlugins.get('layer')!.build(defaultConfig) }
const initial: ModelState = { records: [{ id: 'initial', draft: copy(defaultConfig), versions: [firstVersion] }], selectedModelId: 'initial', selectedVersionId: firstVersion.id }
const storageKey = 'geoweb-models-v1'
function readState(): ModelState {
  try { const raw = localStorage.getItem(storageKey); if (raw) { const value = JSON.parse(raw) as ModelState; if (value.records?.length && value.records.every(r => r.draft && Array.isArray(r.versions))) return value } } catch { /* 使用默认演示模型 */ }
  return initial
}
let state = readState()
const listeners = new Set<() => void>()
function commit(next: ModelState) {
  // 写入失败时保留旧状态，由表单展示错误。
  localStorage.setItem(storageKey, JSON.stringify(next))
  state = next
  listeners.forEach(listener => listener())
}
export function useModels() { return useSyncExternalStore(listener => { listeners.add(listener); return () => listeners.delete(listener) }, () => state) }
export function saveModel(config: ModelConfig, id?: string, build = false) {
  const error = validateConfig(config)
  if (error) throw new Error(error)
  const old = state.records.find(r => r.id === id)
  const record: ModelRecord = old ? copy(old) : { id: crypto.randomUUID(), draft: copy(config), versions: [] }
  record.draft = copy({ ...config, name: config.name.trim(), boreholeIds: config.source === 'section' ? [] : config.boreholeIds, sectionId: config.source === 'boreholes' ? '' : config.sectionId })
  if (build) {
    record.versions.push({ id: crypto.randomUUID(), number: record.versions.length + 1, createdAt: new Date().toISOString(), config: copy(record.draft), shape: modelingPlugins.get(config.method)!.build(record.draft) })
  }
  commit({ ...state, records: old ? state.records.map(r => r.id === record.id ? record : r) : [record, ...state.records], ...(build ? { selectedModelId: record.id, selectedVersionId: record.versions[record.versions.length - 1].id } : {}) })
  return record.id
}
export function selectModel(modelId: string, versionId?: string) {
  const record = state.records.find(r => r.id === modelId)
  const version = record?.versions.find(v => v.id === versionId) || record?.versions[record.versions.length - 1]
  if (record && version) commit({ ...state, selectedModelId: record.id, selectedVersionId: version.id })
}
export function activeModel(value: ModelState) {
  const record = value.records.find(r => r.id === value.selectedModelId && r.versions.length) || value.records.find(r => r.versions.length)!
  const version = record.versions.find(v => v.id === value.selectedVersionId) || record.versions[record.versions.length - 1]
  return { record, version }
}
export const methodName = (id: string) => modelingPlugins.get(id)?.name || id
export const interpolationName = (id: string) => interpolationPlugins.get(id)?.name || id
export const sourceSummary = (c: ModelConfig) => c.source === 'section' ? `剖面：${sections.find(s => s.id === c.sectionId)?.name || c.sectionId}` : `${c.boreholeIds.length} 个钻孔${c.source === 'combined' ? ' + 1 个剖面' : ''}`
