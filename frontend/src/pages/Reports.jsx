import React from 'react'
import { useState } from "react"

const initialReports = [
  {
    id: "FR-1023",
    date: "14 Sep 2026",
    location: "Block A",
    status: "Processed",
  },
  {
    id: "FR-1031",
    date: "14 Sep 2026",
    location: "Block A",
    status: "Needs Review",
  },
]

const projects = [
  {
    id: "OIL-001",
    name: "Gas Processing Plant",
    location: "Duliajan",
    progress: "74%",
    activities: 1000,
    status: "Active",
  },
]

const Reports = () => {
  const [reports, setReports] = useState(initialReports)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    id: "",
    date: "",
    location: "",
    text: "",
    progress: "",
  })

  const submitReport = (e) => {
    e.preventDefault()

    setReports([
      ...reports,
      {
        id: form.id,
        date: form.date,
        location: form.location,
        status: "Needs Review",
      },
    ])

    setForm({
      id: "",
      date: "",
      location: "",
      text: "",
      progress: "",
    })

    setShowForm(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Field Reports</h2>
          <p className="text-gray-400 mt-2">
            Ground execution updates
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700"
        >
          + Add Report
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={submitReport}
          className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <input
              required
              placeholder="Report ID"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 outline-none"
            />

            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 outline-none"
            />

            <input
              required
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 outline-none"
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
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 outline-none"
            />
          </div>

          <textarea
            required
            placeholder="Describe site update..."
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            className="w-full mt-4 bg-[#10151c] border border-[#252d38] rounded-lg p-3 h-28 outline-none"
          />

          <button
            type="submit"
            className="mt-4 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700"
          >
            Submit Report
          </button>
        </form>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-[#252d38]">
        <table className="w-full text-left">
          <thead className="bg-[#151b24] text-gray-400 text-sm">
            <tr>
              <th className="p-4">Report ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-t border-[#252d38] bg-[#10151c]"
              >
                <td className="p-4">{report.id}</td>
                <td className="p-4 text-gray-400">{report.date}</td>
                <td className="p-4">{report.location}</td>
                <td className="p-4 text-yellow-400">{report.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Reports