import { useState } from "react"

const initialProjects = [
  {
    id: "OIL-001",
    name: "Gas Processing Plant",
    location: "Duliajan",
    progress: "74%",
    activities: 1000,
    status: "Active",
    schedule: "Imported",
  },
]

const Projects = () => {
  const [projects, setProjects] = useState(initialProjects)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    code: "",
    name: "",
    location: "",
    schedule: null,
  })

  const submitProject = (e) => {
    e.preventDefault()

    const newProject = {
      id: form.code,
      name: form.name,
      location: form.location,
      progress: "0%",
      activities: 0,
      status: "Processing",
      schedule: form.schedule?.name || "Pending",
    }

    setProjects([...projects, newProject])

    setForm({
      code: "",
      name: "",
      location: "",
      schedule: null,
    })

    setShowForm(false)
  }

  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Projects
          </h2>

          <p className="text-gray-400 mt-2">
            Project and schedule overview
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          {showForm ? "Close" : "+ New Project"}
        </button>
      </div>

      {/* New Project */}
      {showForm && (
        <form
          onSubmit={submitProject}
          className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white">
            Create New Project
          </h3>

          <p className="text-gray-400 text-sm mt-1">
            Start a project by providing its basic information and schedule.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">

            <input
              required
              placeholder="Project Code"
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              required
              placeholder="Project Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

            <input
              required
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
              className="bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-white outline-none"
            />

          </div>

          {/* Schedule */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">
                Project Schedule
              </label>

              <span className="text-xs text-red-400">
                Required
              </span>
            </div>

            <input
              required
              type="file"
              accept=".xer,.xml,.xlsx,.xls"
              onChange={(e) =>
                setForm({
                  ...form,
                  schedule: e.target.files[0],
                })
              }
              className="w-full bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-sm text-gray-400"
            />

            <p className="text-xs text-gray-600 mt-2">
              Primavera/P6 schedule or supported spreadsheet format.
            </p>
          </div>

          <button
            type="submit"
            className="mt-6 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
          >
            Create Project
          </button>
        </form>
      )}

      {/* Project List */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-4">

        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#151b24] border border-[#252d38] rounded-xl p-6"
          >

            {/* Project Header */}
            <div className="flex items-start justify-between">

              <div>
                <p className="text-xl font-semibold text-white">
                  {project.name}
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  {project.id}
                </p>
              </div>

              <span
                className={`text-sm ${
                  project.status === "Active"
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {project.status}
              </span>

            </div>

            {/* Project Details */}
            <div className="grid grid-cols-3 gap-4 mt-8">

              <div>
                <p className="text-gray-400 text-sm">
                  Location
                </p>

                <p className="text-white mt-1">
                  {project.location}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">
                  Progress
                </p>

                <p className="text-white mt-1">
                  {project.progress}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">
                  Activities
                </p>

                <p className="text-white mt-1">
                  {project.activities}
                </p>
              </div>

            </div>

            {/* Schedule */}
            <div className="mt-6 pt-5 border-t border-[#252d38]">

              <p className="text-xs text-gray-500">
                SCHEDULE
              </p>

              <p className="text-gray-300 text-sm mt-2">
                {project.schedule}
              </p>

            </div>

          </div>
        ))}

      </div>

      {/* Architecture Note */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          PROJECT INITIALIZATION
        </p>

        <p className="text-sm text-gray-300 mt-2">
          A project starts from its schedule. Once the schedule is
          processed, its WBS and activities become the planning
          reference for field execution reconciliation.
        </p>

      </div>

    </div>
  )
}

export default Projects