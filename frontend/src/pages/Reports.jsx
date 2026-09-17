import { useState } from "react"

const initialReports = [
  {
    id: "FR-1023",
    date: "16 Sep 2026",
    sourceType: "Daily Report",
    discipline: "Civil",
    activity: "Compressor Foundation",
    progress: "65%",
    processingStatus: "Processed",
    extractionStatus: "Complete",
    matchingStatus: "Matched",
    confidence: "94%",
  },
  {
    id: "FR-1031",
    date: "16 Sep 2026",
    sourceType: "Daily Report",
    discipline: "Civil",
    activity: "Compressor Foundation",
    progress: "65%",
    processingStatus: "Processed",
    extractionStatus: "Complete",
    matchingStatus: "Needs Review",
    confidence: "81%",
  },
  {
    id: "FR-1042",
    date: "15 Sep 2026",
    sourceType: "Spreadsheet",
    discipline: "Piping",
    activity: "Main Piping Installation",
    progress: "48%",
    processingStatus: "Processed",
    extractionStatus: "Complete",
    matchingStatus: "Matched",
    confidence: "89%",
  },
]

const sourceTypes = [
  "Daily Report",
  "Spreadsheet",
  "Manual Field Update",
]

const disciplines = [
  "Civil",
  "Piping",
  "Electrical",
  "Instrumentation",
  "HSE",
]

