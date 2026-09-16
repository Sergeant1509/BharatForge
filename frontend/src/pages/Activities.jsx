import { useNavigate } from "react-router-dom"

const activities = [
  ["A103", "Compressor Foundation", "80%", "65%", "HIGH"],
  ["A221", "Main Piping Installation", "70%", "48%", "HIGH"],
  ["A417", "Electrical Works", "75%", "72%", "MEDIUM"],
]

const Activities = () => {
  const navigate = useNavigate()

  return (
    <div>
      <h2 className="text-2xl font-semibold">Activities</h2>

      <p className="text-gray-400 mt-2">
        Schedule vs actual execution
      </p>

      <div className="mt-8 overflow-hidden rounded-xl border border-[#252d38]">
        <table className="w-full text-left">
          <thead className="bg-[#151b24] text-gray-400 text-sm">
            <tr>
              <th className="p-4">Activity ID</th>
              <th className="p-4">Activity</th>
              <th className="p-4">Planned</th>
              <th className="p-4">Actual</th>
              <th className="p-4">Risk</th>
            </tr>
          </thead>

          <tbody>
            {activities.map(([id, activity, planned, actual, risk]) => (
              <tr
                key={id}
                onClick={() =>
                  id === "A103" && navigate("/activity/A103")
                }
                className="border-t border-[#252d38] bg-[#10151c] hover:bg-[#151b24] cursor-pointer"
              >
                <td className="p-4 text-gray-400">{id}</td>
                <td className="p-4 font-medium">{activity}</td>
                <td className="p-4">{planned}</td>
                <td className="p-4">{actual}</td>
                <td className="p-4 text-red-400">{risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Activities