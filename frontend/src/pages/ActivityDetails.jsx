import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"

const API_BASE = "http://localhost:5000/api"

function formatDate(date) {
  if (!date) return "—"

  const value = String(date).slice(0, 10)
  const parts = value.split("-")

  if (parts.length !== 3) return value

  const [year, month, day] = parts

  const monthName = new Date(
    `${year}-${month}-01`
  ).toLocaleString("en-US", {
    month: "short",
  })

  return `${day} ${monthName} ${year}`
}

function formatProgress(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—"
  }

  return `${Number(value)}%`
}

function formatStatus(status) {
  if (!status) return "Unknown"

  if (status === "IN_PROGRESS") {
    return "In Progress"
  }

  if (status === "COMPLETED") {
    return "Completed"
  }

  if (status === "DELAYED") {
    return "Delayed"
  }

  if (status === "NOT_STARTED") {
    return "Not Started"
  }

  return status
}

function getRiskClass(risk) {
  if (risk === "HIGH") {
    return "text-red-400"
  }

  if (risk === "MEDIUM") {
    return "text-yellow-400"
  }

  return "text-green-400"
}

function getStatusClass(status) {
  if (status === "COMPLETED") {
    return "text-green-400"
  }

  if (status === "DELAYED") {
    return "text-red-400"
  }

  if (status === "IN_PROGRESS") {
    return "text-yellow-400"
  }

  return "text-gray-400"
}

