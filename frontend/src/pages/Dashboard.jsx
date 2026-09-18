import UploadModal from "../components/UploadModal"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const API_BASE = "http://localhost:5000/api"

const inputSources = [
  {
    title: "Schedule",
    description: "Import Primavera / P6 schedule",
    formats: "XLSX / XLS",
  },
  {
    title: "DPR / Field Reports",
    description: "Upload daily site execution reports",
    formats: "JPG / PNG / WEBP",
  },
  {
    title: "Progress & Materials",
    description: "Import progress and material data",
    formats: "XLSX / CSV",
  },
  {
    title: "Evidence",
    description: "Upload photos and supporting documents",
    formats: "JPG / PNG / PDF",
  },
]

function formatProgress(value) {
  return `${Number(value || 0)}%`
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
  if (
    status === "VERIFIED" ||
    status === "AUTO_LINKED" ||
    status === "COMPLETED"
  ) {
    return "text-green-400"
  }

  if (
    status === "REQUIRES_REVIEW" ||
    status === "UNMATCHED" ||
    status === "IN_PROGRESS"
  ) {
    return "text-yellow-400"
  }

  return "text-gray-400"
}

function formatReportStatus(status) {
  if (status === "REQUIRES_REVIEW") {
    return "Needs Review"
  }

  if (status === "AUTO_LINKED") {
    return "Processed"
  }

  if (status === "VERIFIED") {
    return "Verified"
  }

  if (status === "UNMATCHED") {
    return "Unmatched"
  }

  return status || "Pending"
}

