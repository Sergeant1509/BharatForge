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

    activityHierarchy: [
      {
        id: "L5-CIV",
        name: "Civil & Structural Works",
        discipline: "Civil",
        children: [
          {
            id: "A103",
            name: "Compressor Foundation",
            description: "Construction and reinforcement of compressor foundation",
            progress: "65%",
          },
          {
            id: "A118",
            name: "Equipment Foundation",
            description: "Civil foundation works for process equipment",
            progress: "72%",
          },
        ],
      },
      {
        id: "L5-PIP",
        name: "Piping Works",
        discipline: "Piping",
        children: [
          {
            id: "A221",
            name: "Main Piping Installation",
            description: "Installation of main process piping",
            progress: "48%",
          },
          {
            id: "A245",
            name: "Pipeline Pressure Testing",
            description: "Hydrostatic pressure testing of pipelines",
            progress: "35%",
          },
        ],
      },
      {
        id: "L5-ELE",
        name: "Electrical Works",
        discipline: "Electrical",
        children: [
          {
            id: "A417",
            name: "Electrical Works",
            description: "Electrical cable installation and termination",
            progress: "72%",
          },
          {
            id: "A429",
            name: "Equipment Testing",
            description: "Testing of electrical equipment and systems",
            progress: "54%",
          },
        ],
      },
      {
        id: "L5-INS",
        name: "Instrumentation Works",
        discipline: "Instrumentation",
        children: [
          {
            id: "A501",
            name: "Instrument Installation",
            description: "Installation of field instruments",
            progress: "61%",
          },
          {
            id: "A517",
            name: "Instrument Calibration",
            description: "Calibration and loop checking of instruments",
            progress: "42%",
          },
        ],
      },
      {
        id: "L5-HSE",
        name: "HSE & Safety",
        discipline: "HSE",
        children: [
          {
            id: "A601",
            name: "Safety Inspection",
            description: "Daily construction safety inspection",
            progress: "88%",
          },
          {
            id: "A615",
            name: "Permit Compliance",
            description: "Permit and safety compliance verification",
            progress: "91%",
          },
        ],
      },
    ],
  },
]

const disciplines = [
  "All",
  "Civil",
  "Piping",
  "Electrical",
  "Instrumentation",
  "HSE",
]

const Projects = () => {
  const [projects, setProjects] = useState(initialProjects)
  const [showForm, setShowForm] = useState(false)

  const [search, setSearch] = useState("")
  const [discipline, setDiscipline] = useState("All")

  const [expandedL5, setExpandedL5] = useState({})

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
      activityHierarchy: [],
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

  const toggleL5 = (projectId, l5Id) => {
    const key = `${projectId}-${l5Id}`

    setExpandedL5((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const getFilteredHierarchy = (project) => {
    return project.activityHierarchy
      .filter((l5) => {
        if (discipline !== "All" && l5.discipline !== discipline) {
          return false
        }

        return true
      })
      .map((l5) => {
        const filteredChildren = l5.children.filter((activity) => {
          const query = search.toLowerCase().trim()

          if (!query) return true

          return (
            activity.id.toLowerCase().includes(query) ||
            activity.name.toLowerCase().includes(query) ||
            activity.description.toLowerCase().includes(query)
          )
        })

        return {
          ...l5,
          children: filteredChildren,
        }
      })
      .filter((l5) => l5.children.length > 0)
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

      {/* Search + Filters */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <div className="flex flex-col lg:flex-row gap-4">

          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search Activity ID or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Discipline */}
          <select
            value={discipline}
            onChange={(e) => setDiscipline(e.target.value)}
            className="bg-[#10151c] border border-[#252d38] rounded-lg px-4 py-3 text-gray-300 outline-none"
          >
            {disciplines.map((item) => (
              <option key={item} value={item}>
                {item === "All" ? "All Disciplines" : item}
              </option>
            ))}
          </select>

        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {disciplines.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDiscipline(item)}
              className={`px-3 py-1.5 rounded-lg text-xs transition ${
                discipline === item
                  ? "bg-blue-600 text-white"
                  : "bg-[#10151c] border border-[#252d38] text-gray-400 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

      </div>

      {/* Project List */}
      <div className="mt-8 grid grid-cols-1 gap-4">

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

            {/* Activity Hierarchy */}
            <div className="mt-8 pt-6 border-t border-[#252d38]">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">
                    Schedule Activity Hierarchy
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    L5 WBS → L6 Activities
                  </p>
                </div>

                <span className="text-xs text-gray-500">
                  Planning Reference
                </span>
              </div>

              <div className="mt-5 space-y-3">

                {getFilteredHierarchy(project).map((l5) => {
                  const key = `${project.id}-${l5.id}`
                  const isExpanded = expandedL5[key]

                  return (
                    <div
                      key={l5.id}
                      className="border border-[#252d38] rounded-lg overflow-hidden"
                    >

                      {/* L5 */}
                      <button
                        type="button"
                        onClick={() => toggleL5(project.id, l5.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-[#10151c] hover:bg-[#1b2430] transition text-left"
                      >

                        <div className="flex items-center gap-3">

                          <span className="text-gray-500">
                            {isExpanded ? "▼" : "▶"}
                          </span>

                          <div>
                            <p className="text-sm font-medium text-white">
                              {l5.id}
                            </p>

                            <p className="text-sm text-gray-300 mt-0.5">
                              {l5.name}
                            </p>
                          </div>

                        </div>

                        <span className="text-xs text-gray-400">
                          {l5.discipline}
                        </span>

                      </button>

                      {/* L6 */}
                      {isExpanded && (
                        <div className="divide-y divide-[#252d38]">

                          {l5.children.map((activity) => (
                            <div
                              key={activity.id}
                              className="px-5 py-4 bg-[#151b24] hover:bg-[#1b2430] transition"
                            >

                              <div className="flex items-start justify-between gap-4">

                                <div>
                                  <div className="flex items-center gap-3">

                                    <span className="text-xs text-blue-400 font-medium">
                                      L6
                                    </span>

                                    <span className="text-sm font-medium text-white">
                                      {activity.id}
                                    </span>

                                  </div>

                                  <p className="text-sm text-gray-300 mt-2">
                                    {activity.name}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {activity.description}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">

                                  <p className="text-xs text-gray-500">
                                    Progress
                                  </p>

                                  <p className="text-sm text-white mt-1">
                                    {activity.progress}
                                  </p>

                                </div>

                              </div>

                            </div>
                          ))}

                        </div>
                      )}

                    </div>
                  )
                })}

              </div>

              {getFilteredHierarchy(project).length === 0 && (
                <div className="mt-4 py-8 text-center border border-dashed border-[#252d38] rounded-lg">
                  <p className="text-gray-400 text-sm">
                    No activities found
                  </p>

                  <p className="text-gray-600 text-xs mt-1">
                    Try another Activity ID, description or discipline.
                  </p>
                </div>
              )}

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