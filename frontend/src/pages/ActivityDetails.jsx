import { useState } from "react"

const executionTimeline = [
  {
    date: "16 Sep 2026",
    title: "Field Report Received",
    description:
      "Daily field report FR-1023 received for compressor foundation execution.",
    status: "Completed",
  },
  {
    date: "16 Sep 2026",
    title: "Data Extracted",
    description:
      "Execution update, progress and field information extracted from the report.",
    status: "Completed",
  },
  {
    date: "16 Sep 2026",
    title: "Activity Matched",
    description:
      "Field update matched with L6 activity A103 — Compressor Foundation.",
    status: "Completed",
  },
  {
    date: "16 Sep 2026",
    title: "Verification",
    description:
      "Execution update reviewed and accepted for schedule reconciliation.",
    status: "Completed",
  },
  {
    date: "16 Sep 2026",
    title: "Schedule Update",
    description:
      "Verified execution progress is ready to update the schedule record.",
    status: "Pending",
  },
]

const auditTrail = [
  {
    step: "Source",
    value: "FR-1023",
    description: "Daily Field Report",
  },
  {
    step: "Extracted Data",
    value: "65% Progress",
    description: "Reinforcement work is 65% complete.",
  },
  {
    step: "Matched Activity",
    value: "A103",
    description: "Compressor Foundation",
  },
  {
    step: "Verification",
    value: "Verified",
    description: "Planner verification completed.",
  },
  {
    step: "Schedule Update",
    value: "Pending",
    description: "Awaiting schedule synchronization.",
  },
]

const matchingCases = [
  {
    id: "FR-1023",
    activity: "Compressor Foundation",
    activityId: "A103",
    confidence: "94%",
    category: "High Confidence",
  },
  {
    id: "FR-1031",
    activity: "Compressor Foundation",
    activityId: "A103",
    confidence: "81%",
    category: "Needs Review",
  },
  {
    id: "FR-1062",
    activity: "Unknown Activity",
    activityId: "—",
    confidence: "32%",
    category: "Unmatched",
  },
]

