import { useState } from "react"

const initialReports = [
  {
    id: "FR-1023",
    date: "16 Sep 2026",
    sourceType: "Daily Report",
    discipline: "Civil",
    activity: "Compressor Foundation",
    progress: "65%",
    processingStatus: "Processed",
    extractionStatus: "Complete",
    matchingStatus: "Matched",
    confidence: "94%",
  },
  {
    id: "FR-1031",
    date: "16 Sep 2026",
    sourceType: "Daily Report",
    discipline: "Civil",
    activity: "Compressor Foundation",
    progress: "65%",
    processingStatus: "Processed",
    extractionStatus: "Complete",
    matchingStatus: "Needs Review",
    confidence: "81%",
  },
  {
    id: "FR-1042",
    date: "15 Sep 2026",
    sourceType: "Spreadsheet",
    discipline: "Piping",
    activity: "Main Piping Installation",
    progress: "48%",
    processingStatus: "Processed",
    extractionStatus: "Complete",
    matchingStatus: "Matched",
    confidence: "89%",
  },
]

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
]

const Reports = () => {
  const [reports, setReports] = useState(initialReports)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    reportId: "",
    date: "",
    sourceType: "Daily Report",
    discipline: "Civil",
    activityId: "",
    progress: "",
    constraint: "",
    executionUpdate: "",
    evidence: null,
  })

  const submitReport = (e) => {
    e.preventDefault()

    const newReport = {
      id: form.reportId,
      date: form.date,
      sourceType: form.sourceType,
      discipline: form.discipline,
      activity: form.activityId || "Pending AI Match",
      progress: form.progress ? `${form.progress}%` : "—",
      processingStatus: "Pending",
      extractionStatus: "Pending",
      matchingStatus: "Pending",
      confidence: "Pending",
    }

    setReports([newReport, ...reports])

    setForm({
      reportId: "",
      date: "",
      sourceType: "Daily Report",
      discipline: "Civil",
      activityId: "",
      progress: "",
      constraint: "",
      executionUpdate: "",
      evidence: null,
    })

    setShowForm(false)
  }

  const statusClass = (status) => {
    if (status === "Complete" || status === "Processed" || status === "Matched") {
      return "text-green-400"
    }

    if (status === "Needs Review") {
      return "text-yellow-400"
    }

    if (status === "Pending") {
      return "text-gray-400"
    }

    return "text-red-400"
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
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          {showForm ? "Close" : "+ Add Field Update"}
        </button>
      </div>

      {/* Input Sources */}
      <div className="mt-8">

        <p className="text-xs text-gray-500 mb-3">
          FIELD INPUT SOURCES
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {[
            {
              title: "Daily Report",
              description: "Upload DPR / daily site execution report",
              formats: "PDF / DOCX / XLSX",
            },
            {
              title: "Spreadsheet",
              description: "Import structured progress or field data",
              formats: "XLSX / XLS / CSV",
            },
            {
              title: "Manual Field Update",
              description: "Enter an execution update directly",
              formats: "Manual Entry",
            },
          ].map((source) => (
            <button
              key={source.title}
              type="button"
              onClick={() => {
                setForm({
                  ...form,
                  sourceType: source.title,
                })
                setShowForm(true)
              }}
              className="text-left bg-[#151b24] border border-[#252d38] rounded-xl p-5 hover:bg-[#1b2430] hover:border-[#3a4655] transition"
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

            </button>
          ))}

        </div>

      </div>

      {/* Add Report Form */}
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

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">

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
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

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
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

          </div>

          {/* Activity Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

            <input
              placeholder="Activity ID (optional)"
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
                  evidence: e.target.files[0],
                })
              }
              className="w-full mt-2 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-sm text-gray-400"
            />

          </div>

          <button
            type="submit"
            className="mt-6 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
          >
            Submit Field Update
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

              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-[#252d38] last:border-0"
                >

                  <td className="py-4 pr-5">
                    <p className="text-white font-medium">
                      {report.id}
                    </p>
                  </td>

                  <td className="py-4 pr-5">
                    <span className="text-gray-300">
                      {report.sourceType}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span className="text-gray-400">
                      {report.discipline}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span className="text-gray-400">
                      {report.date}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <div>
                      <p className="text-white">
                        {report.activity}
                      </p>
                    </div>
                  </td>

                  <td className="py-4 pr-5">
                    <span className="text-gray-300">
                      {report.progress}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span className={statusClass(report.processingStatus)}>
                      {report.processingStatus}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span className={statusClass(report.extractionStatus)}>
                      {report.extractionStatus}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span className={statusClass(report.matchingStatus)}>
                      {report.matchingStatus}
                    </span>
                  </td>

                  <td className="py-4">
                    <span className="text-gray-300">
                      {report.confidence}
                    </span>
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

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