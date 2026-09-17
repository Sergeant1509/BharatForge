import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"

import Sidebar from "./components/Sidebar"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Activities from "./pages/Activities"
import Reports from "./pages/Reports"
import Verification from "./pages/Verification"
import ActivityDetails from "./pages/ActivityDetails"
import AuditTrail from "./pages/AuditTrail"
import Signup from "./pages/Signup"


const ProtectedLayout = ({ children }) => {
  const isLoggedIn =
    localStorage.getItem("bharatforge_logged_in") === "true"

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#11161d] text-white">

      <Sidebar />

      <main
        className="
          min-h-screen
          w-full
          px-4
          py-20
          sm:px-6
          sm:py-6
          lg:ml-[250px]
          lg:w-[calc(100%-250px)]
          lg:px-8
          lg:py-8
        "
      >
        {children}
      </main>

    </div>
  )
}

const SignupPlaceholder = () => {
  return (
    <div className="min-h-screen bg-[#11161d] text-white flex items-center justify-center px-4">

      <div className="w-full max-w-md rounded-2xl border border-[#252d38] bg-[#151b24] p-8 text-center">

        <h1 className="text-xl font-semibold">
          Sign Up
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Signup page will be added next.
        </p>

      </div>

    </div>
  )
}

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />


        {/* PROTECTED */}

        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedLayout>
              <Projects />
            </ProtectedLayout>
          }
        />

        <Route
          path="/activities"
          element={
            <ProtectedLayout>
              <Activities />
            </ProtectedLayout>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          }
        />

        <Route
          path="/verification"
          element={
            <ProtectedLayout>
              <Verification />
            </ProtectedLayout>
          }
        />

        <Route
          path="/audit-trail"
          element={
            <ProtectedLayout>
              <AuditTrail />
            </ProtectedLayout>
          }
        />

        <Route
          path="/activity/A103"
          element={
            <ProtectedLayout>
              <ActivityDetails />
            </ProtectedLayout>
          }
        />


        {/* FALLBACK */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App