const ActivityDetails = () => {
  const [project, setProject] = useState("OIL-001")
  const [discipline, setDiscipline] = useState("Civil")
  const [status, setStatus] = useState("Delayed")
  const [risk, setRisk] = useState("HIGH")
  const [date, setDate] = useState("2026-09-16")

  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm text-gray-500">
            Activity Details
          </p>

          <h2 className="text-2xl font-semibold text-white mt-1">
            A103 — Compressor Foundation
          </h2>

          <p className="text-gray-400 mt-2">
            Civil / Foundation
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm">
          Delayed
        </span>

      </div>

      {/* Common Filters */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <div>
          <p className="text-xs text-gray-500">
            FILTERS
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Filter execution and reconciliation data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-5">

          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-3 py-2.5 text-gray-300 outline-none"
          >
            <option value="OIL-001">OIL-001</option>
          </select>

          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-3 py-2.5 text-gray-300 outline-none"
          >
            <option>Civil</option>
            <option>Piping</option>
            <option>Electrical</option>
            <option>Instrumentation</option>
            <option>HSE</option>
            <option>Mechanical</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-3 py-2.5 text-gray-300 outline-none"
          >
            <option>Delayed</option>
            <option>On Track</option>
            <option>Completed</option>
            <option>Not Started</option>
          </select>

          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-3 py-2.5 text-gray-300 outline-none"
          >
            <option>HIGH</option>
            <option>MEDIUM</option>
            <option>LOW</option>
          </select>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-3 py-2.5 text-gray-300 outline-none"
          />

        </div>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Planned Progress
          </p>

          <p className="text-2xl font-semibold text-white mt-2">
            80%
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Actual Progress
          </p>

          <p className="text-2xl font-semibold text-white mt-2">
            65%
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Variance
          </p>

          <p className="text-2xl font-semibold text-red-400 mt-2">
            -15%
          </p>
        </div>

        <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-5">
          <p className="text-gray-400 text-sm">
            Risk
          </p>

          <p className="text-2xl font-semibold text-red-400 mt-2">
            HIGH
          </p>
        </div>

      </div>

      {/* Schedule Information */}
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
              01 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">
              PLANNED FINISH
            </p>

            <p className="text-gray-300 mt-2">
              15 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">
              FORECAST FINISH
            </p>

            <p className="text-gray-300 mt-2">
              19 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">
              CRITICALITY
            </p>

            <p className="text-red-400 mt-2">
              Critical
            </p>
          </div>

        </div>

      </div>

      {/* AI Activity Matching */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-lg font-semibold text-white">
              AI Activity Matching
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Field updates mapped against schedule activities
            </p>
          </div>

          <span className="text-xs text-gray-500">
            UI Placeholder
          </span>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* High Confidence */}
          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-5">

            <div className="flex items-center justify-between">

              <p className="text-green-400 font-medium">
                High Confidence
              </p>

              <span className="text-green-400 text-sm">
                94%
              </span>

            </div>

            <p className="text-white text-sm mt-4">
              FR-1023 → A103
            </p>

            <p className="text-gray-500 text-xs mt-2">
              Compressor Foundation
            </p>

          </div>

          {/* Needs Review */}
          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-5">

            <div className="flex items-center justify-between">

              <p className="text-yellow-400 font-medium">
                Needs Review
              </p>

              <span className="text-yellow-400 text-sm">
                81%
              </span>

            </div>

            <p className="text-white text-sm mt-4">
              FR-1031 → A103
            </p>

            <p className="text-gray-500 text-xs mt-2">
              Compressor Foundation
            </p>

          </div>

          {/* Unmatched */}
          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-5">

            <div className="flex items-center justify-between">

              <p className="text-red-400 font-medium">
                Unmatched
              </p>

              <span className="text-red-400 text-sm">
                32%
              </span>

            </div>

            <p className="text-white text-sm mt-4">
              FR-1062 → —
            </p>

            <p className="text-gray-500 text-xs mt-2">
              Activity could not be identified
            </p>

          </div>

        </div>

      </div>

      {/* Execution Timeline */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Execution Timeline
        </h3>

        <p className="text-gray-400 text-sm mt-1">
          Chronological view of field execution reconciliation
        </p>

        <div className="mt-6 space-y-6">

          {executionTimeline.map((item, index) => (
            <div
              key={item.title}
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

                {index !== executionTimeline.length - 1 && (
                  <div className="w-px h-full min-h-12 bg-[#252d38] mt-2" />
                )}

              </div>

              <div className="pb-2">

                <div className="flex items-center gap-3">

                  <p className="text-white font-medium">
                    {item.title}
                  </p>

                  <span
                    className={`text-xs ${
                      item.status === "Completed"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
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
          ))}

        </div>

      </div>

      {/* Audit Trail */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Audit Trail
        </h3>

        <p className="text-gray-400 text-sm mt-1">
          Traceability from source field information to schedule update
        </p>

        <div className="mt-6 overflow-x-auto">

          <div className="min-w-200 flex items-stretch">

            {auditTrail.map((item, index) => (
              <div
                key={item.step}
                className="flex-1 flex items-center"
              >

                <div className="flex-1 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                  <p className="text-xs text-gray-500">
                    STEP {String(index + 1).padStart(2, "0")}
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

                {index !== auditTrail.length - 1 && (
                  <span className="px-2 text-gray-600">
                    →
                  </span>
                )}

              </div>
            ))}

          </div>

        </div>

      </div>

      {/* Existing AI Reconciliation */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          AI Execution Reconciliation
        </h3>

        <div className="mt-5 bg-[#10151c] border border-[#252d38] rounded-lg p-5">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-gray-500 text-xs">
                FIELD REPORT
              </p>

              <p className="text-white font-medium mt-2">
                FR-1023
              </p>

            </div>

            <span className="text-green-400 text-sm">
              94% confidence
            </span>

          </div>

          <p className="text-gray-300 text-sm mt-5">
            “Reinforcement work is 65% complete.”
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">

            <div>
              <p className="text-xs text-gray-500">
                MATCHED ACTIVITY
              </p>

              <p className="text-white text-sm mt-1">
                A103
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                EXTRACTED PROGRESS
              </p>

              <p className="text-white text-sm mt-1">
                65%
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                SOURCE
              </p>

              <p className="text-white text-sm mt-1">
                Daily Report
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Linked Reports */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Linked Field Reports
        </h3>

        <div className="mt-5 space-y-3">

          {[
            ["FR-1023", "65%", "94%", "Processed"],
            ["FR-1031", "65%", "81%", "Needs Review"],
          ].map(([id, progress, confidence, status]) => (
            <div
              key={id}
              className="flex items-center justify-between bg-[#10151c] rounded-lg p-4"
            >

              <div>

                <p className="text-white font-medium">
                  {id}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Compressor Foundation
                </p>

              </div>

              <span className="text-gray-300">
                {progress}
              </span>

              <span className="text-gray-400">
                {confidence}
              </span>

              <span
                className={
                  status === "Processed"
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {status}
              </span>

            </div>
          ))}

        </div>

      </div>

      {/* Schedule Impact */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Schedule Impact
        </h3>

        <div className="mt-5 bg-[#10151c] rounded-lg p-5">

          <p className="text-gray-400 text-sm">
            Potential Delay
          </p>

          <p className="text-2xl font-semibold text-red-400 mt-2">
            4 Days
          </p>

          <p className="text-gray-500 text-sm mt-2">
            Forecast finish: 19 Sep 2026
          </p>

        </div>

      </div>

      {/* Reconciliation Factors */}
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
              WBS, activity relationships and planned dates
            </p>
          </div>

          <div className="bg-[#10151c] rounded-lg p-4">
            <p className="text-gray-500 text-xs">
              FIELD CONTEXT
            </p>

            <p className="text-gray-300 text-sm mt-2">
              Progress, execution description and report date
            </p>
          </div>

          <div className="bg-[#10151c] rounded-lg p-4">
            <p className="text-gray-500 text-xs">
              EVIDENCE
            </p>

            <p className="text-gray-300 text-sm mt-2">
              Supporting documents and site evidence
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default ActivityDetails