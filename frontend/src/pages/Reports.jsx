import { useEffect, useState } from "react"
import {
  getFieldReports,
  createFieldReport,
  getProjects,
  getActivities,
} from "../services/api"

const sourceTypes = [
  "Daily Report",
  "Spreadsheet",
  "Manual Field Update",
]

const disciplines = [
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

  const monthName = new Date(
    `${year}-${month}-01`
  ).toLocaleString("en-US", {
    month: "short",
  })

  return `${day} ${monthName} ${year}`
}

function formatProgress(value) {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  return `${Number(value)}%`
}

function formatMatchingStatus(status) {
  if (!status) return "—"

  if (status === "AUTO_LINKED") return "Matched"
  if (status === "REQUIRES_REVIEW") return "Needs Review"
  if (status === "UNMATCHED") return "Unmatched"
  if (status === "VERIFIED") return "Verified"
  if (status === "MANUALLY_LINKED") return "Matched"
  if (status === "REJECTED") return "Rejected"

  return status
}

function formatProcessingStatus(report) {
  if (
    report.matching_status === "AUTO_LINKED" ||
    report.matching_status === "VERIFIED" ||
    report.matching_status === "MANUALLY_LINKED"
  ) {
    return "Processed"
  }

  return "Pending"
}

function formatExtractionStatus(report) {
  if (
    report.matching_status === "AUTO_LINKED" ||
    report.matching_status === "VERIFIED" ||
    report.matching_status === "MANUALLY_LINKED"
  ) {
    return "Complete"
  }

  return "Pending"
}

function statusClass(status) {
  if (
    status === "Complete" ||
    status === "Processed" ||
    status === "Matched" ||
    status === "Verified"
  ) {
    return "text-green-400"
  }

  if (status === "Needs Review") {
    return "text-yellow-400"
  }

  if (status === "Pending") {
    return "text-gray-400"
  }

  if (status === "Unmatched" || status === "Rejected") {
    return "text-red-400"
  }

  return "text-gray-400"
}

