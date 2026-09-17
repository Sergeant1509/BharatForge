import express from "express";
import pool from "../config/db.js";
import { matchActivity } from "../services/activityMatcher.js";

const router = express.Router();


/*
GET /api/field-reports

Returns all field reports with:
- Project information
- Linked activity information
- Matching information
- Verification information
*/

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                fr.id,
                fr.report_code,
                fr.project_id,
                fr.activity_id,
                fr.report_date,
                fr.location,
                fr.description,
                fr.reported_progress,
                fr.status,
                fr.discipline,
                fr.match_confidence,
                fr.matching_status,
                fr.source_type,
                fr.verified_at,
                fr.verified_by,
                fr.created_at,
                fr.updated_at,

                p.project_code,
                p.name AS project_name,

                a.activity_code,
                a.name AS activity_name

            FROM field_reports fr

            JOIN projects p
                ON fr.project_id = p.id

            LEFT JOIN activities a
                ON fr.activity_id = a.id

            ORDER BY
                fr.report_date DESC,
                fr.id DESC;
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Field reports error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch field reports",
            error: error.message
        });
    }
});


/*
GET /api/field-reports/:id

Returns a single field report.
*/

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT
                fr.id,
                fr.report_code,
                fr.project_id,
                fr.activity_id,
                fr.report_date,
                fr.location,
                fr.description,
                fr.reported_progress,
                fr.status,
                fr.discipline,
                fr.match_confidence,
                fr.matching_status,
                fr.source_type,
                fr.verified_at,
                fr.verified_by,
                fr.created_at,
                fr.updated_at,

                p.project_code,
                p.name AS project_name,

                a.activity_code,
                a.name AS activity_name

            FROM field_reports fr

            JOIN projects p
                ON fr.project_id = p.id

            LEFT JOIN activities a
                ON fr.activity_id = a.id

            WHERE fr.id = $1;
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Field report not found"
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Field report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch field report",
            error: error.message
        });
    }
});


/*
POST /api/field-reports

Creates a field report.

Matching flow:

1. Manual activity_id supplied
      -> MANUALLY_LINKED

2. No activity_id + description
      -> AI Activity Matcher

3. Confidence >= 80
      -> AUTO_LINKED
      -> Update Activity
      -> Create Audit Log

4. Confidence 50-79
      -> REQUIRES_REVIEW

5. Confidence < 50
      -> UNMATCHED
*/

