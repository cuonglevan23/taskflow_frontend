"use client"
import { useEffect, useRef, useState } from "react"

const data = [
  { label: "Design", value: 30, color: "#60a5fa" },
  { label: "Development", value: 50, color: "#34d399" },
  { label: "Testing", value: 20, color: "#f87171" },
]

const total = data.reduce((acc, item) => acc + item.value, 0)

export default function DonutChart() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 10
    const innerRadius = radius * 0.6

    let animationProgress = 0
    let startTime: number | null = null

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      animationProgress = Math.min(elapsed / 1000, 1) // 1s animation

      ctx.clearRect(0, 0, width, height)

      let startAngle = -Math.PI / 2
      data.forEach((item) => {
        const angle = (item.value / total) * Math.PI * 2 * animationProgress
        const endAngle = startAngle + angle

        // Vẽ phần donut
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true)
        ctx.fillStyle = item.color
        ctx.fill()
        ctx.closePath()

        // Vị trí text %
        const midAngle = startAngle + angle / 2
        const textX = centerX + Math.cos(midAngle) * ((radius + innerRadius) / 2)
        const textY = centerY + Math.sin(midAngle) * ((radius + innerRadius) / 2)

        if (angle > 0.2) {
          ctx.fillStyle = "white"
          ctx.font = "bold 14px sans-serif"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(`${Math.round((item.value / total) * 100)}%`, textX, textY)
        }

        startAngle = endAngle
      })

      // Vẽ số tổng ở giữa
      ctx.fillStyle = "#111"
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(`${total}`, centerX, centerY)

      if (animationProgress < 1) {
        requestAnimationFrame(draw)
      }
    }

    requestAnimationFrame(draw)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
      <div className="">
        <div className="p-4">
          <div className="w-full h-full flex justify-center items-center">
            <canvas ref={canvasRef} width={250} height={250} />
          </div>
        </div>
      </div>

      {/* Chi tiết phân loại */}
      <div className="flex flex-col justify-center gap-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-gray-700 text-sm">
              {item.label}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
