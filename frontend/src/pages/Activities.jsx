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

  const [activities] = useState(initialActivities)
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

  const delayedCount = filteredActivities.filter(
    (item) => item.status === "Delayed"
  ).length

  const highRiskCount = filteredActivities.filter(
    (item) => item.risk === "HIGH"
  ).length

  return (
    <div className="w-full pb-10">

      {/* =========================
          HEADER
      ========================== */}

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


      {/* =========================
          SEARCH + FILTERS
      ========================== */}

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


        {/* Filter Buttons */}

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


      {/* =========================
          ACTIVITY SUMMARY
      ========================== */}

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

          <p
            className="
              mt-1.5
              text-xl font-semibold text-white
              sm:mt-2 sm:text-2xl
            "
          >
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

          <p
            className="
              mt-1.5
              text-xl font-semibold text-red-400
              sm:mt-2 sm:text-2xl
            "
          >
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

          <p
            className="
              mt-1.5
              text-xl font-semibold text-red-400
              sm:mt-2 sm:text-2xl
            "
          >
            {highRiskCount}
          </p>
        </div>
      </div>


      {/* =========================
          ACTIVITIES TABLE
      ========================== */}

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

        {/* Table Header */}

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
          <div className="min-w-0">
            <h3
              className="
                text-base
                font-semibold
                text-white
                sm:text-lg
              "
            >
              Schedule Activities
            </h3>

            <p
              className="
                mt-1
                text-xs text-gray-400
                sm:text-sm
              "
            >
              Planning baseline compared with field execution
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {filteredActivities.length} Records
          </span>
        </div>


        {/* =========================
            DESKTOP / TABLET TABLE
        ========================== */}

        <div className="mt-5 hidden overflow-x-auto md:block sm:mt-6">
          <table className="w-full min-w-275 text-sm">

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

              {filteredActivities.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => {
                    if (item.id === "A103") {
                      navigate("/activity/A103")
                    }
                  }}
                  className={`
                    border-b
                    border-[#252d38]
                    last:border-0
                    ${
                      item.id === "A103"
                        ? "cursor-pointer hover:bg-[#1b2430]"
                        : ""
                    }
                  `}
                >

                  <td className="py-4 pr-5">
                    <p className="font-medium text-white">
                      {item.activity}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.id}
                    </p>
                  </td>


                  <td className="py-4 pr-5 text-gray-300">
                    {item.discipline}
                  </td>


                  <td className="whitespace-nowrap py-4 pr-5 text-gray-400">
                    {item.plannedStart}
                  </td>


                  <td className="whitespace-nowrap py-4 pr-5 text-gray-400">
                    {item.plannedFinish}
                  </td>


                  <td className="whitespace-nowrap py-4 pr-5 text-gray-400">
                    {item.actualStart}
                  </td>


                  <td className="whitespace-nowrap py-4 pr-5 text-gray-400">
                    {item.actualFinish}
                  </td>


                  <td className="py-4 pr-5 text-gray-300">
                    {item.planned}
                  </td>


                  <td className="py-4 pr-5 font-medium text-white">
                    {item.actual}
                  </td>


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


                  <td className="py-4 pr-5">
                    <span
                      className={
                        item.risk === "HIGH"
                          ? "font-medium text-red-400"
                          : item.risk === "MEDIUM"
                          ? "font-medium text-yellow-400"
                          : "font-medium text-green-400"
                      }
                    >
                      {item.risk}
                    </span>
                  </td>


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


        {/* =========================
            MOBILE ACTIVITY CARDS
        ========================== */}

        <div className="mt-5 space-y-3 md:hidden">

          {filteredActivities.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.id === "A103") {
                  navigate("/activity/A103")
                }
              }}
              className={`
                rounded-lg
                border border-[#252d38]
                bg-[#10151c]
                p-4
                ${
                  item.id === "A103"
                    ? "cursor-pointer active:bg-[#1b2430]"
                    : ""
                }
              `}
            >

              {/* Activity Header */}

              <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">
                  <p className="wrap-break-word text-sm font-medium text-white">
                    {item.activity}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {item.id}
                  </p>
                </div>

                <span
                  className={`
                    shrink-0
                    text-[10px]
                    font-medium
                    ${
                      item.risk === "HIGH"
                        ? "text-red-400"
                        : item.risk === "MEDIUM"
                        ? "text-yellow-400"
                        : "text-green-400"
                    }
                  `}
                >
                  {item.risk}
                </span>

              </div>


              {/* Discipline */}

              <div className="mt-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-600">
                  Discipline
                </p>

                <p className="mt-1 text-xs text-gray-300">
                  {item.discipline}
                </p>
              </div>


              {/* Dates */}

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
                    {item.plannedStart}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Planned Finish
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {item.plannedFinish}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Actual Start
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {item.actualStart}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Actual Finish
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {item.actualFinish}
                  </p>
                </div>

              </div>


              {/* Progress */}

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
                    {item.planned}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Actual
                  </p>

                  <p className="mt-1 text-xs font-medium text-white">
                    {item.actual}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Variance
                  </p>

                  <p
                    className={`
                      mt-1 text-xs
                      ${
                        item.variance.startsWith("-")
                          ? "text-red-400"
                          : "text-green-400"
                      }
                    `}
                  >
                    {item.variance}
                  </p>
                </div>

              </div>


              {/* Status */}

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
                    item.status === "Delayed"
                      ? "text-xs text-red-400"
                      : "text-xs text-green-400"
                  }
                >
                  {item.status}
                </span>
              </div>

            </div>
          ))}

        </div>


        {/* Empty State */}

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


      {/* =========================
          EXECUTION RECONCILIATION
      ========================== */}

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