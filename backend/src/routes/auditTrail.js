import express from "express"
import pool from "../config/db.js"

const router = express.Router()


/*
============================================================
GET AUDIT TRAIL
============================================================
*/

router.get("/", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                al.id,
                al.field_report_id,
                al.activity_id,
                al.action,
                al.performed_by,
                al.performed_at,
                al.previous_activity_id,
                al.new_activity_id,
                al.previous_progress,
                al.new_progress,
                al.previous_status,
                al.new_status,
                al.metadata,

                fr.report_code,
                fr.report_date,
                fr.description AS report_description,
                fr.reported_progress,
                fr.match_confidence,
                fr.matching_status,
                fr.source_type,

                a.activity_code,
                a.name AS activity_name,
                a.discipline,

                p.project_code,
                p.name AS project_name

            FROM audit_logs al

            LEFT JOIN field_reports fr
                ON al.field_report_id = fr.id

            LEFT JOIN activities a
                ON al.activity_id = a.id

            LEFT JOIN projects p
                ON a.project_id = p.id

            ORDER BY
                al.performed_at DESC,
                al.id DESC;
        `)


        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        })

    } catch (error) {

        console.error(
            "Audit trail error:",
            error
        )

        res.status(500).json({
            success: false,
            message: "Failed to fetch audit trail",
            error: error.message
        })

    }

})


/*
============================================================
EXPORT ROUTER
============================================================
*/

export default router