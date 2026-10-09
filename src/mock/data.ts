/* ============ Mock 数据（全部为演示数据） ============ */

export interface Stratum {
  id: number
  name: string
  color: string
  avgThickness: number
  minThickness: number
  maxThickness: number
  volume: number
  ratio: number
}

export const strata: Stratum[] = [
  { id: 1, name: '淤泥', color: '#8a7a5a', avgThickness: 2.85, minThickness: 0.3, maxThickness: 12.6, volume: 35642180, ratio: 2.84 },
  { id: 2, name: '淤泥质黏土', color: '#6e8b5e', avgThickness: 6.2, minThickness: 1.2, maxThickness: 18.9, volume: 102456320, ratio: 8.16 },
  { id: 3, name: '软塑黏土', color: '#4f9e94', avgThickness: 8.7, minThickness: 2.1, maxThickness: 21.3, volume: 178325410, ratio: 14.21 },
  { id: 4, name: '中密砂', color: '#d9a648', avgThickness: 7.6, minThickness: 0.8, maxThickness: 16.4, volume: 156803210, ratio: 12.47 },
  { id: 5, name: '密实砂砾', color: '#c9732e', avgThickness: 9.8, minThickness: 1.5, maxThickness: 22.7, volume: 243568430, ratio: 19.37 },
  { id: 6, name: '强风化花岗岩', color: '#b8524a', avgThickness: 6.5, minThickness: 0.4, maxThickness: 15.2, volume: 132584560, ratio: 10.54 },
  { id: 7, name: '中风化花岗岩', color: '#8e4f9e', avgThickness: 4.0, minThickness: 0.5, maxThickness: 11.3, volume: 95246450, ratio: 7.57 },
  { id: 8, name: '微风化花岗岩', color: '#4a6fb5', avgThickness: 0, minThickness: 0, maxThickness: 0, volume: 310715620, ratio: 24.84 },
]

export interface Borehole {
  id: string
  x: number
  y: number
  elevation: number
  depth: number
  status: '已审核' | '待审核'
  type: string
  model: string
  method: string
  startDate: string
  endDate: string
  layers: { top: number; bottom: number; name: string; code: string; desc: string; cls: string }[]
}

const defaultLayers = [
  { top: 0.0, bottom: 2.8, name: '淤泥', code: 'S1', desc: '灰黑色，流塑', cls: '软土' },
  { top: 2.8, bottom: 9.0, name: '淤泥质黏土', code: 'S2-S3', desc: '灰色，流塑-软塑', cls: '软土' },
  { top: 9.0, bottom: 17.7, name: '软塑黏土', code: 'S4-S6', desc: '灰黄色，软塑', cls: '软土' },
  { top: 17.7, bottom: 25.3, name: '中密砂', code: 'S7-S8', desc: '灰黄色，中密', cls: '砂土' },
  { top: 25.3, bottom: 35.1, name: '密实砂砾', code: 'S9-S11', desc: '棕黄色，密实', cls: '砂砾石' },
  { top: 35.1, bottom: 41.6, name: '强风化花岗岩', code: 'S12-S13', desc: '棕红色，强风化', cls: '岩石' },
  { top: 41.6, bottom: 45.6, name: '中风化花岗岩', code: 'S14', desc: '灰白色，中风化', cls: '岩石' },
]

