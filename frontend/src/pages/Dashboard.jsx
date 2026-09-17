import UploadModal from "../components/UploadModal"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const API_BASE = "http://localhost:5000/api"

const inputSources = [
  {
    title: "Schedule",
    description: "Import Primavera / P6 schedule",
    formats: "XER / XML / XLSX",
  },
  {
    title: "DPR / Field Reports",
    description: "Upload daily site execution reports",
    formats: "PDF / DOCX / XLSX",
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

        setUploadedFiles((prev) => ({
          ...prev,
          [sourceType]: file.name,
        }))
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
      <div className="pb-10">

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Project
            </p>

            <h2 className="text-2xl font-semibold text-white mt-1">
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
      <div className="pb-10">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm text-gray-500">
              Project
            </p>

            <h2 className="text-2xl font-semibold text-white mt-1">
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
    <div className="pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-gray-500">
            Project
          </p>

          <h2 className="text-2xl font-semibold text-white mt-1">
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
          PROGRESS TREND CHART
      ===================================================== */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="text-lg font-semibold text-white">
              Progress Trend
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Planned vs actual progress across tracked activities
            </p>

          </div>


          <div className="flex items-center gap-4 text-xs">

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


        <div className="mt-6 h-72 w-full">

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

        <div className="flex items-center justify-between">

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
                className="grid grid-cols-[110px_1fr_80px_120px_70px] gap-3 items-center p-4 bg-[#10151c] rounded-lg"
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

        <div className="flex items-center justify-between">

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
                className="w-full text-left grid grid-cols-[1fr_120px_80px] items-center p-4 bg-[#10151c] rounded-lg hover:bg-[#1b2430] transition"
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
            ? "Upload daily site execution reports"
            : uploadType ===
              "Progress & Materials"
            ? "Import progress and material data"
            : "Upload supporting photos or documents"
        }

        accept={
          uploadType === "Schedule"
            ? ".xer,.xml,.xlsx,.xls"
            : uploadType ===
              "DPR / Field Reports"
            ? ".pdf,.doc,.docx,.xlsx,.xls"
            : uploadType ===
              "Progress & Materials"
            ? ".xlsx,.xls,.csv"
            : "image/*,.pdf"
        }

        onFileSelect={(file) => {

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