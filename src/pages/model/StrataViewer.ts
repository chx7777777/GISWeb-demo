import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { ModelVersion, interpolationPlugins } from './modelStore'
import { strata, boreholes } from '../../mock/data'

export interface MeasurementPoint { x: number; y: number; z: number }

export interface SectionPoint { x: number; z: number }

export interface SectionLayerSample { topDepth: number; bottomDepth: number }
export interface SectionSample { distance: number; layers: SectionLayerSample[] }
export interface SectionBorehole { id: string; distance: number; depth: number }
export interface SectionProfile { length: number; samples: SectionSample[]; boreholes: SectionBorehole[]; maxDepth: number }

export interface ViewerHandle {
  setLayerVisible: (i: number, v: boolean) => void
  setLayerOpacity: (i: number, o: number) => void
  setExploded: (v: boolean) => void
  setTransparent: (v: boolean) => void
  setAutoRotate: (v: boolean) => void
  setSectionMode: (enabled: boolean, onPoint?: (point: SectionPoint) => void, onChange?: (points: SectionPoint[]) => void) => void
  setSectionLine: (start: SectionPoint | null, end: SectionPoint | null) => void
  setMeasurement: (active: boolean, editable: boolean, points: MeasurementPoint[], onChange?: (points: MeasurementPoint[]) => void) => void
  resetCamera: () => void
  dispose: () => void
}

export interface PickInfo { x: number; y: number; html: string }

/* 确定性噪声 —— 生成自然地层起伏 */
function noise(x: number, z: number, seed: number) {
  return (
    Math.sin(x * 0.055 + seed * 1.7) * Math.cos(z * 0.07 + seed) * 0.55 +
    Math.sin(x * 0.021 + seed * 3.1) * Math.sin(z * 0.033 + seed * 2.3) * 0.45
  )
}

const layerGap = 7
const holePositions: [number, number][] = [
  [-48, -26], [-30, 8], [-12, -18], [4, 12], [20, -8], [36, 20], [52, -22], [10, -32], [-38, 26],
]

function thickness(i: number, x: number, z: number, version?: ModelVersion) {
  const base = strata[i].avgThickness || 14
  if (version) {
    const value = noise(x, z, i * 7.3 + version.shape.phase)
    const interpolated = interpolationPlugins.get(version.config.interpolation)?.interpolate(value) ?? value
    const raw = base * (0.9 + 0.25 * interpolated * version.shape.amplitude * (1 - version.config.smooth))
    return Math.max(version.config.vertical, Math.round(raw / version.config.vertical) * version.config.vertical)
  }
  return base * (0.62 + 0.55 * (noise(x, z, i * 7.3) * 0.5 + 0.5))
}

/** 根据当前 Demo 实际生成地层所使用的厚度函数，计算剖切线上的地层截面。 */
export function calculateSectionProfile(start: SectionPoint, end: SectionPoint, sampleCount = 61, version?: ModelVersion): SectionProfile {
  const dx = end.x - start.x
  const dz = end.z - start.z
  const length = Math.hypot(dx, dz)
  const count = Math.max(2, sampleCount)
  const samples: SectionSample[] = []
  let maxDepth = 0

  for (let sampleIndex = 0; sampleIndex < count; sampleIndex++) {
    const t = sampleIndex / (count - 1)
    const x = start.x + dx * t
    const z = start.z + dz * t
    let depth = 0
    const layers: SectionLayerSample[] = []
    for (let layerIndex = 0; layerIndex < strata.length; layerIndex++) {
      const topDepth = depth
      depth += thickness(layerIndex, x, z, version)
      layers.push({ topDepth, bottomDepth: depth })
    }
    maxDepth = Math.max(maxDepth, depth)
    samples.push({ distance: length * t, layers })
  }

  const sectionBoreholes: SectionBorehole[] = []
  holePositions.forEach(([hx, hz], index) => {
    if (version && (version.config.source === 'section' || !version.config.boreholeIds.includes(boreholes[index % boreholes.length].id))) return
    const denominator = dx * dx + dz * dz || 1
    const t = Math.max(0, Math.min(1, ((hx - start.x) * dx + (hz - start.z) * dz) / denominator))
    const px = start.x + t * dx
    const pz = start.z + t * dz
    const distanceToLine = Math.hypot(hx - px, hz - pz)
    if (distanceToLine <= 9) {
      const hole = boreholes[index % boreholes.length]
      sectionBoreholes.push({ id: hole.id, distance: length * t, depth: Math.min(maxDepth, hole.depth * 1.35) })
    }
  })

  return { length, samples, boreholes: sectionBoreholes, maxDepth }
}

