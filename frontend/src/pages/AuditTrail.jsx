import { useEffect, useMemo, useState } from "react"

const API_BASE = "http://localhost:5000/api"


/*
============================================================
FORMAT DATE
============================================================
*/

function formatDate(date) {

  if (!date) {
    return "—"
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )
}


/*
============================================================
FORMAT ACTION
============================================================
*/

function formatAction(action) {

  if (!action) {
    return "Unknown"
  }

  const actions = {
    AUTO_LINKED: "Auto Linked",
    MANUALLY_LINKED: "Manually Linked",
    VERIFIED: "Verified",
    CHANGE_MATCH: "Match Changed",
    REJECTED: "Rejected",
  }

  return actions[action] || action
}


/*
============================================================
VERIFICATION STATUS
============================================================
*/

function getVerificationStatus(record) {

  if (
    record.action === "VERIFIED" ||
    record.action === "AUTO_LINKED" ||
    record.action === "MANUALLY_LINKED"
  ) {
    return "Verified"
  }

  if (
    record.action === "CHANGE_MATCH"
  ) {
    return "Match Changed"
  }

  if (
    record.action === "REJECTED"
  ) {
    return "Rejected"
  }

  return "Recorded"
}


/*
============================================================
VERIFICATION CLASS
============================================================
*/

function getVerificationClass(status) {

  if (
    status === "Verified" ||
    status === "Match Changed"
  ) {
    return "text-green-400"
  }

  if (status === "Rejected") {
    return "text-red-400"
  }

  return "text-yellow-400"
}


/*
============================================================
SCHEDULE UPDATE
============================================================
*/

function getScheduleUpdate(record) {

  if (
    record.action === "AUTO_LINKED" ||
    record.action === "VERIFIED" ||
    record.action === "MANUALLY_LINKED" ||
    record.action === "CHANGE_MATCH"
  ) {
    return "Updated"
  }

  if (
    record.action === "REJECTED"
  ) {
    return "Not Updated"
  }

  return "Recorded"
}


/*
============================================================
AUDIT TRAIL
============================================================
*/