const Dashboard = () => {
  const navigate = useNavigate()

  const [uploadType, setUploadType] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState({})
  const [draggingType, setDraggingType] = useState(null)

  const [summary, setSummary] = useState(null)
  const [activities, setActivities] = useState([])
  const [reports, setReports] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [scheduleUploading, setScheduleUploading] = useState(false)
  const [scheduleImport, setScheduleImport] = useState(null)

  const handleDragOver = (e, sourceType) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingType(sourceType)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingType(null)
  }

  const handleDrop = (e, sourceType) => {
    e.preventDefault()
    e.stopPropagation()

    setDraggingType(null)

    const file = e.dataTransfer.files?.[0]

    if (!file) return

    if (sourceType === "Schedule") {
      uploadSchedule(file)
      return
    }

    if (sourceType === "DPR / Field Reports") {
      uploadDprImage(file)
      return
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [sourceType]: file.name,
    }))
  }

  async function uploadSchedule(file) {
    if (!file) return

    const extension = file.name.toLowerCase().split(".").pop()

    if (extension !== "xlsx" && extension !== "xls") {
      alert("Please upload a P6 schedule in XLSX or XLS format.")
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      alert("Schedule file must be smaller than 25 MB.")
      return
    }

    try {
      setScheduleUploading(true)
      setError("")

      const formData = new FormData()
      formData.append("file", file)

      console.log("Uploading P6 schedule:", file.name)

      const response = await fetch(
        `${API_BASE}/ingestion/schedule`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      )

      const data = await response.json()

      console.log("P6 IMPORT RESPONSE:", data)

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to import P6 schedule"
        )
      }

      const schedule = data.schedule || {}
      const project = data.project || {}

      setUploadedFiles((prev) => ({
        ...prev,
        Schedule: file.name,
      }))

      setScheduleImport({
        filename: file.name,
        projectName: project.name || "Imported P6 Project",
        projectCode: project.projectCode || "—",
        activityCount: schedule.activityCount ?? 0,
        inserted: schedule.inserted ?? 0,
        updated: schedule.updated ?? 0,
        sheets: schedule.sheets || [],
        projectStart: schedule.projectStart || null,
        projectEnd: schedule.projectEnd || null,
      })

      setUploadType(null)

      await loadDashboard()

      alert(
        `P6 SCHEDULE IMPORTED SUCCESSFULLY\n\n` +
        `Project: ${project.name || "—"}\n` +
        `Project Code: ${project.projectCode || "—"}\n\n` +
        `Activities Imported: ${schedule.activityCount ?? 0}\n` +
        `Inserted: ${schedule.inserted ?? 0}\n` +
        `Updated: ${schedule.updated ?? 0}\n\n` +
        `Sheets Found: ${schedule.sheets?.length || 0}\n\n` +
        `All schedule data has been saved to PostgreSQL.`
      )
    } catch (err) {
      console.error("P6 upload error:", err)

      setError(err.message || "Failed to import P6 schedule")

      alert(
        `P6 schedule import failed:\n\n${err.message}`
      )
    } finally {
      setScheduleUploading(false)
    }
  }

  async function uploadDprImage(file) {
    if (!file) return

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ]

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a JPG, PNG or WEBP DPR image.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("DPR image must be smaller than 10 MB.")
      return
    }

    try {
      setError("")

      const formData = new FormData()
      formData.append("file", file)

      console.log("Uploading DPR image:", file.name)

      const response = await fetch(
        `${API_BASE}/ingestion/image`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      )

      const data = await response.json()

      console.log("DPR AI RESPONSE:", data)

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to process DPR image"
        )
      }

      setUploadedFiles((prev) => ({
        ...prev,
        "DPR / Field Reports": file.name,
      }))

      setUploadType(null)

      await loadDashboard()

      const extracted = data.extracted || {}
      const matching = data.matching || {}
      const matchedActivity =
        matching.activity || data.activity || null

      alert(
        `DPR PROCESSED SUCCESSFULLY\n\n` +
        `Discipline: ${extracted.discipline || "Not Found"}\n` +
        `Progress: ${
          extracted.reportedProgress !== null &&
          extracted.reportedProgress !== undefined
            ? extracted.reportedProgress + "%"
            : "Not Found"
        }\n` +
        `Status: ${extracted.status || "Not Found"}\n\n` +
        `Activity Code: ${
          matchedActivity?.activity_code ||
          matchedActivity?.activityCode ||
          "Unmatched"
        }\n` +
        `Activity Name: ${
          matchedActivity?.name ||
          "Unmatched Activity"
        }\n` +
        `Match Confidence: ${
          matching.confidence ?? 0
        }%\n` +
        `Extraction Confidence: ${
          extracted.extractionConfidence ?? "N/A"
        }%\n\n` +
        `Matching Status: ${
          matching.status || "UNKNOWN"
        }\n\n` +
        `The report has been saved to PostgreSQL.`
      )
    } catch (err) {
      console.error("DPR upload error:", err)

      setError(
        err.message || "Failed to process DPR image"
      )

      alert(
        `DPR processing failed:\n\n${err.message}`
      )
    }
  }

  /*
  ============================================================
  LOAD DASHBOARD DATA
  ============================================================
  */

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setLoading(true)
      setError("")

      const [
        summaryResponse,
        riskResponse,
        reportsResponse,
      ] = await Promise.all([
        fetch(
          `${API_BASE}/analytics/project-summary`
        ).then(async (response) => {
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(
              data.message ||
                "Failed to load project summary"
            )
          }

          return data
        }),

        fetch(
          `${API_BASE}/analytics/activity-risk`
        ).then(async (response) => {
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(
              data.message ||
                "Failed to load activity analytics"
            )
          }

          return data
        }),

        fetch(
          `${API_BASE}/field-reports`
        ).then(async (response) => {
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(
              data.message ||
                "Failed to load field reports"
            )
          }

          return data
        }),
      ])

      setSummary(
        summaryResponse.data || null
      )

      setActivities(
        riskResponse.data || []
      )

      setReports(
        reportsResponse.data || []
      )
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      )

      setError(
        err.message ||
          "Failed to load dashboard data"
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  ============================================================
  SUMMARY DATA
  ============================================================
  */

  const activitySummary =
    summary?.activities || {}

  const riskSummary =
    summary?.risk || {}

  const progressSummary =
    summary?.progress || {}

  const reportSummary =
    summary?.field_reports || {}

  /*
  ============================================================
  DASHBOARD STAT CARDS
  ============================================================
  */

  const stats = [
    [
      "Activities Tracked",
      activitySummary.total ?? 0,
    ],

    [
      "Reports Pending Verification",
      reportSummary.requires_review ?? 0,
    ],

    [
      "Unmatched Activities",
      reportSummary.unmatched ?? 0,
    ],

    [
      "High-Risk Activities",
      riskSummary.high ?? 0,
    ],
  ]

  /*
  ============================================================
  CRITICAL ACTIVITIES
  ============================================================
  */

  const criticalActivities = useMemo(() => {
    return [...activities]
      .filter(
        (activity) =>
          activity.risk_level === "HIGH" ||
          activity.risk_level === "MEDIUM"
      )
      .sort((a, b) => {
        const riskOrder = {
          HIGH: 1,
          MEDIUM: 2,
          LOW: 3,
        }

        return (
          (riskOrder[a.risk_level] || 3) -
          (riskOrder[b.risk_level] || 3)
        )
      })
      .slice(0, 5)
  }, [activities])

  /*
  ============================================================
  RECENT FIELD REPORTS
  ============================================================
  */

  const recentReports = useMemo(() => {
    return [...reports]
      .sort((a, b) => {
        const dateA = new Date(
          a.created_at ||
            a.report_date ||
            0
        ).getTime()

        const dateB = new Date(
          b.created_at ||
            b.report_date ||
            0
        ).getTime()

        return dateB - dateA
      })
      .slice(0, 5)
  }, [reports])

  /*
  ============================================================
  PROGRESS CHART DATA
  ============================================================
  
  The backend currently contains activity-level progress,
  not historical daily progress.

  Therefore this chart displays:
  
  X-axis  = Activity
  Blue    = Planned progress
  Green   = Actual progress
  ============================================================
  */

  const progressActivities = useMemo(() => {
    return activities.slice(0, 6)
  }, [activities])

  /*
  ============================================================
  LOADING STATE
  ============================================================
  */

  if (loading) {
    return (
      <div className="w-full max-w-full min-w-0 overflow-x-hidden pb-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500">
              Project
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-white mt-1 break-words">
              OIL — Gas Processing Plant
            </h2>

            <p className="text-gray-400 mt-2">
              Project execution overview
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
            Active
          </span>
        </div>

        <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-10 text-center">
          <p className="text-gray-400">
            Loading dashboard data...
          </p>
        </div>

      </div>
    )
  }

  /*
  ============================================================
  ERROR STATE
  ============================================================
  */

  if (error) {
    return (
      <div className="w-full max-w-full min-w-0 overflow-x-hidden pb-10">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>
            <p className="text-sm text-gray-500">
              Project
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold text-white mt-1 break-words">
              OIL — Gas Processing Plant
            </h2>

            <p className="text-gray-400 mt-2">
              Project execution overview
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
            Active
          </span>

        </div>

        <div className="mt-8 bg-[#151b24] border border-red-500/30 rounded-xl p-6">

          <p className="text-red-400">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
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
  MAIN DASHBOARD
  ============================================================
  */

  return (
    <div className="w-full max-w-full min-w-0 overflow-x-hidden pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div>

          <p className="text-sm text-gray-500">
            Project
          </p>

          <h2 className="text-xl sm:text-2xl font-semibold text-white mt-1 break-words">
            OIL — Gas Processing Plant
          </h2>

          <p className="text-gray-400 mt-2">
            Project execution overview
          </p>

        </div>

        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-sm">
          Active
        </span>

      </div>


      {/* =====================================================
          DASHBOARD STATS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

        {stats.map(([label, value]) => (

          <div
            key={label}
            className="bg-[#151b24] border border-[#252d38] rounded-xl p-5"
          >

            <p className="text-gray-400 text-sm">
              {label}
            </p>

            <p className="text-2xl font-semibold text-white mt-2">
              {value}
            </p>

          </div>

        ))}

      </div>


      {/* =====================================================
          PROJECT PROGRESS
      ===================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <h3 className="text-lg font-semibold text-white">
          Project Progress
        </h3>


        {/* Planned */}

        <div className="mt-6">

          <div className="flex justify-between text-sm">

            <span className="text-gray-400">
              Planned
            </span>

            <span className="text-white">
              {formatProgress(
                progressSummary.average_planned
              )}
            </span>

          </div>

          <div className="h-2 bg-[#252d38] rounded-full mt-2 overflow-hidden">

            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${Math.min(
                  Number(
                    progressSummary.average_planned || 0
                  ),
                  100
                )}%`,
              }}
            />

          </div>

        </div>


        {/* Actual */}

        <div className="mt-5">

          <div className="flex justify-between text-sm">

            <span className="text-gray-400">
              Actual
            </span>

            <span className="text-white">
              {formatProgress(
                progressSummary.average_actual
              )}
            </span>

          </div>

          <div className="h-2 bg-[#252d38] rounded-full mt-2 overflow-hidden">

            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${Math.min(
                  Number(
                    progressSummary.average_actual || 0
                  ),
                  100
                )}%`,
              }}
            />

          </div>

        </div>


        {/* Variance */}

        <div className="mt-5 flex justify-between text-sm">

          <span className="text-gray-400">
            Progress Variance
          </span>

          <span
            className={
              Number(
                progressSummary.variance || 0
              ) < 0
                ? "text-red-400"
                : "text-green-400"
            }
          >

            {Number(
              progressSummary.variance || 0
            ) > 0
              ? "+"
              : ""}

            {Number(
              progressSummary.variance || 0
            )}%

          </span>

        </div>

      </div>


      {/* =====================================================
          FIELD INPUTS
      ===================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div>

          <h3 className="text-lg font-semibold text-white">
            Field Inputs
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            Add the source data BharatForge uses for execution reconciliation
          </p>

        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

          {inputSources.map((source) => (

            <button
            key={source.title}
            type="button"
            onClick={() =>
              setUploadType(source.title)
            }
            onDragOver={(e) =>
              handleDragOver(e, source.title)
            }
            onDragLeave={handleDragLeave}
            onDrop={(e) =>
              handleDrop(e, source.title)
            }
            className={`text-left bg-[#10151c] border rounded-xl p-5 transition ${
              draggingType === source.title
                ? "border-blue-500 bg-blue-500/10"
                : "border-[#252d38] hover:bg-[#1b2430] hover:border-[#3a4655]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-medium">
                  {source.title}
                </p>

                <p className="text-gray-400 text-sm mt-2">
                  {source.description}
                </p>
              </div>

              <span className="text-gray-500 text-lg">
                +
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              {source.formats}
            </p>

            {draggingType === source.title && (
              <p className="text-xs text-blue-400 mt-3">
                Drop file here
              </p>
            )}

            {uploadedFiles[source.title] && (
              <div className="mt-3">
                <p className="text-xs text-green-400">
                  ✓ Uploaded
                </p>

                <p className="text-xs text-gray-500 mt-1 truncate">
                  {uploadedFiles[source.title]}
                </p>
              </div>
            )}
          </button>

          ))}

        </div>

      </div>


      {/* =====================================================
          P6 SCHEDULE IMPORT STATUS
      ===================================================== */}

      {scheduleUploading && (
        <div className="mt-8 bg-[#151b24] border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />

            <div>
              <h3 className="text-lg font-semibold text-white">
                Importing P6 Schedule
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                Reading workbook, extracting activities and saving schedule data to PostgreSQL...
              </p>
            </div>
          </div>
        </div>
      )}

      {scheduleImport && !scheduleUploading && (
        <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">

            <div>
              <p className="text-xs text-gray-500">
                P6 SCHEDULE IMPORT
              </p>

              <h3 className="text-lg font-semibold text-white mt-1">
                {scheduleImport.projectName}
              </h3>

              <p className="text-gray-400 text-sm mt-1">
                {scheduleImport.projectCode}
              </p>

              <p className="text-gray-500 text-xs mt-3 truncate max-w-xl">
                {scheduleImport.filename}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              <div className="bg-[#10151c] rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500">
                  Activities
                </p>

                <p className="text-xl font-semibold text-white mt-1">
                  {scheduleImport.activityCount}
                </p>
              </div>

              <div className="bg-[#10151c] rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500">
                  Inserted
                </p>

                <p className="text-xl font-semibold text-green-400 mt-1">
                  {scheduleImport.inserted}
                </p>
              </div>

              <div className="bg-[#10151c] rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500">
                  Updated
                </p>

                <p className="text-xl font-semibold text-blue-400 mt-1">
                  {scheduleImport.updated}
                </p>
              </div>

              <div className="bg-[#10151c] rounded-lg px-4 py-3">
                <p className="text-xs text-gray-500">
                  Sheets
                </p>

                <p className="text-xl font-semibold text-white mt-1">
                  {scheduleImport.sheets.length}
                </p>
              </div>

            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-gray-400">
            <span>
              Start: {scheduleImport.projectStart || "—"}
            </span>

            <span>
              End: {scheduleImport.projectEnd || "—"}
            </span>

            <button
              type="button"
              onClick={() => navigate("/activities")}
              className="text-blue-400 hover:text-blue-300"
            >
              View Imported Activities →
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          PROGRESS TREND CHART
      ===================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h3 className="text-lg font-semibold text-white">
              Progress Trend
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Planned vs actual progress across tracked activities
            </p>

          </div>


          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">

            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-blue-500" />

              <span className="text-gray-400">
                Planned
              </span>

            </div>


            <div className="flex items-center gap-2">

              <span className="w-3 h-3 rounded-full bg-green-500" />

              <span className="text-gray-400">
                Actual
              </span>

            </div>

          </div>

        </div>


        <div className="mt-6 h-56 sm:h-72 w-full min-w-0 overflow-hidden">

          {progressActivities.length === 0 ? (

            <div className="h-full flex items-center justify-center">

              <p className="text-gray-500 text-sm">
                No progress data available.
              </p>

            </div>

          ) : (

            <svg
              viewBox="0 0 800 280"
              className="w-full h-full"
              preserveAspectRatio="none"
            >

              {/* Horizontal Grid */}

              {[40, 80, 120, 160, 200].map(
                (y) => (

                  <line
                    key={y}
                    x1="50"
                    y1={y}
                    x2="770"
                    y2={y}
                    stroke="#252d38"
                    strokeWidth="1"
                  />

                )
              )}


              {/* Y Axis */}

              <text
                x="15"
                y="204"
                fill="#6b7280"
                fontSize="12"
              >
                0
              </text>

              <text
                x="10"
                y="164"
                fill="#6b7280"
                fontSize="12"
              >
                25
              </text>

              <text
                x="10"
                y="124"
                fill="#6b7280"
                fontSize="12"
              >
                50
              </text>

              <text
                x="10"
                y="84"
                fill="#6b7280"
                fontSize="12"
              >
                75
              </text>

              <text
                x="10"
                y="44"
                fill="#6b7280"
                fontSize="12"
              >
                100
              </text>


              {/* Planned Line */}

              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points={progressActivities
                  .map((item, index) => {

                    const x =
                      progressActivities.length === 1
                        ? 410
                        : 70 +
                          (index * 700) /
                            (progressActivities.length - 1)

                    const planned =
                      Number(
                        item.planned_progress || 0
                      )

                    const y =
                      204 -
                      (planned * 160) /
                        100

                    return `${x},${y}`
                  })
                  .join(" ")}
              />


              {/* Actual Line */}

              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                points={progressActivities
                  .map((item, index) => {

                    const x =
                      progressActivities.length === 1
                        ? 410
                        : 70 +
                          (index * 700) /
                            (progressActivities.length - 1)

                    const actual =
                      Number(
                        item.actual_progress || 0
                      )

                    const y =
                      204 -
                      (actual * 160) /
                        100

                    return `${x},${y}`
                  })
                  .join(" ")}
              />


              {/* Planned Points */}

              {progressActivities.map(
                (item, index) => {

                  const x =
                    progressActivities.length === 1
                      ? 410
                      : 70 +
                        (index * 700) /
                          (progressActivities.length - 1)

                  const planned =
                    Number(
                      item.planned_progress || 0
                    )

                  const y =
                    204 -
                    (planned * 160) /
                      100

                  return (

                    <circle
                      key={`planned-${item.id}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                    />

                  )
                }
              )}


              {/* Actual Points */}

              {progressActivities.map(
                (item, index) => {

                  const x =
                    progressActivities.length === 1
                      ? 410
                      : 70 +
                        (index * 700) /
                          (progressActivities.length - 1)

                  const actual =
                    Number(
                      item.actual_progress || 0
                    )

                  const y =
                    204 -
                    (actual * 160) /
                      100

                  return (

                    <circle
                      key={`actual-${item.id}`}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#22c55e"
                    />

                  )
                }
              )}


              {/* X Axis Activity Labels */}

              {progressActivities.map(
                (item, index) => {

                  const x =
                    progressActivities.length === 1
                      ? 410
                      : 70 +
                        (index * 700) /
                          (progressActivities.length - 1)

                  return (

                    <text
                      key={`label-${item.id}`}
                      x={x}
                      y="235"
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize="11"
                    >
                      {item.activity_code}
                    </text>

                  )
                }
              )}

            </svg>

          )}

        </div>

      </div>


      {/* =====================================================
          RECENT FIELD REPORTS
      ===================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div>

            <h3 className="text-lg font-semibold text-white">
              Recent Field Reports
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Latest execution updates received from site
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              navigate("/reports")
            }
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All
          </button>

        </div>


        <div className="mt-5 space-y-3">

          {recentReports.length === 0 ? (

            <div className="bg-[#10151c] rounded-lg p-4">

              <p className="text-gray-500 text-sm">
                No field reports available.
              </p>

            </div>

          ) : (

            recentReports.map((report) => (

              <div
                key={report.id}
                className="grid grid-cols-1 sm:grid-cols-[110px_minmax(0,1fr)_80px_120px_70px] gap-2 sm:gap-3 items-start sm:items-center p-4 bg-[#10151c] rounded-lg w-full min-w-0"
              >

                <span className="text-sm text-gray-300">
                  {report.report_code}
                </span>


                <span className="text-sm text-white">

                  {report.activity_name ||
                    report.activity_code ||
                    "Unmatched Activity"}

                </span>


                <span className="text-sm text-gray-300">

                  {formatProgress(
                    report.reported_progress
                  )}

                </span>


                <span
                  className={`text-sm font-medium ${getStatusClass(
                    report.matching_status
                  )}`}
                >

                  {formatReportStatus(
                    report.matching_status
                  )}

                </span>


                <span className="text-sm text-gray-400">

                  {Number(
                    report.match_confidence || 0
                  )}%

                </span>

              </div>

            ))

          )}

        </div>

      </div>


      {/* =====================================================
          CRITICAL ACTIVITIES
      ===================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <h3 className="text-lg font-semibold text-white">
            Critical Activities
          </h3>

          <span className="text-xs text-gray-500">
            Risk Analytics
          </span>

        </div>


        <div className="mt-5 space-y-3">

          {criticalActivities.length === 0 ? (

            <div className="bg-[#10151c] rounded-lg p-4">

              <p className="text-gray-500 text-sm">
                No medium or high-risk activities.
              </p>

            </div>

          ) : (

            criticalActivities.map((item) => (

              <button
                key={item.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/activity/${item.id}`
                  )
                }
                className="w-full min-w-0 text-left grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_120px_80px] gap-2 sm:gap-0 items-start sm:items-center p-4 bg-[#10151c] rounded-lg hover:bg-[#1b2430] transition"
              >

                <div>

                  <p className="font-medium text-white">
                    {item.name}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {item.activity_code}
                  </p>

                </div>


                <span
                  className={`text-sm font-medium ${getRiskClass(
                    item.risk_level
                  )}`}
                >

                  {item.risk_level}

                </span>


                <span className="text-sm text-gray-300">

                  {formatProgress(
                    item.actual_progress
                  )}

                </span>

              </button>

            ))

          )}

        </div>

      </div>


      {/* =====================================================
          UPLOAD MODAL
      ===================================================== */}

      <UploadModal
        open={uploadType !== null}

        onClose={() =>
          setUploadType(null)
        }

        title={`Upload ${uploadType || ""}`}

        description={
          uploadType === "Schedule"
            ? "Import Primavera / P6 schedule"
            : uploadType ===
              "DPR / Field Reports"
            ? ".jpg,.jpeg,.png,.webp"
            : uploadType ===
              "Progress & Materials"
            ? "Import progress and material data"
            : "Upload supporting photos or documents"
        }

        accept={
          uploadType === "Schedule"
            ? ".xlsx,.xls"
            : uploadType ===
              "DPR / Field Reports"
            ? ".pdf,.doc,.docx,.xlsx,.xls"
            : uploadType ===
              "Progress & Materials"
            ? ".xlsx,.xls,.csv"
            : "image/*,.pdf"
        }

        onFileSelect={(file) => {

          if (uploadType === "Schedule") {
            uploadSchedule(file)
            return
          }

          if (uploadType === "DPR / Field Reports") {
            uploadDprImage(file)
            return
          }

          setUploadedFiles((prev) => ({
            ...prev,
            [uploadType]: file.name,
          }))

          setUploadType(null)

        }}
      />

    </div>
  )
}

export default Dashboard