import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import pool from "../config/db.js";

const router = express.Router();


// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 25 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {

        const allowedExtensions = [
            ".xlsx",
            ".xls",
        ];

        const extension =
            file.originalname
                .toLowerCase()
                .slice(
                    file.originalname.lastIndexOf(".")
                );

        if (!allowedExtensions.includes(extension)) {
            return cb(
                new Error(
                    "Only XLSX and XLS P6 schedule files are supported."
                )
            );
        }

        cb(null, true);
    },
});


// ============================================================
// TEXT NORMALIZATION
// ============================================================

function normalizeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\u00a0/g, " ")
        .replace(/\r/g, " ")
        .replace(/\n/g, " ")
        .replace(/\t/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}


function cleanValue(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (
        typeof value === "string"
    ) {

        const cleaned =
            value
                .replace(/\u00a0/g, " ")
                .replace(/\r/g, " ")
                .replace(/\n/g, " ")
                .trim();

        return cleaned || null;
    }

    return value;
}


// ============================================================
// HEADER MATCHING
// ============================================================

function headerMatches(
    actualHeader,
    possibleHeaders
) {

    const normalizedActual =
        normalizeText(actualHeader);

    if (!normalizedActual) {
        return false;
    }

    return possibleHeaders.some(
        (header) =>
            normalizedActual ===
            normalizeText(header)
    );
}


// ============================================================
// GET VALUE FROM NORMALIZED ROW
// ============================================================

function getValue(
    row,
    possibleHeaders
) {

    if (!row) {
        return null;
    }

    const keys =
        Object.keys(row);

    for (const key of keys) {

        if (
            headerMatches(
                key,
                possibleHeaders
            )
        ) {
            return cleanValue(
                row[key]
            );
        }
    }

    return null;
}


// ============================================================
// FIND HEADER ROW
// ============================================================

function findHeaderRow(
    sheet,
    requiredHeaders = []
) {

    const matrix =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                header: 1,
                defval: null,
                raw: true,
            }
        );

    if (!matrix.length) {
        return -1;
    }

    const normalizedRequired =
        requiredHeaders.map(
            normalizeText
        );

    /*
     * Search the first 50 rows for the actual
     * table header.
     */
    const searchLimit =
        Math.min(
            matrix.length,
            50
        );

    for (
        let rowIndex = 0;
        rowIndex < searchLimit;
        rowIndex++
    ) {

        const row =
            matrix[rowIndex] || [];

        const normalizedRow =
            row.map(
                normalizeText
            );

        const matchedCount =
            normalizedRequired.filter(
                (required) =>
                    normalizedRow.includes(
                        required
                    )
            ).length;

        /*
         * Require at least two important headers.
         */
        if (
            matchedCount >=
            Math.min(
                2,
                normalizedRequired.length
            )
        ) {
            return rowIndex;
        }
    }

    return -1;
}


// ============================================================
// CONVERT SHEET TO OBJECT ROWS
// ============================================================

function sheetToObjects(
    sheet,
    headerRowIndex
) {

    const matrix =
        XLSX.utils.sheet_to_json(
            sheet,
            {
                header: 1,
                defval: null,
                raw: true,
            }
        );

    if (
        headerRowIndex < 0 ||
        headerRowIndex >= matrix.length
    ) {
        return [];
    }

    const headerRow =
        matrix[headerRowIndex] || [];

    const headers =
        headerRow.map(
            (header, index) => {

                const value =
                    cleanValue(header);

                return (
                    value ||
                    `Column_${index + 1}`
                );
            }
        );

    const rows = [];

    for (
        let i =
            headerRowIndex + 1;
        i < matrix.length;
        i++
    ) {

        const sourceRow =
            matrix[i] || [];

        const row = {};

        let hasValue = false;

        headers.forEach(
            (header, columnIndex) => {

                const value =
                    cleanValue(
                        sourceRow[
                            columnIndex
                        ]
                    );

                if (
                    value !== null &&
                    value !== ""
                ) {
                    hasValue = true;
                }

                row[header] = value;
            }
        );

        if (hasValue) {
            rows.push(row);
        }
    }

    return rows;
}


// ============================================================
// NUMBER PARSER
// ============================================================

function toNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }

    if (
        typeof value === "number"
    ) {
        return Number.isFinite(value)
            ? value
            : null;
    }

    const text =
        String(value)
            .replace(/,/g, "")
            .replace(/%/g, "")
            .trim();

    if (!text) {
        return null;
    }

    const number =
        Number(text);

    return Number.isFinite(number)
        ? number
        : null;
}


// ============================================================
// DATE PARSER
// ============================================================

function toDate(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return null;
    }


    // Already a JavaScript Date
    if (
        value instanceof Date
    ) {

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {
            return null;
        }

        return value
            .toISOString()
            .slice(0, 10);
    }


    // Excel serial date
    if (
        typeof value === "number"
    ) {

        /*
         * Excel epoch conversion.
         */
        const excelEpoch =
            new Date(
                Date.UTC(
                    1899,
                    11,
                    30
                )
            );

        const date =
            new Date(
                excelEpoch.getTime() +
                value * 86400000
            );

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return null;
        }

        return date
            .toISOString()
            .slice(0, 10);
    }


    const text =
        String(value)
            .trim();

    if (!text) {
        return null;
    }


    /*
     * DD-MMM-YYYY
     * Example: 09-Oct-2026
     */
    const dmy =
        text.match(
            /^(\d{1,2})[-\/](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-\/](\d{4})$/i
        );

    if (dmy) {

        const months = {
            jan: 0,
            feb: 1,
            mar: 2,
            apr: 3,
            may: 4,
            jun: 5,
            jul: 6,
            aug: 7,
            sep: 8,
            oct: 9,
            nov: 10,
            dec: 11,
        };

        const date =
            new Date(
                Date.UTC(
                    Number(dmy[3]),
                    months[
                        dmy[2]
                            .slice(0, 3)
                            .toLowerCase()
                    ],
                    Number(dmy[1])
                )
            );

        return date
            .toISOString()
            .slice(0, 10);
    }


    /*
     * YYYY-MM-DD
     */
    const iso =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );

    if (iso) {

        return `${iso[1]}-${String(
            iso[2]
        ).padStart(2, "0")}-${String(
            iso[3]
        ).padStart(2, "0")}`;
    }


    /*
     * DD/MM/YYYY
     */
    const slash =
        text.match(
            /^(\d{1,2})\/(\d{1,2})\/(\d{4})/
        );

    if (slash) {

        return `${slash[3]}-${String(
            slash[2]
        ).padStart(2, "0")}-${String(
            slash[1]
        ).padStart(2, "0")}`;
    }


    const parsed =
        new Date(text);

    if (
        Number.isNaN(
            parsed.getTime()
        )
    ) {
        return null;
    }

    return parsed
        .toISOString()
        .slice(0, 10);
}


// ============================================================
// NORMALIZE PROGRESS
// ============================================================

function normalizeProgress(value) {

    const number =
        toNumber(value);

    if (number === null) {
        return 0;
    }

    /*
     * If Excel stores 0.82 instead of 82,
     * convert to percentage.
     */
    if (
        number > 0 &&
        number <= 1
    ) {
        return Number(
            (number * 100).toFixed(2)
        );
    }

    return Math.max(
        0,
        Math.min(
            100,
            number
        )
    );
}


// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(
    status,
    progress
) {

    const text =
        normalizeText(status);

    if (
        text.includes("complete") ||
        progress >= 100
    ) {
        return "COMPLETED";
    }

    if (
        text.includes("delay")
    ) {
        return "DELAYED";
    }

    if (
        text.includes("progress") ||
        text.includes("active") ||
        text.includes("started")
    ) {
        return "IN_PROGRESS";
    }

    return "NOT_STARTED";
}


// ============================================================
// EXTRACT PROJECT METADATA
// ============================================================

