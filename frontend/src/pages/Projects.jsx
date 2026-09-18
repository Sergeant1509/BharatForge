import { useEffect, useState } from "react"

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
            description:
              "Construction and reinforcement of compressor foundation",
            progress: "65%",
          },
          {
            id: "A118",
            name: "Equipment Foundation",
            description:
              "Civil foundation works for process equipment",
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
            description:
              "Installation of main process piping",
            progress: "48%",
          },
          {
            id: "A245",
            name: "Pipeline Pressure Testing",
            description:
              "Hydrostatic pressure testing of pipelines",
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
            description:
              "Electrical cable installation and termination",
            progress: "72%",
          },
          {
            id: "A429",
            name: "Equipment Testing",
            description:
              "Testing of electrical equipment and systems",
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
            description:
              "Installation of field instruments",
            progress: "61%",
          },
          {
            id: "A517",
            name: "Instrument Calibration",
            description:
              "Calibration and loop checking of instruments",
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
            description:
              "Daily construction safety inspection",
            progress: "88%",
          },
          {
            id: "A615",
            name: "Permit Compliance",
            description:
              "Permit and safety compliance verification",
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

  const [loadingProjects, setLoadingProjects] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)

  const [form, setForm] = useState({
    code: "",
    name: "",
    location: "",
    schedule: null,
  })

  /*
    Load projects from backend
  */
  const loadProjects = async () => {
    try {
      setLoadingProjects(true)

      const response = await fetch(
        "http://localhost:5000/api/projects"
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load projects"
        )
      }

      const databaseProjects = result.data.map((project) => ({
        id: project.project_code,
        name: project.name,
        location: project.location,

        progress: `${Number(
          project.actual_progress || 0
        )}%`,

        activities: 0,

        status:
          project.status === "ACTIVE"
            ? "Active"
            : project.status || "Active",

        schedule: "Database Project",

        activityHierarchy: [],
      }))

      /*
        Keep demo project if it is not
        present in the database.
      */
      const databaseProjectCodes = new Set(
        databaseProjects.map(
          (project) => project.id
        )
      )

      const demoProjects = initialProjects.filter(
        (project) =>
          !databaseProjectCodes.has(project.id)
      )

      setProjects([
        ...demoProjects,
        ...databaseProjects,
      ])
    } catch (error) {
      console.error(
        "Failed to load projects:",
        error
      )
    } finally {
      setLoadingProjects(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  /*
    Create new project
  */
  const submitProject = async (e) => {
    e.preventDefault()

    if (creatingProject) {
      return
    }

    try {
      setCreatingProject(true)

      const response = await fetch(
        "http://localhost:5000/api/projects",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            project_code: form.code.trim(),
            name: form.name.trim(),
            location: form.location.trim(),

            status: "ACTIVE",

            planned_progress: 0,

            actual_progress: 0,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to create project"
        )
      }

      const createdProject = result.data

      const newProject = {
        id: createdProject.project_code,

        name: createdProject.name,

        location: createdProject.location,

        progress: `${Number(
          createdProject.actual_progress || 0
        )}%`,

        activities: 0,

        status:
          createdProject.status === "ACTIVE"
            ? "Active"
            : createdProject.status,

        schedule:
          form.schedule?.name ||
          "Pending",

        activityHierarchy: [],
      }

      setProjects((prevProjects) => [
        ...prevProjects.filter(
          (project) =>
            project.id !== newProject.id
        ),
        newProject,
      ])

      setForm({
        code: "",
        name: "",
        location: "",
        schedule: null,
      })

      setShowForm(false)

      alert(
        "Project created successfully"
      )
    } catch (error) {
      console.error(
        "Create project error:",
        error
      )

      alert(
        `Failed to create project: ${error.message}`
      )
    } finally {
      setCreatingProject(false)
    }
  }

  /*
    Expand / collapse L5 activity group
  */
  const toggleL5 = (projectId, l5Id) => {
    const key = `${projectId}-${l5Id}`

    setExpandedL5((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  /*
    Search + discipline filtering
  */
  const getFilteredHierarchy = (project) => {
    const query = search.toLowerCase().trim()

    return project.activityHierarchy
      .filter((l5) => {
        if (
          discipline !== "All" &&
          l5.discipline !== discipline
        ) {
          return false
        }

        return true
      })
      .map((l5) => {
        const filteredChildren =
          l5.children.filter((activity) => {
            if (!query) {
              return true
            }

            return (
              activity.id
                .toLowerCase()
                .includes(query) ||
              activity.name
                .toLowerCase()
                .includes(query) ||
              activity.description
                .toLowerCase()
                .includes(query)
            )
          })

        return {
          ...l5,
          children: filteredChildren,
        }
      })
      .filter(
        (l5) =>
          l5.children.length > 0
      )
  }

  /*
    Project search
  */
  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase().trim()

    if (!query) {
      return true
    }

    return (
      project.id.toLowerCase().includes(query) ||
      project.name.toLowerCase().includes(query) ||
      project.location.toLowerCase().includes(query) ||
      getFilteredHierarchy(project).length > 0
    )
  })

  return (
    <div className="w-full pb-10">

      {/* HEADER */}

      <div
        className="
          flex flex-col gap-4
          sm:flex-row sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h2
            className="
              text-xl font-semibold text-white
              sm:text-2xl
            "
          >
            Projects
          </h2>

          <p className="mt-1 text-sm text-gray-400 sm:mt-2">
            Project and schedule overview
          </p>
        </div>

        <button
          onClick={() =>
            setShowForm(!showForm)
          }
          className="
            w-full
            rounded-lg
            bg-blue-600
            px-4 py-2.5
            text-sm
            text-white
            transition
            hover:bg-blue-700
            sm:w-auto
            sm:shrink-0
          "
        >
          {showForm
            ? "Close"
            : "+ New Project"}
        </button>
      </div>

      {/* NEW PROJECT FORM */}

      {showForm && (
        <form
          onSubmit={submitProject}
          className="
            mt-6
            rounded-xl
            border border-[#252d38]
            bg-[#151b24]
            p-4
            sm:mt-8
            sm:p-6
          "
        >
          <h3 className="text-base font-semibold text-white sm:text-lg">
            Create New Project
          </h3>

          <p className="mt-1 text-xs text-gray-400 sm:text-sm">
            Start a project by providing its basic information
            and schedule.
          </p>

          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3
              sm:gap-4
              md:grid-cols-2
              lg:grid-cols-3
            "
          >
            <input
              required
              placeholder="Project Code"
              value={form.code}
              onChange={(e) =>
                setForm({
                  ...form,
                  code: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />

            <input
              required
              placeholder="Project Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />

            <input
              required
              placeholder="Location"
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
                md:col-span-2
                lg:col-span-1
              "
            />
          </div>

          {/* Schedule */}

          <div className="mt-5">
            <div
              className="
                mb-2
                flex flex-col gap-1
                sm:flex-row sm:items-center
                sm:justify-between
              "
            >
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
                  schedule:
                    e.target.files[0],
                })
              }
              className="
                w-full
                rounded-lg
                border border-[#252d38]
                bg-[#10151c]
                p-2.5
                text-xs
                text-gray-400
                sm:p-3
                sm:text-sm
              "
            />

            <p className="mt-2 text-[11px] text-gray-600 sm:text-xs">
              Primavera/P6 schedule or supported spreadsheet
              format.
            </p>
          </div>

          <button
            type="submit"
            disabled={creatingProject}
            className={`
              mt-5
              w-full
              rounded-lg
              px-5 py-2.5
              text-sm
              text-white
              transition
              sm:w-auto
              sm:mt-6
              ${
                creatingProject
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }
            `}
          >
            {creatingProject
              ? "Creating..."
              : "Create Project"}
          </button>
        </form>
      )}

      {/* SEARCH + FILTERS */}

      <div
        className="
          mt-6
          rounded-xl
          border border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:gap-4
          "
        >
          <div className="min-w-0 flex-1">
            <input
              type="text"
              placeholder="Search Activity ID or description..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                w-full
                rounded-lg
                border border-[#252d38]
                bg-[#10151c]
                px-4 py-3
                text-sm
                text-white
                placeholder-gray-500
                outline-none
                focus:border-blue-500
              "
            />
          </div>

          <select
            value={discipline}
            onChange={(e) =>
              setDiscipline(e.target.value)
            }
            className="
              w-full
              rounded-lg
              border border-[#252d38]
              bg-[#10151c]
              px-4 py-3
              text-sm
              text-gray-300
              outline-none
              lg:w-auto
              lg:min-w-45
            "
          >
            {disciplines.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item === "All"
                  ? "All Disciplines"
                  : item}
              </option>
            ))}
          </select>
        </div>

        {/* Filter buttons */}

        <div
          className="
            mt-4
            flex
            gap-2
            overflow-x-auto
            pb-1
          "
        >
          {disciplines.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setDiscipline(item)
              }
              className={`
                shrink-0
                rounded-lg
                px-3 py-1.5
                text-xs
                transition
                ${
                  discipline === item
                    ? "bg-blue-600 text-white"
                    : "border border-[#252d38] bg-[#10151c] text-gray-400 hover:text-white"
                }
              `}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* PROJECT LIST */}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-8">

        {loadingProjects ? (
          <div
            className="
              rounded-xl
              border border-[#252d38]
              bg-[#151b24]
              p-8
              text-center
            "
          >
            <p className="text-gray-400">
              Loading projects...
            </p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            className="
              rounded-xl
              border border-[#252d38]
              bg-[#151b24]
              p-8
              text-center
            "
          >
            <p className="text-gray-400">
              No projects found.
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="
                overflow-hidden
                rounded-xl
                border border-[#252d38]
                bg-[#151b24]
                p-4
                sm:p-6
              "
            >

              {/* PROJECT HEADER */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      wrap-break-word
                      text-lg
                      font-semibold
                      text-white
                      sm:text-xl
                    "
                  >
                    {project.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {project.id}
                  </p>
                </div>

                <span
                  className={`
                    self-start
                    rounded-full
                    border
                    px-2.5 py-1
                    text-xs
                    ${
                      project.status === "Active"
                        ? "border-green-900/50 text-green-400"
                        : "border-yellow-900/50 text-yellow-400"
                    }
                  `}
                >
                  {project.status}
                </span>
              </div>

              {/* PROJECT DETAILS */}

              <div
                className="
                  mt-6
                  grid
                  grid-cols-2
                  gap-4
                  sm:mt-8
                  sm:grid-cols-3
                "
              >
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Location
                  </p>

                  <p className="mt-1 truncate text-sm text-white sm:text-base">
                    {project.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Progress
                  </p>

                  <p className="mt-1 text-sm text-white sm:text-base">
                    {project.progress}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-gray-400 sm:text-sm">
                    Activities
                  </p>

                  <p className="mt-1 text-sm text-white sm:text-base">
                    {project.activities}
                  </p>
                </div>
              </div>

              {/* SCHEDULE */}

              <div
                className="
                  mt-5
                  border-t border-[#252d38]
                  pt-4
                  sm:mt-6
                  sm:pt-5
                "
              >
                <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
                  SCHEDULE
                </p>

                <p className="mt-1.5 break-all text-xs text-gray-300 sm:mt-2 sm:text-sm">
                  {project.schedule}
                </p>
              </div>

              {/* ACTIVITY HIERARCHY */}

              <div
                className="
                  mt-6
                  border-t border-[#252d38]
                  pt-5
                  sm:mt-8
                  sm:pt-6
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-2
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        text-base
                        font-semibold
                        text-white
                        sm:text-lg
                      "
                    >
                      Schedule Activity Hierarchy
                    </p>

                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      L5 WBS → L6 Activities
                    </p>
                  </div>

                  <span className="text-[10px] text-gray-500 sm:text-xs">
                    Planning Reference
                  </span>
                </div>

                <div className="mt-4 space-y-3 sm:mt-5">

                  {getFilteredHierarchy(project).map(
                    (l5) => {
                      const key =
                        `${project.id}-${l5.id}`

                      const isExpanded =
                        expandedL5[key]

                      return (
                        <div
                          key={l5.id}
                          className="
                            overflow-hidden
                            rounded-lg
                            border border-[#252d38]
                          "
                        >

                          {/* L5 */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleL5(
                                project.id,
                                l5.id
                              )
                            }
                            className="
                              flex
                              w-full
                              items-center
                              justify-between
                              gap-3
                              bg-[#10151c]
                              px-3 py-3
                              text-left
                              transition
                              hover:bg-[#1b2430]
                              sm:px-4
                            "
                          >
                            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

                              <span className="shrink-0 text-xs text-gray-500">
                                {isExpanded
                                  ? "▼"
                                  : "▶"}
                              </span>

                              <div className="min-w-0">
                                <p className="text-xs font-medium text-white sm:text-sm">
                                  {l5.id}
                                </p>

                                <p className="mt-0.5 wrap-break-word text-xs text-gray-300 sm:text-sm">
                                  {l5.name}
                                </p>
                              </div>
                            </div>

                            <span className="shrink-0 text-[10px] text-gray-400 sm:text-xs">
                              {l5.discipline}
                            </span>
                          </button>

                          {/* L6 */}

                          {isExpanded && (
                            <div className="divide-y divide-[#252d38]">

                              {l5.children.map(
                                (activity) => (
                                  <div
                                    key={activity.id}
                                    className="
                                      bg-[#151b24]
                                      px-3 py-4
                                      transition
                                      hover:bg-[#1b2430]
                                      sm:px-5
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        flex-col
                                        gap-4
                                        sm:flex-row
                                        sm:items-start
                                        sm:justify-between
                                      "
                                    >
                                      <div className="min-w-0">

                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                          <span className="text-[10px] font-medium text-blue-400 sm:text-xs">
                                            L6
                                          </span>

                                          <span className="text-xs font-medium text-white sm:text-sm">
                                            {activity.id}
                                          </span>
                                        </div>

                                        <p className="mt-2 wrap-break-word text-sm text-gray-300">
                                          {activity.name}
                                        </p>

                                        <p className="mt-1 wrap-break-word text-xs leading-5 text-gray-500">
                                          {activity.description}
                                        </p>

                                      </div>

                                      <div
                                        className="
                                          flex
                                          items-center
                                          justify-between
                                          border-t border-[#252d38]
                                          pt-3
                                          sm:block
                                          sm:min-w-20
                                          sm:border-0
                                          sm:pt-0
                                          sm:text-right
                                        "
                                      >
                                        <p className="text-[10px] text-gray-500 sm:text-xs">
                                          Progress
                                        </p>

                                        <p className="mt-0 text-sm text-white sm:mt-1">
                                          {activity.progress}
                                        </p>
                                      </div>

                                    </div>
                                  </div>
                                )
                              )}

                            </div>
                          )}

                        </div>
                      )
                    }
                  )}

                </div>

                {/* Empty state */}

                {getFilteredHierarchy(project).length === 0 && (
                  <div
                    className="
                      mt-4
                      rounded-lg
                      border
                      border-dashed
                      border-[#252d38]
                      px-4 py-8
                      text-center
                    "
                  >
                    <p className="text-sm text-gray-400">
                      No activities found
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      Try another Activity ID,
                      description or discipline.
                    </p>
                  </div>
                )}

              </div>

            </div>
          ))
        )}

      </div>

      {/* ARCHITECTURE NOTE */}

      <div
        className="
          mt-6
          rounded-xl
          border border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-5
        "
      >
        <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
          PROJECT INITIALIZATION
        </p>

        <p className="mt-2 text-xs leading-5 text-gray-300 sm:text-sm sm:leading-6">
          A project starts from its schedule. Once the
          schedule is processed, its WBS and activities
          become the planning reference for field
          execution reconciliation.
        </p>
      </div>

    </div>
  )
}

export default Projects