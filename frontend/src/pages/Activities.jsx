import { useNavigate } from "react-router-dom"

const activities = [
  {
    id: "A103",
    activity: "Compressor Foundation",
    wbs: "Mechanical / Foundation",
    planned: "80%",
    actual: "65%",
    variance: "-15%",
    status: "Delayed",
    risk: "HIGH",
  },
  {
    id: "A221",
    activity: "Main Piping Installation",
    wbs: "Piping / Installation",
    planned: "70%",
    actual: "48%",
    variance: "-22%",
    status: "Delayed",
    risk: "HIGH",
  },
  {
    id: "A417",
    activity: "Electrical Works",
    wbs: "Electrical / Installation",
    planned: "75%",
    actual: "72%",
    variance: "-3%",
    status: "On Track",
    risk: "MEDIUM",
  },
  {
    id: "A508",
    activity: "Equipment Installation",
    wbs: "Mechanical / Equipment",
    planned: "60%",
    actual: "58%",
    variance: "-2%",
    status: "On Track",
    risk: "LOW",
  },
]

const Activities = () => {
  const navigate = useNavigate()

  return (
    <div className="pb-10">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Activities
        </h2>

        <p className="text-gray-400 mt-2">
          Schedule vs actual execution
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Total Activities
          </p>

          <p className="text-2xl font-semibold text-white mt-2">
            1,000
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Delayed
          </p>

          <p className="text-2xl font-semibold text-red-400 mt-2">
            82
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Needs Review
          </p>

          <p className="text-2xl font-semibold text-yellow-400 mt-2">
            31
          </p>
        </div>

      </div>

      {/* Activity Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-[#252d38]">

        <div className="px-5 py-4 bg-[#151b24] border-b border-[#252d38]">
          <h3 className="font-semibold text-white">
            Schedule Activities
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Planned schedule reconciled with field execution
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-[#151b24] text-gray-400 text-sm">
              <tr>
                <th className="p-4">Activity</th>
                <th className="p-4">WBS</th>
                <th className="p-4">Planned</th>
                <th className="p-4">Actual</th>
                <th className="p-4">Variance</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((item) => (
                <tr
                  key={item.id}
                  onClick={() =>
                    item.id === "A103" &&
                    navigate("/activity/A103")
                  }
                  className="border-t border-[#252d38] bg-[#10151c] hover:bg-[#151b24] cursor-pointer transition"
                >

                  {/* Activity */}
                  <td className="p-4">
                    <p className="font-medium text-white">
                      {item.activity}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.id}
                    </p>
                  </td>

                  {/* WBS */}
                  <td className="p-4 text-gray-400 text-sm">
                    {item.wbs}
                  </td>

                  {/* Planned */}
                  <td className="p-4 text-blue-400">
                    {item.planned}
                  </td>

                  {/* Actual */}
                  <td className="p-4 text-green-400">
                    {item.actual}
                  </td>

                  {/* Variance */}
                  <td
                    className={`p-4 ${
                      item.variance.startsWith("-")
                        ? "text-red-400"
                        : "text-green-400"
                    }`}
                  >
                    {item.variance}
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`text-sm ${
                        item.status === "Delayed"
                          ? "text-red-400"
                          : "text-green-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Risk */}
                  <td className="p-4">
                    <span
                      className={`text-sm font-medium ${
                        item.risk === "HIGH"
                          ? "text-red-400"
                          : item.risk === "MEDIUM"
                          ? "text-yellow-400"
                          : "text-gray-400"
                      }`}
                    >
                      {item.risk}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 bg-[#151b24] border border-[#252d38] rounded-xl p-5">
        <p className="text-sm text-gray-400">
          Click an activity to view its linked field reports,
          execution evidence and schedule impact.
        </p>
      </div>

    </div>
  )
}

export default Activities