function extractProjectMetadata(
    setupSheet,
    workbookTitle = ""
) {

    let projectCode = null;
    let projectName = null;
    let location = null;

    if (setupSheet) {

        const matrix =
            XLSX.utils.sheet_to_json(
                setupSheet,
                {
                    header: 1,
                    defval: null,
                    raw: true,
                }
            );

        for (
            let i = 0;
            i < matrix.length;
            i++
        ) {

            const row =
                matrix[i] || [];

            for (
                let j = 0;
                j < row.length;
                j++
            ) {

                const label =
                    normalizeText(
                        row[j]
                    );

                const value =
                    row[j + 1];

                if (
                    !value
                ) {
                    continue;
                }

                if (
                    [
                        "project id",
                        "project code",
                        "projectid",
                        "projectcode",
                    ].includes(label)
                ) {

                    projectCode =
                        cleanValue(
                            value
                        );
                }

                if (
                    [
                        "project name",
                        "projectname",
                    ].includes(label)
                ) {

                    projectName =
                        cleanValue(
                            value
                        );
                }

                if (
                    [
                        "location",
                        "project location",
                        "site location",
                    ].includes(label)
                ) {

                    location =
                        cleanValue(
                            value
                        );
                }
            }
        }
    }


    /*
     * Fallback if P6 Setup does not contain
     * the expected key/value labels.
     */
    if (!projectCode) {

        const match =
            workbookTitle.match(
                /\b([A-Z]{2,10}[-_]\w+)\b/i
            );

        if (match) {
            projectCode =
                match[1];
        }
    }


    if (!projectName) {

        const title =
            String(
                workbookTitle || ""
            );

        const parts =
            title
                .split("|")
                .map(
                    (part) =>
                        part.trim()
                )
                .filter(Boolean);

        if (
            parts.length >= 2
        ) {

            projectName =
                parts[1];
        }
    }


    return {
        projectCode:
            projectCode ||
            `P6-${Date.now()}`,

        projectName:
            projectName ||
            "Imported P6 Project",

        location:
            location ||
            "Project Site",
    };
}


// ============================================================
// FIND MASTER SCHEDULE SHEET
// ============================================================

function findMasterScheduleSheet(
    workbook
) {

    const names =
        workbook.SheetNames;

    /*
     * Prefer exact Master Schedule.
     */
    const exact =
        names.find(
            (name) =>
                normalizeText(name) ===
                "master schedule"
        );

    if (exact) {
        return exact;
    }


    /*
     * Fallback for variations.
     */
    const fallback =
        names.find(
            (name) =>
                normalizeText(name)
                    .includes(
                        "master schedule"
                    )
        );

    if (fallback) {
        return fallback;
    }


    /*
     * Final fallback to Activities.
     */
    const activities =
        names.find(
            (name) =>
                normalizeText(name) ===
                "activities"
        );

    return activities || null;
}


// ============================================================
// EXTRACT ACTIVITIES
// ============================================================

function extractActivities(
    workbook
) {

    const sheetName =
        findMasterScheduleSheet(
            workbook
        );

    if (!sheetName) {

        return {
            sheetName: null,
            headerRow: -1,
            rows: [],
        };
    }


    const sheet =
        workbook.Sheets[
            sheetName
        ];


    /*
     * IMPORTANT:
     *
     * The uploaded P6 workbook has a title/header
     * area before the actual Master Schedule table.
     *
     * Therefore we dynamically locate the row containing:
     *
     * Activity ID
     * WBS
     * Activity Name
     */
    const headerRow =
        findHeaderRow(
            sheet,
            [
                "Activity ID",
                "WBS",
                "Activity Name",
            ]
        );


    if (
        headerRow === -1
    ) {

        console.error(
            `Could not find activity header in ${sheetName}`
        );

        return {
            sheetName,
            headerRow,
            rows: [],
        };
    }


    const rows =
        sheetToObjects(
            sheet,
            headerRow
        );


    /*
     * Remove non-activity rows.
     */
    const activityRows =
        rows.filter(
            (row) => {

                const activityCode =
                    getValue(
                        row,
                        [
                            "Activity ID",
                            "Activity Code",
                            "Activity Id",
                            "ID",
                        ]
                    );

                const activityName =
                    getValue(
                        row,
                        [
                            "Activity Name",
                            "Name",
                        ]
                    );

                return (
                    activityCode &&
                    activityName
                );
            }
        );


    console.log(
        `P6 activity source: ${sheetName}`
    );

    console.log(
        `P6 header row: ${headerRow + 1}`
    );

    console.log(
        `Found ${activityRows.length} schedule activity rows`
    );


    return {
        sheetName,
        headerRow,
        rows: activityRows,
    };
}


// ============================================================
// POST /api/ingestion/schedule
// ============================================================

