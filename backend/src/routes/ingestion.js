import express from "express";
import multer from "multer";
import XLSX from "xlsx";
import pool from "../config/db.js";

import {
    extractFieldReportFromImage,
    extractFieldReportFromPdf,
    extractFieldReportFromSpreadsheet,
} from "../services/aiExtractor.js";

import { matchActivity } from "../services/activityMatcher.js";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024,
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg",
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
            "text/csv",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error(
                    "Supported formats: JPG, PNG, WEBP, PDF, XLSX, XLS and CSV"
                )
            );
        }

        cb(null, true);
    },
});

const extractDPR = async (file) => {
    const { buffer, mimetype } = file;

    if (mimetype.startsWith("image/")) {
        return await extractFieldReportFromImage(
            buffer,
            mimetype
        );
    }

    if (mimetype === "application/pdf") {
    const pdfModule = await import("pdf-parse");

    const PDFParse = pdfModule.PDFParse;

    if (!PDFParse) {
        throw new Error(
            "PDFParse is not available from pdf-parse"
        );
    }

    const parser = new PDFParse({
        data: buffer,
    });

    const pdfData = await parser.getText();

    if (!pdfData?.text?.trim()) {
        throw new Error(
            "No readable text was found in the PDF"
        );
    }

    return await extractFieldReportFromPdf(
        pdfData.text
    );
}

    if (
        mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimetype === "application/vnd.ms-excel" ||
        mimetype === "text/csv"
    ) {
        let workbook;

        if (mimetype === "text/csv") {
            workbook = XLSX.read(
                buffer.toString("utf8"),
                {
                    type: "string",
                }
            );
        } else {
            workbook = XLSX.read(buffer, {
                type: "buffer",
            });
        }

        const spreadsheetText = workbook.SheetNames
            .map((sheetName) => {
                const sheet =
                    workbook.Sheets[sheetName];

                return `
SHEET: ${sheetName}

${XLSX.utils.sheet_to_csv(sheet)}
                `;
            })
            .join("\n");

        if (!spreadsheetText.trim()) {
            throw new Error(
                "No readable data was found in the spreadsheet"
            );
        }

        return await extractFieldReportFromSpreadsheet(
            spreadsheetText
        );
    }

    throw new Error(
        `Unsupported file type: ${file.originalname}`
    );
};
const processDPR = async (req, res) => {
    const client = await pool.connect();

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "DPR file is required",
            });
        }

        const file = req.file;

        console.log(
            `Processing DPR: ${file.originalname}`
        );

        // =========================================================
        // STEP 1: EXTRACT DPR DATA USING GEMINI
        // =========================================================

        const extracted = await extractDPR(file);

        console.log(
            "AI EXTRACTED DATA:",
            extracted
        );

        if (!extracted.projectCode) {
            return res.status(400).json({
                success: false,
                message:
                    "Project code could not be extracted",
                extracted,
            });
        }

        if (!extracted.activityDescription) {
            return res.status(400).json({
                success: false,
                message:
                    "Activity description could not be extracted",
                extracted,
            });
        }

        // =========================================================
        // STEP 2: FIND PROJECT
        // =========================================================

        const projectResult = await pool.query(
            `SELECT
                id,
                project_code,
                name
             FROM projects
             WHERE project_code = $1
             LIMIT 1`,
            [extracted.projectCode]
        );

        if (projectResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
                projectCode:
                    extracted.projectCode,
                extracted,
            });
        }

        const project =
            projectResult.rows[0];

        // =========================================================
        // STEP 3: MATCH ACTIVITY TO L5/L6 SCHEDULE
        // =========================================================

        let matching = null

if (extracted.activityCode) {
    const exactActivityResult =
        await client.query(
            `
                SELECT
                    id,
                    activity_code,
                    name,
                    discipline
                FROM activities
                WHERE project_id = $1
                AND LOWER(TRIM(activity_code)) =
                    LOWER(TRIM($2))
                LIMIT 1
            `,
            [
                project.id,
                extracted.activityCode,
            ]
        )

    if (exactActivityResult.rows.length > 0) {
        const activity =
            exactActivityResult.rows[0]

        matching = {
            matched: true,
            confidence: 100,
            status: "AUTO_LINKED",
            activity: {
                id: activity.id,
                activity_code:
                    activity.activity_code,
                name: activity.name,
                discipline:
                    activity.discipline,
            },
            candidates: [
                {
                    id: activity.id,
                    activity_code:
                        activity.activity_code,
                    name: activity.name,
                    discipline:
                        activity.discipline,
                    confidence: 100,
                },
            ],
        }
    }
}

