import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getActivities } from "../services/api"

const disciplines = [
  "All",
  "Civil",
  "Piping",
  "Electrical",
  "Instrumentation",
  "HSE",
  "Mechanical",
]

function formatDate(date) {
  if (!date) return "—"

  const value = String(date).slice(0, 10)
  const parts = value.split("-")

  if (parts.length !== 3) return value

  const [year, month, day] = parts

  return `${day} ${new Date(
    `${year}-${month}-01`
  ).toLocaleString("en-US", {
    month: "short",
  })} ${year}`
}

function formatProgress(value) {
  return `${Number(value || 0)}%`
}

function formatStatus(status) {
  if (!status) return "—"

  if (status === "IN_PROGRESS") return "In Progress"
  if (status === "COMPLETED") return "Completed"
  if (status === "DELAYED") return "Delayed"

  return status
}

function getRisk(activity) {
  return activity.risk_level || "LOW"
}

const Activities = () => {
  const navigate = useNavigate()

  const [activities, setActivities] = useState([])
  const [search, setSearch] = useState("")
  const [discipline, setDiscipline] = useState("All")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    try {
      setLoading(true)
      setError("")

      const response = await getActivities()

      const backendActivities = response.data || []

      setActivities(backendActivities)
    } catch (err) {
      console.error("Failed to load activities:", err)
      setError(err.message || "Failed to load activities")
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = activities.filter((item) => {
    const query = search.toLowerCase().trim()

    const activityId = String(
      item.activity_code || ""
    ).toLowerCase()

    const activityName = String(
      item.name || ""
    ).toLowerCase()

    const activityDescription = String(
      item.description || ""
    ).toLowerCase()

    const activityDiscipline = String(
      item.discipline || ""
    )

    const matchesSearch =
      !query ||
      activityId.includes(query) ||
      activityName.includes(query) ||
      activityDescription.includes(query)

    const matchesDiscipline =
      discipline === "All" ||
      activityDiscipline.toLowerCase() ===
        discipline.toLowerCase()

    return matchesSearch && matchesDiscipline
  })

  const delayedCount = filteredActivities.filter(
    (item) =>
      item.status === "DELAYED" ||
      Number(item.potential_delay_days || 0) > 0
  ).length

  const highRiskCount = filteredActivities.filter(
    (item) => getRisk(item) === "HIGH"
  ).length

  return (
    <div className="w-full pb-10">

      {/* HEADER */}

      <div>
        <h2
          className="
            text-xl font-semibold text-white
            sm:text-2xl
          "
        >
          Activities
        </h2>

        <p
          className="
            mt-1
            text-xs text-gray-400
            sm:mt-2 sm:text-sm
          "
        >
          Schedule activities and planned vs actual execution
        </p>
      </div>

      {/* SEARCH + FILTERS */}

      <div
        className="
          mt-6
          rounded-xl
          border border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8 sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:gap-4
          "
        >
          <input
            type="text"
            placeholder="Search Activity ID or activity name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              min-w-0
              flex-1
              rounded-lg
              border border-[#252d38]
              bg-[#10151c]
              px-4 py-3
              text-sm
              text-white
              placeholder-gray-500
              outline-none
              focus:border-blue-500
            "
          />

          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="
              w-full
              rounded-lg
              border border-[#252d38]
              bg-[#10151c]
              px-4 py-3
              text-sm
              text-gray-300
              outline-none
              lg:w-auto
              lg:min-w-47.5
            "
          >
            {disciplines.map((item) => (
              <option key={item} value={item}>
                {item === "All"
                  ? "All Disciplines"
                  : item}
              </option>
            ))}
          </select>
        </div>

        {/* FILTER BUTTONS */}

        <div
          className="
            mt-4
            flex
            gap-2
            overflow-x-auto
            pb-1
          "
        >
          {disciplines.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDiscipline(item)}
              className={`
                shrink-0
                rounded-lg
                px-3 py-1.5
                text-xs
                transition
                ${
                  discipline === item
                    ? "bg-blue-600 text-white"
                    : "border border-[#252d38] bg-[#10151c] text-gray-400 hover:text-white"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING */}

      {loading && (
        <div className="mt-8 rounded-xl border border-[#252d38] bg-[#151b24] p-8 text-center">
          <p className="text-gray-400">
            Loading activities...
          </p>
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-500/30 bg-[#151b24] p-6">
          <p className="text-sm text-red-400">
            {error}
          </p>

          <button
            onClick={loadActivities}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* ACTIVITY SUMMARY */}

      {!loading && !error && (
        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-3
            sm:mt-8
            sm:grid-cols-3
            sm:gap-4
          "
        >
          <div
            className="
              rounded-xl
              border border-[#252d38]
              bg-[#151b24]
              p-4
              sm:p-5
            "
          >
            <p className="text-xs text-gray-400 sm:text-sm">
              Activities
            </p>

            <p className="mt-1.5 text-xl font-semibold text-white sm:mt-2 sm:text-2xl">
              {filteredActivities.length}
            </p>
          </div>

          <div
            className="
              rounded-xl
              border border-[#252d38]
              bg-[#151b24]
              p-4
              sm:p-5
            "
          >
            <p className="text-xs text-gray-400 sm:text-sm">
              Delayed
            </p>

            <p className="mt-1.5 text-xl font-semibold text-red-400 sm:mt-2 sm:text-2xl">
              {delayedCount}
            </p>
          </div>

          <div
            className="
              rounded-xl
              border border-[#252d38]
              bg-[#151b24]
              p-4
              sm:p-5
            "
          >
            <p className="text-xs text-gray-400 sm:text-sm">
              High Risk
            </p>

            <p className="mt-1.5 text-xl font-semibold text-red-400 sm:mt-2 sm:text-2xl">
              {highRiskCount}
            </p>
          </div>
        </div>
      )}

      {/* ACTIVITIES TABLE */}

      {!loading && !error && (
        <div
          className="
            mt-6
            rounded-xl
            border border-[#252d38]
            bg-[#151b24]
            p-4
            sm:mt-8 sm:p-6
          "
        >
          <div
            className="
              flex
              flex-col
              gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h3 className="text-base font-semibold text-white sm:text-lg">
                Schedule Activities
              </h3>

              <p className="mt-1 text-xs text-gray-400 sm:text-sm">
                Planning baseline compared with field execution
              </p>
            </div>

            <span className="text-xs text-gray-500">
              {filteredActivities.length} Records
            </span>
          </div>

          {/* DESKTOP TABLE */}

          <div className="mt-5 hidden overflow-x-auto md:block sm:mt-6">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b border-[#252d38] text-left">
                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Activity
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Discipline
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Planned Start
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Planned Finish
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Actual Start
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Actual Finish
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Planned
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Actual
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Variance
                  </th>

                  <th className="pb-3 pr-5 font-medium text-gray-500">
                    Risk
                  </th>

                  <th className="pb-3 font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredActivities.map((item) => {
                  const planned = Number(
                    item.planned_progress || 0
                  )

                  const actual = Number(
                    item.actual_progress || 0
                  )

                  const variance = Number(
                    (actual - planned).toFixed(2)
                  )

                  const risk = getRisk(item)

                  return (
                    <tr
                      key={item.id}
                      onClick={() =>
                        navigate(`/activity/${item.id}`)
                      }
                      className="
                        cursor-pointer
                        border-b border-[#252d38]
                        last:border-0
                        hover:bg-[#1b2430]
                      "
                    >
                      <td className="py-4 pr-5">
                        <p className="font-medium text-white">
                          {item.name || "Unnamed Activity"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.activity_code || item.id}
                        </p>
                      </td>

                      <td className="py-4 pr-5">
                        <span className="text-gray-300">
                          {item.discipline || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-4 pr-5">
                        <span className="text-gray-400">
                          {formatDate(item.planned_start)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-4 pr-5">
                        <span className="text-gray-400">
                          {formatDate(item.planned_finish)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-4 pr-5">
                        <span className="text-gray-400">
                          {formatDate(item.actual_start)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap py-4 pr-5">
                        <span className="text-gray-400">
                          {formatDate(item.actual_finish)}
                        </span>
                      </td>

                      <td className="py-4 pr-5">
                        <span className="text-gray-300">
                          {formatProgress(planned)}
                        </span>
                      </td>

                      <td className="py-4 pr-5">
                        <span className="font-medium text-white">
                          {formatProgress(actual)}
                        </span>
                      </td>

                      <td className="py-4 pr-5">
                        <span
                          className={
                            variance < 0
                              ? "text-red-400"
                              : "text-green-400"
                          }
                        >
                          {variance > 0 ? "+" : ""}
                          {variance}%
                        </span>
                      </td>

                      <td className="py-4 pr-5">
                        <span
                          className={
                            risk === "HIGH"
                              ? "font-medium text-red-400"
                              : risk === "MEDIUM"
                              ? "font-medium text-yellow-400"
                              : "font-medium text-green-400"
                          }
                        >
                          {risk}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={
                            item.status === "DELAYED"
                              ? "text-red-400"
                              : item.status === "COMPLETED"
                              ? "text-green-400"
                              : "text-green-400"
                          }
                        >
                          {formatStatus(item.status)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE ACTIVITY CARDS */}

          <div className="mt-5 space-y-3 md:hidden">
            {filteredActivities.map((item) => {
              const planned = Number(
                item.planned_progress || 0
              )

              const actual = Number(
                item.actual_progress || 0
              )

              const variance = Number(
                (actual - planned).toFixed(2)
              )

              const risk = getRisk(item)

              return (
                <div
                  key={item.id}
                  onClick={() =>
                    navigate(`/activity/${item.id}`)
                  }
                  className="
                    cursor-pointer
                    rounded-lg
                    border border-[#252d38]
                    bg-[#10151c]
                    p-4
                    active:bg-[#1b2430]
                  "
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-white">
                        {item.name || "Unnamed Activity"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {item.activity_code || item.id}
                      </p>
                    </div>

                    <span
                      className={
                        risk === "HIGH"
                          ? "shrink-0 text-[10px] font-medium text-red-400"
                          : risk === "MEDIUM"
                          ? "shrink-0 text-[10px] font-medium text-yellow-400"
                          : "shrink-0 text-[10px] font-medium text-green-400"
                      }
                    >
                      {risk}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-600">
                      Discipline
                    </p>

                    <p className="mt-1 text-xs text-gray-300">
                      {item.discipline || "—"}
                    </p>
                  </div>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-2
                      gap-3
                      border-t border-[#252d38]
                      pt-3
                    "
                  >
                    <div>
                      <p className="text-[10px] text-gray-600">
                        Planned Start
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(item.planned_start)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-600">
                        Planned Finish
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(item.planned_finish)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-600">
                        Actual Start
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(item.actual_start)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-600">
                        Actual Finish
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {formatDate(item.actual_finish)}
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-3
                      gap-2
                      border-t border-[#252d38]
                      pt-3
                    "
                  >
                    <div>
                      <p className="text-[10px] text-gray-600">
                        Planned
                      </p>

                      <p className="mt-1 text-xs text-gray-300">
                        {formatProgress(planned)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-600">
                        Actual
                      </p>

                      <p className="mt-1 text-xs font-medium text-white">
                        {formatProgress(actual)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-gray-600">
                        Variance
                      </p>

                      <p
                        className={
                          variance < 0
                            ? "mt-1 text-xs text-red-400"
                            : "mt-1 text-xs text-green-400"
                        }
                      >
                        {variance > 0 ? "+" : ""}
                        {variance}%
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      mt-4
                      flex
                      items-center
                      justify-between
                      border-t border-[#252d38]
                      pt-3
                    "
                  >
                    <span className="text-[10px] uppercase tracking-wider text-gray-600">
                      Status
                    </span>

                    <span
                      className={
                        item.status === "DELAYED"
                          ? "text-xs text-red-400"
                          : "text-xs text-green-400"
                      }
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* EMPTY STATE */}

          {filteredActivities.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-gray-400">
                No activities found
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Try another Activity ID, name or discipline.
              </p>
            </div>
          )}
        </div>
      )}

      {/* EXECUTION RECONCILIATION */}

      <div
        className="
          mt-6
          rounded-xl
          border border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8 sm:p-5
        "
      >
        <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
          EXECUTION RECONCILIATION
        </p>

        <p
          className="
            mt-2
            text-xs
            leading-5
            text-gray-300
            sm:text-sm
            sm:leading-6
          "
        >
          Planned values represent the schedule baseline.
          Actual values represent execution information
          received from field reports after reconciliation
          and verification.
        </p>
      </div>

    </div>
  )
}

export default Activities