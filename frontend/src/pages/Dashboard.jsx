import React from "react"

const stats = [
  ["Total Activities", "1,000"],
  ["On Track", "870"],
  ["Delayed", "82"],
  ["Needs Review", "31"],
]

const progressData = [
  { day: "Sep 10", planned: 60, actual: 55 },
  { day: "Sep 11", planned: 65, actual: 58 },
  { day: "Sep 12", planned: 70, actual: 62 },
  { day: "Sep 13", planned: 76, actual: 68 },
  { day: "Sep 14", planned: 82, actual: 74 },
]

const criticalActivities = [
  ["A103", "Compressor Foundation", "HIGH", "65%"],
  ["A221", "Main Piping Installation", "HIGH", "48%"],
  ["A417", "Electrical Works", "MEDIUM", "72%"],
]

const Dashboard = () => {
  return (
    <div className="pb-10">
      {/* Header */}
      <h2 className="text-2xl font-semibold text-white">
        Dashboard
      </h2>

      <p className="text-gray-400 mt-2">
        Project execution overview
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="bg-[#151b24] border border-[#252d38] rounded-xl p-5"
          >
            <p className="text-gray-400 text-sm">
              {label}
            </p>

            <p className="text-2xl font-semibold text-white mt-2">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Project Progress */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">
          Project Progress
        </h3>

        {/* Planned */}
        <div className="mt-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Planned
            </span>

            <span className="text-white">
              82%
            </span>
          </div>

          <div className="h-2 bg-[#252d38] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: "82%" }}
            />
          </div>
        </div>

        {/* Actual */}
        <div className="mt-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">
              Actual
            </span>

            <span className="text-white">
              74%
            </span>
          </div>

          <div className="h-2 bg-[#252d38] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: "74%" }}
            />
          </div>
        </div>
      </div>

      {/* Progress Trend */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Progress Trend
          </h3>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-gray-400">
                Planned
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400">
                Actual
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mt-6 h-72 w-full">
          <svg
            viewBox="0 0 800 280"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Horizontal grid lines */}
            {[40, 80, 120, 160, 200].map((y) => (
              <line
                key={y}
                x1="50"
                y1={y}
                x2="770"
                y2={y}
                stroke="#252d38"
                strokeWidth="1"
              />
            ))}

            {/* Y-axis labels */}
            <text
              x="15"
              y="204"
              fill="#6b7280"
              fontSize="12"
            >
              0
            </text>

            <text
              x="10"
              y="164"
              fill="#6b7280"
              fontSize="12"
            >
              25
            </text>

            <text
              x="10"
              y="124"
              fill="#6b7280"
              fontSize="12"
            >
              50
            </text>

            <text
              x="10"
              y="84"
              fill="#6b7280"
              fontSize="12"
            >
              75
            </text>

            <text
              x="10"
              y="44"
              fill="#6b7280"
              fontSize="12"
            >
              100
            </text>

            {/* Planned line */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points="70,136 245,128 420,120 595,98 770,69"
            />

            {/* Actual line */}
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              points="70,152 245,147 420,136 595,121 770,102"
            />

            {/* Planned points */}
            {[
              [70, 136],
              [245, 128],
              [420, 120],
              [595, 98],
              [770, 69],
            ].map(([cx, cy], index) => (
              <circle
                key={`planned-${index}`}
                cx={cx}
                cy={cy}
                r="4"
                fill="#3b82f6"
              />
            ))}

            {/* Actual points */}
            {[
              [70, 152],
              [245, 147],
              [420, 136],
              [595, 121],
              [770, 102],
            ].map(([cx, cy], index) => (
              <circle
                key={`actual-${index}`}
                cx={cx}
                cy={cy}
                r="4"
                fill="#22c55e"
              />
            ))}

            {/* X-axis labels */}
            {progressData.map((item, index) => {
              const xPositions = [70, 245, 420, 595, 770]

              return (
                <text
                  key={item.day}
                  x={xPositions[index]}
                  y="235"
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="12"
                >
                  {item.day}
                </text>
              )
            })}
          </svg>
        </div>
      </div>

      {/* Critical Activities */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">
          Critical Activities
        </h3>

        <div className="mt-5 space-y-3">
          {criticalActivities.map(
            ([id, name, risk, progress]) => (
              <div
                key={id}
                className="grid grid-cols-[1fr_120px_80px] items-center p-4 bg-[#10151c] rounded-lg"
              >
                {/* Activity */}
                <div>
                  <p className="font-medium text-white">
                    {name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {id}
                  </p>
                </div>

                {/* Risk */}
                <span
                  className={`text-sm font-medium ${
                    risk === "HIGH"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {risk}
                </span>

                {/* Progress */}
                <span className="text-sm text-gray-300">
                  {progress}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard