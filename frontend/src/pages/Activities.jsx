import { useState } from "react"
import { useNavigate } from "react-router-dom"

const initialActivities = [
  {
    id: "A103",
    activity: "Compressor Foundation",
    discipline: "Civil",
    plannedStart: "01 Sep 2026",
    plannedFinish: "15 Sep 2026",
    actualStart: "02 Sep 2026",
    actualFinish: "—",
    planned: "80%",
    actual: "65%",
    variance: "-15%",
    status: "Delayed",
    risk: "HIGH",
  },
  {
    id: "A221",
    activity: "Main Piping Installation",
    discipline: "Piping",
    plannedStart: "05 Sep 2026",
    plannedFinish: "20 Sep 2026",
    actualStart: "06 Sep 2026",
    actualFinish: "—",
    planned: "70%",
    actual: "48%",
    variance: "-22%",
    status: "Delayed",
    risk: "HIGH",
  },
  {
    id: "A417",
    activity: "Electrical Works",
    discipline: "Electrical",
    plannedStart: "03 Sep 2026",
    plannedFinish: "18 Sep 2026",
    actualStart: "03 Sep 2026",
    actualFinish: "—",
    planned: "75%",
    actual: "72%",
    variance: "-3%",
    status: "On Track",
    risk: "MEDIUM",
  },
  {
    id: "A508",
    activity: "Equipment Installation",
    discipline: "Mechanical",
    plannedStart: "08 Sep 2026",
    plannedFinish: "25 Sep 2026",
    actualStart: "08 Sep 2026",
    actualFinish: "—",
    planned: "60%",
    actual: "58%",
    variance: "-2%",
    status: "On Track",
    risk: "LOW",
  },
  {
    id: "A601",
    activity: "Safety Inspection",
    discipline: "HSE",
    plannedStart: "01 Sep 2026",
    plannedFinish: "30 Sep 2026",
    actualStart: "01 Sep 2026",
    actualFinish: "—",
    planned: "85%",
    actual: "88%",
    variance: "+3%",
    status: "On Track",
    risk: "LOW",
  },
]

const disciplines = [
  "All",
  "Civil",
  "Piping",
  "Electrical",
  "Instrumentation",
  "HSE",
  "Mechanical",
]

const Activities = () => {
  const navigate = useNavigate()

  const [activities, setActivities] = useState(initialActivities)
  const [search, setSearch] = useState("")
  const [discipline, setDiscipline] = useState("All")

  const filteredActivities = activities.filter((item) => {
    const query = search.toLowerCase().trim()

    const matchesSearch =
      !query ||
      item.id.toLowerCase().includes(query) ||
      item.activity.toLowerCase().includes(query)

    const matchesDiscipline =
      discipline === "All" ||
      item.discipline === discipline

    return matchesSearch && matchesDiscipline
  })

  return (
    <div className="pb-10">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Activities
        </h2>

        <p className="text-gray-400 mt-2">
          Schedule activities and planned vs actual execution
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <div className="flex flex-col lg:flex-row gap-4">

          <input
            type="text"
            placeholder="Search Activity ID or activity name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
          />

          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-gray-300 outline-none"
          >
            {disciplines.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Disciplines" : item}
              </option>
            ))}
          </select>

        </div>

        <div className="flex flex-wrap gap-2 mt-4">

          {disciplines.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDiscipline(item)}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                discipline === item
                  ? "bg-blue-600 text-white"
                  : "bg-[#10151c] border border-[#252d38] text-gray-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}

        </div>

      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Activities
          </p>

          <p className="text-2xl font-semibold text-white mt-2">
            {filteredActivities.length}
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Delayed
          </p>

          <p className="text-2xl font-semibold text-red-400 mt-2">
            {
              filteredActivities.filter(
                (item) => item.status === "Delayed"
              ).length
            }
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            High Risk
          </p>

          <p className="text-2xl font-semibold text-red-400 mt-2">
            {
              filteredActivities.filter(
                (item) => item.risk === "HIGH"
              ).length
            }
          </p>
        </div>

      </div>

      {/* Activities Table */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-lg font-semibold text-white">
              Schedule Activities
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Planning baseline compared with field execution
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {filteredActivities.length} Records
          </span>

        </div>

        <div className="mt-6 overflow-x-auto">

          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-[#252d38] text-left">

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Activity
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Discipline
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Planned Start
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Planned Finish
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Actual Start
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Actual Finish
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Planned
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Actual
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Variance
                </th>

                <th className="pb-3 pr-5 text-gray-500 font-medium">
                  Risk
                </th>

                <th className="pb-3 text-gray-500 font-medium">
                  Status
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredActivities.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    if (item.id === "A103") {
                      navigate("/activity/A103")
                    }
                  }}
                  className={`border-b border-[#252d38] last:border-0 ${
                    item.id === "A103"
                      ? "cursor-pointer hover:bg-[#1b2430]"
                      : ""
                  }`}
                >

                  {/* Activity */}
                  <td className="py-4 pr-5">

                    <p className="text-white font-medium">
                      {item.activity}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {item.id}
                    </p>

                  </td>

                  {/* Discipline */}
                  <td className="py-4 pr-5">
                    <span className="text-gray-300">
                      {item.discipline}
                    </span>
                  </td>

                  {/* Planned Start */}
                  <td className="py-4 pr-5">
                    <span className="text-gray-400">
                      {item.plannedStart}
                    </span>
                  </td>

                  {/* Planned Finish */}
                  <td className="py-4 pr-5">
                    <span className="text-gray-400">
                      {item.plannedFinish}
                    </span>
                  </td>

                  {/* Actual Start */}
                  <td className="py-4 pr-5">
                    <span className="text-gray-400">
                      {item.actualStart}
                    </span>
                  </td>

                  {/* Actual Finish */}
                  <td className="py-4 pr-5">
                    <span className="text-gray-400">
                      {item.actualFinish}
                    </span>
                  </td>

                  {/* Planned */}
                  <td className="py-4 pr-5">
                    <span className="text-gray-300">
                      {item.planned}
                    </span>
                  </td>

                  {/* Actual */}
                  <td className="py-4 pr-5">
                    <span className="text-white font-medium">
                      {item.actual}
                    </span>
                  </td>

                  {/* Variance */}
                  <td className="py-4 pr-5">

                    <span
                      className={
                        item.variance.startsWith("-")
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {item.variance}
                    </span>

                  </td>

                  {/* Risk */}
                  <td className="py-4 pr-5">

                    <span
                      className={
                        item.risk === "HIGH"
                          ? "text-red-400 font-medium"
                          : item.risk === "MEDIUM"
                          ? "text-yellow-400 font-medium"
                          : "text-green-400 font-medium"
                      }
                    >
                      {item.risk}
                    </span>

                  </td>

                  {/* Status */}
                  <td className="py-4">

                    <span
                      className={
                        item.status === "Delayed"
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    >
                      {item.status}
                    </span>

                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

        {filteredActivities.length === 0 && (
          <div className="py-10 text-center">

            <p className="text-gray-400 text-sm">
              No activities found
            </p>

            <p className="text-gray-600 text-xs mt-1">
              Try another Activity ID, name or discipline.
            </p>

          </div>
        )}

      </div>

      {/* Planned vs Actual Explanation */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          EXECUTION RECONCILIATION
        </p>

        <p className="text-sm text-gray-300 mt-2">
          Planned values represent the schedule baseline. Actual values
          represent execution information received from field reports
          after reconciliation and verification.
        </p>

      </div>

    </div>
  )
}

export default Activities