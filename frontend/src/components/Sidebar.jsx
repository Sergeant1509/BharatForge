import { useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"

const menu = [
  ["Dashboard", "/"],
  ["Projects", "/projects"],
  ["Activities", "/activities"],
  ["Field Reports", "/reports"],
  ["Verification", "/verification"],
  ["Audit Trail", "/audit-trail"],
]

const Sidebar = () => {
  const navigate = useNavigate()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const storedUser = JSON.parse(
    localStorage.getItem("bharatforge_user") || "null"
  )

  const userName = storedUser?.name || "BharatForge User"
  const userIdentifier = storedUser?.identifier || "User"

  const handleLogout = () => {
    localStorage.removeItem("bharatforge_logged_in")
    localStorage.removeItem("bharatforge_user")

    setProfileOpen(false)
    setMobileOpen(false)

    navigate("/login")
  }

  const handleNavigation = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  return (
    <>
      {/* MOBILE TOP BAR */}

      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#252d38] bg-[#151b24] px-4 lg:hidden">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <span className="font-bold text-white">
              B
            </span>
          </div>

          <span className="font-semibold text-white">
            BharatForge
          </span>

        </div>


        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="
            rounded-lg
            border
            border-[#303946]
            bg-[#10151c]
            px-3
            py-2
            text-gray-300
          "
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

      </div>


      {/* MOBILE DRAWER */}

      {mobileOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/50
            lg:hidden
          "
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="
              mt-16
              h-[calc(100vh-4rem)]
              w-[270px]
              border-r
              border-[#252d38]
              bg-[#151b24]
              p-4
            "
            onClick={(e) => e.stopPropagation()}
          >

            <nav className="space-y-1">

              {menu.map(([label, path]) => (
                <NavLink
                  key={label}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    block
                    rounded-lg
                    px-4
                    py-3
                    text-sm
                    transition
                    ${
                      isActive
                        ? "bg-blue-600/10 text-blue-400"
                        : "text-gray-400 hover:bg-[#1b2430] hover:text-white"
                    }
                  `}
                >
                  {label}
                </NavLink>
              ))}

            </nav>


            {/* MOBILE PROFILE */}

            <div className="absolute bottom-5 left-4 right-4">

              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-[#252d38]
                  bg-[#10151c]
                  p-3
                  text-left
                "
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                  B
                </div>

                <div className="min-w-0 flex-1">

                  <p className="truncate text-sm font-medium text-white">
                    {userName}
                  </p>

                  <p className="truncate text-xs text-gray-500">
                    {userIdentifier}
                  </p>

                </div>

                <span className="text-gray-500">
                  ⋮
                </span>

              </button>


              {profileOpen && (
                <div className="mb-2 rounded-xl border border-[#303946] bg-[#10151c] p-2">

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false)
                      setMobileOpen(false)
                    }}
                    className="
                      w-full
                      rounded-lg
                      px-3
                      py-2
                      text-left
                      text-sm
                      text-gray-300
                      hover:bg-[#1b2430]
                      hover:text-white
                    "
                  >
                    Profile
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="
                      w-full
                      rounded-lg
                      px-3
                      py-2
                      text-left
                      text-sm
                      text-red-400
                      hover:bg-red-500/10
                    "
                  >
                    Log out
                  </button>

                </div>
              )}

            </div>

          </div>
        </div>
      )}


      {/* DESKTOP SIDEBAR */}

      <aside
        className="
          fixed
          left-0
          top-0
          z-40
          hidden
          h-screen
          w-[250px]
          border-r
          border-[#252d38]
          bg-[#151b24]
          lg:flex
          lg:flex-col
        "
      >

        {/* LOGO */}

        <div className="flex h-20 items-center gap-3 border-b border-[#252d38] px-6">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <span className="text-lg font-bold text-white">
              B
            </span>
          </div>

          <div>
            <p className="font-semibold text-white">
              BharatForge
            </p>

            <p className="text-[10px] text-gray-500">
              Execution Intelligence
            </p>
          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          {menu.map(([label, path]) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) => `
                block
                rounded-lg
                px-4
                py-3
                text-sm
                transition
                ${
                  isActive
                    ? "bg-blue-600/10 text-blue-400"
                    : "text-gray-400 hover:bg-[#1b2430] hover:text-white"
                }
              `}
            >
              {label}
            </NavLink>
          ))}

        </nav>


        {/* PROFILE */}

        <div className="relative border-t border-[#252d38] p-4">

          {profileOpen && (
            <div
              className="
                absolute
                bottom-[76px]
                left-4
                right-4
                rounded-xl
                border
                border-[#303946]
                bg-[#10151c]
                p-2
              "
            >

              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="
                  w-full
                  rounded-lg
                  px-3
                  py-2
                  text-left
                  text-sm
                  text-gray-300
                  hover:bg-[#1b2430]
                  hover:text-white
                "
              >
                Profile
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  w-full
                  rounded-lg
                  px-3
                  py-2
                  text-left
                  text-sm
                  text-red-400
                  hover:bg-red-500/10
                "
              >
                Log out
              </button>

            </div>
          )}


          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              p-2
              text-left
              transition
              hover:bg-[#1b2430]
            "
          >

            {/* PROFILE PHOTO / AVATAR */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              B
            </div>


            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-medium text-white">
                {userName}
              </p>

              <p className="truncate text-xs text-gray-500">
                {userIdentifier}
              </p>

            </div>


            <span className="text-gray-500">
              ⋮
            </span>

          </button>

        </div>

      </aside>
    </>
  )
}

export default Sidebar