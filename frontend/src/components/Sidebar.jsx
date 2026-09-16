import React from 'react'
import { NavLink } from 'react-router-dom'

const menu = [
  ["Dashboard", "/"],
  ["Projects", "/projects"],
  ["Activities", "/activities"],
  ["Field Reports", "/reports"],
  ["Verification", "/verification"],
  ["Audit Trail", "/audit-trail"],
]

const Sidebar = () => {
  return (
     <aside className="w-64 min-h-screen bg-[#0b0f14] text-white p-6">
      <h1 className="text-xl font-bold">BharatForge</h1>

      <nav className='space-y-2'>
        {menu.map(([label, path])=> (
            <NavLink 
            key={label}
            to={path}
             className={({ isActive }) =>
              `block px-4 py-3 rounded-lg ${
                isActive
                  ? "bg-[#1b2430] text-white"
                  : "text-gray-400 hover:bg-[#151b24] hover:text-white"
              }`
            }
            >
            {label}
            </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar