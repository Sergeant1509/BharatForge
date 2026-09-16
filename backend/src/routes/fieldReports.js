import express from "express";
import pool from "../config/db.js";
import { matchActivity } from "../services/activityMatcher.js";

const router = express.Router();


// =====================================================
// GET ALL FIELD REPORTS
// =====================================================
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

            ORDER BY fr.report_date DESC, fr.id DESC;
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
            message: "Failed to fetch field reports"
        });
    }
});


// =====================================================
// GET SINGLE FIELD REPORT
// =====================================================
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
            message: "Failed to fetch field report"
        });
    }
});


// =====================================================
// CREATE FIELD REPORT + AUTOMATIC ACTIVITY MATCHING
// =====================================================
router.post("/", async (req, res) => {
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


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!report_code || !project_id || !report_date) {
            return res.status(400).json({
                success: false,
                message: "report_code, project_id and report_date are required"
            });
        }


        if (
            reported_progress !== undefined &&
            reported_progress !== null &&
            (reported_progress < 0 || reported_progress > 100)
        ) {
            return res.status(400).json({
                success: false,
                message: "reported_progress must be between 0 and 100"
            });
        }


        // -------------------------------------------------
        // ACTIVITY MATCHING
        // -------------------------------------------------

        let matchedActivityId = activity_id || null;
        let matchConfidence = null;
        let matchingStatus = "UNMATCHED";


        // Automatically match when activity_id
        // was not manually provided
        if (!activity_id && description) {

            const matchResult = await matchActivity({
                projectId: project_id,
                discipline,
                description
            });


            matchConfidence = matchResult.confidence;
            matchingStatus = matchResult.status;


            // Automatically link only high-confidence matches
            if (
                matchResult.status === "AUTO_LINKED" &&
                matchResult.activity
            ) {
                matchedActivityId = matchResult.activity.id;
            }
        }


        // Manual activity selection
        else if (activity_id) {

            matchingStatus = "MANUALLY_LINKED";
            matchConfidence = 100;
        }


        // -------------------------------------------------
        // SAVE FIELD REPORT
        // -------------------------------------------------

        const result = await pool.query(`
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
        `, [
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
        ]);


        // -------------------------------------------------
        // RESPONSE
        // -------------------------------------------------

        res.status(201).json({
            success: true,
            message: "Field report created successfully",
            data: result.rows[0]
        });


    } catch (error) {

        console.error("Create field report error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create field report",
            error: error.message
        });
    }
});


// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;