/* 构建某一层的封闭实体网格（顶面 + 底面 + 四周裙边） */
function buildLayerGeometry(i: number, version?: ModelVersion) {
  const W = version?.config.range === 'custom' ? version.config.width : 130
  const D = version?.config.range === 'custom' ? version.config.depth : 86
  const N = Math.min(160, Math.max(2, Math.ceil(W / (version?.config.grid || 3))))
  const M = Math.min(160, Math.max(2, Math.ceil(D / (version?.config.grid || 3))))
  const positions: number[] = []
  const idx: (gx: number, gz: number, bottom: boolean) => number =
    (gx, gz, bottom) => (bottom ? (N + 1) * (M + 1) : 0) + gz * (N + 1) + gx

  for (let b = 0; b < 2; b++) {
    for (let gz = 0; gz <= M; gz++) {
      for (let gx = 0; gx <= N; gx++) {
        const x = (gx / N - 0.5) * W
        const z = (gz / M - 0.5) * D
        let top = 0
        for (let k = 0; k < i; k++) top += thickness(k, x, z, version)
        const y = b === 0 ? -top : -(top + thickness(i, x, z, version))
        positions.push(x, y, z)
      }
    }
  }

  const indices: number[] = []
  // 顶面（朝上）
  for (let gz = 0; gz < M; gz++) for (let gx = 0; gx < N; gx++) {
    const a = idx(gx, gz, false), b = idx(gx + 1, gz, false), c = idx(gx, gz + 1, false), d = idx(gx + 1, gz + 1, false)
    indices.push(a, c, b, b, c, d)
  }
  // 底面（朝下）
  for (let gz = 0; gz < M; gz++) for (let gx = 0; gx < N; gx++) {
    const a = idx(gx, gz, true), b = idx(gx + 1, gz, true), c = idx(gx, gz + 1, true), d = idx(gx + 1, gz + 1, true)
    indices.push(a, b, c, b, d, c)
  }
  // 裙边
  const edge = (pts: [number, number][]) => {
    for (let e = 0; e < pts.length - 1; e++) {
      const [g1x, g1z] = pts[e], [g2x, g2z] = pts[e + 1]
      const t1 = idx(g1x, g1z, false), t2 = idx(g2x, g2z, false)
      const b1 = idx(g1x, g1z, true), b2 = idx(g2x, g2z, true)
      indices.push(t1, b1, t2, t2, b1, b2)
    }
  }
  edge(Array.from({ length: N + 1 }, (_, g) => [g, 0] as [number, number]))
  edge(Array.from({ length: N + 1 }, (_, g) => [g, M] as [number, number]))
  edge(Array.from({ length: M + 1 }, (_, g) => [0, g] as [number, number]))
  edge(Array.from({ length: M + 1 }, (_, g) => [N, g] as [number, number]))

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

function makeLabel(text: string) {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 56
  const ctx = c.getContext('2d')!
  ctx.fillStyle = 'rgba(8,20,38,0.85)'
  ctx.strokeStyle = '#3a6db5'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.roundRect(2, 2, 252, 52, 8); ctx.fill(); ctx.stroke()
  ctx.fillStyle = '#cfe0ff'; ctx.font = '22px Microsoft YaHei'
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(text, 128, 29)
  const tex = new THREE.CanvasTexture(c)
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }))
  sp.scale.set(20, 4.4, 1)
  return sp
}

