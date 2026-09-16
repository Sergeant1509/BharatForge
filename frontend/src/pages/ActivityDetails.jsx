const fieldReports = [
  {
    id: "FR-1023",
    date: "14 Sep 2026",
    text: "Reinforcement work is 65% complete.",
    confidence: "94%",
    status: "Matched",
  },
  {
    id: "FR-1031",
    date: "14 Sep 2026",
    text: "Steel shortage has slowed the work.",
    confidence: "81%",
    status: "Linked",
  },
]

const ActivityDetails = () => {
  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Activity A103
          </p>

          <h2 className="text-2xl font-semibold text-white mt-1">
            Compressor Foundation
          </h2>

          <p className="text-gray-400 mt-2">
            Mechanical / Foundation
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-sm">
          Delayed
        </span>
      </div>

      {/* Execution Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {[
          ["Planned Progress", "80%", "text-blue-400"],
          ["Actual Progress", "65%", "text-green-400"],
          ["Variance", "-15%", "text-red-400"],
          ["Risk", "HIGH", "text-red-400"],
        ].map(([label, value, color]) => (
          <div
            key={label}
            className="bg-[#151b24] border border-[#252d38] rounded-xl p-5"
          >
            <p className="text-gray-400 text-sm">
              {label}
            </p>

            <p className={`text-2xl font-semibold mt-2 ${color}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Schedule Information */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">
          Schedule Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
          <div>
            <p className="text-gray-400 text-sm">
              Planned Start
            </p>
            <p className="text-white mt-1">
              01 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Planned Finish
            </p>
            <p className="text-white mt-1">
              15 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Forecast Finish
            </p>
            <p className="text-white mt-1">
              19 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Criticality
            </p>
            <p className="text-red-400 mt-1">
              Critical
            </p>
          </div>
        </div>
      </div>

      {/* AI Reconciliation */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              AI Execution Reconciliation
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Field information mapped against the schedule activity
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
            Matched
          </span>
        </div>

        <div className="mt-6 bg-[#10151c] border border-[#252d38] rounded-lg p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">
                FIELD REPORT
              </p>

              <p className="text-white font-medium mt-1">
                FR-1023
              </p>
            </div>

            <span className="text-green-400 text-sm font-medium">
              94% confidence
            </span>
          </div>

          <p className="text-gray-300 mt-4">
            "Reinforcement work is 65% complete."
          </p>

          <div className="mt-5 pt-4 border-t border-[#252d38]">
            <p className="text-xs text-gray-500">
              MATCHED SCHEDULE ACTIVITY
            </p>

            <div className="flex items-center justify-between mt-2">
              <div>
                <p className="text-white font-medium">
                  A103 — Compressor Foundation
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  Mechanical / Foundation
                </p>
              </div>

              <span className="text-green-400 text-sm">
                High confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Reports */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">
          Linked Field Reports
        </h3>

        <div className="mt-5 space-y-3">
          {fieldReports.map((report) => (
            <div
              key={report.id}
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {report.id}
                  </p>

                  <p className="text-gray-500 text-xs mt-1">
                    {report.date}
                  </p>
                </div>

                <span className="text-green-400 text-sm">
                  {report.status}
                </span>
              </div>

              <p className="text-gray-300 text-sm mt-4">
                {report.text}
              </p>

              <p className="text-gray-500 text-xs mt-3">
                AI confidence: {report.confidence}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Supporting Evidence
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Optional evidence associated with this execution update
            </p>
          </div>

          <span className="text-gray-500 text-sm">
            Optional
          </span>
        </div>

        <div className="mt-5 border border-dashed border-[#3a4655] rounded-lg p-6 text-center">
          <p className="text-gray-400 text-sm">
            No supporting photo or document uploaded
          </p>

          <p className="text-gray-600 text-xs mt-2">
            Evidence can improve confidence but is not required
          </p>
        </div>
      </div>

      {/* Schedule Impact */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">
          Schedule Impact
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-5">
          <div>
            <p className="text-gray-400 text-sm">
              Planned Finish
            </p>

            <p className="text-white mt-1">
              15 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Current Forecast
            </p>

            <p className="text-white mt-1">
              19 Sep 2026
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">
              Potential Delay
            </p>

            <p className="text-red-400 mt-1">
              4 Days
            </p>
          </div>
        </div>

        <div className="mt-6 bg-red-500/5 border border-red-500/10 rounded-lg p-4">
          <p className="text-sm text-red-300">
            Execution is currently 15% behind planned progress.
            Material shortage has also been reported for this activity.
          </p>
        </div>
      </div>

      {/* AI Factors */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white">
          Reconciliation Factors
        </h3>

        <div className="mt-5 space-y-3">
          {[
            "Field report progress aligns with the current actual progress.",
            "The report is strongly matched to activity A103.",
            "Material shortage is reported as a possible execution constraint.",
            "Current progress is below the planned schedule.",
          ].map((factor) => (
            <div
              key={factor}
              className="flex gap-3 bg-[#10151c] rounded-lg p-4"
            >
              <span className="text-green-400">
                •
              </span>

              <p className="text-gray-300 text-sm">
                {factor}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default ActivityDetails