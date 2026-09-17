import express from "express";
import pool from "../config/db.js";
import { matchActivity } from "../services/activityMatcher.js";

const router = express.Router();


/*
========================================================
GET /api/verification

Returns field reports that need planner verification.
========================================================
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
                a.name AS activity_name,
                a.description AS activity_description

            FROM field_reports fr

            JOIN projects p
                ON fr.project_id = p.id

            LEFT JOIN activities a
                ON fr.activity_id = a.id

            WHERE fr.matching_status IN (
                'REQUIRES_REVIEW',
                'UNMATCHED'
            )

            ORDER BY
                fr.report_date DESC,
                fr.id DESC;
        `);

        const reportsWithCandidates = await Promise.all(
            result.rows.map(async (report) => {
                let candidates = [];

                if (report.description) {
                    const matchResult = await matchActivity({
                        projectId: report.project_id,
                        discipline: report.discipline,
                        description: report.description
                    });

                    candidates = matchResult.candidates || [];
                }

                return {
                    ...report,
                    candidates
                };
            })
        );

        res.json({
            success: true,
            count: reportsWithCandidates.length,
            data: reportsWithCandidates
        });

    } catch (error) {
        console.error("Verification fetch error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch verification records",
            error: error.message
        });
    }
});


/*
========================================================
PUT /api/verification/:id

Planner verifies a field report and selects
the correct activity.

Supported actions:
APPROVE
CHANGE_MATCH
REJECT

Optional:
reported_progress

All database changes happen inside one transaction.
========================================================
*/

