import { useEffect, useState } from "react"
import {
  getFieldReports,
  createFieldReport,
  getProjects,
  getActivities,
} from "../services/api"

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
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

  return "Complete"
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

  if (
    status === "Unmatched" ||
    status === "Rejected"
  ) {
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
  const [draggingType, setDraggingType] = useState(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [aiUploading, setAiUploading] = useState(false)

  const [error, setError] = useState("")
  const [aiResult, setAiResult] = useState(null)

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

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError("")

      const [
        reportsResponse,
        projectsResponse,
        activitiesResponse,
      ] = await Promise.all([
        getFieldReports(),
        getProjects(),
        getActivities(),
      ])

      setReports(
        reportsResponse.data || []
      )

      setProjects(
        projectsResponse.data || []
      )

      setActivities(
        activitiesResponse.data || []
      )

      if (
        projectsResponse.data &&
        projectsResponse.data.length > 0
      ) {
        setForm((prev) => ({
          ...prev,
          projectId:
            prev.projectId ||
            String(
              projectsResponse.data[0].id
            ),
        }))
      }
    } catch (err) {
      console.error(
        "Failed to load field report data:",
        err
      )

      setError(
        err.message ||
          "Failed to load field reports"
      )
    } finally {
      setLoading(false)
    }
  }

  // =========================================================
  // AI DPR IMAGE PROCESSING
  // =========================================================

  async function uploadDPRImage(file) {
    if (!file) return

    // Make sure this is actually an image
    if (!file.type.startsWith("image/")) {
      selectFile(
        file,
        "Daily Report"
      )
      return
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ]

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Only JPG, PNG and WEBP images are supported."
      )
      return
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Image size must be less than 10 MB."
      )
      return
    }

    try {
      setAiUploading(true)
      setError("")
      setAiResult(null)

      const formData =
        new FormData()

      formData.append(
        "file",
        file
      )

      console.log(
        "Uploading DPR image:",
        file.name
      )

      // =====================================================
      // SEND IMAGE TO GEMINI BACKEND
      // =====================================================

      const response =
        await fetch(
          `${API_BASE}/ingestion/image`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        )

      const data =
        await response.json()

      console.log(
        "FULL AI RESPONSE:",
        data
      )

      // =====================================================
      // HANDLE BACKEND ERROR
      // =====================================================

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to process DPR image"
        )
      }

      // =====================================================
      // GET AI DATA
      // =====================================================

      const extracted =
        data.extracted || {}

      const matching =
        data.matching || {}

      const project =
        data.project || {}

      const report =
        data.report || {}

      console.log(
        "Extracted Project:",
        extracted.projectCode
      )

      console.log(
        "Extracted Date:",
        extracted.reportDate
      )

      console.log(
        "Extracted Discipline:",
        extracted.discipline
      )

      console.log(
        "Extracted Activity:",
        extracted.activityDescription
      )

      console.log(
        "Extracted Progress:",
        extracted.reportedProgress
      )

      console.log(
        "Extracted Status:",
        extracted.status
      )

      // =====================================================
      // STORE AI RESULT
      // =====================================================

      setAiResult({
        extracted,
        matching,
        project,
        report,
      })

      // =====================================================
      // SAVE FILE STATE ONLY
      // =====================================================

      setSelectedFile(file)

      // IMPORTANT:
      // Do NOT call createFieldReport() here.
      //
      // The backend /api/ingestion/image has already
      // created the PostgreSQL field_reports record.
      //
      // Calling createFieldReport() again would attempt
      // to create the same AI report a second time.
      // =====================================================

      // Close manual form if it happened to be open.
      setShowForm(false)

      // =====================================================
      // REFRESH REPORT TABLE
      // =====================================================

      const reportsResponse =
        await getFieldReports()

      setReports(
        reportsResponse.data || []
      )

      // =====================================================
      // EXTRACTION CONFIDENCE
      // =====================================================

      const extractionConfidence =
        Number(
          extracted.extractionConfidence ||
            0
        )

      const extractionPercent =
        extractionConfidence <= 1
          ? Math.round(
              extractionConfidence * 100
            )
          : Math.round(
              extractionConfidence
            )

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      alert(
        `AI DPR PROCESSING COMPLETE\n\n` +
        `Report ID: ${
          report.reportCode ||
          "—"
        }\n\n` +
        `Project: ${
          extracted.projectCode ||
          "Not found"
        }\n` +
        `Date: ${
          extracted.reportDate ||
          "Not found"
        }\n` +
        `Discipline: ${
          extracted.discipline ||
          "Not found"
        }\n` +
        `Progress: ${
          extracted.reportedProgress ??
          "Not found"
        }%\n` +
        `Status: ${
          extracted.status ||
          "Not found"
        }\n\n` +
        `Activity Code: ${
          matching.activity
            ?.activity_code ||
          "Pending"
        }\n` +
        `Activity Name: ${
          matching.activity
            ?.name ||
          "Pending"
        }\n` +
        `Match Confidence: ${
          matching.confidence ??
          0
        }%\n` +
        `Extraction Confidence: ${
          extractionPercent
        }%\n\n` +
        `The report has already been saved to PostgreSQL.`
      )
    } catch (err) {
      console.error(
        "AI DPR upload error:",
        err
      )

      setError(
        err.message ||
          "Failed to process DPR image"
      )

      alert(
        err.message ||
          "Failed to process DPR image"
      )
    } finally {
      setAiUploading(false)
    }
  }

  // =========================================================
  // MANUAL FIELD REPORT SUBMISSION
  // =========================================================

  async function submitReport(e) {
    e.preventDefault()

    if (!form.projectId) {
      alert(
        "Please select a project."
      )
      return
    }

    if (!form.reportId.trim()) {
      alert(
        "Please enter a Report ID."
      )
      return
    }

    if (!form.date) {
      alert(
        "Please select a report date."
      )
      return
    }

    if (
      !form.executionUpdate.trim() &&
      !form.activityId.trim()
    ) {
      alert(
        "Please enter an activity ID or provide an execution update."
      )
      return
    }

    try {
      setSubmitting(true)
      setError("")

      // =====================================================
      // FIND ACTIVITY
      // =====================================================

      let selectedActivity = null

      if (
        form.activityId.trim()
      ) {
        selectedActivity =
          activities.find(
            (activity) =>
              String(
                activity.activity_code
              ).toLowerCase() ===
              form.activityId
                .trim()
                .toLowerCase()
          )

        if (!selectedActivity) {
          alert(
            `Activity "${form.activityId}" was not found in the selected project.`
          )

          setSubmitting(false)
          return
        }

        if (
          String(
            selectedActivity.project_id
          ) !==
          String(form.projectId)
        ) {
          alert(
            "The selected activity does not belong to the selected project."
          )

          setSubmitting(false)
          return
        }
      }

      // =====================================================
      // BUILD DESCRIPTION
      // =====================================================

      const descriptionParts =
        []

      if (
        form.executionUpdate.trim()
      ) {
        descriptionParts.push(
          form.executionUpdate.trim()
        )
      }

      if (
        form.constraint.trim()
      ) {
        descriptionParts.push(
          `Constraint/Observation: ${form.constraint.trim()}`
        )
      }

      const description =
        descriptionParts.join(
          "\n"
        ) ||
        selectedActivity?.description ||
        "Field execution update"

      // =====================================================
      // PAYLOAD
      // =====================================================

      const payload = {
        report_code:
          form.reportId.trim(),

        project_id:
          Number(
            form.projectId
          ),

        activity_id:
          selectedActivity
            ? Number(
                selectedActivity.id
              )
            : null,

        report_date:
          form.date,

        location:
          "Project Site",

        description,

        reported_progress:
          form.progress === ""
            ? null
            : Number(
                form.progress
              ),

        discipline:
          form.discipline,

        source_type:
          form.sourceType,
      }

      console.log(
        "Manual report payload:",
        payload
      )

      // =====================================================
      // CREATE MANUAL REPORT
      // =====================================================

      const response =
        await createFieldReport(
          payload
        )

      if (
        !response.success
      ) {
        throw new Error(
          response.message ||
            "Failed to create field report"
        )
      }

      alert(
        "Field report submitted successfully."
      )

      // =====================================================
      // REFRESH
      // =====================================================

      const reportsResponse =
        await getFieldReports()

      setReports(
        reportsResponse.data || []
      )

      // =====================================================
      // RESET FORM
      // =====================================================

      setForm({
        reportId: "",
        projectId:
          form.projectId,
        date: "",
        sourceType:
          "Daily Report",
        discipline:
          "Civil",
        activityId: "",
        progress: "",
        constraint: "",
        executionUpdate: "",
        evidence: null,
      })

      setSelectedFile(null)
      setShowForm(false)
    } catch (err) {
      console.error(
        "Failed to submit field report:",
        err
      )

      setError(
        err.message ||
          "Failed to submit field report"
      )

      alert(
        err.message ||
          "Failed to submit field report"
      )
    } finally {
      setSubmitting(false)
    }
  }

  // =========================================================
  // DRAG OVER
  // =========================================================

  const handleDragOver = (
    e,
    sourceType
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setDraggingType(
      sourceType
    )
  }

  // =========================================================
  // DRAG LEAVE
  // =========================================================

  const handleDragLeave = (
    e
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setDraggingType(null)
  }

  // =========================================================
  // DROP
  // =========================================================

  const handleDrop = (
    e,
    sourceType
  ) => {
    e.preventDefault()
    e.stopPropagation()

    setDraggingType(null)

    const file =
      e.dataTransfer.files?.[0]

    if (!file) return

    // Image DPR → Gemini AI
    if (
      sourceType ===
        "Daily Report" &&
      file.type.startsWith(
        "image/"
      )
    ) {
      uploadDPRImage(file)
      return
    }

    // Other file types → normal form
    setSelectedFile(file)

    setForm((prev) => ({
      ...prev,
      sourceType,
    }))

    setShowForm(true)
  }

  // =========================================================
  // FILE SELECT
  // =========================================================

  const selectFile = (
    file,
    sourceType
  ) => {
    if (!file) return

    setSelectedFile(file)

    setForm((prev) => ({
      ...prev,
      sourceType,
    }))

    setShowForm(true)
  }

  // =========================================================
  // MANUAL FORM
  // =========================================================

  function openManualForm() {
    setSelectedFile(null)
    setAiResult(null)

    setForm((prev) => ({
      ...prev,
      sourceType:
        "Manual Field Update",
    }))

    setShowForm(true)
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="pb-10">

      {/* ===================================================
          HEADER
      =================================================== */}

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
          {showForm
            ? "Close"
            : "+ Add Field Update"}
        </button>

      </div>

      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (
        <div className="mt-6 bg-[#151b24] border border-red-500/30 rounded-xl p-4">

          <p className="text-red-400 text-sm">
            {error}
          </p>

        </div>
      )}

      {/* ===================================================
          AI EXTRACTION RESULT
      =================================================== */}

      {aiResult && (
        <div className="mt-6 bg-[#151b24] border border-blue-500/30 rounded-xl p-6">

          {/* Header */}

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-blue-400 font-medium">
                AI DPR EXTRACTION
              </p>

              <h3 className="text-lg font-semibold text-white mt-1">
                Extraction completed successfully
              </h3>

              <p className="text-gray-500 text-sm mt-1">
                Gemini extracted the field information and BharatForge matched it against the L5/L6 schedule.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setAiResult(null)
              }
              className="text-gray-500 hover:text-white text-xl"
            >
              ×
            </button>

          </div>

          {/* =================================================
              BASIC EXTRACTED DATA
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            {/* Project */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                PROJECT CODE
              </p>

              <p className="text-white font-medium mt-2">
                {aiResult.extracted?.projectCode ||
                  "Not found"}
              </p>

              {aiResult.project?.name && (
                <p className="text-xs text-gray-500 mt-1">
                  {aiResult.project.name}
                </p>
              )}

            </div>

            {/* Date */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                REPORT DATE
              </p>

              <p className="text-white font-medium mt-2">
                {aiResult.extracted?.reportDate ||
                  "Not found"}
              </p>

            </div>

            {/* Discipline */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                DISCIPLINE
              </p>

              <p className="text-white font-medium mt-2">
                {aiResult.extracted?.discipline ||
                  "Not found"}
              </p>

            </div>

            {/* Progress */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                REPORTED PROGRESS
              </p>

              <p className="text-white font-medium mt-2">

                {aiResult.extracted?.reportedProgress ??
                  "Not found"}

                {aiResult.extracted?.reportedProgress !==
                  null &&
                aiResult.extracted?.reportedProgress !==
                  undefined
                  ? "%"
                  : ""}

              </p>

            </div>

          </div>

          {/* =================================================
              ACTIVITY DESCRIPTION
          ================================================= */}

          <div className="mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

            <p className="text-xs text-gray-500">
              EXTRACTED ACTIVITY DESCRIPTION
            </p>

            <p className="text-gray-200 mt-2 leading-relaxed">
              {aiResult.extracted?.activityDescription ||
                "No activity description extracted"}
            </p>

          </div>

          {/* =================================================
              ACTIVITY MATCH
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">

            {/* Activity Code */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                MATCHED ACTIVITY
              </p>

              <p className="text-white font-medium mt-2">

                {aiResult.matching?.activity
                  ?.activity_code ||
                  "Pending"}

              </p>

            </div>

            {/* Activity Name */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                ACTIVITY NAME
              </p>

              <p className="text-white font-medium mt-2">

                {aiResult.matching?.activity
                  ?.name ||
                  "Pending"}

              </p>

            </div>

            {/* Match Confidence */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                MATCH CONFIDENCE
              </p>

              <p className="text-yellow-400 font-medium mt-2">

                {aiResult.matching?.confidence ??
                  0}
                %

              </p>

            </div>

            {/* Extraction Confidence */}

            <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

              <p className="text-xs text-gray-500">
                EXTRACTION CONFIDENCE
              </p>

              <p className="text-green-400 font-medium mt-2">

                {(() => {
                  const value =
                    Number(
                      aiResult.extracted
                        ?.extractionConfidence ||
                        0
                    )

                  return value <= 1
                    ? `${Math.round(
                        value * 100
                      )}%`
                    : `${Math.round(
                        value
                      )}%`
                })()}

              </p>

            </div>

          </div>

          {/* =================================================
              STATUS
          ================================================= */}

          <div className="mt-5 flex flex-wrap gap-3">

            <span
              className={`px-3 py-1.5 rounded-full text-xs ${
                aiResult.matching?.status ===
                "AUTO_LINKED"
                  ? "bg-green-500/10 text-green-400"
                  : aiResult.matching?.status ===
                    "REQUIRES_REVIEW"
                  ? "bg-yellow-500/10 text-yellow-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              Matching:{" "}
              {formatMatchingStatus(
                aiResult.matching?.status
              )}
            </span>

            <span className="px-3 py-1.5 rounded-full text-xs bg-blue-500/10 text-blue-400">
              AI Processed
            </span>

            <span className="px-3 py-1.5 rounded-full text-xs bg-green-500/10 text-green-400">
              Saved to PostgreSQL
            </span>

          </div>

          {/* =================================================
              REPORT ID
          ================================================= */}

          <div className="mt-4 text-xs text-gray-500">

            AI Report ID:{" "}

            <span className="text-gray-300">
              {aiResult.report?.reportCode ||
                "—"}
            </span>

          </div>

        </div>
      )}

      {/* ===================================================
          INPUT SOURCES
      =================================================== */}

      <div className="mt-8">

        <p className="text-xs text-gray-500 mb-3">
          FIELD INPUT SOURCES
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* =================================================
              DAILY REPORT
          ================================================= */}

          <label
            onDragOver={(e) =>
              handleDragOver(
                e,
                "Daily Report"
              )
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={(e) =>
              handleDrop(
                e,
                "Daily Report"
              )
            }
            className={`text-left bg-[#151b24] border rounded-xl p-5 transition cursor-pointer ${
              draggingType ===
              "Daily Report"
                ? "border-blue-500 bg-blue-500/10"
                : "border-[#252d38] hover:bg-[#1b2430] hover:border-[#3a4655]"
            }`}
          >

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
              PDF / DOCX / XLSX / JPG / PNG / WEBP
            </p>

            {aiUploading && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">

                <p className="text-xs text-blue-400">
                  AI is extracting and matching the DPR...
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Please wait while Gemini analyzes the document.
                </p>

              </div>
            )}

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
              className="hidden"
              disabled={aiUploading}
              onChange={(e) => {

                const file =
                  e.target.files?.[0]

                if (!file) return

                if (
                  file.type.startsWith(
                    "image/"
                  )
                ) {
                  uploadDPRImage(file)
                } else {
                  selectFile(
                    file,
                    "Daily Report"
                  )
                }

                e.target.value = ""

              }}
            />

            {selectedFile &&
              form.sourceType ===
                "Daily Report" && (
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

          {/* =================================================
              SPREADSHEET
          ================================================= */}

          <label
            onDragOver={(e) =>
              handleDragOver(
                e,
                "Spreadsheet"
              )
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={(e) =>
              handleDrop(
                e,
                "Spreadsheet"
              )
            }
            className={`text-left bg-[#151b24] border rounded-xl p-5 transition cursor-pointer ${
              draggingType ===
              "Spreadsheet"
                ? "border-blue-500 bg-blue-500/10"
                : "border-[#252d38] hover:bg-[#1b2430] hover:border-[#3a4655]"
            }`}
          >

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
              form.sourceType ===
                "Spreadsheet" && (
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

          {/* =================================================
              MANUAL FIELD UPDATE
          ================================================= */}

          <button
            type="button"
            onClick={
              openManualForm
            }
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

      {/* ===================================================
          MANUAL FIELD UPDATE FORM
      =================================================== */}

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

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">

            {/* Report ID */}

            <input
              required
              placeholder="Report ID"
              value={
                form.reportId
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  reportId:
                    e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            {/* Project */}

            <select
              required
              value={
                form.projectId
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  projectId:
                    e.target.value,
                  activityId: "",
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
            >

              <option value="">
                Select Project
              </option>

              {projects.map(
                (project) => (
                  <option
                    key={project.id}
                    value={project.id}
                  >
                    {project.project_code} —{" "}
                    {project.name}
                  </option>
                )
              )}

            </select>

            {/* Date */}

            <input
              required
              type="date"
              value={
                form.date
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  date:
                    e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            {/* Source */}

            <select
              value={
                form.sourceType
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  sourceType:
                    e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
            >

              {sourceTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

            {/* Discipline */}

            <select
              value={
                form.discipline
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  discipline:
                    e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
            >

              {disciplines.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =================================================
              ACTIVITY + PROGRESS
          ================================================= */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            <input
              placeholder="Activity ID (e.g. L6-ELEC-001) — optional"
              value={
                form.activityId
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  activityId:
                    e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Progress %"
              value={
                form.progress
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  progress:
                    e.target.value,
                })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

          </div>

          {/* =================================================
              EXECUTION UPDATE
          ================================================= */}

          <textarea
            placeholder="Execution update / work description"
            value={
              form.executionUpdate
            }
            onChange={(e) =>
              setForm({
                ...form,
                executionUpdate:
                  e.target.value,
              })
            }
            rows="4"
            className="w-full mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none resize-none"
          />

          {/* =================================================
              CONSTRAINT
          ================================================= */}

          <input
            placeholder="Material / constraint / observation (optional)"
            value={
              form.constraint
            }
            onChange={(e) =>
              setForm({
                ...form,
                constraint:
                  e.target.value,
              })
            }
            className="w-full mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
          />

          {/* =================================================
              EVIDENCE
          ================================================= */}

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
                  evidence:
                    e.target.files?.[0] ||
                    null,
                })
              }
              className="w-full mt-2 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-sm text-gray-400"
            />

          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={
              submitting
            }
            className="mt-6 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          >
            {submitting
              ? "Submitting..."
              : "Submit Field Update"}
          </button>

        </form>
      )}

      {/* ===================================================
          PROCESSING PIPELINE
      =================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Field Report Processing
        </h3>

        <p className="text-gray-400 text-sm mt-1">
          Each field input moves through extraction and activity matching.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

          {/* STEP 1 */}

          <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

            <p className="text-xs text-gray-500">
              STEP 01
            </p>

            <p className="text-white font-medium mt-2">
              AI Extraction
            </p>

            <p className="text-gray-500 text-xs mt-1">
              Gemini extracts project, date, discipline, progress and execution information from the DPR.
            </p>

          </div>

          {/* STEP 2 */}

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

          {/* STEP 3 */}

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

      {/* ===================================================
          REPORT TABLE
      =================================================== */}

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
          ) : reports.length === 0 ? (
            <div className="py-10 text-center">

              <p className="text-gray-400 text-sm">
                No field reports found
              </p>

              <p className="text-gray-600 text-xs mt-1">
                Upload a DPR or add a field update to create a report.
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

                {reports.map(
                  (report) => {

                    const matchingStatus =
                      formatMatchingStatus(
                        report.matching_status
                      )

                    return (
                      <tr
                        key={
                          report.id
                        }
                        className="border-b border-[#252d38] last:border-0"
                      >

                        {/* Report */}

                        <td className="py-4 pr-5">

                          <p className="text-white font-medium">
                            {report.report_code ||
                              "—"}
                          </p>

                        </td>

                        {/* Source */}

                        <td className="py-4 pr-5">

                          <span className="text-gray-300">
                            {report.source_type ||
                              "—"}
                          </span>

                        </td>

                        {/* Discipline */}

                        <td className="py-4 pr-5">

                          <span className="text-gray-400">
                            {report.discipline ||
                              "—"}
                          </span>

                        </td>

                        {/* Date */}

                        <td className="py-4 pr-5">

                          <span className="text-gray-400">
                            {formatDate(
                              report.report_date
                            )}
                          </span>

                        </td>

                        {/* Activity */}

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

                        {/* Progress */}

                        <td className="py-4 pr-5">

                          <span className="text-gray-300">
                            {formatProgress(
                              report.reported_progress
                            )}
                          </span>

                        </td>

                        {/* Processing */}

                        <td className="py-4 pr-5">

                          <span
                            className={statusClass(
                              formatProcessingStatus(
                                report
                              )
                            )}
                          >
                            {formatProcessingStatus(
                              report
                            )}
                          </span>

                        </td>

                        {/* Extraction */}

                        <td className="py-4 pr-5">

                          <span
                            className={statusClass(
                              formatExtractionStatus(
                                report
                              )
                            )}
                          >
                            {formatExtractionStatus(
                              report
                            )}
                          </span>

                        </td>

                        {/* Matching */}

                        <td className="py-4 pr-5">

                          <span
                            className={statusClass(
                              matchingStatus
                            )}
                          >
                            {matchingStatus}
                          </span>

                        </td>

                        {/* Confidence */}

                        <td className="py-4">

                          <span className="text-gray-300">

                            {report.match_confidence !==
                              null &&
                            report.match_confidence !==
                              undefined
                              ? `${Number(
                                  report.match_confidence
                                )}%`
                              : "—"}

                          </span>

                        </td>

                      </tr>
                    )
                  }
                )}

              </tbody>

            </table>
          )}

        </div>

      </div>

      {/* ===================================================
          ARCHITECTURE NOTE
      =================================================== */}

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