export function createViewer(container: HTMLDivElement, onPick: (info: PickInfo | null) => void, version?: ModelVersion): ViewerHandle {
  const W = version?.config.range === 'custom' ? version.config.width : 130
  const D = version?.config.range === 'custom' ? version.config.depth : 86
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#060f1f')
  scene.fog = new THREE.Fog('#060f1f', 260, 520)

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 2000)
  const viewScale = Math.max(W / 130, D / 86, 0.65)
  const camPos = new THREE.Vector3(105, 85, 125).multiplyScalar(viewScale)
  camera.position.copy(camPos)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, -18, 0)
  controls.maxDistance = Math.max(420, 420 * viewScale)
  controls.autoRotateSpeed = 0.8

  scene.add(new THREE.AmbientLight('#8fb4e8', 0.75))
  const dir = new THREE.DirectionalLight('#ffffff', 1.5)
  dir.position.set(80, 140, 60)
  scene.add(dir)
  const dir2 = new THREE.DirectionalLight('#3a6db5', 0.5)
  dir2.position.set(-90, 40, -70)
  scene.add(dir2)

  // 底部网格基座
  const grid = new THREE.GridHelper(320, 40, '#1b3a66', '#122a4e')
  grid.position.y = -72
  scene.add(grid)
  const axes = new THREE.AxesHelper(36)
  axes.position.set(-W / 2 - 8, 0.5, D / 2 + 8)
  scene.add(axes)

  // 地层实体
  const layerMeshes: THREE.Mesh[] = []
  const layerMats: THREE.MeshStandardMaterial[] = []
  const group = new THREE.Group()
  for (let i = 0; i < strata.length; i++) {
    const mat = new THREE.MeshStandardMaterial({
      color: strata[i].color, roughness: 0.85, metalness: 0.05,
      side: THREE.DoubleSide, transparent: true, opacity: 1,
    })
    const mesh = new THREE.Mesh(buildLayerGeometry(i, version), mat)
    mesh.userData.layerIndex = i
    layerMeshes.push(mesh); layerMats.push(mat)
    group.add(mesh)
  }
  scene.add(group)

  // 屏幕 SVG 覆盖层：固定像素大小，不参与模型深度测试。
  const sectionPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  let measurementActive = false
  let measurementEditable = false
  let measurementPoints: MeasurementPoint[] = []
  let onMeasurementChange: ((points: MeasurementPoint[]) => void) | undefined
  let sectionMode = false
  let onSectionPoint: ((point: SectionPoint) => void) | undefined
  let onSectionChange: ((points: SectionPoint[]) => void) | undefined
  let sectionPoints: SectionPoint[] = []
  const ns = 'http://www.w3.org/2000/svg'
  const overlay = document.createElementNS(ns, 'svg')
  overlay.setAttribute('aria-label', '可拖动的剖切线与 A、B 端点')
  Object.assign(overlay.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', zIndex: '20', pointerEvents: 'none', touchAction: 'none' })
  container.appendChild(overlay)
  const line = document.createElementNS(ns, 'line')
  line.setAttribute('stroke', '#ffcf5a')
  line.setAttribute('stroke-width', '3')
  const hitLine = document.createElementNS(ns, 'line')
  hitLine.setAttribute('stroke', 'transparent')
  hitLine.setAttribute('stroke-width', '20')
  overlay.append(line, hitLine)
  const markers = ['A', 'B'].map((label, i) => {
    const g = document.createElementNS(ns, 'g')
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('r', '13')
    circle.setAttribute('fill', i === 0 ? '#059669' : '#e11d48')
    circle.setAttribute('stroke', '#fff')
    circle.setAttribute('stroke-width', '2')
    const text = document.createElementNS(ns, 'text')
    text.textContent = label
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('dy', '4')
    text.setAttribute('fill', '#fff')
    text.setAttribute('font-size', '12')
    text.setAttribute('font-weight', '700')
    g.append(circle, text)
    overlay.appendChild(g)
    return g
  })
  const distanceLabel = document.createElementNS(ns, 'text')
  distanceLabel.setAttribute('text-anchor', 'middle')
  distanceLabel.setAttribute('fill', '#67e8f9')
  distanceLabel.setAttribute('stroke', '#071426')
  distanceLabel.setAttribute('stroke-width', '5')
  distanceLabel.setAttribute('paint-order', 'stroke')
  distanceLabel.setAttribute('font-size', '14')
  distanceLabel.setAttribute('font-weight', '700')
  overlay.appendChild(distanceLabel)
  const project = (p: SectionPoint & { y?: number }) => {
    const v = new THREE.Vector3(p.x, p.y ?? 0, p.z).project(camera)
    return { x: (v.x + 1) * container.clientWidth / 2, y: (1 - v.y) * container.clientHeight / 2, visible: v.z >= -1 && v.z <= 1 }
  }
  const updateOverlay = () => {
    const points = (measurementActive ? measurementPoints : sectionPoints).map(project)
    overlay.setAttribute('aria-label', measurementActive ? '测量线与 A、B 端点' : '可拖动的剖切线与 A、B 端点')
    line.setAttribute('stroke', measurementActive ? '#67e8f9' : '#ffcf5a')
    distanceLabel.style.display = measurementActive && points.length === 2 && points.every(p => p.visible) ? '' : 'none'
    if (measurementActive && points.length === 2) {
      const [a, b] = measurementPoints
      distanceLabel.textContent = `${Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z).toFixed(2)} m`
      distanceLabel.setAttribute('x', String((points[0].x + points[1].x) / 2))
      distanceLabel.setAttribute('y', String((points[0].y + points[1].y) / 2 - 14))
    }
    markers.forEach((marker, i) => {
      const p = points[i]
      marker.style.display = p?.visible ? '' : 'none'
      if (p) marker.setAttribute('transform', `translate(${p.x},${p.y})`)
      marker.style.pointerEvents = (measurementActive ? measurementEditable : sectionMode) ? 'all' : 'none'
      marker.style.cursor = 'move'
    })
    for (const el of [line, hitLine]) {
      el.style.display = points.length === 2 && points.every(p => p.visible) ? '' : 'none'
      if (points.length === 2) {
        el.setAttribute('x1', String(points[0].x)); el.setAttribute('y1', String(points[0].y))
        el.setAttribute('x2', String(points[1].x)); el.setAttribute('y2', String(points[1].y))
      }
    }
    hitLine.style.pointerEvents = sectionMode && !measurementActive ? 'stroke' : 'none'
    hitLine.style.cursor = 'move'
  }
  let drag: { index: number; x: number; y: number; points: SectionPoint[] } | null = null
  const startDrag = (e: PointerEvent, index: number) => {
    if (!(measurementActive ? measurementEditable && index >= 0 : sectionMode) || e.button !== 0) return
    e.preventDefault(); e.stopPropagation()
    drag = { index, x: e.clientX, y: e.clientY, points: sectionPoints.map(p => ({ ...p })) }
    controls.enabled = false
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
  }
  markers.forEach((marker, i) => marker.addEventListener('pointerdown', e => startDrag(e, i)))
  hitLine.addEventListener('pointerdown', e => startDrag(e, -1))
  overlay.addEventListener('pointermove', e => {
    if (!drag) return
    if (measurementActive) {
      const point = pickSurface(e.clientX, e.clientY)
      if (point) {
        measurementPoints = measurementPoints.map((p, i) => i === drag!.index ? point : p)
        onMeasurementChange?.(measurementPoints)
        updateOverlay()
      }
      return
    }
    // 屏幕投影的阻尼逆解：接近侧视时仍保持稳定，避免水平面拾取跳变。
    const anchor = drag.points[drag.index < 0 ? 0 : drag.index]
    const p = project(anchor), px = project({ x: anchor.x + 1, z: anchor.z }), pz = project({ x: anchor.x, z: anchor.z + 1 })
    const ax = px.x - p.x, ay = px.y - p.y, bx = pz.x - p.x, by = pz.y - p.y
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y
    const aa = ax * ax + ay * ay + 0.05, bb = bx * bx + by * by + 0.05, ab = ax * bx + ay * by
    const u = ax * dx + ay * dy, v = bx * dx + by * dy, det = aa * bb - ab * ab
    let x = (bb * u - ab * v) / det, z = (aa * v - ab * u) / det
    const affected = drag.index < 0 ? drag.points : [anchor]
    x = THREE.MathUtils.clamp(x, Math.max(...affected.map(p => -W / 2 - p.x)), Math.min(...affected.map(p => W / 2 - p.x)))
    z = THREE.MathUtils.clamp(z, Math.max(...affected.map(p => -D / 2 - p.z)), Math.min(...affected.map(p => D / 2 - p.z)))
    sectionPoints = drag.points.map((p, i) => drag!.index < 0 || i === drag!.index ? { x: p.x + x, z: p.z + z } : { ...p })
    onSectionChange?.(sectionPoints)
    updateOverlay()
  })
  const endDrag = () => { drag = null; controls.enabled = true }
  overlay.addEventListener('pointerup', endDrag)
  overlay.addEventListener('pointercancel', endDrag)
  overlay.addEventListener('lostpointercapture', endDrag)

  // 钻孔
  const holeGroup = new THREE.Group()
  const holeMeshes: THREE.Mesh[] = []
  holePositions.forEach(([hx, hz], i) => {
    const b = boreholes[i % boreholes.length]
    if (Math.abs(hx) > W / 2 || Math.abs(hz) > D / 2) return
    if (version && (version.config.source === 'section' || !version.config.boreholeIds.includes(b.id))) return
    let top = 0
    for (let k = 0; k < strata.length; k++) top += thickness(k, hx, hz, version)
    const depth = Math.min(top, b.depth * 1.35)
    const geo = new THREE.CylinderGeometry(0.9, 0.9, depth + 6, 10)
    const mat = new THREE.MeshStandardMaterial({ color: '#e8ecf2', roughness: 0.4, emissive: '#223044' })
    const cyl = new THREE.Mesh(geo, mat)
    cyl.position.set(hx, 3 - depth / 2, hz)
    cyl.userData.borehole = b
    holeMeshes.push(cyl)
    holeGroup.add(cyl)
    const label = makeLabel(b.id)
    label.position.set(hx, 8.5, hz)
    holeGroup.add(label)
  })
  scene.add(holeGroup)

  /* 拾取 */
  const ray = new THREE.Raycaster()
  const pickSurface = (clientX: number, clientY: number): MeasurementPoint | null => {
    const rect = renderer.domElement.getBoundingClientRect()
    ray.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), camera)
    group.updateMatrixWorld(true)
    const hit = ray.intersectObjects(layerMeshes.filter((mesh, i) => mesh.visible && layerMats[i].opacity > 0), false)[0]
    return hit ? { x: hit.point.x, y: hit.point.y, z: hit.point.z } : null
  }
  let pointerStart = { x: 0, y: 0 }
  const onPointerDown = (e: PointerEvent) => { pointerStart = { x: e.clientX, y: e.clientY } }
  renderer.domElement.addEventListener('pointerdown', onPointerDown)
  const onClick = (e: MouseEvent) => {
    if (Math.hypot(e.clientX - pointerStart.x, e.clientY - pointerStart.y) > 5) return
    const rect = renderer.domElement.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
    ray.setFromCamera(new THREE.Vector2(mx, my), camera)
    if (measurementActive) {
      if (measurementEditable && measurementPoints.length < 2) {
        const point = pickSurface(e.clientX, e.clientY)
        if (point) {
          measurementPoints = [...measurementPoints, point]
          onMeasurementChange?.(measurementPoints)
          updateOverlay()
        }
      }
      return
    }
    if (sectionMode) {
      if (sectionPoints.length >= 2) return
      const point = new THREE.Vector3()
      if (ray.ray.intersectPlane(sectionPlane, point)) {
        const x = THREE.MathUtils.clamp(point.x, -W / 2, W / 2)
        const z = THREE.MathUtils.clamp(point.z, -D / 2, D / 2)
        onSectionPoint?.({ x, z })
      }
      return
    }
    const hits = ray.intersectObjects(holeMeshes)
    if (hits.length) {
      const b = hits[0].object.userData.borehole
      onPick({
        x: e.clientX - rect.left, y: e.clientY - rect.top,
        html: `<b>钻孔编号：${b.id}</b><br/>孔深：${b.depth.toFixed(1)} m<br/>孔口高程：${b.elevation.toFixed(2)} m<br/>地层数量：${b.layers.length} 层`,
      })
    } else onPick(null)
  }
  renderer.domElement.addEventListener('click', onClick)

  /* 尺寸自适应 */
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight
    if (!w || !h) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  let raf = 0
  const loop = () => {
    raf = requestAnimationFrame(loop)
    controls.update()
    renderer.render(scene, camera)
    updateOverlay()
  }
  loop()

  let exploded = false
  const applyExplode = () => {
    layerMeshes.forEach((m, i) => { m.position.y = exploded ? -i * layerGap : 0 })
  }

  return {
    setLayerVisible: (i, v) => { layerMeshes[i].visible = v },
    setLayerOpacity: (i, o) => { layerMats[i].opacity = o; layerMats[i].transparent = o < 1 },
    setExploded: v => { exploded = v; applyExplode() },
    setTransparent: v => { layerMats.forEach(m => { m.opacity = v ? 0.45 : 1; m.transparent = true }) },
    setAutoRotate: v => { controls.autoRotate = v },
    setSectionMode: (enabled, callback, onChange) => {
      sectionMode = enabled
      onSectionPoint = callback
      onSectionChange = onChange
      controls.enabled = true
      if (enabled) controls.autoRotate = false
      renderer.domElement.style.cursor = enabled ? 'crosshair' : 'grab'
      updateOverlay()
    },
    setSectionLine: (start, end) => {
      sectionPoints = start ? (end ? [start, end] : [start]) : []
      updateOverlay()
    },
    setMeasurement: (active, editable, points, onChange) => {
      measurementActive = active
      measurementEditable = editable
      measurementPoints = points
      onMeasurementChange = onChange
      controls.enabled = true
      if (active) controls.autoRotate = false
      renderer.domElement.style.cursor = active && editable ? 'crosshair' : 'grab'
      updateOverlay()
    },
    resetCamera: () => {
      camera.position.copy(camPos)
      controls.target.set(0, -18, 0)
      controls.update()
    },
    dispose: () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      renderer.domElement.removeEventListener('click', onClick)
      controls.dispose()
      overlay.remove()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      renderer.dispose()
      container.removeChild(renderer.domElement)
      layerMeshes.forEach(m => m.geometry.dispose())
      layerMats.forEach(m => m.dispose())
      holeGroup.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach(material => material.dispose())
        } else if (object instanceof THREE.Sprite) {
          object.material.map?.dispose()
          object.material.dispose()
        }
      })
      grid.geometry.dispose()
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material]
      gridMaterials.forEach(material => material.dispose())
      axes.geometry.dispose()
      const axesMaterials = Array.isArray(axes.material) ? axes.material : [axes.material]
      axesMaterials.forEach(material => material.dispose())
    },
  }
}
