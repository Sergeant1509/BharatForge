import { BrowserRouter, Routes, Route } from "react-router-dom"

import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Activities from "./pages/Activities"
import Reports from "./pages/Reports"
import Verification from "./pages/Verification"
import ActivityDetails from "./pages/ActivityDetails"
import AuditTrail from "./pages/AuditTrail"

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#11161d] text-white">

        <Sidebar />

        <main
          className="
            min-h-screen
            w-full
            px-4 py-20
            sm:px-6 sm:py-6
            lg:ml-62.5
            lg:w-[calc(100%-250px)]
            lg:px-8
            lg:py-8
          "
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />

            <Route
              path="/projects"
              element={<Projects />}
            />

            <Route
              path="/activities"
              element={<Activities />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/verification"
              element={<Verification />}
            />

            <Route
              path="/audit-trail"
              element={<AuditTrail />}
            />

            <Route
              path="/activity/A103"
              element={<ActivityDetails />}
            />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}

export default App