import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const API_BASE = "http://localhost:5000/api"

const Schedule = () => {
  const navigate = useNavigate()

  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [search, setSearch] = useState("")
  const [discipline, setDiscipline] = useState("ALL")
  const [status, setStatus] = useState("ALL")
  const [wbs, setWbs] = useState("ALL")

  // ============================================================
  // FETCH ACTIVITIES
  // ============================================================

  const loadActivities = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await fetch(
        `${API_BASE}/activities`,
        {
          credentials: "include",
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to fetch schedule"
        )
      }

      setActivities(data.data || [])

    } catch (err) {
      console.error(
        "Schedule loading error:",
        err
      )

      setError(
        err.message ||
        "Failed to load P6 schedule"
      )

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])


  // ============================================================
  // FILTER OPTIONS
  // ============================================================

  const disciplines = useMemo(() => {
    return [
      "ALL",
      ...Array.from(
        new Set(
          activities
            .map((activity) =>
              activity.discipline
            )
            .filter(Boolean)
        )
      ).sort(),
    ]
  }, [activities])


  const statuses = useMemo(() => {
    return [
      "ALL",
      ...Array.from(
        new Set(
          activities
            .map((activity) =>
              activity.status
            )
            .filter(Boolean)
        )
      ).sort(),
    ]
  }, [activities])


  const wbsOptions = useMemo(() => {
    return [
      "ALL",
      ...Array.from(
        new Set(
          activities
            .map((activity) =>
              activity.wbs_code
            )
            .filter(Boolean)
        )
      ).sort(),
    ]
  }, [activities])


  // ============================================================
  // FILTER ACTIVITIES
  // ============================================================

  const filteredActivities = useMemo(() => {

    const query =
      search.trim().toLowerCase()

    return activities.filter(
      (activity) => {

        const matchesSearch =
          !query ||
          String(
            activity.activity_code || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            activity.name || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            activity.description || ""
          )
            .toLowerCase()
            .includes(query) ||
          String(
            activity.owner || ""
          )
            .toLowerCase()
            .includes(query)

        const matchesDiscipline =
          discipline === "ALL" ||
          activity.discipline === discipline

        const matchesStatus =
          status === "ALL" ||
          activity.status === status

        const matchesWbs =
          wbs === "ALL" ||
          activity.wbs_code === wbs

        return (
          matchesSearch &&
          matchesDiscipline &&
          matchesStatus &&
          matchesWbs
        )
      }
    )
  }, [
    activities,
    search,
    discipline,
    status,
    wbs,
  ])


  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {

    const total =
      activities.length

    const completed =
      activities.filter(
        (activity) =>
          activity.status ===
          "COMPLETED"
      ).length

    const inProgress =
      activities.filter(
        (activity) =>
          activity.status ===
          "IN_PROGRESS"
      ).length

    const delayed =
      activities.filter(
        (activity) =>
          activity.status ===
          "DELAYED" ||
          Number(
            activity.potential_delay_days
          ) > 0
      ).length

    const averageProgress =
      total
        ? activities.reduce(
            (
              sum,
              activity
            ) =>
              sum +
              Number(
                activity.actual_progress ||
                0
              ),
            0
          ) / total
        : 0

    return {
      total,
      completed,
      inProgress,
      delayed,
      averageProgress,
    }

  }, [activities])


  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (value) => {

    if (!value) {
      return "—"
    }

    const date =
      new Date(value)

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return String(value)
    }

    return date.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
  }


  // ============================================================
  // STATUS STYLE
  // ============================================================

  const getStatusStyle = (
    activityStatus
  ) => {

    switch (activityStatus) {

      case "COMPLETED":
        return "bg-green-500/10 text-green-400 border-green-500/20"

      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"

      case "DELAYED":
        return "bg-red-500/10 text-red-400 border-red-500/20"

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }


  // ============================================================
  // RISK STYLE
  // ============================================================

  const getRiskStyle = (
    risk
  ) => {

    switch (
      String(
        risk || ""
      ).toUpperCase()
    ) {

      case "HIGH":
        return "text-red-400"

      case "MEDIUM":
        return "text-yellow-400"

      default:
        return "text-green-400"
    }
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                P6 Baseline
              </span>

              <span className="text-xs text-gray-500">
                Planning → Execution
              </span>

            </div>

            <h1 className="text-2xl font-semibold text-white">
              Schedule
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Primavera P6 master schedule and activity baseline
            </p>

          </div>


          <button
            type="button"
            onClick={loadActivities}
            className="
              rounded-lg
              border
              border-[#303946]
              bg-[#151b24]
              px-4
              py-2
              text-sm
              text-gray-300
              transition
              hover:bg-[#1b2430]
              hover:text-white
            "
          >
            Refresh Schedule
          </button>

        </div>

      </div>


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">

        <div className="rounded-xl border border-[#252d38] bg-[#151b24] p-5">

          <p className="text-xs text-gray-500">
            Total Activities
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.total}
          </p>

        </div>


        <div className="rounded-xl border border-[#252d38] bg-[#151b24] p-5">

          <p className="text-xs text-gray-500">
            Completed
          </p>

          <p className="mt-2 text-2xl font-semibold text-green-400">
            {summary.completed}
          </p>

        </div>


        <div className="rounded-xl border border-[#252d38] bg-[#151b24] p-5">

          <p className="text-xs text-gray-500">
            In Progress
          </p>

          <p className="mt-2 text-2xl font-semibold text-blue-400">
            {summary.inProgress}
          </p>

        </div>


        <div className="rounded-xl border border-[#252d38] bg-[#151b24] p-5">

          <p className="text-xs text-gray-500">
            Delayed
          </p>

          <p className="mt-2 text-2xl font-semibold text-red-400">
            {summary.delayed}
          </p>

        </div>


        <div className="rounded-xl border border-[#252d38] bg-[#151b24] p-5">

          <p className="text-xs text-gray-500">
            Actual Progress
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {summary.averageProgress.toFixed(1)}%
          </p>

        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="mb-6 rounded-xl border border-[#252d38] bg-[#151b24] p-4">

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

          {/* SEARCH */}

          <div>

            <label className="mb-2 block text-xs text-gray-500">
              Search Activity
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="ID, activity, owner..."
              className="
                w-full
                rounded-lg
                border
                border-[#303946]
                bg-[#10151c]
                px-3
                py-2.5
                text-sm
                text-white
                outline-none
                placeholder:text-gray-600
                focus:border-blue-500/50
              "
            />

          </div>


          {/* DISCIPLINE */}

          <div>

            <label className="mb-2 block text-xs text-gray-500">
              Discipline
            </label>

            <select
              value={discipline}
              onChange={(e) =>
                setDiscipline(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[#303946]
                bg-[#10151c]
                px-3
                py-2.5
                text-sm
                text-gray-300
                outline-none
              "
            >

              {disciplines.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "ALL"
                      ? "All Disciplines"
                      : item}
                  </option>
                )
              )}

            </select>

          </div>


          {/* STATUS */}

          <div>

            <label className="mb-2 block text-xs text-gray-500">
              Status
            </label>

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[#303946]
                bg-[#10151c]
                px-3
                py-2.5
                text-sm
                text-gray-300
                outline-none
              "
            >

              {statuses.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "ALL"
                      ? "All Status"
                      : item}
                  </option>
                )
              )}

            </select>

          </div>


          {/* WBS */}

          <div>

            <label className="mb-2 block text-xs text-gray-500">
              WBS
            </label>

            <select
              value={wbs}
              onChange={(e) =>
                setWbs(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-lg
                border
                border-[#303946]
                bg-[#10151c]
                px-3
                py-2.5
                text-sm
                text-gray-300
                outline-none
              "
            >

              {wbsOptions.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "ALL"
                      ? "All WBS"
                      : item}
                  </option>
                )
              )}

            </select>

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

          <p className="text-sm font-medium text-red-400">
            Failed to load schedule
          </p>

          <p className="mt-1 text-xs text-red-300/70">
            {error}
          </p>

        </div>

      )}


      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading ? (

        <div className="rounded-xl border border-[#252d38] bg-[#151b24] p-12 text-center">

          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />

          <p className="text-sm text-gray-400">
            Loading P6 schedule...
          </p>

        </div>

      ) : (

        /* ====================================================
           TABLE
        ==================================================== */

        <div className="overflow-hidden rounded-xl border border-[#252d38] bg-[#151b24]">

          {/* TABLE HEADER */}

          <div className="flex flex-col gap-2 border-b border-[#252d38] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-sm font-semibold text-white">
                Master Schedule
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredActivities.length} of{" "}
                {activities.length} activities
              </p>

            </div>

            <div className="text-xs text-gray-500">
              Source: Primavera P6 XLSX
            </div>

          </div>


          {/* TABLE */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1500px] border-collapse">

              <thead>

                <tr className="border-b border-[#252d38] bg-[#10151c]">

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Activity ID
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    WBS
                  </th>

                  <th className="min-w-[280px] whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Activity Name
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Discipline
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Owner
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Duration
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Planned Start
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Planned Finish
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Actual Start
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Actual Finish
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Progress
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Risk
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Variance
                  </th>

                  <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredActivities.length === 0 ? (

                  <tr>

                    <td
                      colSpan="15"
                      className="px-6 py-16 text-center"
                    >

                      <p className="text-sm text-gray-400">
                        No activities found
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        Try changing your filters or search query.
                      </p>

                    </td>

                  </tr>

                ) : (

                  filteredActivities.map(
                    (activity) => {

                      const progress =
                        Number(
                          activity.actual_progress ||
                          0
                        )

                      const planned =
                        Number(
                          activity.planned_progress ||
                          0
                        )

                      const variance =
                        progress -
                        planned

                      return (

                        <tr
                          key={
                            activity.id
                          }
                          className="
                            border-b
                            border-[#202833]
                            transition
                            hover:bg-[#1a222d]
                          "
                        >

                          {/* ID */}

                          <td className="px-4 py-4">

                            <span className="font-mono text-xs font-medium text-blue-400">
                              {activity.activity_code ||
                                "—"}
                            </span>

                          </td>


                          {/* WBS */}

                          <td className="px-4 py-4">

                            <span className="text-xs text-gray-400">
                              {activity.wbs_code ||
                                "—"}
                            </span>

                          </td>


                          {/* NAME */}

                          <td className="px-4 py-4">

                            <div className="max-w-[350px]">

                              <p className="text-sm font-medium text-white">
                                {activity.name ||
                                  "Unnamed Activity"}
                              </p>

                              {activity.description &&
                                activity.description !==
                                  activity.name && (

                                <p className="mt-1 truncate text-xs text-gray-600">
                                  {activity.description}
                                </p>

                              )}

                            </div>

                          </td>


                          {/* DISCIPLINE */}

                          <td className="px-4 py-4">

                            <span className="rounded-md bg-[#202833] px-2 py-1 text-xs text-gray-300">
                              {activity.discipline ||
                                "—"}
                            </span>

                          </td>


                          {/* OWNER */}

                          <td className="px-4 py-4">

                            <span className="text-xs text-gray-400">
                              {activity.owner ||
                                "—"}
                            </span>

                          </td>


                          {/* DURATION */}

                          <td className="px-4 py-4">

                            <span className="text-xs text-gray-400">
                              {activity.duration_days !==
                              null &&
                              activity.duration_days !==
                              undefined
                                ? `${activity.duration_days}d`
                                : "—"}
                            </span>

                          </td>


                          {/* PLANNED START */}

                          <td className="px-4 py-4">

                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {formatDate(
                                activity.planned_start
                              )}
                            </span>

                          </td>


                          {/* PLANNED FINISH */}

                          <td className="px-4 py-4">

                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {formatDate(
                                activity.planned_finish
                              )}
                            </span>

                          </td>


                          {/* ACTUAL START */}

                          <td className="px-4 py-4">

                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {formatDate(
                                activity.actual_start
                              )}
                            </span>

                          </td>


                          {/* ACTUAL FINISH */}

                          <td className="px-4 py-4">

                            <span className="whitespace-nowrap text-xs text-gray-400">
                              {formatDate(
                                activity.actual_finish
                              )}
                            </span>

                          </td>


                          {/* PROGRESS */}

                          <td className="px-4 py-4">

                            <div className="w-[100px]">

                              <div className="mb-1 flex items-center justify-between">

                                <span className="text-xs font-medium text-white">
                                  {progress.toFixed(
                                    0
                                  )}%
                                </span>

                              </div>

                              <div className="h-1.5 overflow-hidden rounded-full bg-[#252d38]">

                                <div
                                  className="h-full rounded-full bg-blue-500 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        progress
                                      )
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td className="px-4 py-4">

                            <span
                              className={`
                                inline-flex
                                rounded-md
                                border
                                px-2
                                py-1
                                text-[10px]
                                font-medium
                                ${getStatusStyle(
                                  activity.status
                                )}
                              `}
                            >
                              {activity.status ||
                                "NOT_STARTED"}
                            </span>

                          </td>


                          {/* RISK */}

                          <td className="px-4 py-4">

                            <span
                              className={`
                                text-xs
                                font-medium
                                ${getRiskStyle(
                                  activity.risk_level
                                )}
                              `}
                            >
                              {activity.risk_level ||
                                "LOW"}
                            </span>

                          </td>


                          {/* VARIANCE */}

                          <td className="px-4 py-4">

                            <span
                              className={`
                                text-xs
                                font-medium
                                ${
                                  variance < 0
                                    ? "text-red-400"
                                    : variance > 0
                                    ? "text-green-400"
                                    : "text-gray-400"
                                }
                              `}
                            >
                              {variance > 0
                                ? "+"
                                : ""}
                              {variance.toFixed(
                                1
                              )}
                              %
                            </span>

                          </td>


                          {/* ACTION */}

                          <td className="px-4 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/activity/${activity.id}`
                                )
                              }
                              className="
                                rounded-md
                                border
                                border-[#303946]
                                px-3
                                py-1.5
                                text-xs
                                text-gray-300
                                transition
                                hover:border-blue-500/30
                                hover:bg-blue-500/10
                                hover:text-blue-400
                              "
                            >
                              Details
                            </button>

                          </td>

                        </tr>

                      )
                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  )
}

export default Schedule