if (!matching) {
    matching = await matchActivity({
        projectId: project.id,
        discipline: extracted.discipline,
        description:
            extracted.activityDescription,
        activityCode:
            extracted.activityCode,
    })
}

console.log(
    "EXTRACTED ACTIVITY CODE:",
    extracted.activityCode
)

console.log(
    "AI MATCHING RESULT:",
    matching
)

        let activityId = null;

        if (
            matching.status === "AUTO_LINKED" &&
            matching.activity
        ) {
            activityId =
                matching.activity.id;
        }

        // =========================================================
        // STEP 4: GENERATE REPORT CODE
        // =========================================================

        const reportCode =
            `FR-AI-${Date.now()}`;

        // =========================================================
        // STEP 5: START TRANSACTION
        // =========================================================

        await client.query("BEGIN");

        // =========================================================
        // STEP 6: SAVE FIELD REPORT
        // =========================================================

        const sourceType =
            file.mimetype.startsWith("image/")
                ? "IMAGE_AI"
                : file.mimetype ===
                  "application/pdf"
                ? "PDF_AI"
                : "SPREADSHEET_AI";

        const reportResult =
            await client.query(
                `INSERT INTO field_reports (
                    report_code,
                    project_id,
                    activity_id,
                    report_date,
                    description,
                    reported_progress,
                    status,
                    discipline,
                    match_confidence,
                    matching_status,
                    source_type
                )
                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, $10, $11
                )
                RETURNING *`,
                [
                    reportCode,
                    project.id,
                    activityId,
                    extracted.reportDate ||
                        null,
                    extracted.activityDescription,
                    extracted.reportedProgress ??
                        null,
                    extracted.status ||
                        "REPORTED",
                    extracted.discipline ||
                        null,
                    matching.confidence ??
                        0,
                    matching.status,
                    sourceType,
                ]
            );

        const savedReport =
            reportResult.rows[0];

        // =========================================================
        // STEP 7: AUTO-LINKED ACTIVITY UPDATE
        // =========================================================

        let updatedActivity = null;
        let auditLog = null;

        if (
            matching.status === "AUTO_LINKED" &&
            matching.activity
        ) {
            const activityResult =
                await client.query(
                    `SELECT
                        id,
                        activity_code,
                        name,
                        actual_progress,
                        actual_start,
                        actual_finish,
                        status
                     FROM activities
                     WHERE id = $1
                     FOR UPDATE`,
                    [matching.activity.id]
                );

            if (
                activityResult.rows.length > 0
            ) {
                const previousActivity =
                    activityResult.rows[0];

                const previousProgress = Number(
    previousActivity.actual_progress || 0
);

const previousStatus =
    previousActivity.status;

const reportedProgress =
    extracted.reportedProgress !== null &&
    extracted.reportedProgress !== undefined
        ? Number(extracted.reportedProgress)
        : null;

const newProgress =
    reportedProgress !== null
        ? Math.min(
            100,
            previousProgress + reportedProgress
        )
        : previousProgress;

                let newStatus =
                    extracted.status ||
                    previousStatus ||
                    "IN_PROGRESS";

                const normalizedStatus =
                    String(newStatus)
                        .toUpperCase()
                        .replace(
                            /[\s-]+/g,
                            "_"
                        );

                if (
                    normalizedStatus ===
                        "COMPLETED" ||
                    newProgress >= 100
                ) {
                    newStatus = "COMPLETED";
                } else if (
                    normalizedStatus ===
                    "NOT_STARTED"
                ) {
                    newStatus =
                        "NOT_STARTED";
                } else {
                    newStatus =
                        "IN_PROGRESS";
                }

                const activityUpdate =
                    await client.query(
                        `UPDATE activities
                         SET
                            actual_progress = $1,
                            actual_start = COALESCE(
                                actual_start,
                                $2
                            ),
                            actual_finish = CASE
                                WHEN $3 = 'COMPLETED'
                                THEN COALESCE(
                                    $4,
                                    actual_finish
                                )
                                ELSE actual_finish
                            END,
                            status = $3,
                            updated_at = NOW()
                         WHERE id = $5
                         RETURNING *`,
                        [
                            newProgress,
                            extracted.reportDate ||
                                null,
                            newStatus,
                            extracted.reportDate ||
                                null,
                            previousActivity.id,
                        ]
                    );

                updatedActivity =
                    activityUpdate.rows[0];

                // =================================================
                // STEP 8: AUDIT LOG
                // =================================================

                const auditResult =
                    await client.query(
                        `INSERT INTO audit_logs (
                            field_report_id,
                            activity_id,
                            action,
                            performed_by,
                            performed_at,
                            previous_activity_id,
                            new_activity_id,
                            previous_progress,
                            new_progress,
                            previous_status,
                            new_status,
                            metadata
                        )
                        VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            NOW(),
                            $5,
                            $6,
                            $7,
                            $8,
                            $9,
                            $10,
                            $11
                        )
                        RETURNING *`,
                        [
                            savedReport.id,
                            previousActivity.id,
                            "AUTO_LINKED",
                            "AI_MATCHER",
                            previousActivity.id,
                            previousActivity.id,
                            previousProgress,
                            newProgress,
                            previousStatus,
                            newStatus,
                            JSON.stringify({
                                source_type:
                                    sourceType,
                                filename:
                                    file.originalname,
                                match_confidence:
                                    matching.confidence,
                                extracted,
                                activity_code:
                                    previousActivity.activity_code,
                            }),
                        ]
                    );

                auditLog =
                    auditResult.rows[0];
            }
        }

        // =========================================================
        // STEP 9: COMMIT
        // =========================================================

        await client.query("COMMIT");

        console.log(
            `AI DPR saved: ${reportCode} | ${matching.status}`
        );

        if (updatedActivity) {
            console.log(
                `Activity updated: ${updatedActivity.activity_code}`
            );
        }

        // =========================================================
        // STEP 10: RETURN COMPLETE RESULT
        // =========================================================

        return res.json({
            success: true,

            sourceType,

            filename:
                file.originalname,

            project: {
                id: project.id,
                projectCode:
                    project.project_code,
                name: project.name,
            },

            report: {
                id: savedReport.id,
                reportCode:
                    savedReport.report_code,
                matchingStatus:
                    savedReport.matching_status,
                matchConfidence:
                    savedReport.match_confidence,
                sourceType:
                    savedReport.source_type,
            },

            extracted,

            matching,

            activity: updatedActivity
                ? {
                      id:
                          updatedActivity.id,
                      activityCode:
                          updatedActivity.activity_code,
                      name:
                          updatedActivity.name,
                      actualProgress:
                          updatedActivity.actual_progress,
                      actualStart:
                          updatedActivity.actual_start,
                      actualFinish:
                          updatedActivity.actual_finish,
                      status:
                          updatedActivity.status,
                  }
                : null,

            audit: auditLog
                ? {
                      id: auditLog.id,
                      action:
                          auditLog.action,
                      performedBy:
                          auditLog.performed_by,
                  }
                : null,
        });
    } catch (error) {
        try {
            await client.query(
                "ROLLBACK"
            );
        } catch (
            rollbackError
        ) {
            console.error(
                "Rollback failed:",
                rollbackError
            );
        }

        console.error(
            "DPR ingestion error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to process DPR",
            error: error.message,
        });
    } finally {
        client.release();
    }
};

// =============================================================
// EXISTING IMAGE ENDPOINT
// =============================================================

router.post(
    "/image",
    upload.single("file"),
    processDPR
);

// =============================================================
// NEW MULTI-FORMAT DPR ENDPOINT
// =============================================================

router.post(
    "/dpr",
    upload.single("file"),
    processDPR
);

// =============================================================
// MULTER / UPLOAD ERRORS
// =============================================================

router.use(
    (error, req, res, next) => {
        console.error(
            "Ingestion error:",
            error
        );

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Invalid upload",
        });
    }
);

export default router;