const AuditTrail = () => {

  const [project, setProject] = useState("All")

  const [activity, setActivity] = useState("")

  const [verification, setVerification] =
    useState("All")

  const [auditRecords, setAuditRecords] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")


  /*
  ============================================================
  LOAD AUDIT RECORDS
  ============================================================
  */

  useEffect(() => {

    loadAuditTrail()

  }, [])


  async function loadAuditTrail() {

    try {

      setLoading(true)

      setError("")


      const response = await fetch(
        `${API_BASE}/audit-trail`
      )


      const result =
        await response.json()


      if (
        !response.ok ||
        !result.success
      ) {

        throw new Error(
          result.message ||
          "Failed to load audit trail"
        )

      }


      setAuditRecords(
        result.data || []
      )

    } catch (err) {

      console.error(
        "Audit trail loading error:",
        err
      )

      setError(
        err.message ||
        "Failed to load audit trail"
      )

    } finally {

      setLoading(false)

    }

  }


  /*
  ============================================================
  PROJECT OPTIONS
  ============================================================
  */

  const projects = useMemo(() => {

    const uniqueProjects =
      auditRecords.filter(
        (record) =>
          record.project_code
      )

    const map = new Map()

    uniqueProjects.forEach(
      (record) => {

        map.set(
          record.project_code,
          record.project_name ||
          record.project_code
        )

      }
    )

    return Array.from(
      map.entries()
    )

  }, [auditRecords])


  /*
  ============================================================
  FILTER RECORDS
  ============================================================
  */

  const filteredRecords =
    auditRecords.filter(
      (record) => {

        const matchesProject =
          project === "All" ||
          record.project_code === project


        const searchValue =
          activity
            .toLowerCase()
            .trim()


        const matchesActivity =
          !searchValue ||
          String(
            record.activity_code ||
            ""
          )
            .toLowerCase()
            .includes(searchValue) ||

          String(
            record.report_code ||
            ""
          )
            .toLowerCase()
            .includes(searchValue) ||

          String(
            record.activity_name ||
            ""
          )
            .toLowerCase()
            .includes(searchValue)


        const status =
          getVerificationStatus(
            record
          )


        const matchesVerification =
          verification === "All" ||
          status === verification


        return (
          matchesProject &&
          matchesActivity &&
          matchesVerification
        )

      }
    )


  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {

    return (

      <div className="pb-10">

        <div>
          <h2 className="text-2xl font-semibold text-white">
            Audit Trail
          </h2>

          <p className="text-gray-400 mt-2">
            Complete traceability of field execution reconciliation
          </p>
        </div>


        <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-10 text-center">

          <p className="text-gray-400">
            Loading audit records...
          </p>

        </div>

      </div>

    )

  }


  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error) {

    return (

      <div className="pb-10">

        <div>

          <h2 className="text-2xl font-semibold text-white">
            Audit Trail
          </h2>

          <p className="text-gray-400 mt-2">
            Complete traceability of field execution reconciliation
          </p>

        </div>


        <div className="mt-8 bg-[#151b24] border border-red-500/30 rounded-xl p-6">

          <p className="text-red-400">
            {error}
          </p>


          <button
            type="button"
            onClick={loadAuditTrail}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Retry
          </button>

        </div>

      </div>

    )

  }


  /*
  ============================================================
  MAIN UI
  ============================================================
  */

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


      {/* ====================================================
          FILTERS
      ==================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          AUDIT FILTERS
        </p>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">


          {/* Project */}

          <select
            value={project}
            onChange={(e) =>
              setProject(e.target.value)
            }
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-gray-300 outline-none"
          >

            <option value="All">
              All Projects
            </option>


            {projects.map(
              ([code, name]) => (

                <option
                  key={code}
                  value={code}
                >
                  {code} — {name}
                </option>

              )
            )}

          </select>


          {/* Activity Search */}

          <input
            type="text"
            placeholder="Search Activity ID or Report ID..."
            value={activity}
            onChange={(e) =>
              setActivity(e.target.value)
            }
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none"
          />


          {/* Verification */}

          <select
            value={verification}
            onChange={(e) =>
              setVerification(e.target.value)
            }
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-gray-300 outline-none"
          >

            <option value="All">
              All Verification Status
            </option>

            <option value="Verified">
              Verified
            </option>

            <option value="Match Changed">
              Match Changed
            </option>

            <option value="Rejected">
              Rejected
            </option>

          </select>

        </div>

      </div>


      {/* ====================================================
          RECONCILIATION PIPELINE
      ==================================================== */}

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
          ].map(
            (step, index, array) => (

              <div
                key={step}
                className="flex items-center gap-3 flex-1"
              >

                <div className="flex-1 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                  <p className="text-xs text-gray-500">
                    STEP{" "}
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </p>

                  <p className="text-blue-400 text-sm font-medium mt-2">
                    {step}
                  </p>

                </div>


                {index !==
                  array.length - 1 && (

                  <span className="text-gray-600 text-xl hidden lg:block">
                    →
                  </span>

                )}

              </div>

            )
          )}

        </div>

      </div>


      {/* ====================================================
          AUDIT RECORDS
      ==================================================== */}

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


          {filteredRecords.map(
            (record) => {

              const verificationStatus =
                getVerificationStatus(
                  record
                )

              const scheduleUpdate =
                getScheduleUpdate(
                  record
                )


              return (

                <div
                  key={record.id}
                  className="bg-[#10151c] border border-[#252d38] rounded-xl p-5"
                >


                  {/* Record Header */}

                  <div className="flex items-start justify-between">


                    <div>

                      <p className="text-white font-medium">

                        AT-
                        {String(
                          record.id
                        ).padStart(
                          4,
                          "0"
                        )}

                      </p>


                      <p className="text-xs text-gray-500 mt-1">

                        {formatDate(
                          record.performed_at
                        )}

                        {" · "}

                        {record.project_code ||
                          "Unknown Project"}

                      </p>

                    </div>


                    <span
                      className={`${getVerificationClass(
                        verificationStatus
                      )} text-sm`}
                    >
                      {verificationStatus}
                    </span>


                  </div>


                  {/* Audit Chain */}

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-3">


                    {/* SOURCE */}

                    <div className="bg-[#151b24] rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        SOURCE
                      </p>


                      <p className="text-white text-sm mt-2">

                        {record.report_code ||
                          "System Event"}

                      </p>


                      <p className="text-xs text-gray-500 mt-1">

                        {record.source_type ||
                          "Field Report"}

                      </p>

                    </div>


                    {/* EXTRACTED DATA */}

                    <div className="bg-[#151b24] rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        EXTRACTED DATA
                      </p>


                      <p className="text-white text-sm mt-2">

                        {record.report_description ||
                          (
                            record.new_progress !== null &&
                            record.new_progress !== undefined
                              ? `${record.new_progress}% Progress`
                              : "Execution update"
                          )}

                      </p>


                      {record.reported_progress !== null &&
                        record.reported_progress !==
                          undefined && (

                        <p className="text-xs text-gray-500 mt-2">

                          Reported:
                          {" "}
                          {record.reported_progress}%

                        </p>

                      )}

                    </div>


                    {/* MATCHED ACTIVITY */}

                    <div className="bg-[#151b24] rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        MATCHED ACTIVITY
                      </p>


                      <p className="text-blue-400 text-sm font-medium mt-2">

                        {record.activity_code ||
                          (
                            record.new_activity_id
                              ? `Activity #${record.new_activity_id}`
                              : "No Activity"
                          )}

                      </p>


                      <p className="text-xs text-gray-500 mt-1">

                        {record.activity_name ||
                          "Schedule Activity"}

                      </p>

                    </div>


                    {/* VERIFICATION */}

                    <div className="bg-[#151b24] rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        VERIFICATION
                      </p>


                      <p
                        className={`text-sm font-medium mt-2 ${getVerificationClass(
                          verificationStatus
                        )}`}
                      >
                        {formatAction(
                          record.action
                        )}
                      </p>


                      <p className="text-xs text-gray-500 mt-1">

                        {record.performed_by ||
                          "System"}

                      </p>

                    </div>


                    {/* SCHEDULE UPDATE */}

                    <div className="bg-[#151b24] rounded-lg p-4">

                      <p className="text-xs text-gray-500">
                        SCHEDULE UPDATE
                      </p>


                      <p
                        className={`text-sm font-medium mt-2 ${
                          scheduleUpdate ===
                          "Updated"
                            ? "text-green-400"
                            : scheduleUpdate ===
                              "Not Updated"
                            ? "text-gray-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {scheduleUpdate}
                      </p>


                      {record.previous_progress !==
                        null &&
                        record.previous_progress !==
                          undefined && (

                        <p className="text-xs text-gray-500 mt-1">

                          {record.previous_progress}%
                          {" → "}
                          {record.new_progress ?? "—"}%

                        </p>

                      )}

                    </div>


                  </div>


                </div>

              )

            }
          )}


        </div>


        {/* Empty State */}

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


      {/* ====================================================
          AUDITABILITY NOTE
      ==================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          AUDITABILITY
        </p>

        <p className="text-sm text-gray-300 mt-2">

          The audit trail preserves the relationship
          between the original field source, extracted
          execution information, matched schedule activity,
          verification decision and resulting schedule update.

        </p>

      </div>


    </div>

  )
}

export default AuditTrail