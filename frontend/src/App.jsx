import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import Activities from "./pages/Activities"
import Reports from "./pages/Reports"
import Verification from "./pages/Verification"
import ActivityDetails from "./pages/ActivityDetails"

const App = () => {
  return  (
    <BrowserRouter>
    <div className='flex min-h-screen bg-[#11161d]'>
      <Sidebar />

      <main className='flex-1 p-8 text-white'>
       <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/verification" element={<Verification />} />
            <Route path="/activity/A103" element={<ActivityDetails />} />
          </Routes>
      </main>
    </div>
    </BrowserRouter>
  )

}

export default App
