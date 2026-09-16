import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all field reports
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


// GET single field report
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


// CREATE field report
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
            status
        } = req.body;

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
                status
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING *;
        `, [
            report_code,
            project_id,
            activity_id || null,
            report_date,
            location || null,
            description || null,
            reported_progress ?? null,
            status || "PENDING"
        ]);

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


// Export router
export default router;