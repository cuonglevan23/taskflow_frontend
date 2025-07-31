"use client"
import { useEffect, useRef, useState } from "react"

const data = [
  { label: "Completed", value: 1, color: "#8b5cf6" },
  { label: "Incomplete", value: 1, color: "#E7E2FA" },
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
          ctx.fillText(`${item.value}`, textX, textY)
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
  }, [data])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          <canvas ref={canvasRef} width={280} height={280} />
        </div>

        {/* Chi tiết phân loại */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Task Status</h3>
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-gray-700 text-sm font-medium">
                  {item.label}
                </span>
              </div>
              <span className="text-gray-600 text-sm font-bold">
                {item.value}
              </span>
            </div>
          ))}
          <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
            <div className="text-xl font-bold text-purple-600">{total}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
