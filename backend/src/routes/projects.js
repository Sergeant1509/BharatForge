import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/*
    GET all projects
    GET /api/projects
*/
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *
            FROM projects
            ORDER BY id;
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Error fetching projects:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
            error: error.message
        });
    }
});


/*
    CREATE project
    POST /api/projects

    Expected body:
    {
        "project_code": "OIL-002",
        "name": "New Processing Plant",
        "location": "Duliajan",
        "status": "ACTIVE",
        "planned_progress": 0,
        "actual_progress": 0
    }
*/
router.post("/", async (req, res) => {
    try {
        const {
            project_code,
            name,
            location,
            status = "ACTIVE",
            planned_progress = 0,
            actual_progress = 0,
            start_date = null,
            planned_end_date = null
        } = req.body;


        // Validate required fields
        if (!project_code || !name || !location) {
            return res.status(400).json({
                success: false,
                message: "project_code, name and location are required"
            });
        }


        // Check duplicate project code
        const existingProject = await pool.query(
            `
            SELECT id
            FROM projects
            WHERE project_code = $1
            `,
            [project_code]
        );


        if (existingProject.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "A project with this project code already exists"
            });
        }


        // Insert project into PostgreSQL / Supabase
        const result = await pool.query(
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
                $4,
                $5,
                $6,
                $7,
                $8
            )
            RETURNING *;
            `,
            [
                project_code,
                name,
                location,
                status,
                planned_progress,
                actual_progress,
                start_date,
                planned_end_date
            ]
        );


        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error creating project:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create project",
            error: error.message
        });
    }
});


/*
    GET project by ID
    GET /api/projects/:id
*/
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT *
            FROM projects
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Error fetching project:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch project",
            error: error.message
        });
    }
});


export default router;