router.post(
    "/schedule",
    upload.single("file"),
    async (req, res) => {

        const client =
            await pool.connect();

        try {

            // --------------------------------------------------
            // Validate upload
            // --------------------------------------------------

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No P6 schedule file uploaded.",
                });
            }


            console.log(
                "========================================"
            );

            console.log(
                "P6 SCHEDULE IMPORT STARTED"
            );

            console.log(
                `File: ${req.file.originalname}`
            );

            console.log(
                "========================================"
            );


            // --------------------------------------------------
            // Read workbook
            // --------------------------------------------------

            const workbook =
                XLSX.read(
                    req.file.buffer,
                    {
                        type: "buffer",
                        cellDates: true,
                        cellNF: false,
                        cellText: true,
                    }
                );


            console.log(
                `Sheets found: ${workbook.SheetNames.length}`
            );

            console.log(
                workbook.SheetNames
            );


            // --------------------------------------------------
            // Convert every sheet to raw structured data
            // --------------------------------------------------

            const rawWorkbookData = {};


            for (
                const sheetName
                of workbook.SheetNames
            ) {

                const sheet =
                    workbook.Sheets[
                        sheetName
                    ];

                const matrix =
                    XLSX.utils.sheet_to_json(
                        sheet,
                        {
                            header: 1,
                            defval: null,
                            raw: true,
                        }
                    );

                rawWorkbookData[
                    sheetName
                ] = {
                    rowCount:
                        matrix.length,

                    rows:
                        matrix,
                };
            }


            // --------------------------------------------------
            // P6 Setup
            // --------------------------------------------------

            const setupSheetName =
                workbook.SheetNames.find(
                    (name) =>
                        normalizeText(
                            name
                        ) ===
                        "p6 setup"
                );


            const setupSheet =
                setupSheetName
                    ? workbook.Sheets[
                          setupSheetName
                      ]
                    : null;


            const workbookTitle =
                rawWorkbookData[
                    workbook.SheetNames[0]
                ]
                    ?.rows?.[0]?.[0] ||
                "";


            const {
                projectCode,
                projectName,
                location,
            } =
                extractProjectMetadata(
                    setupSheet,
                    workbookTitle
                );


            console.log(
                `Project Code: ${projectCode}`
            );

            console.log(
                `Project Name: ${projectName}`
            );


            // --------------------------------------------------
            // Extract Master Schedule
            // --------------------------------------------------

            const {
                sheetName:
                    activitySheetName,
                headerRow:
                    activityHeaderRow,
                rows:
                    activityRows,
            } =
                extractActivities(
                    workbook
                );


            if (
                activityRows.length === 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "No activities were found in the P6 workbook. The Master Schedule header could not be detected.",
                    sheets:
                        workbook.SheetNames,
                    activitySheet:
                        activitySheetName,
                    headerRow:
                        activityHeaderRow >= 0
                            ? activityHeaderRow + 1
                            : null,
                });
            }


            // --------------------------------------------------
            // Find project dates
            // --------------------------------------------------

            const plannedStarts =
                activityRows
                    .map(
                        (row) =>
                            toDate(
                                getValue(
                                    row,
                                    [
                                        "Planned Start",
                                        "Planned Start Date",
                                        "Start",
                                    ]
                                )
                            )
                    )
                    .filter(Boolean);


            const plannedFinishes =
                activityRows
                    .map(
                        (row) =>
                            toDate(
                                getValue(
                                    row,
                                    [
                                        "Planned Finish",
                                        "Planned Finish Date",
                                        "Finish",
                                    ]
                                )
                            )
                    )
                    .filter(Boolean);


            const projectStart =
                plannedStarts.length
                    ? [...plannedStarts].sort()[0]
                    : null;


            const projectEnd =
                plannedFinishes.length
                    ? [...plannedFinishes].sort().at(-1)
                    : null;


            // --------------------------------------------------
            // Progress
            // --------------------------------------------------

            const progressValues =
                activityRows
                    .map(
                        (row) =>
                            normalizeProgress(
                                getValue(
                                    row,
                                    [
                                        "Percent Complete",
                                        "% Complete",
                                        "Physical % Complete",
                                        "Activity % Complete",
                                    ]
                                )
                            )
                    );


            const averageProgress =
                progressValues.length
                    ? progressValues.reduce(
                          (
                              sum,
                              value
                          ) =>
                              sum + value,
                          0
                      ) /
                      progressValues.length
                    : 0;


            // --------------------------------------------------
            // Begin transaction
            // --------------------------------------------------

            await client.query(
                "BEGIN"
            );


            // --------------------------------------------------
            // Create schedule_imports table
            // --------------------------------------------------

            await client.query(`
                CREATE TABLE IF NOT EXISTS schedule_imports (
                    id BIGSERIAL PRIMARY KEY,
                    project_id BIGINT REFERENCES projects(id),
                    source_filename VARCHAR(500) NOT NULL,
                    source_type VARCHAR(50) DEFAULT 'P6_XLSX',
                    activity_count INTEGER DEFAULT 0,
                    imported_at TIMESTAMPTZ DEFAULT NOW(),
                    raw_data JSONB
                )
            `);


            // --------------------------------------------------
            // Create schedule_import_sheets table
            // --------------------------------------------------

            await client.query(`
                CREATE TABLE IF NOT EXISTS schedule_import_sheets (
                    id BIGSERIAL PRIMARY KEY,
                    schedule_import_id BIGINT REFERENCES schedule_imports(id) ON DELETE CASCADE,
                    sheet_name VARCHAR(255) NOT NULL,
                    row_count INTEGER DEFAULT 0,
                    data JSONB,
                    imported_at TIMESTAMPTZ DEFAULT NOW()
                )
            `);


            // --------------------------------------------------
            // Create or update project
            // --------------------------------------------------

            let projectResult =
                await client.query(
                    `
                    SELECT
                        id,
                        project_code,
                        name
                    FROM projects
                    WHERE project_code = $1
                    LIMIT 1
                    `,
                    [
                        projectCode,
                    ]
                );


            let project;


            if (
                projectResult.rows.length > 0
            ) {

                project =
                    projectResult.rows[0];


                await client.query(
                    `
                    UPDATE projects
                    SET
                        name = COALESCE(
                            $1,
                            name
                        ),

                        location = COALESCE(
                            $2,
                            location
                        ),

                        status = 'ACTIVE',

                        planned_progress = $3,

                        actual_progress = $4,

                        start_date = $5,

                        planned_end_date = $6,

                        updated_at = NOW()

                    WHERE id = $7
                    `,
                    [
                        projectName,
                        location,
                        0,
                        averageProgress,
                        projectStart,
                        projectEnd,
                        project.id,
                    ]
                );

            } else {

                const newProjectResult =
                    await client.query(
                        `
                        INSERT INTO projects (
                            project_code,
                            name,
                            location,
                            status,
                            planned_progress,
                            actual_progress,
                            start_date,
                            planned_end_date
                        )

                        VALUES (
                            $1,
                            $2,
                            $3,
                            'ACTIVE',
                            $4,
                            $5,
                            $6,
                            $7
                        )

                        RETURNING
                            id,
                            project_code,
                            name
                        `,
                        [
                            projectCode,
                            projectName,
                            location,
                            0,
                            averageProgress,
                            projectStart,
                            projectEnd,
                        ]
                    );


                project =
                    newProjectResult.rows[0];
            }


            // --------------------------------------------------
            // Import activities
            // --------------------------------------------------

            let importedActivities = 0;
            let updatedActivities = 0;
            let insertedActivities = 0;


            for (
                const row
                of activityRows
            ) {

                // ------------------------------------------------
                // Basic fields
                // ------------------------------------------------

                const activityCode =
                    getValue(
                        row,
                        [
                            "Activity ID",
                            "Activity Code",
                            "Activity Id",
                            "ID",
                        ]
                    );


                const activityName =
                    getValue(
                        row,
                        [
                            "Activity Name",
                            "Name",
                        ]
                    );


                if (
                    !activityCode ||
                    !activityName
                ) {
                    continue;
                }


                // ------------------------------------------------
                // P6 fields
                // ------------------------------------------------

                const wbsCode =
                    getValue(
                        row,
                        [
                            "WBS Code",
                            "WBS",
                        ]
                    );


                const activityType =
                    getValue(
                        row,
                        [
                            "Activity Type",
                            "Type",
                        ]
                    );


                const discipline =
                    getValue(
                        row,
                        [
                            "Discipline",
                            "Discipline Name",
                        ]
                    );


                const owner =
                    getValue(
                        row,
                        [
                            "Owner",
                        ]
                    );


                const durationDays =
                    toNumber(
                        getValue(
                            row,
                            [
                                "Original Duration",
                                "Original Duration days",
                                "Original Duration (days)",
                                "Duration (days)",
                                "Duration days",
                                "Duration",
                                "Dur.",
                            ]
                        )
                    );


                const plannedStart =
                    toDate(
                        getValue(
                            row,
                            [
                                "Planned Start",
                                "Planned Start Date",
                                "Start",
                            ]
                        )
                    );


                const plannedFinish =
                    toDate(
                        getValue(
                            row,
                            [
                                "Planned Finish",
                                "Planned Finish Date",
                                "Finish",
                            ]
                        )
                    );


                const actualStart =
                    toDate(
                        getValue(
                            row,
                            [
                                "Actual Start",
                                "Actual Start Date",
                            ]
                        )
                    );


                const actualFinish =
                    toDate(
                        getValue(
                            row,
                            [
                                "Actual Finish",
                                "Actual Finish Date",
                            ]
                        )
                    );


                const baselineStart =
                    toDate(
                        getValue(
                            row,
                            [
                                "Baseline Start",
                                "BL Start",
                            ]
                        )
                    );


                const baselineFinish =
                    toDate(
                        getValue(
                            row,
                            [
                                "Baseline Finish",
                                "BL Finish",
                            ]
                        )
                    );


                const forecastFinish =
                    toDate(
                        getValue(
                            row,
                            [
                                "Forecast Finish",
                                "Forecast Finish Date",
                            ]
                        )
                    );


                const predecessorId =
                    getValue(
                        row,
                        [
                            "Predecessor ID",
                            "Predecessor",
                            "Predecessors",
                        ]
                    );


                const relationshipType =
                    getValue(
                        row,
                        [
                            "Relationship",
                            "Relationship Type",
                            "Predecessor Relationship",
                        ]
                    );


                const lagDays =
                    toNumber(
                        getValue(
                            row,
                            [
                                "Lag days",
                                "Lag Days",
                                "Lag",
                            ]
                        )
                    );


                const statusRaw =
                    getValue(
                        row,
                        [
                            "Status",
                            "Activity Status",
                        ]
                    );


                const percentComplete =
                    normalizeProgress(
                        getValue(
                            row,
                            [
                                "Percent Complete",
                                "% Complete",
                                "Physical % Complete",
                                "Activity % Complete",
                            ]
                        )
                    );


                const primaryResource =
                    getValue(
                        row,
                        [
                            "Primary Resource",
                            "Resource",
                            "Resources",
                        ]
                    );


                const quantity =
                    toNumber(
                        getValue(
                            row,
                            [
                                "Quantity",
                                "Qty",
                            ]
                        )
                    );


                const uom =
                    getValue(
                        row,
                        [
                            "UOM",
                            "Unit",
                            "Unit of Measure",
                        ]
                    );


                const calendar =
                    getValue(
                        row,
                        [
                            "Calendar",
                            "Calendar Name",
                        ]
                    );


                const constraintType =
                    getValue(
                        row,
                        [
                            "Constraint Type",
                            "Constraint",
                        ]
                    );


                const constraintDate =
                    toDate(
                        getValue(
                            row,
                            [
                                "Constraint Date",
                            ]
                        )
                    );


                const criticalCandidate =
                    getValue(
                        row,
                        [
                            "Critical Candidate",
                            "Critical",
                            "Critical Activity",
                        ]
                    );


                const varianceDays =
                    toNumber(
                        getValue(
                            row,
                            [
                                "Variance days",
                                "Variance Days",
                                "Variance",
                            ]
                        )
                    );


                const acceptanceExitCriteria =
                    getValue(
                        row,
                        [
                            "Acceptance / Exit Criteria",
                            "Acceptance Exit Criteria",
                            "Acceptance Criteria",
                        ]
                    );


                const inputEvidence =
                    getValue(
                        row,
                        [
                            "Input / Evidence",
                            "Evidence",
                        ]
                    );


                const reviewGate =
                    getValue(
                        row,
                        [
                            "Review Gate",
                        ]
                    );


                const notes =
                    getValue(
                        row,
                        [
                            "Notes",
                            "Remarks",
                        ]
                    );


                const description =
                    getValue(
                        row,
                        [
                            "Description",
                            "Activity Description",
                        ]
                    ) ||
                    activityName;


                // ------------------------------------------------
                // Normalize status
                // ------------------------------------------------

                const normalizedStatus =
                    normalizeStatus(
                        statusRaw,
                        percentComplete
                    );


                // ------------------------------------------------
                // Calculate risk
                // ------------------------------------------------

                let riskLevel =
                    "LOW";


                if (
                    varianceDays !== null &&
                    varianceDays <= -20
                ) {

                    riskLevel =
                        "HIGH";

                } else if (
                    varianceDays !== null &&
                    varianceDays <= -10
                ) {

                    riskLevel =
                        "MEDIUM";
                }


                // ------------------------------------------------
                // Complete raw P6 row
                // ------------------------------------------------

                const p6Data = {
                    ...row,

                    source_sheet:
                        activitySheetName,

                    source_file:
                        req.file.originalname,

                    imported_at:
                        new Date().toISOString(),
                };


                // ------------------------------------------------
                // Existing activity
                // ------------------------------------------------

                const existing =
                    await client.query(
                        `
                        SELECT
                            id
                        FROM activities
                        WHERE
                            project_id = $1
                            AND activity_code = $2
                        LIMIT 1
                        `,
                        [
                            project.id,
                            String(
                                activityCode
                            ),
                        ]
                    );


                // ------------------------------------------------
                // UPDATE
                // ------------------------------------------------

                if (
                    existing.rows.length > 0
                ) {

                    await client.query(
                        `
                        UPDATE activities

                        SET
                            name = $1,
                            description = $2,
                            planned_progress = $3,
                            actual_progress = $4,
                            status = $5,
                            planned_start = $6,
                            planned_finish = $7,
                            actual_start = $8,
                            actual_finish = $9,
                            forecast_finish = $10,
                            potential_delay_days = $11,
                            discipline = $12,
                            wbs_code = $13,
                            activity_type = $14,
                            owner = $15,
                            duration_days = $16,
                            predecessor_id = $17,
                            relationship_type = $18,
                            lag_days = $19,
                            calendar = $20,
                            baseline_start = $21,
                            baseline_finish = $22,
                            critical_candidate = $23,
                            variance_days = $24,
                            acceptance_exit_criteria = $25,
                            input_evidence = $26,
                            review_gate = $27,
                            notes = $28,
                            primary_resource = $29,
                            quantity = $30,
                            uom = $31,
                            constraint_type = $32,
                            constraint_date = $33,
                            risk_level = $34,
                            p6_data = $35,
                            updated_at = NOW()

                        WHERE id = $36
                        `,
                        [
                            activityName,
                            description,
                            0,
                            percentComplete,
                            normalizedStatus,
                            plannedStart,
                            plannedFinish,
                            actualStart,
                            actualFinish,
                            forecastFinish,
                            varianceDays || 0,
                            discipline,
                            wbsCode,
                            activityType,
                            owner,
                            durationDays,
                            predecessorId,
                            relationshipType,
                            lagDays,
                            calendar,
                            baselineStart,
                            baselineFinish,
                            criticalCandidate,
                            varianceDays,
                            acceptanceExitCriteria,
                            inputEvidence,
                            reviewGate,
                            notes,
                            primaryResource,
                            quantity,
                            uom,
                            constraintType,
                            constraintDate,
                            riskLevel,
                            JSON.stringify(
                                p6Data
                            ),
                            existing.rows[0].id,
                        ]
                    );


                    updatedActivities++;

                } else {

                    // ------------------------------------------------
                    // INSERT
                    // ------------------------------------------------

                    await client.query(
                        `
                        INSERT INTO activities (
                            activity_code,
                            project_id,
                            name,
                            description,
                            planned_progress,
                            actual_progress,
                            risk_level,
                            status,
                            planned_start,
                            planned_finish,
                            actual_start,
                            actual_finish,
                            forecast_finish,
                            potential_delay_days,
                            discipline,
                            wbs_code,
                            activity_type,
                            owner,
                            duration_days,
                            predecessor_id,
                            relationship_type,
                            lag_days,
                            calendar,
                            baseline_start,
                            baseline_finish,
                            critical_candidate,
                            variance_days,
                            acceptance_exit_criteria,
                            input_evidence,
                            review_gate,
                            notes,
                            primary_resource,
                            quantity,
                            uom,
                            constraint_type,
                            constraint_date,
                            p6_data
                        )

                        VALUES (
                            $1,$2,$3,$4,$5,$6,$7,$8,
                            $9,$10,$11,$12,$13,$14,$15,$16,
                            $17,$18,$19,$20,$21,$22,$23,$24,
                            $25,$26,$27,$28,$29,$30,$31,$32,
                            $33,$34,$35,$36,$37
                        )
                        `,
                        [
                            String(
                                activityCode
                            ),

                            project.id,

                            activityName,

                            description,

                            0,

                            percentComplete,

                            riskLevel,

                            normalizedStatus,

                            plannedStart,

                            plannedFinish,

                            actualStart,

                            actualFinish,

                            forecastFinish,

                            varianceDays || 0,

                            discipline,

                            wbsCode,

                            activityType,

                            owner,

                            durationDays,

                            predecessorId,

                            relationshipType,

                            lagDays,

                            calendar,

                            baselineStart,

                            baselineFinish,

                            criticalCandidate,

                            varianceDays,

                            acceptanceExitCriteria,

                            inputEvidence,

                            reviewGate,

                            notes,

                            primaryResource,

                            quantity,

                            uom,

                            constraintType,

                            constraintDate,

                            JSON.stringify(
                                p6Data
                            ),
                        ]
                    );


                    insertedActivities++;
                }


                importedActivities++;
            }


            // --------------------------------------------------
            // Store complete workbook
            // --------------------------------------------------

            const importResult =
                await client.query(
                    `
                    INSERT INTO schedule_imports (
                        project_id,
                        source_filename,
                        source_type,
                        activity_count,
                        raw_data
                    )

                    VALUES (
                        $1,
                        $2,
                        'P6_XLSX',
                        $3,
                        $4
                    )

                    RETURNING id
                    `,
                    [
                        project.id,
                        req.file.originalname,
                        importedActivities,
                        JSON.stringify(
                            rawWorkbookData
                        ),
                    ]
                );


            const scheduleImportId =
                importResult.rows[0].id;


            // --------------------------------------------------
            // Store each sheet separately
            // --------------------------------------------------

            for (
                const sheetName
                of workbook.SheetNames
            ) {

                const sheetData =
                    rawWorkbookData[
                        sheetName
                    ];


                await client.query(
                    `
                    INSERT INTO schedule_import_sheets (
                        schedule_import_id,
                        sheet_name,
                        row_count,
                        data
                    )

                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    `,
                    [
                        scheduleImportId,
                        sheetName,
                        sheetData.rowCount,
                        JSON.stringify(
                            sheetData.rows
                        ),
                    ]
                );
            }


            // --------------------------------------------------
            // Commit
            // --------------------------------------------------

            await client.query(
                "COMMIT"
            );


            console.log(
                "========================================"
            );

            console.log(
                "P6 IMPORT COMPLETE"
            );

            console.log(
                `Project: ${project.project_code}`
            );

            console.log(
                `Activities: ${importedActivities}`
            );

            console.log(
                `Inserted: ${insertedActivities}`
            );

            console.log(
                `Updated: ${updatedActivities}`
            );

            console.log(
                `Sheets: ${workbook.SheetNames.length}`
            );

            console.log(
                "========================================"
            );


            // --------------------------------------------------
            // Return response
            // --------------------------------------------------

            return res.json({

                success: true,

                message:
                    "P6 schedule imported successfully",

                project: {
                    id:
                        project.id,

                    projectCode:
                        project.project_code,

                    name:
                        project.name,

                    location,
                },

                schedule: {

                    filename:
                        req.file.originalname,

                    sheets:
                        workbook.SheetNames,

                    activitySource:
                        activitySheetName,

                    activityHeaderRow:
                        activityHeaderRow + 1,

                    activityCount:
                        importedActivities,

                    inserted:
                        insertedActivities,

                    updated:
                        updatedActivities,

                    projectStart,

                    projectEnd,

                    averageProgress:
                        Number(
                            averageProgress.toFixed(
                                2
                            )
                        ),
                },

            });

        } catch (error) {

            try {
                await client.query(
                    "ROLLBACK"
                );
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }


            console.error(
                "========================================"
            );

            console.error(
                "P6 SCHEDULE IMPORT ERROR"
            );

            console.error(
                error
            );

            console.error(
                "========================================"
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to import P6 schedule",

                error:
                    error.message,

            });

        } finally {

            client.release();
        }
    }
);


// ============================================================
// MULTER / UPLOAD ERROR HANDLER
// ============================================================

router.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Schedule upload error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Invalid schedule upload",

        });
    }
);


// ============================================================
// EXPORT
// ============================================================

export default router;