router.post("/", async (req, res) => {

    const client = await pool.connect();

    try {
        const {
            report_code,
            project_id,
            activity_id,
            report_date,
            location,
            description,
            reported_progress,
            status,
            discipline,
            source_type
        } = req.body;


        /*
        Validate required fields.
        */

        if (!report_code || !project_id || !report_date) {
            return res.status(400).json({
                success: false,
                message:
                    "report_code, project_id and report_date are required"
            });
        }


        /*
        Validate progress.
        */

        if (
            reported_progress !== undefined &&
            reported_progress !== null &&
            (reported_progress < 0 || reported_progress > 100)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "reported_progress must be between 0 and 100"
            });
        }


        /*
        Start transaction.

        For AUTO_LINKED reports:
        field report + activity update + audit
        will all be committed together.
        */

        await client.query("BEGIN");


        /*
        Variables for matching.
        */

        let matchedActivityId = activity_id || null;
        let matchConfidence = null;
        let matchingStatus = "UNMATCHED";

        let matchResult = null;


        /*
        MANUAL ACTIVITY LINK
        */

        if (activity_id) {

            /*
            Make sure manually selected activity
            belongs to the same project.
            */

            const activityCheck = await client.query(
                `
                SELECT
                    id,
                    activity_code,
                    name,
                    discipline,
                    actual_progress,
                    actual_start,
                    actual_finish,
                    status
                FROM activities
                WHERE id = $1
                AND project_id = $2
                FOR UPDATE
                `,
                [activity_id, project_id]
            );

            if (activityCheck.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message:
                        "Selected activity does not belong to this project"
                });
            }

            matchingStatus = "MANUALLY_LINKED";
            matchConfidence = 100;
        }


        /*
        AI ACTIVITY MATCHING
        */

        else if (description) {

            matchResult = await matchActivity({
                projectId: project_id,
                discipline,
                description
            });

            matchConfidence = matchResult.confidence;
            matchingStatus = matchResult.status;

            if (
                matchResult.status === "AUTO_LINKED" &&
                matchResult.activity
            ) {
                matchedActivityId = matchResult.activity.id;
            }
        }


        /*
        Create the field report.
        */

        const reportResult = await client.query(
            `
            INSERT INTO field_reports
            (
                report_code,
                project_id,
                activity_id,
                report_date,
                location,
                description,
                reported_progress,
                status,
                discipline,
                match_confidence,
                matching_status,
                source_type
            )
            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10,
                $11,
                $12
            )
            RETURNING *;
            `,
            [
                report_code,
                project_id,
                matchedActivityId,
                report_date,
                location || null,
                description || null,
                reported_progress ?? null,
                status || "PENDING",
                discipline || null,
                matchConfidence,
                matchingStatus,
                source_type || "MANUAL"
            ]
        );

        const report = reportResult.rows[0];


        /*
        AUTO-LINKED REPORT
        ------------------

        If AI confidence is >= 80%,
        update the linked activity automatically.
        */

        if (
            matchingStatus === "AUTO_LINKED" &&
            matchedActivityId
        ) {

            /*
            Lock the activity row.
            */

            const activityResult = await client.query(
                `
                SELECT
                    id,
                    activity_code,
                    name,
                    actual_progress,
                    actual_start,
                    actual_finish,
                    status
                FROM activities
                WHERE id = $1
                AND project_id = $2
                FOR UPDATE
                `,
                [matchedActivityId, project_id]
            );


            if (activityResult.rows.length === 0) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message:
                        "Matched activity could not be found"
                });
            }


            const activity = activityResult.rows[0];


            /*
            Store previous values for audit.
            */

            const previousProgress =
                activity.actual_progress;

            const previousStatus =
                activity.status;


            /*
            Find the latest VERIFIED or
            AUTO_LINKED progress report.

            This prevents an older report from
            overwriting newer progress.
            */

            const latestProgressResult = await client.query(
                `
                SELECT
                    id,
                    reported_progress,
                    report_date,
                    matching_status
                FROM field_reports
                WHERE activity_id = $1
                AND matching_status IN (
                    'VERIFIED',
                    'AUTO_LINKED'
                )
                AND reported_progress IS NOT NULL
                ORDER BY
                    report_date DESC,
                    id DESC
                LIMIT 1
                `,
                [matchedActivityId]
            );


            let newActualProgress =
                activity.actual_progress;

            let newActualStart =
                activity.actual_start;

            let newActualFinish =
                activity.actual_finish;

            let newStatus =
                activity.status;


            /*
            Apply latest progress.
            */

            if (latestProgressResult.rows.length > 0) {

                const latestReport =
                    latestProgressResult.rows[0];


                newActualProgress =
                    latestReport.reported_progress;


                /*
                First execution report becomes
                the actual start date.
                */

                if (!newActualStart) {
                    newActualStart =
                        latestReport.report_date;
                }


                /*
                100% means actual completion.
                */

                if (
                    Number(newActualProgress) >= 100 &&
                    !newActualFinish
                ) {
                    newActualFinish =
                        latestReport.report_date;
                }


                /*
                Update activity status.
                */

                if (
                    Number(newActualProgress) >= 100
                ) {
                    newStatus = "COMPLETED";

                } else if (
                    Number(newActualProgress) > 0
                ) {
                    newStatus = "IN_PROGRESS";
                }
            }


            /*
            Update activity.
            */

            const updateActivity =
                await client.query(
                    `
                    UPDATE activities
                    SET
                        actual_progress = $1,
                        actual_start = $2,
                        actual_finish = $3,
                        status = $4,
                        updated_at = NOW()
                    WHERE id = $5
                    RETURNING *;
                    `,
                    [
                        newActualProgress,
                        newActualStart,
                        newActualFinish,
                        newStatus,
                        matchedActivityId
                    ]
                );


            /*
            Create audit log.

            AUTO_LINKED is recorded separately
            from planner verification.
            */

            await client.query(
                `
                INSERT INTO audit_logs
                (
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
                VALUES
                (
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
                );
                `,
                [
                    report.id,
                    matchedActivityId,
                    "AUTO_LINKED",
                    "AI_MATCHER",

                    activity.id,
                    matchedActivityId,

                    previousProgress,
                    newActualProgress,

                    previousStatus,
                    newStatus,

                    JSON.stringify({
                        report_code:
                            report.report_code,

                        report_date:
                            report.report_date,

                        reported_progress:
                            report.reported_progress,

                        match_confidence:
                            matchConfidence,

                        discipline:
                            report.discipline,

                        source_type:
                            report.source_type,

                        activity_code:
                            activity.activity_code,

                        activity_name:
                            activity.name
                    })
                ]
            );


            /*
            Commit:
            field report + activity + audit.
            */

            await client.query("COMMIT");


            return res.status(201).json({
                success: true,
                message:
                    "Field report created, automatically linked, activity updated and audit logged successfully",

                data: {
                    field_report: report,
                    activity: updateActivity.rows[0],
                    matching: matchResult
                }
            });
        }


        /*
        MANUALLY LINKED REPORT
        ----------------------

        A manually linked report is stored,
        but the planner-controlled verification
        workflow remains responsible for official
        activity execution updates.
        */

        await client.query("COMMIT");


        res.status(201).json({
            success: true,
            message:
                "Field report created successfully",
            data: report
        });


    } catch (error) {

        /*
        Roll back the entire transaction if
        anything fails.
        */

        try {
            await client.query("ROLLBACK");
        } catch (rollbackError) {
            console.error(
                "Rollback error:",
                rollbackError
            );
        }


        console.error(
            "Create field report error:",
            error
        );


        res.status(500).json({
            success: false,
            message:
                "Failed to create field report",
            error: error.message
        });

    } finally {

        client.release();

    }
});


export default router;