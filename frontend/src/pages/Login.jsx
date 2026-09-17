import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Login = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  })

  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()

    setError("")

    if (!form.identifier || !form.password) {
      setError("Please enter email/mobile number and password.")
      return
    }

    localStorage.setItem("bharatforge_logged_in", "true")
    localStorage.setItem(
      "bharatforge_user",
      JSON.stringify({
        identifier: form.identifier,
        name: "BharatForge User",
      })
    )

    navigate("/")
  }

  return (
    <div className="min-h-screen bg-[#11161d] text-white flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* BRAND */}

        <div className="mb-8 text-center">

          <div className="flex items-center justify-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center">
              <span className="text-xl font-bold">
                <img src="icon.jpeg" alt="BharatForge Logo" className='rounded-xl'/>
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight">
              BharatForge
            </h1>

          </div>

          <p className="mt-3 text-sm text-gray-400">
            Your One place for smart project intelligence
          </p>

        </div>


        {/* LOGIN CARD */}

        <div className="rounded-2xl border border-[#252d38] bg-[#151b24] p-6 sm:p-8">

          <div className="mb-6">

            <h2 className="text-xl font-semibold text-white">
              Sign in
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Access your project execution workspace
            </p>

          </div>


          {/* ERROR */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">

              <p className="text-sm text-red-400">
                {error}
              </p>

            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL / MOBILE */}

            <div>

              <label className="mb-2 block text-sm text-gray-300">
                Email or Mobile Number
              </label>

              <input
                type="text"
                placeholder="Email or mobile number"
                value={form.identifier}
                onChange={(e) =>
                  setForm({
                    ...form,
                    identifier: e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-[#303946]
                  bg-[#10151c]
                  px-4
                  py-3
                  text-sm
                  text-white
                  placeholder-gray-600
                  outline-none
                  transition
                  focus:border-blue-500
                "
              />

            </div>


            {/* PASSWORD */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm text-gray-300">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs text-blue-400 transition hover:text-blue-300"
                >
                  Forgot password?
                </button>

              </div>

              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-[#303946]
                  bg-[#10151c]
                  px-4
                  py-3
                  text-sm
                  text-white
                  placeholder-gray-600
                  outline-none
                  transition
                  focus:border-blue-500
                "
              />

            </div>


            {/* REMEMBER */}

            <div className="flex items-center gap-2">

              <input
                type="checkbox"
                className="h-4 w-4 rounded border-[#303946] bg-[#10151c]"
              />

              <span className="text-sm text-gray-400">
                Remember me
              </span>

            </div>


            {/* SIGN IN */}

            <button
              type="submit"
              className="
                w-full
                rounded-lg
                bg-blue-600
                px-4
                py-3
                text-sm
                font-medium
                text-white
                transition
                hover:bg-blue-700
                active:bg-blue-800
              "
            >
              Sign In
            </button>

          </form>


          {/* SIGN UP */}

          <div className="mt-6 border-t border-[#252d38] pt-6 text-center">

            <p className="text-sm text-gray-400">

              New user?{" "}

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Sign up here
              </button>

            </p>

          </div>


          {/* AUTHORIZATION */}

          <p className="mt-5 text-center text-xs text-gray-600">
            Authorized project personnel only
          </p>

        </div>


        <p className="mt-6 text-center text-xs text-gray-600">
          BharatForge · Project Execution Intelligence
        </p>

      </div>

    </div>
  )
}

export default Login