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
    reason:
      "Reported progress conflicts with previous execution data.",
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
    reason:
      "Supporting evidence is missing for the reported progress.",
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
    reason:
      "Field update does not clearly identify the execution stage.",
    evidence: "Available",
  },
]

const Verification = () => {
  const [items, setItems] = useState(initialCases)
  const [editingId, setEditingId] = useState(null)
  const [editProgress, setEditProgress] = useState("")

  const removeItem = (id) => {
    setItems((prev) =>
      prev.filter((item) => item.id !== id)
    )
  }

  const startEditing = (item) => {
    setEditingId(item.id)
    setEditProgress(item.reported.replace("%", ""))
  }

  const saveChanges = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              reported: `${editProgress}%`,
            }
          : item
      )
    )

    setEditingId(null)
    setEditProgress("")
  }

  return (
    <div className="w-full pb-10">

      {/* =========================
          HEADER
      ========================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <h2
            className="
              text-xl
              font-semibold
              text-white
              sm:text-2xl
            "
          >
            Verification Queue
          </h2>

          <p
            className="
              mt-1
              text-xs
              text-gray-400
              sm:mt-2
              sm:text-sm
            "
          >
            Review uncertain or conflicting execution updates
          </p>
        </div>

        <div
          className="
            w-fit
            rounded-lg
            bg-yellow-500/10
            px-3 py-2
            text-xs
            text-yellow-400
            sm:text-sm
          "
        >
          {items.length} Pending
        </div>
      </div>


      {/* =========================
          EXPLANATION
      ========================== */}

      <div
        className="
          mt-6
          rounded-xl
          border border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-5
        "
      >
        <p
          className="
            text-xs
            leading-5
            text-gray-300
            sm:text-sm
            sm:leading-6
          "
        >
          BharatForge routes low-confidence or conflicting
          field updates here for human verification before
          they affect the execution record.
        </p>
      </div>


      {/* =========================
          QUEUE
      ========================== */}

      <div className="mt-5 space-y-4 sm:mt-6">

        {items.length === 0 ? (
          <div
            className="
              rounded-xl
              border border-[#252d38]
              bg-[#151b24]
              p-8
              text-center
              sm:p-10
            "
          >
            <p className="text-sm font-medium text-green-400">
              Verification queue is clear
            </p>

            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              No pending execution updates require review.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="
                rounded-xl
                border border-[#252d38]
                bg-[#151b24]
                p-4
                sm:p-6
              "
            >

              {/* =========================
                  CASE HEADER
              ========================== */}

              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >

                <div className="min-w-0">
                  <p
                    className="
                      wrap-break-word
                      text-base
                      font-semibold
                      text-white
                      sm:text-lg
                    "
                  >
                    {item.activity}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                    {item.activityId} · Report {item.id}
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    sm:block
                    sm:text-right
                  "
                >
                  <span
                    className={`
                      text-xs
                      font-semibold
                      sm:text-sm
                      ${
                        item.confidence === "LOW"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }
                    `}
                  >
                    {item.confidence}
                  </span>

                  <p className="text-[10px] text-gray-500 sm:mt-1 sm:text-xs">
                    {item.confidenceValue} confidence
                  </p>
                </div>

              </div>


              {/* =========================
                  COMPARISON
              ========================== */}

              <div
                className="
                  mt-5
                  grid
                  grid-cols-1
                  gap-3
                  sm:mt-6
                  sm:grid-cols-3
                  sm:gap-4
                "
              >

                {/* Reported */}

                <div
                  className="
                    rounded-lg
                    bg-[#10151c]
                    p-4
                  "
                >
                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    REPORTED
                  </p>

                  {editingId === item.id ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editProgress}
                        onChange={(e) =>
                          setEditProgress(e.target.value)
                        }
                        className="
                          w-full
                          rounded-lg
                          border border-[#3a4655]
                          bg-[#151b24]
                          px-3 py-2
                          text-sm
                          text-white
                          outline-none
                          focus:border-blue-500
                          sm:w-24
                        "
                      />

                      <span className="text-sm text-gray-400">
                        %
                      </span>
                    </div>
                  ) : (
                    <p
                      className="
                        mt-1
                        text-xl
                        font-semibold
                        text-white
                        sm:mt-2
                      "
                    >
                      {item.reported}
                    </p>
                  )}
                </div>


                {/* Previous */}

                <div
                  className="
                    rounded-lg
                    bg-[#10151c]
                    p-4
                  "
                >
                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    PREVIOUS
                  </p>

                  <p
                    className="
                      mt-1
                      text-xl
                      font-semibold
                      text-white
                      sm:mt-2
                    "
                  >
                    {item.previous}
                  </p>
                </div>


                {/* Evidence */}

                <div
                  className="
                    rounded-lg
                    bg-[#10151c]
                    p-4
                  "
                >
                  <p className="text-[10px] text-gray-500 sm:text-xs">
                    EVIDENCE
                  </p>

                  <p
                    className={`
                      mt-1
                      text-base
                      font-semibold
                      sm:mt-2
                      sm:text-xl
                      ${
                        item.evidence === "Available"
                          ? "text-green-400"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {item.evidence}
                  </p>
                </div>

              </div>


              {/* =========================
                  REASON
              ========================== */}

              <div
                className="
                  mt-4
                  rounded-lg
                  border border-[#252d38]
                  bg-[#10151c]
                  p-4
                  sm:mt-5
                "
              >
                <p className="text-[10px] text-gray-500 sm:text-xs">
                  WHY THIS NEEDS REVIEW
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-gray-300
                    sm:text-sm
                    sm:leading-6
                  "
                >
                  {item.reason}
                </p>
              </div>


              {/* =========================
                  MATCHED ACTIVITY
              ========================== */}

              <div className="mt-4 sm:mt-5">

                <p className="text-[10px] text-gray-500 sm:text-xs">
                  AI MATCHED ACTIVITY
                </p>

                <div
                  className="
                    mt-2
                    flex
                    flex-col
                    gap-3
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                  "
                >

                  <div className="min-w-0">
                    <p
                      className="
                        wrap-break-word
                        text-sm
                        font-medium
                        text-white
                      "
                    >
                      {item.activityId} — {item.activity}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Execution update requires human validation
                    </p>
                  </div>

                  <span
                    className="
                      self-start
                      shrink-0
                      text-xs
                      text-yellow-400
                    "
                  >
                    Review Required
                  </span>

                </div>
              </div>


              {/* =========================
                  ACTIONS
              ========================== */}

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  gap-2
                  border-t border-[#252d38]
                  pt-4
                  sm:mt-6
                  sm:flex-row
                  sm:flex-wrap
                  sm:gap-3
                  sm:pt-5
                "
              >

                {/* Confirm */}

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="
                    w-full
                    rounded-lg
                    bg-green-600
                    px-4 py-2.5
                    text-sm
                    text-white
                    transition
                    hover:bg-green-700
                    sm:w-auto
                    sm:py-2
                  "
                >
                  Confirm
                </button>


                {/* Reject */}

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="
                    w-full
                    rounded-lg
                    bg-red-600
                    px-4 py-2.5
                    text-sm
                    text-white
                    transition
                    hover:bg-red-700
                    sm:w-auto
                    sm:py-2
                  "
                >
                  Reject
                </button>


                {/* Edit */}

                {editingId !== item.id && (
                  <button
                    type="button"
                    onClick={() => startEditing(item)}
                    className="
                      w-full
                      rounded-lg
                      bg-[#252d38]
                      px-4 py-2.5
                      text-sm
                      text-gray-200
                      transition
                      hover:bg-[#303a47]
                      sm:w-auto
                      sm:py-2
                    "
                  >
                    Edit
                  </button>
                )}


                {/* Save */}

                {editingId === item.id && (
                  <button
                    type="button"
                    onClick={() => saveChanges(item.id)}
                    className="
                      w-full
                      rounded-lg
                      bg-blue-600
                      px-4 py-2.5
                      text-sm
                      text-white
                      transition
                      hover:bg-blue-700
                      sm:w-auto
                      sm:py-2
                    "
                  >
                    Save Changes
                  </button>
                )}

              </div>

            </div>
          ))
        )}

      </div>


      {/* =========================
          WORKFLOW NOTE
      ========================== */}

      <div
        className="
          mt-6
          rounded-xl
          border border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-5
        "
      >
        <p className="text-[10px] text-gray-500 sm:text-xs">
          VERIFICATION PRINCIPLE
        </p>

        <p
          className="
            mt-2
            text-xs
            leading-5
            text-gray-300
            sm:text-sm
            sm:leading-6
          "
        >
          Low confidence indicates insufficient or conflicting
          evidence. It does not determine whether a field report
          is truthful or false.
        </p>
      </div>

    </div>
  )
}

export default Verification