router.put("/:id", async (req, res) => {

    const client = await pool.connect();

    try {

        const { id } = req.params;

        const {
            activity_id,
            action,
            verified_by,
            reported_progress
        } = req.body;


        /*
        ------------------------------------------------
        Validate action
        ------------------------------------------------
        */

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "action is required"
            });
        }

        const allowedActions = [
            "APPROVE",
            "CHANGE_MATCH",
            "REJECT"
        ];

        if (!allowedActions.includes(action)) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid action. Use APPROVE, CHANGE_MATCH or REJECT"
            });
        }


        /*
        ------------------------------------------------
        Validate progress if supplied
        ------------------------------------------------
        */

        let updatedProgress = null;

        if (
            reported_progress !== undefined &&
            reported_progress !== null &&
            reported_progress !== ""
        ) {

            updatedProgress = Number(reported_progress);

            if (
                Number.isNaN(updatedProgress) ||
                updatedProgress < 0 ||
                updatedProgress > 100
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "reported_progress must be a number between 0 and 100"
                });
            }
        }


        /*
        ------------------------------------------------
        APPROVE / CHANGE_MATCH require activity
        ------------------------------------------------
        */

        if (
            (action === "APPROVE" ||
                action === "CHANGE_MATCH") &&
            !activity_id
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "activity_id is required for this action"
            });
        }


        /*
        ------------------------------------------------
        Start PostgreSQL transaction
        ------------------------------------------------
        */

        await client.query("BEGIN");


        /*
        ------------------------------------------------
        Get field report and lock it
        ------------------------------------------------
        */

        const reportResult = await client.query(
            `
                SELECT *
                FROM field_reports
                WHERE id = $1
                FOR UPDATE
            `,
            [id]
        );

        if (reportResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                success: false,
                message: "Field report not found"
            });
        }

        const report = reportResult.rows[0];


        /*
        ------------------------------------------------
        Prevent duplicate verification
        ------------------------------------------------
        */

        if (
            report.matching_status === "VERIFIED" ||
            report.matching_status === "REJECTED"
        ) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message:
                    `Report is already ${report.matching_status}`
            });
        }


        /*
        ------------------------------------------------
        Validate selected activity belongs
        to the same project
        ------------------------------------------------
        */

        let selectedActivity = null;

        if (
            (action === "APPROVE" ||
                action === "CHANGE_MATCH") &&
            activity_id
        ) {

            const activityResult = await client.query(
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
                [
                    activity_id,
                    report.project_id
                ]
            );

            if (activityResult.rows.length === 0) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    success: false,
                    message:
                        "Selected activity does not belong to this project"
                });
            }

            selectedActivity =
                activityResult.rows[0];
        }


        /*
        ------------------------------------------------
        Previous values for audit
        ------------------------------------------------
        */

        const previousActivityId =
            report.activity_id;

        const previousReportProgress =
            report.reported_progress;


        /*
        =================================================
        REJECT
        =================================================
        */

        if (action === "REJECT") {

            const updateReport =
                await client.query(
                    `
                        UPDATE field_reports
                        SET
                            activity_id = NULL,
                            match_confidence = 0,
                            matching_status = 'REJECTED',
                            verified_at = NOW(),
                            verified_by = $1,
                            updated_at = NOW()
                        WHERE id = $2
                        RETURNING *;
                    `,
                    [
                        verified_by || "PLANNER",
                        id
                    ]
                );


            /*
            ------------------------------------------------
            Audit rejection
            ------------------------------------------------
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
                        NULL,
                        $2,
                        $3,
                        NOW(),
                        $4,
                        NULL,
                        $5,
                        NULL,
                        $6,
                        'REJECTED',
                        $7
                    );
                `,
                [
                    report.id,
                    "REJECT",
                    verified_by || "PLANNER",
                    previousActivityId,
                    previousReportProgress,
                    report.matching_status,
                    JSON.stringify({
                        report_code:
                            report.report_code,
                        report_date:
                            report.report_date,
                        reported_progress:
                            report.reported_progress,
                        previous_confidence:
                            report.match_confidence,
                        source_type:
                            report.source_type
                    })
                ]
            );


            await client.query("COMMIT");

            return res.json({
                success: true,
                message:
                    "Field report rejected successfully",
                data: {
                    field_report:
                        updateReport.rows[0]
                }
            });
        }


        /*
        =================================================
        APPROVE / CHANGE_MATCH
        =================================================
        */

        const newActivityId =
            Number(activity_id);


        /*
        ------------------------------------------------
        Confidence
        ------------------------------------------------
        */

        let newConfidence =
            report.match_confidence;

        if (action === "CHANGE_MATCH") {
            newConfidence = 100;
        }


        /*
        ------------------------------------------------
        If planner edited progress, update the
        field report FIRST.
        ------------------------------------------------
        */

        if (updatedProgress !== null) {

            await client.query(
                `
                    UPDATE field_reports
                    SET
                        reported_progress = $1,
                        updated_at = NOW()
                    WHERE id = $2;
                `,
                [
                    updatedProgress,
                    id
                ]
            );
        }


        /*
        ------------------------------------------------
        Update field report verification state
        ------------------------------------------------
        */

        const updateReport =
            await client.query(
                `
                    UPDATE field_reports
                    SET
                        activity_id = $1,
                        match_confidence = $2,
                        matching_status = 'VERIFIED',
                        verified_at = NOW(),
                        verified_by = $3,
                        updated_at = NOW()
                    WHERE id = $4
                    RETURNING *;
                `,
                [
                    newActivityId,
                    newConfidence,
                    verified_by || "PLANNER",
                    id
                ]
            );


        /*
        ------------------------------------------------
        Find latest verified progress
        ------------------------------------------------

        Because the current report has just been updated
        to VERIFIED, its edited progress is included.
        ------------------------------------------------
        */

        const latestProgressResult =
            await client.query(
                `
                    SELECT
                        id,
                        reported_progress,
                        report_date
                    FROM field_reports
                    WHERE activity_id = $1
                    AND matching_status = 'VERIFIED'
                    AND reported_progress IS NOT NULL
                    ORDER BY
                        report_date DESC,
                        id DESC
                    LIMIT 1
                `,
                [newActivityId]
            );


        /*
        ------------------------------------------------
        Get current activity state
        ------------------------------------------------
        */

        const activityResult =
            await client.query(
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
                    FOR UPDATE
                `,
                [newActivityId]
            );


        if (activityResult.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                success: false,
                message: "Activity not found"
            });
        }

        const activity =
            activityResult.rows[0];


        /*
        ------------------------------------------------
        Previous activity values
        ------------------------------------------------
        */

        const previousProgress =
            activity.actual_progress;

        const previousStatus =
            activity.status;


        /*
        ------------------------------------------------
        Start with current activity values
        ------------------------------------------------
        */

        let newActualProgress =
            activity.actual_progress;

        let newActualStart =
            activity.actual_start;

        let newActualFinish =
            activity.actual_finish;

        let newStatus =
            activity.status;


        /*
        ------------------------------------------------
        Apply latest verified field progress
        ------------------------------------------------
        */

        if (latestProgressResult.rows.length > 0) {

            const latestReport =
                latestProgressResult.rows[0];

            newActualProgress =
                latestReport.reported_progress;


            /*
            First verified progress report
            becomes actual start date.
            */

            if (!newActualStart) {
                newActualStart =
                    latestReport.report_date;
            }


            /*
            100% means activity finished.
            */

            if (
                Number(newActualProgress) >= 100 &&
                !newActualFinish
            ) {
                newActualFinish =
                    latestReport.report_date;
            }


            /*
            Calculate status.
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
        ------------------------------------------------
        Update activity execution state
        ------------------------------------------------
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
                    newActivityId
                ]
            );


        /*
        =================================================
        AUDIT LOG
        =================================================
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
                newActivityId,
                action,
                verified_by || "PLANNER",

                previousActivityId,
                newActivityId,

                previousProgress,
                newActualProgress,

                previousStatus,
                newStatus,

                JSON.stringify({
                    report_code:
                        report.report_code,

                    report_date:
                        report.report_date,

                    previous_reported_progress:
                        previousReportProgress,

                    updated_reported_progress:
                        updatedProgress !== null
                            ? updatedProgress
                            : previousReportProgress,

                    match_confidence:
                        newConfidence,

                    source_type:
                        report.source_type,

                    activity_code:
                        selectedActivity
                            ? selectedActivity.activity_code
                            : null,

                    activity_name:
                        selectedActivity
                            ? selectedActivity.name
                            : null
                })
            ]
        );


        /*
        ------------------------------------------------
        Commit everything together
        ------------------------------------------------
        */

        await client.query("COMMIT");


        res.json({
            success: true,
            message:
                "Verification, activity update and audit logging completed successfully",

            data: {
                field_report:
                    updateReport.rows[0],

                activity:
                    updateActivity.rows[0]
            }
        });


    } catch (error) {

        await client.query("ROLLBACK");

        console.error(
            "Verification update error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to verify field report",
            error: error.message
        });

    } finally {

        client.release();

    }
});


export default router;