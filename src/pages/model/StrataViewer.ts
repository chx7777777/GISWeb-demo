import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { strata, boreholes } from '../../mock/data'

export interface ViewerHandle {
  setLayerVisible: (i: number, v: boolean) => void
  setLayerOpacity: (i: number, o: number) => void
  setExploded: (v: boolean) => void
  setTransparent: (v: boolean) => void
  setAutoRotate: (v: boolean) => void
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

const W = 130, D = 86, N = 44, M = 30
const layerGap = 7

function thickness(i: number, x: number, z: number) {
  const base = strata[i].avgThickness || 14
  return base * (0.62 + 0.55 * (noise(x, z, i * 7.3) * 0.5 + 0.5))
}

/* 构建某一层的封闭实体网格（顶面 + 底面 + 四周裙边） */
function buildLayerGeometry(i: number) {
  const positions: number[] = []
  const idx: (gx: number, gz: number, bottom: boolean) => number =
    (gx, gz, bottom) => (bottom ? (N + 1) * (M + 1) : 0) + gz * (N + 1) + gx

  for (let b = 0; b < 2; b++) {
    for (let gz = 0; gz <= M; gz++) {
      for (let gx = 0; gx <= N; gx++) {
        const x = (gx / N - 0.5) * W
        const z = (gz / M - 0.5) * D
        let top = 0
        for (let k = 0; k < i; k++) top += thickness(k, x, z)
        const y = b === 0 ? -top : -(top + thickness(i, x, z))
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

export function createViewer(container: HTMLDivElement, onPick: (info: PickInfo | null) => void): ViewerHandle {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#060f1f')
  scene.fog = new THREE.Fog('#060f1f', 260, 520)

  const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 2000)
  const camPos = new THREE.Vector3(105, 85, 125)
  camera.position.copy(camPos)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, -18, 0)
  controls.maxDistance = 420
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
    const mesh = new THREE.Mesh(buildLayerGeometry(i), mat)
    mesh.userData.layerIndex = i
    layerMeshes.push(mesh); layerMats.push(mat)
    group.add(mesh)
  }
  scene.add(group)

  // 钻孔
  const holeGroup = new THREE.Group()
  const holeMeshes: THREE.Mesh[] = []
  const holePositions = [
    [-48, -26], [-30, 8], [-12, -18], [4, 12], [20, -8], [36, 20], [52, -22], [10, -32], [-38, 26],
  ]
  holePositions.forEach(([hx, hz], i) => {
    const b = boreholes[i % boreholes.length]
    let top = 0
    for (let k = 0; k < strata.length; k++) top += thickness(k, hx, hz)
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
  const onClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1
    const my = -((e.clientY - rect.top) / rect.height) * 2 + 1
    ray.setFromCamera(new THREE.Vector2(mx, my), camera)
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
      renderer.dispose()
      container.removeChild(renderer.domElement)
      layerMeshes.forEach(m => m.geometry.dispose())
      layerMats.forEach(m => m.dispose())
    },
  }
}