const ActivityDetails = () => {

  /*
  ========================================================
  GET ID FROM URL
  ========================================================

  Example:

  /activity/1
  /activity/2
  /activity/3
  */

  const { id } = useParams()

  const [activities, setActivities] = useState([])
  const [reports, setReports] = useState([])

  const [activity, setActivity] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


  /*
  ========================================================
  LOAD DATA
  ========================================================
  */

  useEffect(() => {
    loadData()
  }, [id])


  async function loadData() {

    try {

      setLoading(true)
      setError("")


      const activitiesResponse = await fetch(
        `${API_BASE}/activities`
      )

      const activitiesData =
        await activitiesResponse.json()


      if (
        !activitiesResponse.ok ||
        !activitiesData.success
      ) {
        throw new Error(
          activitiesData.message ||
          "Failed to fetch activities"
        )
      }


      const reportsResponse = await fetch(
        `${API_BASE}/field-reports`
      )

      const reportsData =
        await reportsResponse.json()


      if (
        !reportsResponse.ok ||
        !reportsData.success
      ) {
        throw new Error(
          reportsData.message ||
          "Failed to fetch field reports"
        )
      }


      const activityData =
        activitiesData.data || []

      const reportData =
        reportsData.data || []


      setActivities(activityData)
      setReports(reportData)


      console.log(
        "Activity URL ID:",
        id
      )

      console.log(
        "Available activities:",
        activityData
      )


      /*
      Find activity using PostgreSQL ID
      */

      const selectedActivity =
        activityData.find(
          (item) =>
            String(item.id) === String(id)
        )


      if (!selectedActivity) {

        setActivity(null)

        setError(
          `Activity with ID "${id}" was not found.`
        )

        return
      }


      setActivity(selectedActivity)

    } catch (err) {

      console.error(
        "Activity details error:",
        err
      )

      setError(
        err.message ||
        "Failed to load activity details"
      )

    } finally {

      setLoading(false)

    }
  }


  /*
  ========================================================
  LINKED FIELD REPORTS
  ========================================================
  */

  const linkedReports = useMemo(() => {

    if (!activity) {
      return []
    }

    return reports
      .filter(
        (report) =>
          Number(report.activity_id) ===
          Number(activity.id)
      )
      .sort((a, b) => {

        const dateA = new Date(
          a.report_date ||
          a.created_at
        ).getTime()

        const dateB = new Date(
          b.report_date ||
          b.created_at
        ).getTime()

        return dateB - dateA

      })

  }, [activity, reports])


  /*
  ========================================================
  VARIANCE
  ========================================================
  */

  const progressVariance =
    activity
      ? Number(
          (
            Number(
              activity.actual_progress || 0
            ) -
            Number(
              activity.planned_progress || 0
            )
          ).toFixed(2)
        )
      : 0


  /*
  ========================================================
  DELAY
  ========================================================
  */

  const delayDays =
    activity
      ? Number(
          activity.potential_delay_days || 0
        )
      : 0


  /*
  ========================================================
  EXECUTION TIMELINE
  ========================================================
  */

  const executionTimeline = useMemo(() => {

    if (!activity) {
      return []
    }

    const timeline = []


    linkedReports.forEach((report) => {

      timeline.push({
        date: formatDate(
          report.report_date
        ),

        title: "Field Report Received",

        description:
          `${report.report_code} received with ${formatProgress(
            report.reported_progress
          )} reported progress.`,

        status: "Completed"
      })


      if (
        report.matching_status ===
          "AUTO_LINKED" ||
        report.matching_status ===
          "VERIFIED" ||
        report.matching_status ===
          "MANUALLY_LINKED"
      ) {

        timeline.push({
          date: formatDate(
            report.report_date
          ),

          title: "Activity Matched",

          description:
            `${report.report_code} linked to ${activity.activity_code} — ${activity.name}.`,

          status: "Completed"
        })

      }


      if (
        report.matching_status ===
        "VERIFIED"
      ) {

        timeline.push({
          date: formatDate(
            report.verified_at ||
            report.report_date
          ),

          title: "Verification",

          description:
            `Report verified by ${
              report.verified_by ||
              "PLANNER"
            }.`,

          status: "Completed"
        })

      }

    })


    if (activity.actual_start) {

      timeline.push({
        date: formatDate(
          activity.actual_start
        ),

        title: "Execution Started",

        description:
          `Actual execution start recorded for ${activity.activity_code}.`,

        status: "Completed"
      })

    }


    if (activity.actual_finish) {

      timeline.push({
        date: formatDate(
          activity.actual_finish
        ),

        title: "Execution Completed",

        description:
          `${activity.activity_code} reached completion.`,

        status: "Completed"
      })

    }


    if (activity.forecast_finish) {

      timeline.push({
        date: formatDate(
          activity.forecast_finish
        ),

        title: "Schedule State",

        description:
          `Forecast finish is ${formatDate(
            activity.forecast_finish
          )}. Potential delay: ${delayDays} days.`,

        status:
          delayDays > 0
            ? "Pending"
            : "Completed"
      })

    }


    return timeline.sort((a, b) => {

      const dateA =
        new Date(a.date).getTime()

      const dateB =
        new Date(b.date).getTime()

      return dateA - dateB

    })

  }, [
    activity,
    linkedReports,
    delayDays
  ])


  /*
  ========================================================
  AUDIT TRAIL
  ========================================================
  */

  const auditTrail = useMemo(() => {

    if (!activity) {
      return []
    }

    const trail = []


    if (linkedReports.length > 0) {

      const latestReport =
        linkedReports[0]


      trail.push({
        step: "Source",

        value:
          latestReport.report_code,

        description:
          latestReport.source_type ||
          "Field Report"
      })


      trail.push({
        step: "Extracted Data",

        value:
          `${formatProgress(
            latestReport.reported_progress
          )} Progress`,

        description:
          latestReport.description ||
          "Execution progress extracted from field input."
      })


      trail.push({
        step: "Matched Activity",

        value:
          activity.activity_code,

        description:
          activity.name
      })


      const verifiedReport =
        linkedReports.find(
          (report) =>
            report.matching_status ===
            "VERIFIED"
        )


      if (verifiedReport) {

        trail.push({
          step: "Verification",

          value: "Verified",

          description:
            `Planner verification completed by ${
              verifiedReport.verified_by ||
              "PLANNER"
            }.`
        })

      } else {

        trail.push({
          step: "Verification",

          value: "Pending",

          description:
            "No verified field report is currently linked."
        })

      }

    }


    trail.push({
      step: "Schedule Update",

      value: "Updated",

      description:
        `Actual schedule progress is ${formatProgress(
          activity.actual_progress
        )}.`
    })


    return trail

  }, [
    activity,
    linkedReports
  ])


  /*
  ========================================================
  LOADING
  ========================================================
  */

  if (loading) {

    return (
      <div className="pb-10">

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-10 text-center">

          <p className="text-gray-400">
            Loading activity details...
          </p>

        </div>

      </div>
    )
  }


  /*
  ========================================================
  ERROR
  ========================================================
  */

  if (error) {

    return (
      <div className="pb-10">

        <div className="bg-[#151b24] border border-red-500/30 rounded-xl p-6">

          <p className="text-red-400">
            {error}
          </p>


          <button
            type="button"
            onClick={loadData}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            Retry
          </button>

        </div>

      </div>
    )
  }


  /*
  ========================================================
  MAIN UI
  ========================================================
  */

  return (

    <div className="pb-10">

      {/* HEADER */}

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm text-gray-500">
            Activity Details
          </p>


          <h2 className="text-2xl font-semibold text-white mt-1">

            {activity.activity_code}
            {" — "}
            {activity.name}

          </h2>


          <p className="text-gray-400 mt-2">

            {activity.discipline ||
              "Unassigned Discipline"}

            {" / "}

            {activity.description ||
              "No description available"}

          </p>


          <p className="text-xs text-gray-600 mt-2">

            Project:{" "}
            {activity.project_code || "—"}

          </p>

        </div>


        <span
          className={`px-3 py-1 rounded-full bg-[#10151c] ${getStatusClass(
            activity.status
          )} text-sm`}
        >

          {formatStatus(
            activity.status
          )}

        </span>

      </div>


      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">


        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">

          <p className="text-gray-400 text-sm">
            Planned Progress
          </p>

          <p className="text-2xl font-semibold text-white mt-2">

            {formatProgress(
              activity.planned_progress
            )}

          </p>

        </div>


        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">

          <p className="text-gray-400 text-sm">
            Actual Progress
          </p>

          <p className="text-2xl font-semibold text-white mt-2">

            {formatProgress(
              activity.actual_progress
            )}

          </p>

        </div>


        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">

          <p className="text-gray-400 text-sm">
            Variance
          </p>

          <p
            className={`text-2xl font-semibold mt-2 ${
              progressVariance < 0
                ? "text-red-400"
                : "text-green-400"
            }`}
          >

            {progressVariance > 0
              ? "+"
              : ""}

            {progressVariance}%

          </p>

        </div>


        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">

          <p className="text-gray-400 text-sm">
            Risk
          </p>

          <p
            className={`text-2xl font-semibold mt-2 ${getRiskClass(
              activity.risk_level
            )}`}
          >

            {activity.risk_level || "LOW"}

          </p>

        </div>

      </div>


      {/* SCHEDULE */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Schedule Information
        </h3>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">

          <div>

            <p className="text-gray-500 text-xs">
              PLANNED START
            </p>

            <p className="text-gray-300 mt-2">
              {formatDate(
                activity.planned_start
              )}
            </p>

          </div>


          <div>

            <p className="text-gray-500 text-xs">
              PLANNED FINISH
            </p>

            <p className="text-gray-300 mt-2">
              {formatDate(
                activity.planned_finish
              )}
            </p>

          </div>


          <div>

            <p className="text-gray-500 text-xs">
              FORECAST FINISH
            </p>

            <p className="text-gray-300 mt-2">
              {formatDate(
                activity.forecast_finish
              )}
            </p>

          </div>


          <div>

            <p className="text-gray-500 text-xs">
              POTENTIAL DELAY
            </p>

            <p
              className={
                delayDays > 0
                  ? "text-red-400 mt-2"
                  : "text-green-400 mt-2"
              }
            >

              {delayDays} Days

            </p>

          </div>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">

          <div>

            <p className="text-gray-500 text-xs">
              ACTUAL START
            </p>

            <p className="text-gray-300 mt-2">
              {formatDate(
                activity.actual_start
              )}
            </p>

          </div>


          <div>

            <p className="text-gray-500 text-xs">
              ACTUAL FINISH
            </p>

            <p className="text-gray-300 mt-2">
              {formatDate(
                activity.actual_finish
              )}
            </p>

          </div>

        </div>

      </div>


      {/* AI MATCHING */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-lg font-semibold text-white">
              AI Activity Matching
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Field updates linked to this schedule activity
            </p>

          </div>


          <span className="text-xs text-gray-500">
            Live Data
          </span>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {linkedReports.length === 0 ? (

            <div className="md:col-span-3 bg-[#10151c] border border-[#252d38] rounded-lg p-5">

              <p className="text-gray-400 text-sm">
                No field reports are linked to this activity.
              </p>

            </div>

          ) : (

            linkedReports
              .slice(0, 3)
              .map((report) => (

                <div
                  key={report.id}
                  className="bg-[#10151c] border border-[#252d38] rounded-lg p-5"
                >

                  <div className="flex items-center justify-between">

                    <p
                      className={
                        Number(
                          report.match_confidence || 0
                        ) >= 80
                          ? "text-green-400 font-medium"
                          : Number(
                              report.match_confidence || 0
                            ) >= 50
                          ? "text-yellow-400 font-medium"
                          : "text-red-400 font-medium"
                      }
                    >

                      {report.matching_status ||
                        "Unknown"}

                    </p>


                    <span className="text-sm text-gray-300">

                      {Number(
                        report.match_confidence || 0
                      )}%

                    </span>

                  </div>


                  <p className="text-white text-sm mt-4">
                    {report.report_code}
                  </p>


                  <p className="text-gray-500 text-xs mt-2">

                    {formatProgress(
                      report.reported_progress
                    )}

                    {" · "}

                    {formatDate(
                      report.report_date
                    )}

                  </p>

                </div>

              ))

          )}

        </div>

      </div>


      {/* TIMELINE */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Execution Timeline
        </h3>


        <p className="text-gray-400 text-sm mt-1">
          Chronological view of field execution reconciliation
        </p>


        <div className="mt-6 space-y-6">

          {executionTimeline.length === 0 ? (

            <p className="text-gray-500 text-sm">
              No execution events available.
            </p>

          ) : (

            executionTimeline.map(
              (item, index) => (

                <div
                  key={`${item.title}-${index}`}
                  className="flex gap-4"
                >

                  <div className="flex flex-col items-center">

                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === "Completed"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />

                    {index !==
                      executionTimeline.length - 1 && (

                      <div className="w-px h-full min-h-12 bg-[#252d38] mt-2" />

                    )}

                  </div>


                  <div className="pb-2">

                    <div className="flex items-center gap-3">

                      <p className="text-white font-medium">
                        {item.title}
                      </p>

                      <span
                        className={
                          item.status === "Completed"
                            ? "text-green-400 text-xs"
                            : "text-yellow-400 text-xs"
                        }
                      >
                        {item.status}
                      </span>

                    </div>


                    <p className="text-xs text-gray-500 mt-1">
                      {item.date}
                    </p>


                    <p className="text-sm text-gray-400 mt-2">
                      {item.description}
                    </p>

                  </div>

                </div>

              )
            )

          )}

        </div>

      </div>


      {/* AUDIT TRAIL */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Audit Trail
        </h3>


        <p className="text-gray-400 text-sm mt-1">
          Traceability from source field information to schedule update
        </p>


        <div className="mt-6 overflow-x-auto">

          <div className="min-w-[700px] flex items-stretch">

            {auditTrail.map(
              (item, index) => (

                <div
                  key={`${item.step}-${index}`}
                  className="flex-1 flex items-center"
                >

                  <div className="flex-1 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                    <p className="text-xs text-gray-500">

                      STEP{" "}
                      {String(
                        index + 1
                      ).padStart(2, "0")}

                    </p>


                    <p className="text-sm text-blue-400 mt-2">
                      {item.step}
                    </p>


                    <p className="text-white font-medium mt-2">
                      {item.value}
                    </p>


                    <p className="text-xs text-gray-500 mt-1">
                      {item.description}
                    </p>

                  </div>


                  {index !==
                    auditTrail.length - 1 && (

                    <span className="px-2 text-gray-600">
                      →
                    </span>

                  )}

                </div>

              )
            )}

          </div>

        </div>

      </div>


      {/* LINKED REPORTS */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Linked Field Reports
        </h3>


        <div className="mt-5 space-y-3">

          {linkedReports.length === 0 ? (

            <p className="text-gray-500 text-sm">
              No field reports linked to this activity.
            </p>

          ) : (

            linkedReports.map(
              (report) => (

                <div
                  key={report.id}
                  className="flex items-center justify-between gap-4 bg-[#10151c] rounded-lg p-4"
                >

                  <div>

                    <p className="text-white font-medium">
                      {report.report_code}
                    </p>


                    <p className="text-xs text-gray-500 mt-1">

                      {formatDate(
                        report.report_date
                      )}

                      {" · "}

                      {report.source_type ||
                        "Field Report"}

                    </p>

                  </div>


                  <span className="text-gray-300">

                    {formatProgress(
                      report.reported_progress
                    )}

                  </span>


                  <span className="text-gray-400">

                    {Number(
                      report.match_confidence || 0
                    )}%

                  </span>


                  <span
                    className={
                      report.matching_status ===
                        "VERIFIED" ||
                      report.matching_status ===
                        "AUTO_LINKED"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  >

                    {report.matching_status ||
                      "Unknown"}

                  </span>

                </div>

              )
            )

          )}

        </div>

      </div>


      {/* SCHEDULE IMPACT */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Schedule Impact
        </h3>


        <div className="mt-5 bg-[#10151c] rounded-lg p-5">

          <p className="text-gray-400 text-sm">
            Potential Delay
          </p>


          <p
            className={
              delayDays > 0
                ? "text-2xl font-semibold mt-2 text-red-400"
                : "text-2xl font-semibold mt-2 text-green-400"
            }
          >

            {delayDays} Days

          </p>


          <p className="text-gray-500 text-sm mt-2">

            Forecast finish:{" "}

            {formatDate(
              activity.forecast_finish
            )}

          </p>

        </div>

      </div>


      {/* RECONCILIATION FACTORS */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Reconciliation Factors
        </h3>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">

          <div className="bg-[#10151c] rounded-lg p-4">

            <p className="text-gray-500 text-xs">
              SCHEDULE CONTEXT
            </p>

            <p className="text-gray-300 text-sm mt-2">

              Activity code, planned dates,
              forecast finish and execution state.

            </p>

          </div>


          <div className="bg-[#10151c] rounded-lg p-4">

            <p className="text-gray-500 text-xs">
              FIELD CONTEXT
            </p>

            <p className="text-gray-300 text-sm mt-2">

              Progress, execution description,
              report date and source type.

            </p>

          </div>


          <div className="bg-[#10151c] rounded-lg p-4">

            <p className="text-gray-500 text-xs">
              EVIDENCE
            </p>

            <p className="text-gray-300 text-sm mt-2">

              Linked field reports and their
              matching / verification state.

            </p>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ActivityDetails