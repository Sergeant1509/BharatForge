import { useState } from "react"
import { NavLink } from "react-router-dom"

const menu = [
  ["Dashboard", "/"],
  ["Projects", "/projects"],
  ["Activities", "/activities"],
  ["Field Reports", "/reports"],
  ["Verification", "/verification"],
  ["Audit Trail", "/audit-trail"],
]

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const getLinkClass = ({ isActive }) =>
    `
      flex items-center
      rounded-lg
      px-4 py-3
      text-sm font-medium
      transition-all duration-200
      ${
        isActive
          ? "bg-[#1d2632] text-white"
          : "text-gray-400 hover:bg-[#171e27] hover:text-white"
      }
    `

  return (
    <>
      {/* =========================
          MOBILE / TABLET TOP BAR
      ========================== */}

      <header
        className="
          fixed left-0 right-0 top-0 z-50
          flex h-16 items-center
          justify-between
          border-b border-[#252d38]
          bg-[#11161d]/95
          px-4
          backdrop-blur
          lg:hidden
        "
      >
        {/* Logo */}

        <div className="flex items-center gap-3">
          <div
            className="
              flex h-9 w-9
              items-center justify-center
              rounded-lg
              bg-[#1d2632]
              text-sm font-bold
              text-white
            "
          >
            BF
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              BharatForge
            </p>

            <p className="text-[10px] text-gray-500">
              Execution Intelligence
            </p>
          </div>
        </div>

        {/* Menu Button */}

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-lg
            border border-[#2a333f]
            bg-[#171e27]
            text-gray-300
            transition
            hover:bg-[#202936]
            hover:text-white
          "
          aria-label="Toggle navigation"
        >
          {isOpen ? (
            <span className="text-xl leading-none">
              ×
            </span>
          ) : (
            <span className="text-xl leading-none">
              ☰
            </span>
          )}
        </button>
      </header>


      {/* =========================
          MOBILE / TABLET DRAWER
      ========================== */}

      {isOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-black/50
            lg:hidden
          "
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed
          left-0 top-0
          z-50
          h-screen
          w-67.5
          border-r border-[#252d38]
          bg-[#11161d]
          transition-transform duration-300
          lg:hidden
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        <SidebarContent
          getLinkClass={getLinkClass}
          onNavigate={() => setIsOpen(false)}
        />
      </aside>


      {/* =========================
          LARGE DESKTOP SIDEBAR
      ========================== */}

      <aside
        className="
          fixed
          left-0 top-0
          z-40
          hidden
          h-screen
          w-62.5
          border-r border-[#252d38]
          bg-[#11161d]
          lg:block
        "
      >
        <SidebarContent
          getLinkClass={getLinkClass}
        />
      </aside>
    </>
  )
}


const SidebarContent = ({
  getLinkClass,
  onNavigate,
}) => {
  return (
    <div className="flex h-full flex-col">

      {/* =========================
          BRAND
      ========================== */}

      <div
        className="
          flex
          h-20
          items-center
          gap-3
          border-b border-[#252d38]
          px-5
        "
      >
        <div
          className="
            flex h-10 w-10
            shrink-0
            items-center justify-center
            rounded-lg
            bg-[#1d2632]
            text-sm font-bold
            text-white
          "
        >
          BF
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-bold text-white">
            BharatForge
          </h1>

          <p className="truncate text-[10px] text-gray-500">
            Execution Intelligence
          </p>
        </div>
      </div>


      {/* =========================
          NAVIGATION
      ========================== */}

      <nav
        className="
          flex-1
          overflow-y-auto
          px-3 py-5
        "
      >
        <p
          className="
            mb-3
            px-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-gray-600
          "
        >
          Workspace
        </p>

        <div className="space-y-1">

          {menu.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              onClick={onNavigate}
              end={path === "/"}
              className={getLinkClass}
            >
              <span className="truncate">
                {label}
              </span>
            </NavLink>
          ))}

        </div>
      </nav>


      {/* =========================
          FOOTER
      ========================== */}

      <div
        className="
          border-t border-[#252d38]
          px-4 py-4
        "
      >
        <div
          className="
            rounded-lg
            border border-[#252d38]
            bg-[#151b23]
            px-3 py-3
          "
        >
          <p className="text-[10px] uppercase tracking-wider text-gray-600">
            System
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-xs text-gray-400">
              Execution Engine Ready
            </span>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Sidebar