export const boreholes: Borehole[] = [
  { id: 'ZK250512-01', x: 464896.31, y: 2513305.99, elevation: 2.85, depth: 45.6, status: '已审核', type: '勘察孔', model: 'XY-3', method: '回转钻进', startDate: '2025-05-12', endDate: '2025-05-14', layers: defaultLayers },
  { id: 'ZK250512-02', x: 465123.45, y: 2513412.18, elevation: 2.76, depth: 38.5, status: '已审核', type: '勘察孔', model: 'XY-3', method: '回转钻进', startDate: '2025-05-12', endDate: '2025-05-13', layers: defaultLayers.slice(0, 6) },
  { id: 'ZK250512-03', x: 465340.22, y: 2513589.04, elevation: 2.68, depth: 42.3, status: '已审核', type: '勘察孔', model: 'XY-3', method: '回转钻进', startDate: '2025-05-11', endDate: '2025-05-13', layers: defaultLayers },
  { id: 'ZK250512-05', x: 465567.3, y: 2513896.52, elevation: 2.91, depth: 35.8, status: '已审核', type: '勘察孔', model: 'XY-2', method: '回转钻进', startDate: '2025-05-10', endDate: '2025-05-12', layers: defaultLayers.slice(0, 5) },
  { id: 'ZK250512-06', x: 465912.34, y: 2514012.22, elevation: 2.65, depth: 28.0, status: '已审核', type: '勘察孔', model: 'XY-2', method: '冲击钻进', startDate: '2025-05-10', endDate: '2025-05-11', layers: defaultLayers.slice(0, 5) },
  { id: 'ZK250512-07', x: 466045.77, y: 2514123.85, elevation: 2.58, depth: 37.6, status: '待审核', type: '勘察孔', model: 'XY-3', method: '回转钻进', startDate: '2025-05-09', endDate: '2025-05-11', layers: defaultLayers.slice(0, 6) },
  { id: 'ZK250512-08', x: 466178.9, y: 2514267.31, elevation: 2.79, depth: 41.2, status: '已审核', type: '勘察孔', model: 'XY-3', method: '回转钻进', startDate: '2025-05-09', endDate: '2025-05-11', layers: defaultLayers },
  { id: 'ZK250512-09', x: 466298.12, y: 2514388.56, elevation: 2.62, depth: 31.5, status: '待审核', type: '勘察孔', model: 'XY-2', method: '冲击钻进', startDate: '2025-05-08', endDate: '2025-05-10', layers: defaultLayers.slice(0, 5) },
  { id: 'ZK250512-10', x: 466421.33, y: 2514510.74, elevation: 2.71, depth: 46.0, status: '已审核', type: '勘察孔', model: 'XY-3', method: '回转钻进', startDate: '2025-05-08', endDate: '2025-05-10', layers: defaultLayers },
]

export interface DataFile {
  id: number
  name: string
  kind: '文件夹' | 'PDF文件' | '影像文件' | '其他文件'
  project: string
  source: string
  time: string
  size: string
  status?: '已识别' | '已发布' | '待识别'
}

export const dataFiles: DataFile[] = [
  { id: 1, name: '南沙港区地质勘察资料', kind: '文件夹', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-12 10:30', size: '-' },
  { id: 2, name: '虎门港区工程地质资料', kind: '文件夹', project: '虎门港区码头扩建工程', source: '虎门项目部上传', time: '2025-05-10 15:20', size: '-' },
  { id: 3, name: '历史勘察资料归档', kind: '文件夹', project: '历史项目', source: '内部上传', time: '2025-05-08 09:15', size: '-' },
  { id: 4, name: 'AI识别结果资料', kind: '文件夹', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-11 11:45', size: '-' },
  { id: 5, name: 'ZK101-ZK120_勘察报告.pdf', kind: 'PDF文件', project: '广州港南沙港区航道治理工程', source: '广州港项目上传', time: '2025-05-12 10:30', size: '45.6 MB', status: '已识别' },
  { id: 6, name: 'ZK121-ZK150_勘察报告.pdf', kind: 'PDF文件', project: '广州港南沙港区航道治理工程', source: '广州港项目上传', time: '2025-05-12 10:25', size: '48.2 MB', status: '已识别' },
  { id: 7, name: '土工试验报告_202505.pdf', kind: 'PDF文件', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-11 16:20', size: '12.8 MB', status: '已识别' },
  { id: 8, name: '原位测试报告_202505.pdf', kind: 'PDF文件', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-11 16:15', size: '18.7 MB', status: '已识别' },
  { id: 9, name: 'DEM_南沙港区_0.5m.tif', kind: '影像文件', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-10 14:30', size: '2.34 GB', status: '已发布' },
  { id: 10, name: '影像_南沙港区_202504.tif', kind: '影像文件', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-10 14:25', size: '1.12 GB', status: '已发布' },
  { id: 11, name: '工程范围.shp', kind: '其他文件', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-10 11:20', size: '2.45 MB', status: '已发布' },
  { id: 12, name: '钻孔点位.shp', kind: '其他文件', project: '广州港南沙港区航道治理工程', source: '内部上传', time: '2025-05-10 11:15', size: '1.32 MB', status: '已发布' },
]

export interface Report {
  id: number
  name: string
  code: string
  time: string
  type: string
  version: string
}

export const reports: Report[] = [
  { id: 1, name: '南沙港区航道治理工程地质成果报告.docx', code: 'RPT-20250512-001', time: '2025-05-12 14:30', type: '地质建模+土方计算报告', version: '正式版' },
  { id: 2, name: '虎门港区工程地质分析报告.docx', code: 'RPT-20250512-003', time: '2025-05-10 11:20', type: '工程地质分析报告', version: '正式版' },
  { id: 3, name: '南沙港区土方量计算报告（方案比选）.docx', code: 'RPT-20250509-002', time: '2025-05-09 16:45', type: '土方计算专项报告', version: '正式版' },
  { id: 4, name: '历史勘察资料综合分析简报.docx', code: 'RPT-20250508-004', time: '2025-05-08 09:15', type: '地质资料分析报告', version: '正式版' },
  { id: 5, name: '南沙港区区域地层对比报告.docx', code: 'RPT-20250507-005', time: '2025-05-07 10:10', type: '区域地层对比报告', version: '正式版' },
]

export const earthworkResult = [
  { type: '淤泥', volume: 125.36, ratio: '42.1%' },
  { type: '普通土方', volume: 98.72, ratio: '33.2%' },
  { type: '砂卵石', volume: 45.18, ratio: '15.2%' },
  { type: '强中风化岩', volume: 28.31, ratio: '9.5%' },
]

export const earthworkSummary = {
  dig: 297.57, fill: 12.45, net: 285.12, area: 48.12, maxDig: 16.8, maxFill: 2.3,
}

export const projectFeed = [
  { status: '进行中', color: '#2e6fff', title: '广州港南沙港区航道治理工程', sub: '土方计算完成', time: '10:30' },
  { status: '已完工', color: '#2fce85', title: '虎门港区吹填工程项目', sub: '三维地层模型更新', time: '09:45' },
  { status: '进行中', color: '#2e6fff', title: '新加坡樟宜航道疏浚工程', sub: '钻孔数据入库', time: '09:20' },
  { status: '进行中', color: '#2e6fff', title: '阿布扎比港口扩建项目', sub: '成果报告生成', time: '08:55' },
  { status: '已完工', color: '#2fce85', title: '上海洋山港航道治理工程', sub: '土方计算完成', time: '08:30' },
]

export const projectTypes = [
  { name: '航道治理', value: 48, color: '#2e6fff' },
  { name: '吹填工程', value: 18, color: '#22d3ee' },
  { name: '吹疏工程', value: 15, color: '#2fce85' },
  { name: '港湾建设', value: 15, color: '#f5a623' },
  { name: '围堰工程', value: 8, color: '#8e4f9e' },
  { name: '其他工程', value: 5, color: '#5b7295' },
]

export const worldProjects = [
  { name: '广州港南沙港区航道治理工程', lon: 113.6, lat: 22.8, color: '#2e6fff' },
  { name: '虎门港区吹填工程项目', lon: 113.7, lat: 22.8, color: '#2fce85' },
  { name: '新加坡樟宜航道疏浚工程', lon: 103.9, lat: 1.35, color: '#2e6fff' },
  { name: '阿布扎比港口扩建项目', lon: 54.4, lat: 24.45, color: '#2e6fff' },
  { name: '上海洋山港航道治理工程', lon: 121.9, lat: 30.7, color: '#2fce85' },
  { name: '马来西亚巴生港疏浚工程', lon: 101.4, lat: 3.0, color: '#2e6fff' },
  { name: '鹿特丹港航道维护工程', lon: 4.5, lat: 51.9, color: '#2e6fff' },
  { name: '巴西桑托斯港疏浚工程', lon: -46.3, lat: -23.9, color: '#8ba3c7' },
]


export const countryRank = [
  { name: '中国', value: 56 },
  { name: '新加坡', value: 18 },
  { name: '阿联酋', value: 12 },
  { name: '马来西亚', value: 8 },
  { name: '沙特阿拉伯', value: 6 },
  { name: '其他国家', value: 26 },
]

export const monthlyTrend = [820, 1320, 2380, 1650, 2280, 3120, 2450, 2780, 3560, 2680, 1980, 2350]

export const layerVolumeLegend = strata.map(s => ({ name: s.name, color: s.color, value: s.volume, ratio: s.ratio }))
