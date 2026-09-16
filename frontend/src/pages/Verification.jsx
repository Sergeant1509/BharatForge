import { useState } from "react"

const initialCases = [
  {
    id: "FR-1031",
    activityId: "A103",
    activity: "Compressor Foundation",
    reported: "100%",
    previous: "60%",
    confidence: "LOW",
    confidenceValue: "42%",
    reason: "Reported progress conflicts with previous execution data.",
    evidence: "Not available",
  },
  {
    id: "FR-1042",
    activityId: "A221",
    activity: "Main Piping Installation",
    reported: "85%",
    previous: "70%",
    confidence: "MEDIUM",
    confidenceValue: "68%",
    reason: "Supporting evidence is missing for the reported progress.",
    evidence: "Not available",
  },
  {
    id: "FR-1051",
    activityId: "A417",
    activity: "Electrical Works",
    reported: "90%",
    previous: "72%",
    confidence: "MEDIUM",
    confidenceValue: "71%",
    reason: "Field update does not clearly identify the execution stage.",
    evidence: "Available",
  },
]

const Verification = () => {
  const [items, setItems] = useState(initialCases)
  const [editingId, setEditingId] = useState(null)
  const [editProgress, setEditProgress] = useState("")

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="pb-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Verification Queue
          </h2>

          <p className="text-gray-400 mt-2">
            Review uncertain or conflicting execution updates
          </p>
        </div>

        <div className="px-3 py-2 rounded-lg bg-yellow-500/10 text-yellow-400 text-sm">
          {items.length} Pending
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">
        <p className="text-sm text-gray-300">
          BharatForge routes low-confidence or conflicting field
          updates here for human verification before they affect
          the execution record.
        </p>
      </div>

      {/* Queue */}
      <div className="mt-6 space-y-4">

        {items.length === 0 ? (
          <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-10 text-center">
            <p className="text-green-400 font-medium">
              Verification queue is clear
            </p>

            <p className="text-gray-500 text-sm mt-2">
              No pending execution updates require review.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-[#151b24] border border-[#252d38] rounded-xl p-6"
            >

              {/* Case Header */}
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-lg font-semibold text-white">
                    {item.activity}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.activityId} · Report {item.id}
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-semibold ${
                      item.confidence === "LOW"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.confidence}
                  </span>

                  <p className="text-xs text-gray-500 mt-1">
                    {item.confidenceValue} confidence
                  </p>
                </div>

              </div>

              {/* Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

                <div className="bg-[#10151c] rounded-lg p-4">
                  <p className="text-gray-500 text-xs">
                    REPORTED
                  </p>

                  {editingId === item.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProgress}
                      onChange={(e) => setEditProgress(e.target.value)}
                      className="w-24 bg-[#151b24] border border-[#3a4655] rounded-lg px-3 py-2 text-white outline-none"
                    />

                    <span className="text-gray-400">%</span>
                  </div>
) : (
  <p className="text-white text-xl font-semibold mt-2">
    {item.reported}
  </p>
)}
                </div>

                <div className="bg-[#10151c] rounded-lg p-4">
                  <p className="text-gray-500 text-xs">
                    PREVIOUS
                  </p>

                  <p className="text-white text-xl font-semibold mt-2">
                    {item.previous}
                  </p>
                </div>

                <div className="bg-[#10151c] rounded-lg p-4">
                  <p className="text-gray-500 text-xs">
                    EVIDENCE
                  </p>

                  <p
                    className={`text-xl font-semibold mt-2 ${
                      item.evidence === "Available"
                        ? "text-green-400"
                        : "text-gray-500"
                    }`}
                  >
                    {item.evidence}
                  </p>
                </div>

              </div>

              {/* Reason */}
              <div className="mt-5 bg-[#10151c] border border-[#252d38] rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  WHY THIS NEEDS REVIEW
                </p>

                <p className="text-gray-300 text-sm mt-2">
                  {item.reason}
                </p>
              </div>

              {/* Matched Activity */}
              <div className="mt-5">
                <p className="text-xs text-gray-500">
                  AI MATCHED ACTIVITY
                </p>

                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="text-white font-medium">
                      {item.activityId} — {item.activity}
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      Execution update requires human validation
                    </p>
                  </div>

                  <span className="text-yellow-400 text-sm">
                    Review Required
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-[#252d38]">

                <button
                  onClick={() => removeItem(item.id)}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition"
                >
                  Confirm
                </button>

                <button
                  onClick={() => removeItem(item.id)}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Reject
                </button>

                <button
                 type="button"
                 onClick={() => {
                 setEditingId(item.id)
                setEditProgress(item.reported.replace("%", ""))
  }}
  className="px-4 py-2 rounded-lg bg-[#252d38] hover:bg-[#303a47] text-gray-200 transition"
>
  Edit
</button>
          {editingId === item.id && (
            <button
              type="button"
              onClick={() => {
                setItems(
                  items.map((x) =>
                    x.id === item.id
                      ? {
                          ...x,
                          reported: `${editProgress}%`,
                        }
                      : x
                  )
                )

                setEditingId(null)
                setEditProgress("")
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
            >
              Save Changes
            </button>
          )}

              </div>

            </div>
          ))
        )}

      </div>

      {/* Workflow Note */}
      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">
        <p className="text-xs text-gray-500">
          VERIFICATION PRINCIPLE
        </p>

        <p className="text-sm text-gray-300 mt-2">
          Low confidence indicates insufficient or conflicting
          evidence. It does not determine whether a field report
          is truthful or false.
        </p>
      </div>

    </div>
  )
}

export default Verification