const Reports = () => {
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [activities, setActivities] = useState([])

  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    reportId: "",
    projectId: "",
    date: "",
    sourceType: "Daily Report",
    discipline: "Civil",
    activityId: "",
    progress: "",
    constraint: "",
    executionUpdate: "",
    evidence: null,
  })


  // ========================================
  // LOAD BACKEND DATA
  // ========================================

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError("")

      const [reportsResponse, projectsResponse, activitiesResponse] =
        await Promise.all([
          getFieldReports(),
          getProjects(),
          getActivities(),
        ])

      setReports(reportsResponse.data || [])
      setProjects(projectsResponse.data || [])
      setActivities(activitiesResponse.data || [])

      // Automatically select the first project
      if (
        projectsResponse.data &&
        projectsResponse.data.length > 0
      ) {
        setForm((prev) => ({
          ...prev,
          projectId: prev.projectId || String(projectsResponse.data[0].id),
        }))
      }

    } catch (err) {
      console.error("Failed to load field report data:", err)
      setError(err.message || "Failed to load field reports")
    } finally {
      setLoading(false)
    }
  }


  // ========================================
  // SUBMIT FIELD REPORT
  // ========================================

  async function submitReport(e) {
    e.preventDefault()

    if (!form.projectId) {
      alert("Please select a project.")
      return
    }

    if (!form.reportId.trim()) {
      alert("Please enter a Report ID.")
      return
    }

    if (!form.date) {
      alert("Please select a report date.")
      return
    }

    if (!form.executionUpdate.trim() && !form.activityId.trim()) {
      alert(
        "Please enter an activity ID or provide an execution update."
      )
      return
    }

    try {
      setSubmitting(true)
      setError("")

      // Resolve activity code to database ID.
      let selectedActivity = null

      if (form.activityId.trim()) {
        selectedActivity = activities.find(
          (activity) =>
            String(activity.activity_code).toLowerCase() ===
            form.activityId.trim().toLowerCase()
        )

        if (!selectedActivity) {
          alert(
            `Activity "${form.activityId}" was not found in the selected project.`
          )
          setSubmitting(false)
          return
        }

        if (
          String(selectedActivity.project_id) !==
          String(form.projectId)
        ) {
          alert(
            "The selected activity does not belong to the selected project."
          )
          setSubmitting(false)
          return
        }
      }

      const descriptionParts = []

      if (form.executionUpdate.trim()) {
        descriptionParts.push(form.executionUpdate.trim())
      }

      if (form.constraint.trim()) {
        descriptionParts.push(
          `Constraint/Observation: ${form.constraint.trim()}`
        )
      }

      const description =
        descriptionParts.join("\n") ||
        selectedActivity?.description ||
        "Field execution update"

      const payload = {
        report_code: form.reportId.trim(),
        project_id: Number(form.projectId),
        activity_id: selectedActivity
          ? Number(selectedActivity.id)
          : null,
        report_date: form.date,
        location: "Project Site",
        description,
        reported_progress:
          form.progress === ""
            ? null
            : Number(form.progress),
        discipline: form.discipline,
        source_type: form.sourceType,
      }

      const response = await createFieldReport(payload)

      if (!response.success) {
        throw new Error(
          response.message || "Failed to create field report"
        )
      }

      alert("Field report submitted successfully.")

      // Reload reports from PostgreSQL.
      const reportsResponse = await getFieldReports()
      setReports(reportsResponse.data || [])

      // Reset form.
      setForm({
        reportId: "",
        projectId: form.projectId,
        date: "",
        sourceType: "Daily Report",
        discipline: "Civil",
        activityId: "",
        progress: "",
        constraint: "",
        executionUpdate: "",
        evidence: null,
      })

      setSelectedFile(null)
      setShowForm(false)

    } catch (err) {
      console.error("Failed to submit field report:", err)

      setError(
        err.message || "Failed to submit field report"
      )

      alert(
        err.message || "Failed to submit field report"
      )
    } finally {
      setSubmitting(false)
    }
  }


  // ========================================
  // FILE SELECTION
  // ========================================

  const selectFile = (file, sourceType) => {
    if (!file) return

    setSelectedFile(file)

    setForm((prev) => ({
      ...prev,
      sourceType,
    }))

    setShowForm(true)
  }


  // ========================================
  // RESET FORM
  // ========================================

  function openManualForm() {
    setSelectedFile(null)

    setForm((prev) => ({
      ...prev,
      sourceType: "Manual Field Update",
    }))

    setShowForm(true)
  }


  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <h2 className="text-2xl font-semibold text-white">
            Field Reports
          </h2>

          <p className="text-gray-400 mt-2">
            Capture and reconcile field execution information
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              setShowForm(false)
            } else {
              openManualForm()
            }
          }}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          {showForm ? "Close" : "+ Add Field Update"}
        </button>

      </div>


      {/* Error */}
      {error && (
        <div className="mt-6 bg-[#151b24] border border-red-500/30 rounded-xl p-4">
          <p className="text-red-400 text-sm">
            {error}
          </p>
        </div>
      )}


      {/* Input Sources */}
      <div className="mt-8">

        <p className="text-xs text-gray-500 mb-3">
          FIELD INPUT SOURCES
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Daily Report */}
          <label className="text-left bg-[#151b24] border border-[#252d38] rounded-xl p-5 hover:bg-[#1b2430] hover:border-[#3a4655] transition cursor-pointer">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-white font-medium">
                  Daily Report
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Upload DPR / daily site execution report
                </p>
              </div>

              <span className="text-gray-500 text-lg">
                ↑
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-4">
              PDF / DOCX / XLSX
            </p>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                selectFile(
                  e.target.files?.[0],
                  "Daily Report"
                )

                e.target.value = ""
              }}
            />

            {selectedFile &&
              form.sourceType === "Daily Report" && (
                <div className="mt-4 p-3 bg-[#10151c] border border-[#252d38] rounded-lg">

                  <p className="text-xs text-green-400">
                    File selected
                  </p>

                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {selectedFile.name}
                  </p>

                </div>
              )}

          </label>


          {/* Spreadsheet */}
          <label className="text-left bg-[#151b24] border border-[#252d38] rounded-xl p-5 hover:bg-[#1b2430] hover:border-[#3a4655] transition cursor-pointer">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-white font-medium">
                  Spreadsheet
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Import structured progress or field data
                </p>
              </div>

              <span className="text-gray-500 text-lg">
                ↑
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-4">
              XLSX / XLS / CSV
            </p>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                selectFile(
                  e.target.files?.[0],
                  "Spreadsheet"
                )

                e.target.value = ""
              }}
            />

            {selectedFile &&
              form.sourceType === "Spreadsheet" && (
                <div className="mt-4 p-3 bg-[#10151c] border border-[#252d38] rounded-lg">

                  <p className="text-xs text-green-400">
                    File selected
                  </p>

                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {selectedFile.name}
                  </p>

                </div>
              )}

          </label>


          {/* Manual Field Update */}
          <button
            type="button"
            onClick={openManualForm}
            className="text-left bg-[#151b24] border border-[#252d38] rounded-xl p-5 hover:bg-[#1b2430] hover:border-[#3a4655] transition"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-white font-medium">
                  Manual Field Update
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  Enter an execution update directly
                </p>
              </div>

              <span className="text-gray-500 text-lg">
                +
              </span>

            </div>

            <p className="text-xs text-gray-500 mt-4">
              Manual Entry
            </p>

          </button>

        </div>

      </div>


      {/* Add Field Update Form */}
      {showForm && (
        <form
          onSubmit={submitReport}
          className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6"
        >

          <div>
            <h3 className="text-lg font-semibold text-white">
              Add Field Update
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Provide field execution information for BharatForge reconciliation.
            </p>
          </div>


          {/* Selected File */}
          {selectedFile && (
            <div className="mt-5 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                SELECTED FILE
              </p>

              <div className="flex items-center justify-between mt-2">

                <p className="text-sm text-white truncate">
                  {selectedFile.name}
                </p>

                <span className="text-xs text-green-400 ml-4">
                  Ready
                </span>

              </div>

            </div>
          )}


          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">

            {/* Report ID */}
            <input
              required
              placeholder="Report ID"
              value={form.reportId}
              onChange={(e) =>
                setForm({
                  ...form,
                  reportId: e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />


            {/* Project */}
            <select
              required
              value={form.projectId}
              onChange={(e) =>
                setForm({
                  ...form,
                  projectId: e.target.value,
                  activityId: "",
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
            >
              <option value="">
                Select Project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.project_code} — {project.name}
                </option>
              ))}
            </select>


            {/* Date */}
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />


            {/* Source Type */}
            <select
              value={form.sourceType}
              onChange={(e) =>
                setForm({
                  ...form,
                  sourceType: e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
            >
              {sourceTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>


            {/* Discipline */}
            <select
              value={form.discipline}
              onChange={(e) =>
                setForm({
                  ...form,
                  discipline: e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
            >
              {disciplines.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

          </div>


          {/* Activity + Progress */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            <input
              placeholder="Activity ID (e.g. L6-ELEC-001) — optional"
              value={form.activityId}
              onChange={(e) =>
                setForm({
                  ...form,
                  activityId: e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Progress %"
              value={form.progress}
              onChange={(e) =>
                setForm({
                  ...form,
                  progress: e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

          </div>


          {/* Execution Update */}
          <textarea
            placeholder="Execution update / work description"
            value={form.executionUpdate}
            onChange={(e) =>
              setForm({
                ...form,
                executionUpdate: e.target.value,
              })
            }
            rows="4"
            className="w-full mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none resize-none"
          />


          {/* Constraint */}
          <input
            placeholder="Material / constraint / observation (optional)"
            value={form.constraint}
            onChange={(e) =>
              setForm({
                ...form,
                constraint: e.target.value,
              })
            }
            className="w-full mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
          />


          {/* Evidence */}
          <div className="mt-4">

            <label className="text-sm text-gray-300">
              Supporting Evidence
            </label>

            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) =>
                setForm({
                  ...form,
                  evidence: e.target.files?.[0] || null,
                })
              }
              className="w-full mt-2 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-sm text-gray-400"
            />

          </div>


          <button
            type="submit"
            disabled={submitting}
            className="mt-6 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          >
            {submitting
              ? "Submitting..."
              : "Submit Field Update"}
          </button>

        </form>
      )}


      {/* Processing Pipeline */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Field Report Processing
        </h3>

        <p className="text-gray-400 text-sm mt-1">
          Each field input moves through extraction and activity matching.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">
            <p className="text-xs text-gray-500">
              STEP 01
            </p>

            <p className="text-white font-medium mt-2">
              Extraction
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Convert field information into structured data.
            </p>
          </div>


          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">
            <p className="text-xs text-gray-500">
              STEP 02
            </p>

            <p className="text-white font-medium mt-2">
              Activity Matching
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Map the field update to the relevant L5/L6 activity.
            </p>
          </div>


          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">
            <p className="text-xs text-gray-500">
              STEP 03
            </p>

            <p className="text-white font-medium mt-2">
              Verification
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Route uncertain or conflicting updates for review.
            </p>
          </div>

        </div>

      </div>


      {/* Reports Table */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-lg font-semibold text-white">
              Field Report Records
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Current execution inputs and reconciliation status
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {reports.length} Records
          </span>

        </div>


        <div className="mt-6 overflow-x-auto">

          {loading ? (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm">
                Loading field reports...
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-[#252d38] text-left">

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Report
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Source
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Discipline
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Date
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Activity
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Progress
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Processing
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Extraction
                  </th>

                  <th className="pb-3 pr-5 text-gray-500 font-medium">
                    Matching
                  </th>

                  <th className="pb-3 text-gray-500 font-medium">
                    Confidence
                  </th>

                </tr>
              </thead>


              <tbody>

                {reports.map((report) => {

                  const matchingStatus =
                    formatMatchingStatus(
                      report.matching_status
                    )

                  return (
                    <tr
                      key={report.id}
                      className="border-b border-[#252d38] last:border-0"
                    >

                      <td className="py-4 pr-5">
                        <p className="text-white font-medium">
                          {report.report_code}
                        </p>
                      </td>


                      <td className="py-4 pr-5">
                        <span className="text-gray-300">
                          {report.source_type || "—"}
                        </span>
                      </td>


                      <td className="py-4 pr-5">
                        <span className="text-gray-400">
                          {report.discipline || "—"}
                        </span>
                      </td>


                      <td className="py-4 pr-5">
                        <span className="text-gray-400">
                          {formatDate(report.report_date)}
                        </span>
                      </td>


                      <td className="py-4 pr-5">
                        <p className="text-white">
                          {report.activity_name ||
                            report.activity_code ||
                            "Pending AI Match"}
                        </p>

                        {report.activity_code && (
                          <p className="text-xs text-gray-500 mt-1">
                            {report.activity_code}
                          </p>
                        )}
                      </td>


                      <td className="py-4 pr-5">
                        <span className="text-gray-300">
                          {formatProgress(
                            report.reported_progress
                          )}
                        </span>
                      </td>


                      <td className="py-4 pr-5">
                        <span
                          className={statusClass(
                            formatProcessingStatus(report)
                          )}
                        >
                          {formatProcessingStatus(report)}
                        </span>
                      </td>


                      <td className="py-4 pr-5">
                        <span
                          className={statusClass(
                            formatExtractionStatus(report)
                          )}
                        >
                          {formatExtractionStatus(report)}
                        </span>
                      </td>


                      <td className="py-4 pr-5">
                        <span
                          className={statusClass(
                            matchingStatus
                          )}
                        >
                          {matchingStatus}
                        </span>
                      </td>


                      <td className="py-4">
                        <span className="text-gray-300">
                          {report.match_confidence !== null &&
                          report.match_confidence !== undefined
                            ? `${Number(
                                report.match_confidence
                              )}%`
                            : "—"}
                        </span>
                      </td>

                    </tr>
                  )
                })}

              </tbody>

            </table>
          )}

        </div>


        {!loading && reports.length === 0 && (
          <div className="py-10 text-center">

            <p className="text-gray-400 text-sm">
              No field reports found
            </p>

            <p className="text-gray-600 text-xs mt-1">
              Add a field update to create the first report.
            </p>

          </div>
        )}

      </div>


      {/* Architecture Note */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          RECONCILIATION PIPELINE
        </p>

        <p className="text-sm text-gray-300 mt-2">
          Field inputs are converted into structured execution data,
          matched against the project schedule, and routed to verification
          when the match or extracted information requires review.
        </p>

      </div>

    </div>
  )
}

export default Reports