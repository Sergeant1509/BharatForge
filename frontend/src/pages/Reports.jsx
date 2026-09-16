import { useState } from "react"

const initialReports = [
  {
    id: "FR-1023",
    date: "14 Sep 2026",
    location: "Block A",
    activity: "Compressor Foundation",
    progress: "65%",
    status: "Processed",
    confidence: "94%",
  },
  {
    id: "FR-1031",
    date: "14 Sep 2026",
    location: "Block A",
    activity: "Compressor Foundation",
    progress: "65%",
    status: "Needs Review",
    confidence: "81%",
  },
]

const Reports = () => {
  const [reports, setReports] = useState(initialReports)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    id: "",
    date: "",
    location: "",
    activity: "",
    progress: "",
    text: "",
    material: "",
    evidence: null,
  })

  const submitReport = (e) => {
    e.preventDefault()

    const newReport = {
      id: form.id,
      date: form.date,
      location: form.location,
      activity: form.activity || "Pending AI Match",
      progress: `${form.progress}%`,
      status: "Needs Review",
      confidence: "Pending",
    }

    setReports([...reports, newReport])

    setForm({
      id: "",
      date: "",
      location: "",
      activity: "",
      progress: "",
      text: "",
      material: "",
      evidence: null,
    })

    setShowForm(false)
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
            Ground execution updates
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          {showForm ? "Close" : "+ Add Report"}
        </button>
      </div>

      {/* Input Form */}
      {showForm && (
        <form
          onSubmit={submitReport}
          className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-white">
              Submit Field Report
            </h3>

            <p className="text-gray-400 text-sm mt-1">
              Provide the latest execution information from site
            </p>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

            <input
              required
              placeholder="Report ID"
              value={form.id}
              onChange={(e) =>
                setForm({ ...form, id: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              required
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              required
              placeholder="Site / Location"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              placeholder="Known Activity ID (optional)"
              value={form.activity}
              onChange={(e) =>
                setForm({ ...form, activity: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              required
              type="number"
              min="0"
              max="100"
              placeholder="Progress %"
              value={form.progress}
              onChange={(e) =>
                setForm({ ...form, progress: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              placeholder="Material / Constraint (optional)"
              value={form.material}
              onChange={(e) =>
                setForm({ ...form, material: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

          </div>

          {/* Execution Update */}
          <textarea
            required
            placeholder="Describe the site execution update..."
            value={form.text}
            onChange={(e) =>
              setForm({ ...form, text: e.target.value })
            }
            className="w-full mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-3 h-32 text-white outline-none resize-none"
          />

          {/* Evidence */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">
                Supporting Evidence
              </label>

              <span className="text-xs text-gray-500">
                Optional
              </span>
            </div>

            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                setForm({
                  ...form,
                  evidence: e.target.files[0],
                })
              }
              className="w-full bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-sm text-gray-400"
            />

            <p className="text-xs text-gray-600 mt-2">
              Photos or documents can support the execution update.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-6 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
          >
            Submit for Processing
          </button>
        </form>
      )}

      {/* Reports Table */}
      <div className="mt-8 overflow-hidden rounded-xl border border-[#252d38]">

        <div className="px-5 py-4 bg-[#151b24] border-b border-[#252d38]">
          <h3 className="font-semibold text-white">
            Submitted Reports
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Field updates received by BharatForge
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead className="bg-[#151b24] text-gray-400 text-sm">
              <tr>
                <th className="p-4">Report</th>
                <th className="p-4">Activity</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Status</th>
                <th className="p-4">Confidence</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-t border-[#252d38] bg-[#10151c] hover:bg-[#151b24] transition"
                >

                  <td className="p-4">
                    <p className="text-white font-medium">
                      {report.id}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      {report.date} · {report.location}
                    </p>
                  </td>

                  <td className="p-4 text-gray-300">
                    {report.activity}
                  </td>

                  <td className="p-4 text-green-400">
                    {report.progress}
                  </td>

                  <td className="p-4">
                    <span
                      className={
                        report.status === "Processed"
                          ? "text-green-400"
                          : "text-yellow-400"
                      }
                    >
                      {report.status}
                    </span>
                  </td>

                  <td className="p-4 text-gray-400">
                    {report.confidence}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* Processing Explanation */}
      <div className="mt-6 bg-[#151b24] border border-[#252d38] rounded-xl p-5">
        <p className="text-sm text-gray-400">
          Submitted reports will be analyzed against schedule
          activities. Low-confidence or conflicting updates can be
          routed to the verification queue.
        </p>
      </div>

    </div>
  )
}

export default Reports