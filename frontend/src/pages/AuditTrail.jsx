import { useState } from "react"

const auditRecords = [
  {
    id: "AT-1023",
    date: "16 Sep 2026",
    project: "OIL-001",
    source: "FR-1023",
    extracted: "65% Reinforcement Progress",
    activity: "A103",
    verification: "Verified",
    scheduleUpdate: "Pending",
  },
  {
    id: "AT-1031",
    date: "16 Sep 2026",
    project: "OIL-001",
    source: "FR-1031",
    extracted: "65% Foundation Progress",
    activity: "A103",
    verification: "Needs Review",
    scheduleUpdate: "Not Updated",
  },
  {
    id: "AT-1042",
    date: "15 Sep 2026",
    project: "OIL-001",
    source: "FR-1042",
    extracted: "48% Piping Progress",
    activity: "A221",
    verification: "Verified",
    scheduleUpdate: "Updated",
  },
]

const AuditTrail = () => {
  const [project, setProject] = useState("All")
  const [activity, setActivity] = useState("")
  const [verification, setVerification] = useState("All")

  const filteredRecords = auditRecords.filter((record) => {
    const matchesProject =
      project === "All" || record.project === project

    const matchesActivity =
      !activity ||
      record.activity.toLowerCase().includes(activity.toLowerCase()) ||
      record.source.toLowerCase().includes(activity.toLowerCase())

    const matchesVerification =
      verification === "All" ||
      record.verification === verification

    return (
      matchesProject &&
      matchesActivity &&
      matchesVerification
    )
  })

  return (
    <div className="pb-10">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Audit Trail
        </h2>

        <p className="text-gray-400 mt-2">
          Complete traceability of field execution reconciliation
        </p>
      </div>

      {/* Filters */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          AUDIT FILTERS
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-gray-300 outline-none"
          >
            <option value="All">All Projects</option>
            <option value="OIL-001">
              OIL-001 — Gas Processing Plant
            </option>
          </select>

          <input
            type="text"
            placeholder="Search Activity ID or Report ID..."
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
          />

          <select
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-gray-300 outline-none"
          >
            <option value="All">All Verification Status</option>
            <option value="Verified">Verified</option>
            <option value="Needs Review">Needs Review</option>
          </select>

        </div>

      </div>

      {/* Pipeline */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div>
          <h3 className="text-lg font-semibold text-white">
            Reconciliation Audit Flow
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            Every execution update follows a traceable processing path.
          </p>
        </div>

        <div className="mt-6 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

          {[
            "Source",
            "Extracted Data",
            "Matched Activity",
            "Verification",
            "Schedule Update",
          ].map((step, index, array) => (
            <div
              key={step}
              className="flex items-center gap-3 flex-1"
            >

              <div className="flex-1 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                <p className="text-xs text-gray-500">
                  STEP {String(index + 1).padStart(2, "0")}
                </p>

                <p className="text-blue-400 text-sm font-medium mt-2">
                  {step}
                </p>

              </div>

              {index !== array.length - 1 && (
                <span className="text-gray-600 text-xl hidden lg:block">
                  →
                </span>
              )}

            </div>
          ))}

        </div>

      </div>

      {/* Audit Records */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-lg font-semibold text-white">
              Audit Records
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Source-to-schedule traceability
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {filteredRecords.length} Records
          </span>

        </div>

        <div className="mt-6 space-y-4">

          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-[#10151c] border border-[#252d38] rounded-xl p-5"
            >

              {/* Record Header */}
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-white font-medium">
                    {record.id}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {record.date} · {record.project}
                  </p>
                </div>

                <span
                  className={
                    record.verification === "Verified"
                      ? "text-green-400 text-sm"
                      : "text-yellow-400 text-sm"
                  }
                >
                  {record.verification}
                </span>

              </div>

              {/* Audit Chain */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">

                <div className="bg-[#151b24] rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    SOURCE
                  </p>

                  <p className="text-white text-sm mt-2">
                    {record.source}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Field Report
                  </p>
                </div>

                <div className="bg-[#151b24] rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    EXTRACTED DATA
                  </p>

                  <p className="text-white text-sm mt-2">
                    {record.extracted}
                  </p>
                </div>

                <div className="bg-[#151b24] rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    MATCHED ACTIVITY
                  </p>

                  <p className="text-blue-400 text-sm font-medium mt-2">
                    {record.activity}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Schedule Activity
                  </p>
                </div>

                <div className="bg-[#151b24] rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    VERIFICATION
                  </p>

                  <p
                    className={`text-sm font-medium mt-2 ${
                      record.verification === "Verified"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {record.verification}
                  </p>
                </div>

                <div className="bg-[#151b24] rounded-lg p-4">
                  <p className="text-xs text-gray-500">
                    SCHEDULE UPDATE
                  </p>

                  <p
                    className={`text-sm font-medium mt-2 ${
                      record.scheduleUpdate === "Updated"
                        ? "text-green-400"
                        : "text-gray-400"
                    }`}
                  >
                    {record.scheduleUpdate}
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>

        {filteredRecords.length === 0 && (
          <div className="py-10 text-center">

            <p className="text-gray-400 text-sm">
              No audit records found
            </p>

            <p className="text-gray-600 text-xs mt-1">
              Try changing the filters.
            </p>

          </div>
        )}

      </div>

      {/* Note */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          AUDITABILITY
        </p>

        <p className="text-sm text-gray-300 mt-2">
          The audit trail preserves the relationship between the original
          field source, extracted execution information, matched schedule
          activity, verification decision and resulting schedule update.
        </p>

      </div>

    </div>
  )
}

export default AuditTrail