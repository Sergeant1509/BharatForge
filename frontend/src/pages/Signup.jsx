import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Signup = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    identifier: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState("")

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

      const handleSignup = async (e) => {
      e.preventDefault()
      setError("")

      if (
        !form.name ||
        !form.identifier ||
        !form.password ||
        !form.confirmPassword
      ) {
        setError("Please fill all fields.")
        return
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.")
        return
      }

      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.")
        return
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/signup",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              name: form.name,
              identifier: form.identifier,
              password: form.password,
            }),
          }
        )

        const data = await response.json()

        if (!response.ok || !data.success) {
          setError(data.message || "Signup failed.")
          return
        }

        localStorage.setItem(
          "bharatforge_user",
          JSON.stringify(data.user)
        )

        navigate("/")
      } catch (err) {
        console.error("Signup error:", err)

        setError(
          "Unable to connect to the server. Please try again."
        )
      }
    }

  return (
    <div className="min-h-screen bg-[#11161d] text-white flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl font-black mb-4">
           <img src="icon.jpeg" alt="BharatForge Logo" className="rounded-xl" />
          </div>

          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="text-sm text-gray-400 mt-2">
            Join BharatForge
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#171d26] border border-[#252d38] rounded-2xl p-6 sm:p-8 shadow-xl">

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full bg-[#11161d] border border-[#303946] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2563eb] transition"
              />
            </div>

            {/* Email / Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email or Mobile Number
              </label>

              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                placeholder="Enter email or mobile number"
                className="w-full bg-[#11161d] border border-[#303946] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2563eb] transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full bg-[#11161d] border border-[#303946] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2563eb] transition"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="w-full bg-[#11161d] border border-[#303946] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#2563eb] transition"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] transition rounded-xl py-3 font-semibold text-sm"
            >
              Create Account
            </button>

          </form>

          {/* Login */}
          <div className="text-center mt-6 pt-6 border-t border-[#252d38]">
            <p className="text-sm text-gray-400">
              Already have an account?
            </p>

            <button
              onClick={() => navigate("/login")}
              className="text-[#60a5fa] hover:text-[#93c5fd] text-sm font-medium mt-2"
            >
              Login here
            </button>
          </div>

        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          BharatForge • Execution Intelligence Bridge
        </p>

      </div>
    </div>
  )
}

export default Signup