const Reports = () => {
  const [reports, setReports] = useState(initialReports)
  const [showForm, setShowForm] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [draggingType, setDraggingType] = useState(null)

  const [form, setForm] = useState({
    reportId: "",
    date: "",
    sourceType: "Daily Report",
    discipline: "Civil",
    activityId: "",
    progress: "",
    constraint: "",
    executionUpdate: "",
    evidence: null,
  })

  const submitReport = (e) => {
    e.preventDefault()

    const newReport = {
      id: form.reportId,
      date: form.date,
      sourceType: form.sourceType,
      discipline: form.discipline,
      activity: form.activityId || "Pending AI Match",
      progress: form.progress
        ? `${form.progress}%`
        : "—",
      processingStatus: "Pending",
      extractionStatus: "Pending",
      matchingStatus: "Pending",
      confidence: "Pending",
    }

    setReports([newReport, ...reports])

    setForm({
      reportId: "",
      date: "",
      sourceType: "Daily Report",
      discipline: "Civil",
      activityId: "",
      progress: "",
      constraint: "",
      executionUpdate: "",
      evidence: null,
    })

    setSelectedFile(null)
    setShowForm(false)
  }

  const statusClass = (status) => {
    if (
      status === "Complete" ||
      status === "Processed" ||
      status === "Matched"
    ) {
      return "text-green-400"
    }

    if (status === "Needs Review") {
      return "text-yellow-400"
    }

    if (status === "Pending") {
      return "text-gray-400"
    }

    return "text-red-400"
  }

  const selectFile = (file, sourceType) => {
    if (!file) return

    setSelectedFile(file)

    setForm((prev) => ({
      ...prev,
      sourceType,
    }))

    setShowForm(true)
  }

  const handleDragOver = (e, sourceType) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingType(sourceType)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingType(null)
  }

  const handleDrop = (e, sourceType) => {
    e.preventDefault()
    e.stopPropagation()

    setDraggingType(null)

    const file = e.dataTransfer.files?.[0]

    if (!file) return

    selectFile(file, sourceType)
  }

  const openManualForm = () => {
    setSelectedFile(null)

    setForm((prev) => ({
      ...prev,
      sourceType: "Manual Field Update",
    }))

    setShowForm(true)
  }

  const uploadCardClass = (type) => `
    cursor-pointer
    rounded-xl
    border
    bg-[#151b24]
    p-4
    text-left
    transition
    sm:p-5
    ${
      draggingType === type
        ? "border-blue-500 bg-blue-500/10"
        : "border-[#252d38] hover:border-[#3a4655] hover:bg-[#1b2430]"
    }
  `

  return (
    <div className="w-full pb-10">

      {/* HEADER */}

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
            Field Reports
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
            Capture and reconcile field execution information
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              setShowForm(false)
              return
            }

            openManualForm()
          }}
          className="
            w-full
            rounded-lg
            bg-blue-600
            px-4
            py-2.5
            text-sm
            text-white
            transition
            hover:bg-blue-700
            sm:w-auto
            sm:shrink-0
          "
        >
          {showForm ? "Close" : "+ Add Field Update"}
        </button>
      </div>


      {/* INPUT SOURCES */}

      <div className="mt-6 sm:mt-8">

        <p className="mb-3 text-[10px] text-gray-500 sm:text-xs">
          FIELD INPUT SOURCES
        </p>

        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-3
            md:gap-4
          "
        >

          {/* DAILY REPORT */}

          <label
            onDragOver={(e) =>
              handleDragOver(e, "Daily Report")
            }
            onDragEnter={(e) =>
              handleDragOver(e, "Daily Report")
            }
            onDragLeave={handleDragLeave}
            onDrop={(e) =>
              handleDrop(e, "Daily Report")
            }
            className={uploadCardClass("Daily Report")}
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Daily Report
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-400 sm:text-sm">
                  Upload DPR / daily site execution report
                </p>
              </div>

              <span className="shrink-0 text-lg text-gray-500">
                ↑
              </span>
            </div>

            <p className="mt-4 text-[10px] text-gray-500 sm:text-xs">
              PDF / DOCX / XLSX
            </p>

            {/* DRAG DROP AREA */}

            <div
              className={`
                mt-4
                rounded-lg
                border
                border-dashed
                px-4
                py-5
                text-center
                transition
                ${
                  draggingType === "Daily Report"
                    ? "border-blue-500 text-blue-400"
                    : "border-[#303946] text-gray-500"
                }
              `}
            >
              <p className="text-xs sm:text-sm">
                {draggingType === "Daily Report"
                  ? "Drop file here"
                  : "Drag & drop file here"}
              </p>

              <p className="mt-1 text-[10px] text-gray-600 sm:text-xs">
                or click to browse
              </p>
            </div>

            <input
              type="file"
              accept=".pdf,.doc,.docx,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                selectFile(
                  e.target.files?.[0],
                  "Daily Report"
                )

                e.target.value = ""
              }}
            />

            {selectedFile &&
              form.sourceType === "Daily Report" && (
                <div
                  className="
                    mt-4
                    rounded-lg
                    border
                    border-[#252d38]
                    bg-[#10151c]
                    p-3
                  "
                >
                  <p className="text-xs text-green-400">
                    File selected
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {selectedFile.name}
                  </p>
                </div>
              )}
          </label>


          {/* SPREADSHEET */}

          <label
            onDragOver={(e) =>
              handleDragOver(e, "Spreadsheet")
            }
            onDragEnter={(e) =>
              handleDragOver(e, "Spreadsheet")
            }
            onDragLeave={handleDragLeave}
            onDrop={(e) =>
              handleDrop(e, "Spreadsheet")
            }
            className={uploadCardClass("Spreadsheet")}
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Spreadsheet
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-400 sm:text-sm">
                  Import structured progress or field data
                </p>
              </div>

              <span className="shrink-0 text-lg text-gray-500">
                ↑
              </span>
            </div>

            <p className="mt-4 text-[10px] text-gray-500 sm:text-xs">
              XLSX / XLS / CSV
            </p>

            {/* DRAG DROP AREA */}

            <div
              className={`
                mt-4
                rounded-lg
                border
                border-dashed
                px-4
                py-5
                text-center
                transition
                ${
                  draggingType === "Spreadsheet"
                    ? "border-blue-500 text-blue-400"
                    : "border-[#303946] text-gray-500"
                }
              `}
            >
              <p className="text-xs sm:text-sm">
                {draggingType === "Spreadsheet"
                  ? "Drop file here"
                  : "Drag & drop file here"}
              </p>

              <p className="mt-1 text-[10px] text-gray-600 sm:text-xs">
                or click to browse
              </p>
            </div>

            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                selectFile(
                  e.target.files?.[0],
                  "Spreadsheet"
                )

                e.target.value = ""
              }}
            />

            {selectedFile &&
              form.sourceType === "Spreadsheet" && (
                <div
                  className="
                    mt-4
                    rounded-lg
                    border
                    border-[#252d38]
                    bg-[#10151c]
                    p-3
                  "
                >
                  <p className="text-xs text-green-400">
                    File selected
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-400">
                    {selectedFile.name}
                  </p>
                </div>
              )}
          </label>


          {/* MANUAL */}

          <button
            type="button"
            onClick={openManualForm}
            className="
              rounded-xl
              border
              border-[#252d38]
              bg-[#151b24]
              p-4
              text-left
              transition
              hover:border-[#3a4655]
              hover:bg-[#1b2430]
              sm:p-5
            "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  Manual Field Update
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-400 sm:text-sm">
                  Enter an execution update directly
                </p>
              </div>

              <span className="shrink-0 text-lg text-gray-500">
                +
              </span>
            </div>

            <p className="mt-4 text-[10px] text-gray-500 sm:text-xs">
              Manual Entry
            </p>
          </button>

        </div>
      </div>


      {/* ADD FIELD UPDATE FORM */}

      {showForm && (
        <form
          onSubmit={submitReport}
          className="
            mt-6
            rounded-xl
            border
            border-[#252d38]
            bg-[#151b24]
            p-4
            sm:mt-8
            sm:p-6
          "
        >

          <div>
            <h3 className="text-base font-semibold text-white sm:text-lg">
              Add Field Update
            </h3>

            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              Provide field execution information for BharatForge reconciliation.
            </p>
          </div>


          {/* SELECTED FILE */}

          {selectedFile && (
            <div
              className="
                mt-4
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                sm:mt-5
                sm:p-4
              "
            >
              <p className="text-[10px] text-gray-500 sm:text-xs">
                SELECTED FILE
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <p className="min-w-0 truncate text-xs text-white sm:text-sm">
                  {selectedFile.name}
                </p>

                <span className="shrink-0 text-[10px] text-green-400 sm:text-xs">
                  Ready
                </span>
              </div>
            </div>
          )}


          {/* BASIC INFORMATION */}

          <div
            className="
              mt-5
              grid
              grid-cols-1
              gap-3
              sm:mt-6
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            <input
              required
              placeholder="Report ID"
              value={form.reportId}
              onChange={(e) =>
                setForm({
                  ...form,
                  reportId: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />

            <input
              required
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />

            <select
              value={form.sourceType}
              onChange={(e) =>
                setForm({
                  ...form,
                  sourceType: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-gray-300
                outline-none
              "
            >
              {sourceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={form.discipline}
              onChange={(e) =>
                setForm({
                  ...form,
                  discipline: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-gray-300
                outline-none
              "
            >
              {disciplines.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>


          {/* ACTIVITY INFORMATION */}

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-3
              sm:mt-4
              sm:grid-cols-2
            "
          >
            <input
              placeholder="Activity ID (optional)"
              value={form.activityId}
              onChange={(e) =>
                setForm({
                  ...form,
                  activityId: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Progress %"
              value={form.progress}
              onChange={(e) =>
                setForm({
                  ...form,
                  progress: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-3
                text-sm
                text-white
                outline-none
                focus:border-blue-500
              "
            />
          </div>


          {/* EXECUTION UPDATE */}

          <textarea
            placeholder="Execution update / work description"
            value={form.executionUpdate}
            onChange={(e) =>
              setForm({
                ...form,
                executionUpdate: e.target.value,
              })
            }
            rows="4"
            className="
              mt-3
              w-full
              resize-none
              rounded-lg
              border
              border-[#252d38]
              bg-[#10151c]
              p-3
              text-sm
              text-white
              outline-none
              focus:border-blue-500
              sm:mt-4
            "
          />


          {/* CONSTRAINT */}

          <input
            placeholder="Material / constraint / observation (optional)"
            value={form.constraint}
            onChange={(e) =>
              setForm({
                ...form,
                constraint: e.target.value,
              })
            }
            className="
              mt-3
              w-full
              rounded-lg
              border
              border-[#252d38]
              bg-[#10151c]
              p-3
              text-sm
              text-white
              outline-none
              focus:border-blue-500
              sm:mt-4
            "
          />


          {/* EVIDENCE */}

          <div className="mt-4">
            <label className="text-sm text-gray-300">
              Supporting Evidence
            </label>

            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) =>
                setForm({
                  ...form,
                  evidence:
                    e.target.files?.[0] || null,
                })
              }
              className="
                mt-2
                w-full
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-2.5
                text-xs
                text-gray-400
                sm:p-3
                sm:text-sm
              "
            />
          </div>


          {/* SUBMIT */}

          <button
            type="submit"
            className="
              mt-5
              w-full
              rounded-lg
              bg-green-600
              px-5
              py-2.5
              text-sm
              text-white
              transition
              hover:bg-green-700
              sm:mt-6
              sm:w-auto
            "
          >
            Submit Field Update
          </button>

        </form>
      )}


      {/* PROCESSING PIPELINE */}

      <div
        className="
          mt-6
          rounded-xl
          border
          border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-6
        "
      >
        <h3 className="text-base font-semibold text-white sm:text-lg">
          Field Report Processing
        </h3>

        <p className="mt-1 text-xs text-gray-400 sm:text-sm">
          Each field input moves through extraction and activity matching.
        </p>

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            md:grid-cols-3
            md:gap-4
            sm:mt-6
          "
        >

          <div
            className="
              rounded-lg
              border
              border-[#252d38]
              bg-[#10151c]
              p-4
            "
          >
            <p className="text-[10px] text-gray-500 sm:text-xs">
              STEP 01
            </p>

            <p className="mt-2 text-sm font-medium text-white">
              Extraction
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Convert field information into structured data.
            </p>
          </div>


          <div
            className="
              rounded-lg
              border
              border-[#252d38]
              bg-[#10151c]
              p-4
            "
          >
            <p className="text-[10px] text-gray-500 sm:text-xs">
              STEP 02
            </p>

            <p className="mt-2 text-sm font-medium text-white">
              Activity Matching
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Map the field update to the relevant L5/L6 activity.
            </p>
          </div>


          <div
            className="
              rounded-lg
              border
              border-[#252d38]
              bg-[#10151c]
              p-4
            "
          >
            <p className="text-[10px] text-gray-500 sm:text-xs">
              STEP 03
            </p>

            <p className="mt-2 text-sm font-medium text-white">
              Verification
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Route uncertain or conflicting updates for review.
            </p>
          </div>

        </div>
      </div>


      {/* REPORT RECORDS */}

      <div
        className="
          mt-6
          rounded-xl
          border
          border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-6
        "
      >

        <div
          className="
            flex
            flex-col
            gap-2
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h3 className="text-base font-semibold text-white sm:text-lg">
              Field Report Records
            </h3>

            <p className="mt-1 text-xs text-gray-400 sm:text-sm">
              Current execution inputs and reconciliation status
            </p>
          </div>

          <span className="text-xs text-gray-500">
            {reports.length} Records
          </span>
        </div>


        {/* DESKTOP / TABLET TABLE */}

        <div className="mt-5 hidden overflow-x-auto md:block sm:mt-6">
          <table className="w-full min-w-262.5 text-sm">

            <thead>
              <tr className="border-b border-[#252d38] text-left">

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Report
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Source
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Discipline
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Date
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Activity
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Progress
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Processing
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Extraction
                </th>

                <th className="pb-3 pr-5 font-medium text-gray-500">
                  Matching
                </th>

                <th className="pb-3 font-medium text-gray-500">
                  Confidence
                </th>

              </tr>
            </thead>


            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-[#252d38] last:border-0"
                >
                  <td className="py-4 pr-5 font-medium text-white">
                    {report.id}
                  </td>

                  <td className="py-4 pr-5 text-gray-300">
                    {report.sourceType}
                  </td>

                  <td className="py-4 pr-5 text-gray-400">
                    {report.discipline}
                  </td>

                  <td className="whitespace-nowrap py-4 pr-5 text-gray-400">
                    {report.date}
                  </td>

                  <td className="py-4 pr-5 text-white">
                    {report.activity}
                  </td>

                  <td className="py-4 pr-5 text-gray-300">
                    {report.progress}
                  </td>

                  <td className="py-4 pr-5">
                    <span
                      className={statusClass(
                        report.processingStatus
                      )}
                    >
                      {report.processingStatus}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span
                      className={statusClass(
                        report.extractionStatus
                      )}
                    >
                      {report.extractionStatus}
                    </span>
                  </td>

                  <td className="py-4 pr-5">
                    <span
                      className={statusClass(
                        report.matchingStatus
                      )}
                    >
                      {report.matchingStatus}
                    </span>
                  </td>

                  <td className="py-4 text-gray-300">
                    {report.confidence}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>


        {/* MOBILE REPORT CARDS */}

        <div className="mt-5 space-y-3 md:hidden">

          {reports.map((report) => (
            <div
              key={report.id}
              className="
                rounded-lg
                border
                border-[#252d38]
                bg-[#10151c]
                p-4
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-3
                "
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white">
                    {report.id}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {report.activity}
                  </p>
                </div>

                <span
                  className={`
                    shrink-0
                    text-xs
                    font-medium
                    ${statusClass(report.matchingStatus)}
                  `}
                >
                  {report.matchingStatus}
                </span>
              </div>


              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                  border-t
                  border-[#252d38]
                  pt-3
                "
              >
                <div>
                  <p className="text-[10px] text-gray-600">
                    Source
                  </p>

                  <p className="mt-1 text-xs text-gray-300">
                    {report.sourceType}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Discipline
                  </p>

                  <p className="mt-1 text-xs text-gray-300">
                    {report.discipline}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Date
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    {report.date}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Progress
                  </p>

                  <p className="mt-1 text-xs text-white">
                    {report.progress}
                  </p>
                </div>
              </div>


              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-3
                  border-t
                  border-[#252d38]
                  pt-3
                "
              >
                <div>
                  <p className="text-[10px] text-gray-600">
                    Processing
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      ${statusClass(
                        report.processingStatus
                      )}
                    `}
                  >
                    {report.processingStatus}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Extraction
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      ${statusClass(
                        report.extractionStatus
                      )}
                    `}
                  >
                    {report.extractionStatus}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Matching
                  </p>

                  <p
                    className={`
                      mt-1
                      text-xs
                      ${statusClass(
                        report.matchingStatus
                      )}
                    `}
                  >
                    {report.matchingStatus}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-600">
                    Confidence
                  </p>

                  <p className="mt-1 text-xs text-gray-300">
                    {report.confidence}
                  </p>
                </div>
              </div>

            </div>
          ))}

        </div>

      </div>


      {/* ARCHITECTURE NOTE */}

      <div
        className="
          mt-6
          rounded-xl
          border
          border-[#252d38]
          bg-[#151b24]
          p-4
          sm:mt-8
          sm:p-5
        "
      >
        <p className="text-[10px] text-gray-500 sm:text-xs">
          RECONCILIATION PIPELINE
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
          Field inputs are converted into structured execution
          data, matched against the project schedule, and routed
          to verification when the match or extracted information
          requires review.
        </p>
      </div>

    </div>
  )
}

export default Reports