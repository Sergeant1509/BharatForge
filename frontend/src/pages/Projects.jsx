import React from 'react'
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

const Projects = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold">Projects</h2>
      <p className="text-gray-400 mt-2">Project overview</p>

      <div className="mt-8 grid grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-[#151b24] border border-[#252d38] rounded-xl p-6"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-xl font-semibold">{project.name}</p>
                <p className="text-gray-500 text-sm mt-1">{project.id}</p>
              </div>

              <span className="text-green-400">{project.status}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="mt-1">{project.location}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Progress</p>
                <p className="mt-1">{project.progress}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Activities</p>
                <p className="mt-1">{project.activities}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Projects
