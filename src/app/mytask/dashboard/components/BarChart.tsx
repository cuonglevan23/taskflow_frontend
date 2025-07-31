"use client"
import { useEffect, useRef, useState } from "react"

const data = [
  { label: "Recently assigned", value: 5, color: "#8b5cf6" },
  { label: "Do today", value: 2, color: "#8b5cf6" },
  { label: "Do next", value: 0, color: "#8b5cf6" },
  { label: "Do later", value: 0, color: "#8b5cf6" },
]

const total = data.reduce((acc, item) => acc + item.value, 0)

export default function BarChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = 60
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding
    const barWidth = 35
    const maxValue = Math.max(...data.map(item => item.value))
    // Tăng maxValue lên một chút để các cột không quá thấp
    const adjustedMaxValue = maxValue <= 10 ? maxValue + 2 : maxValue + Math.ceil(maxValue * 0.1)
    
    // Tự động điều chỉnh số lượng grid lines dựa trên maxValue
    const getGridLines = (max: number) => {
      if (max <= 10) return 5
      if (max <= 20) return 4
      if (max <= 50) return 5
      if (max <= 100) return 6
      return Math.min(10, Math.ceil(max / 10))
    }
    
    const gridLines = getGridLines(adjustedMaxValue)

    let animationProgress = 0
    let startTime: number | null = null

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      animationProgress = Math.min(elapsed / 1000, 1) // 1s animation

      ctx.clearRect(0, 0, width, height)

             // Vẽ background cho chart (trong suốt)
       ctx.clearRect(padding, padding, chartWidth, chartHeight)

      // Vẽ grid lines
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1
      for (let i = 0; i <= gridLines; i++) {
        const y = padding + (chartHeight / gridLines) * i
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(padding + chartWidth, y)
        ctx.stroke()
      }

             // Vẽ bars
       data.forEach((item, index) => {
         const x = padding + index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2
         const barHeight = (item.value / adjustedMaxValue) * chartHeight * animationProgress
         const y = padding + chartHeight - barHeight
        const percentage = (item.value / total) * 100

                 // Vẽ bar với màu đơn giản
         ctx.fillStyle = item.color
         ctx.fillRect(x, y, barWidth, barHeight)

                 // Vẽ giá trị trên bar
         if (item.value > 0) {
           ctx.fillStyle = "#111"
           ctx.font = "bold 12px sans-serif"
           ctx.textAlign = "center"
           ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)
         }

        // Vẽ label dưới bar
        ctx.fillStyle = "#374151"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(item.label, x + barWidth / 2, padding + chartHeight + 20)
      })

             // Vẽ axis labels
       ctx.fillStyle = "#6b7280"
       ctx.font = "12px sans-serif"
       ctx.textAlign = "right"
       for (let i = 0; i <= gridLines; i++) {
         const value = Math.round((adjustedMaxValue / gridLines) * (gridLines - i))
         const y = padding + (chartHeight / gridLines) * i
         ctx.fillText(value.toString(), padding - 10, y + 5)
       }

      if (animationProgress < 1) {
        requestAnimationFrame(draw)
      }
    }

    requestAnimationFrame(draw)
  }, [data])

  // Helper function để điều chỉnh độ sáng của màu
  const adjustBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas ref={canvasRef} width={600} height={300} />
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm text-gray-600 font-medium">
          Tasks (count)
        </div>
      </div>
    </div>
  )
}