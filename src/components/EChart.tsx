import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

export default function EChart({ option, height = 200 }: { option: echarts.EChartsOption; height?: number | string }) {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chartRef.current = chart
    chart.setOption(option)
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option as any, true)
  }, [JSON.stringify(option)])

  return <div ref={ref} style={{ width: '100%', height }} />
}
