import { useEffect, useState } from "react"
import {
  getVerificationQueue,
  updateVerification,
} from "../services/api"

function formatProgress(value) {
  if (value === null || value === undefined || value === "") {
    return "—"
  }

  return `${Number(value)}%`
}

function formatDate(date) {
  if (!date) return "—"

  const value = String(date).slice(0, 10)
  const parts = value.split("-")

  if (parts.length !== 3) return value

  const [year, month, day] = parts

  const monthName = new Date(
    `${year}-${month}-01`
  ).toLocaleString("en-US", {
    month: "short",
  })

  return `${day} ${monthName} ${year}`
}

function getConfidenceLevel(value) {
  const confidence = Number(value || 0)

  if (confidence < 50) {
    return "LOW"
  }

  return "MEDIUM"
}

function getConfidenceClass(level) {
  return level === "LOW"
    ? "text-red-400"
    : "text-yellow-400"
}

const Verification = () => {

  const [items, setItems] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [processingId, setProcessingId] = useState(null)

  const [editingId, setEditingId] = useState(null)

  const [editProgress, setEditProgress] = useState("")

  const [editedProgress, setEditedProgress] = useState({})

  const [selectedActivity, setSelectedActivity] =
    useState({})


  /*
  ========================================================
  LOAD VERIFICATION QUEUE
  ========================================================
  */

  useEffect(() => {
    loadVerificationQueue()
  }, [])


  async function loadVerificationQueue() {

    try {

      setLoading(true)
      setError("")

      const response =
        await getVerificationQueue()

      setItems(response.data || [])

    } catch (err) {

      console.error(
        "Failed to load verification queue:",
        err
      )

      setError(
        err.message ||
          "Failed to load verification records"
      )

    } finally {

      setLoading(false)

    }
  }


  /*
  ========================================================
  EDIT PROGRESS
  ========================================================
  */

  function startEditing(item) {

    setEditingId(item.id)

    setEditProgress(
      item.reported_progress !== null &&
      item.reported_progress !== undefined
        ? String(item.reported_progress)
        : ""
    )
  }


  function saveProgress(item) {

    const value = Number(editProgress)

    if (
      Number.isNaN(value) ||
      value < 0 ||
      value > 100
    ) {

      alert(
        "Progress must be between 0 and 100."
      )

      return
    }

    setEditedProgress((current) => ({
      ...current,
      [item.id]: value,
    }))

    setEditingId(null)
    setEditProgress("")
  }


  /*
  ========================================================
  GET CURRENT PROGRESS
  ========================================================
  */

  function getCurrentProgress(item) {

    if (
      editedProgress[item.id] !== undefined
    ) {
      return editedProgress[item.id]
    }

    return item.reported_progress
  }


  /*
  ========================================================
  VERIFICATION ACTION
  ========================================================
  */

  async function handleVerification(
    item,
    action,
    activityId = null
  ) {

    try {

      setProcessingId(item.id)
      setError("")


      let selectedId = activityId


      /*
      APPROVE may work without an activity.
      CHANGE_MATCH still requires one.
      */

      if (
        action === "CHANGE_MATCH" &&
        !selectedId
      ) {

        selectedId =
          item.activity_id ||
          item.candidates?.[0]?.id
      }


      if (
        action === "CHANGE_MATCH" &&
        !selectedId
      ) {

        alert(
          "No activity has been selected for this report."
        )

        setProcessingId(null)

        return
      }


      const currentProgress =
        getCurrentProgress(item)


      const payload = {

        action,

        activity_id:
          selectedId
            ? Number(selectedId)
            : null,

        verified_by: "PLANNER",

        reported_progress:
          action === "REJECT"
            ? undefined
            : Number(currentProgress),
      }


      const response =
        await updateVerification(
          item.id,
          payload
        )


      if (!response.success) {

        throw new Error(
          response.message ||
            "Verification action failed"
        )
      }


      if (action === "REJECT") {

        alert(
          "Field report rejected successfully."
        )

      } else if (
        action === "CHANGE_MATCH"
      ) {

        alert(
          "Activity match changed and verified."
        )

      } else {

        alert(
          "Field report verified successfully."
        )
      }


      /*
      Remove processed report from queue.
      */

      setItems((current) =>
        current.filter(
          (x) => x.id !== item.id
        )
      )


      setEditingId(null)

      setEditProgress("")


      setEditedProgress((current) => {

        const updated = { ...current }

        delete updated[item.id]

        return updated
      })


      setSelectedActivity((current) => {

        const updated = { ...current }

        delete updated[item.id]

        return updated
      })


    } catch (err) {

      console.error(
        "Verification action failed:",
        err
      )

      setError(
        err.message ||
          "Verification action failed"
      )

      alert(
        err.message ||
          "Verification action failed"
      )

    } finally {

      setProcessingId(null)

    }
  }


  /*
  ========================================================
  ACTIVITY SELECTION
  ========================================================
  */

  function selectActivity(
    reportId,
    activityId
  ) {

    setSelectedActivity((current) => ({
      ...current,
      [reportId]: activityId,
    }))
  }


  /*
  ========================================================
  RENDER
  ========================================================
  */

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

          BharatForge routes low-confidence or unmatched
          field updates here for human verification before
          they affect the execution record.

        </p>

      </div>


      {/* Error */}

      {error && (

        <div className="mt-6 bg-[#151b24] border border-red-500/30 rounded-xl p-4">

          <p className="text-red-400 text-sm">
            {error}
          </p>

          <button
            type="button"
            onClick={loadVerificationQueue}
            className="mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Retry
          </button>

        </div>

      )}


      {/* Queue */}

      <div className="mt-6 space-y-4">

        {loading ? (

          <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-10 text-center">

            <p className="text-gray-400">
              Loading verification queue...
            </p>

          </div>

        ) : items.length === 0 ? (

          <div className="bg-[#151b24] border border-[#252d38] rounded-xl p-10 text-center">

            <p className="text-green-400 font-medium">
              Verification queue is clear
            </p>

            <p className="text-gray-500 text-sm mt-2">
              No pending execution updates require review.
            </p>

          </div>

        ) : (

          items.map((item) => {

            const confidenceValue =
              Number(
                item.match_confidence || 0
              )

            const confidence =
              getConfidenceLevel(
                confidenceValue
              )

            const candidates =
              item.candidates || []

            const currentSelectedActivity =
              selectedActivity[item.id] ||
              item.activity_id ||
              (
                item.matching_status !== "UNMATCHED"
                  ? candidates[0]?.id
                  : null
              ) ||
              null

            const selectedCandidate =
              candidates.find(
                (candidate) =>
                  Number(candidate.id) ===
                  Number(
                    currentSelectedActivity
                  )
              ) || null

            const displayCandidate =
              selectedCandidate ||
              candidates[0] ||
              null

            const isProcessing =
              processingId === item.id

            const currentProgress =
              getCurrentProgress(item)


            return (

              <div
                key={item.id}
                className="bg-[#151b24] border border-[#252d38] rounded-xl p-6"
              >

                {/* Case Header */}

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-lg font-semibold text-white">

                      {item.activity_name ||
                        "Unmatched Activity"}

                    </p>


                    <p className="text-sm text-gray-500 mt-1">

                      {item.activity_code ||
                        "No activity selected"}

                      {" · Report "}

                      {item.report_code}

                    </p>


                    <p className="text-xs text-gray-600 mt-1">

                      {item.project_code}
                      {" · "}
                      {item.project_name}

                    </p>

                  </div>


                  <div className="text-right">

                    <span
                      className={`text-sm font-semibold ${getConfidenceClass(
                        confidence
                      )}`}
                    >
                      {confidence}
                    </span>

                    <p className="text-xs text-gray-500 mt-1">
                      {confidenceValue}% confidence
                    </p>

                  </div>

                </div>


                {/* Comparison */}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">


                  {/* Reported */}

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
                          onChange={(e) =>
                            setEditProgress(
                              e.target.value
                            )
                          }
                          className="w-24 bg-[#151b24] border border-[#3a4655] rounded-lg px-3 py-2 text-white outline-none"
                        />

                        <span className="text-gray-400">
                          %
                        </span>

                      </div>

                    ) : (

                      <p className="text-white text-xl font-semibold mt-2">

                        {formatProgress(
                          currentProgress
                        )}

                      </p>

                    )}

                  </div>


                  {/* Date */}

                  <div className="bg-[#10151c] rounded-lg p-4">

                    <p className="text-gray-500 text-xs">
                      REPORT DATE
                    </p>

                    <p className="text-white text-xl font-semibold mt-2">
                      {formatDate(
                        item.report_date
                      )}
                    </p>

                  </div>


                  {/* Discipline */}

                  <div className="bg-[#10151c] rounded-lg p-4">

                    <p className="text-gray-500 text-xs">
                      DISCIPLINE
                    </p>

                    <p className="text-white text-xl font-semibold mt-2">
                      {item.discipline ||
                        "—"}
                    </p>

                  </div>

                </div>


                {/* Description */}

                <div className="mt-5 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                  <p className="text-xs text-gray-500">
                    FIELD UPDATE
                  </p>

                  <p className="text-gray-300 text-sm mt-2 whitespace-pre-line">

                    {item.description ||
                      "No description available."}

                  </p>

                </div>


                {/* Review Reason */}

                <div className="mt-5 bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                  <p className="text-xs text-gray-500">
                    WHY THIS NEEDS REVIEW
                  </p>

                  <p className="text-gray-300 text-sm mt-2">

                    {item.matching_status ===
                    "UNMATCHED"
                      ? "The field update could not be confidently linked to a schedule activity."
                      : "The activity match requires planner verification before the execution record is updated."}

                  </p>

                </div>


                {/* AI Matched Activity */}

                <div className="mt-5">

                  <p className="text-xs text-gray-500">

                    {item.matching_status === "UNMATCHED"
                      ? "SUGGESTED ACTIVITY"
                      : "AI MATCHED ACTIVITY"}

                  </p>


                  <div className="mt-2">

                    {displayCandidate ? (

                      <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="text-white font-medium">

                              {
                                displayCandidate.activity_code
                              }

                              {" — "}

                              {
                                displayCandidate.name
                              }

                            </p>


                            <p className="text-gray-500 text-xs mt-1">

                              Candidate confidence:{" "}

                              {
                                displayCandidate.confidence
                              }%

                            </p>

                          </div>


                          <span className="text-yellow-400 text-sm">

                            {item.matching_status === "UNMATCHED"
                              ? "Manual Selection Required"
                              : "Review Required"}

                          </span>

                        </div>

                      </div>

                    ) : (

                      <div className="bg-[#10151c] border border-[#252d38] rounded-lg p-4">

                        <p className="text-gray-400 text-sm">
                          No activity candidate available.
                        </p>

                      </div>

                    )}

                  </div>

                </div>


                {/* Candidate Selection */}

                {candidates.length > 0 && (

                  <div className="mt-5">

                    <p className="text-xs text-gray-500">
                      SELECT ACTIVITY
                    </p>


                    <select
                      value={
                        currentSelectedActivity || ""
                      }
                      onChange={(e) =>
                        selectActivity(
                          item.id,
                          e.target.value
                        )
                      }
                      disabled={isProcessing}
                      className="w-full mt-2 bg-[#10151c] border border-[#252d38] rounded-lg p-3 text-gray-300 outline-none"
                    >

                      {candidates.map(
                        (candidate) => (

                          <option
                            key={candidate.id}
                            value={candidate.id}
                          >

                            {candidate.activity_code}
                            {" — "}
                            {candidate.name}
                            {" ("}
                            {candidate.confidence}
                            {"%)"}

                          </option>

                        )
                      )}

                    </select>

                  </div>

                )}


                {/* Actions */}

                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-[#252d38]">


                  {/* Edit */}

                  {editingId !== item.id && (

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        startEditing(item)
                      }
                      className="px-4 py-2 rounded-lg bg-[#252d38] hover:bg-[#303a47] disabled:opacity-50 text-gray-200 transition"
                    >
                      Edit Progress
                    </button>

                  )}


                  {/* Save Edit */}

                  {editingId === item.id && (

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        saveProgress(item)
                      }
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition"
                    >
                      Save Changes
                    </button>

                  )}


                  {/* Approve */}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleVerification(
                        item,
                        "APPROVE",
                        currentSelectedActivity
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                  >

                    {isProcessing
                      ? "Processing..."
                      : "Approve"}

                  </button>


                  {/* Change Match */}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleVerification(
                        item,
                        "CHANGE_MATCH",
                        currentSelectedActivity
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                  >

                    Change Match

                  </button>


                  {/* Reject */}

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleVerification(
                        item,
                        "REJECT"
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
                  >

                    Reject

                  </button>

                </div>

              </div>

            )
          })

        )}

      </div>


      {/* Workflow Note */}

      <div className="mt-8 bg-[#151b24] border border-[#252d38] rounded-xl p-5">

        <p className="text-xs text-gray-500">
          VERIFICATION PRINCIPLE
        </p>

        <p className="text-sm text-gray-300 mt-2">

          Low confidence indicates insufficient or
          conflicting evidence. It does not determine
          whether a field report is truthful or false.

        </p>

      </div>

    </div>
  )
}

export default Verification