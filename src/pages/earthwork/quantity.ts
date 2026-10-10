import { strata } from '../../mock/data'
import { ModelVersion } from '../model/modelStore'
import { thickness } from '../model/StrataViewer'
export interface SurveyPoint { x: number; y: number; z: number }
export interface SurfaceData { name: string; points: SurveyPoint[] }
export interface Bounds { minX: number; maxX: number; minY: number; maxY: number }
export type ChannelZone = 'bottom' | 'leftSlope' | 'rightSlope' | 'outside'
export interface ChannelDesign {
  elevation: number
  overdepth: number
  bottomWidth: number
  slope: number
  centerX: number
  startStation: number
  endStation: number
}
export interface Cell extends SurveyPoint { design: number; cut: number; fill: number; layers: number[]; zone: ChannelZone }
export interface QuantityResult {
  cells: Cell[]; columns: number; rows: number; bounds: Bounds; sourceBounds: Bounds
  dx: number; dy: number; area: number; cut: number; fill: number; layers: number[]; unclassified: number
  zones: Record<Exclude<ChannelZone, 'outside'>, number>
  layerZones: Record<Exclude<ChannelZone, 'outside'>, number[]>
}
export function parseSurvey(text: string): SurveyPoint[] {
  const lines = text.replace(/^\uFEFF/, '').trim().split(/\r?\n/).filter(line => line.trim())
  const split = (s: string) => s.trim().split(/[,;\t ]+/)
  const header = split(lines[0] || '').map(v => v.toLowerCase())
  const hasDepth = header[2] === 'depth'
  if (header.length !== 3 || header[0] !== 'x' || header[1] !== 'y' || !['z', 'depth'].includes(header[2])) throw new Error('表头应为 x,y,z 或 x,y,depth；坐标和高程单位为米')
  if (lines.length < 5 || lines.length > 2001) throw new Error('请提供 4～2000 个测点')
  const seen = new Set<string>()
  const points = lines.slice(1).map((line, index) => {
    const values = split(line)
    if (values.length !== 3 || values.some(v => !v || !Number.isFinite(Number(v)))) throw new Error(`第 ${index + 2} 行不是有效的三列数值`)
    const [x, y, value] = values.map(Number)
    if (hasDepth && value < 0) throw new Error(`第 ${index + 2} 行水深应为非负数；高程请使用 z 列`)
    const key = `${x},${y}`
    if (seen.has(key)) throw new Error(`第 ${index + 2} 行坐标重复`)
    seen.add(key)
    return { x, y, z: hasDepth ? -value : value }
  })
  const b = boundsOf(points)
  if (b.maxX <= b.minX || b.maxY <= b.minY) throw new Error('测点必须覆盖二维区域，不能位于同一条水平或垂直线上')
  const a = points[0], q = points[1]
  if (points.every(p => Math.abs((q.x - a.x) * (p.y - a.y) - (q.y - a.y) * (p.x - a.x)) < 1e-8)) throw new Error('测点不能全部共线')
  return points
}
export function boundsOf(points: SurveyPoint[]): Bounds { return { minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)) } }
export function interpolate(points: SurveyPoint[], x: number, y: number) {
  let sum = 0, weight = 0
  for (const p of points) { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < 1e-12) return p.z; const w = 1 / d; sum += p.z * w; weight += w }
  return sum / weight
}
export function modelBounds(v: ModelVersion): Bounds { const w = v.config.range === 'custom' ? v.config.width : 130, h = v.config.range === 'custom' ? v.config.depth : 86; return { minX: -w / 2, maxX: w / 2, minY: -h / 2, maxY: h / 2 } }
export function commonBounds(model?: ModelVersion, survey?: SurfaceData, design?: SurfaceData): Bounds {
  const domains = [model && modelBounds(model), survey && boundsOf(survey.points), design && boundsOf(design.points)].filter(Boolean) as Bounds[]
  if (!domains.length) throw new Error('请导入现状水深数据，或选择地层模型')
  const bounds = { minX: Math.max(...domains.map(b => b.minX)), maxX: Math.min(...domains.map(b => b.maxX)), minY: Math.max(...domains.map(b => b.minY)), maxY: Math.min(...domains.map(b => b.maxY)) }
  if (bounds.maxX <= bounds.minX || bounds.maxY <= bounds.minY) throw new Error('模型、现状和设计数据无重叠范围，请检查坐标和单位')
  return bounds
}
export function formatStation(distance: number) {
  const value = Math.max(0, Math.round(distance))
  return `K${Math.floor(value / 1000)}+${String(value % 1000).padStart(3, '0')}`
}
export function stationValues(length: number, interval = 10) {
  const end = Math.max(1, Math.round(length))
  const values = Array.from({ length: Math.floor(end / interval) + 1 }, (_, index) => index * interval).filter(value => value < end)
  return [...values, end]
}
export function channelTarget(existing: number, x: number, design: ChannelDesign) {
  const offset = x - design.centerX
  const halfBottom = design.bottomWidth / 2
  const bottom = design.elevation - design.overdepth
  const zone: ChannelZone = Math.abs(offset) <= halfBottom ? 'bottom' : offset < 0 ? 'leftSlope' : 'rightSlope'
  const slopeElevation = bottom + Math.max(0, Math.abs(offset) - halfBottom) / design.slope
  // The sloping surface stops where it meets the existing terrain, avoiding artificial fill outside the channel.
  return { target: Math.min(existing, slopeElevation), zone }
}
export function calculateQuantity({ model, survey, design, channel, grid }: { model?: ModelVersion; survey?: SurfaceData; design?: SurfaceData; channel: ChannelDesign; grid: number }): QuantityResult {
  if (!model && !survey) throw new Error('请导入现状水深数据，或载入演示数据')
  if (![channel.elevation, channel.overdepth, channel.bottomWidth, channel.slope, channel.centerX, channel.startStation, channel.endStation, grid].every(Number.isFinite)) throw new Error('设计参数必须为有效数值')
  if (channel.overdepth < 0 || channel.overdepth > 5 || channel.bottomWidth <= 0 || channel.slope <= 0 || channel.slope > 20 || grid < 1 || grid > 50) throw new Error('超挖应为 0～5 m，底宽大于 0 m，坡比为 1:0.1～1:20，网格为 1～50 m')
  const sourceBounds = commonBounds(model, survey, design)
  const length = sourceBounds.maxY - sourceBounds.minY
  if (channel.startStation < 0 || channel.endStation > length + 1e-6 || channel.startStation >= channel.endStation) throw new Error('请选择有效的起止桩号范围')
  const bounds = { ...sourceBounds, minY: sourceBounds.minY + channel.startStation, maxY: sourceBounds.minY + channel.endStation }
  const columns = Math.ceil((bounds.maxX - bounds.minX) / grid), rows = Math.ceil((bounds.maxY - bounds.minY) / grid)
  if (columns * rows > 12000) throw new Error('计算网格超过 12000 个，请增大网格间距')
  const dx = (bounds.maxX - bounds.minX) / columns, dy = (bounds.maxY - bounds.minY) / rows, cellArea = dx * dy
  const cells: Cell[] = [], layers = strata.map(() => 0)
  const zones = { bottom: 0, leftSlope: 0, rightSlope: 0 }
  const layerZones = { bottom: strata.map(() => 0), leftSlope: strata.map(() => 0), rightSlope: strata.map(() => 0) }
  let cut = 0, fill = 0, unclassified = 0
  for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) {
    const x = bounds.minX + (i + 0.5) * dx, y = bounds.minY + (j + 0.5) * dy
    const z = survey ? interpolate(survey.points, x, y) : 0
    // Imported design data provides a longitudinal reference elevation; editable channel parameters still define the section.
    const baseElevation = design ? interpolate(design.points, channel.centerX, y) : channel.elevation
    const shaped = channelTarget(z, x, { ...channel, elevation: baseElevation })
    const target = shaped.target
    const difference = Math.abs(z - target) < 1e-9 ? 0 : z - target
    const depth = Math.max(0, difference), raise = Math.max(0, -difference)
    const layerDepths: number[] = []
    let top = 0, classified = 0
    strata.forEach((_, k) => {
      const bottom = top - (model ? thickness(k, x, y, model) : 0)
      const overlap = model ? Math.min(depth, Math.max(0, Math.min(z, top) - Math.max(target, bottom))) : 0
      const volume = overlap * cellArea
      layerDepths.push(overlap); layers[k] += volume; layerZones[shaped.zone as keyof typeof layerZones][k] += volume; classified += overlap; top = bottom
    })
    const cutVolume = depth * cellArea
    cut += cutVolume; fill += raise * cellArea; unclassified += Math.max(0, depth - classified) * cellArea
    zones[shaped.zone as keyof typeof zones] += cutVolume
    cells.push({ x, y, z, design: target, cut: depth, fill: raise, layers: layerDepths, zone: shaped.zone })
  }
  return { cells, columns, rows, bounds, sourceBounds, dx, dy, area: cellArea * cells.length, cut, fill, layers, unclassified, zones, layerZones }
}
export function demoSurvey(): SurfaceData { return { name: '演示水深测点.csv', points: Array.from({ length: 99 }, (_, i) => { const x = -65 + (i % 11) * 13, y = -43 + Math.floor(i / 11) * 10.75; return { x, y, z: -8 - 4 * Math.exp(-x * x / 800) + Math.sin(y / 15) * 1.5 } }) } }
export function downloadText(name: string, text: string) { const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv;charset=utf-8' })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
