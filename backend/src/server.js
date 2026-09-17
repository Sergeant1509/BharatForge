import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import projectsRouter from "./routes/projects.js";
import fieldReportsRouter from "./routes/fieldReports.js";
import matchingRouter from "./routes/matching.js";
import verificationRouter from "./routes/verification.js";
import analyticsRouter from "./routes/analytics.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "BharatForge API is running",
        endpoints: {
            health: "/api/health",
            projects: "/api/projects",
            activities: "/api/activities",
            fieldReports: "/api/field-reports"
        }
    });
});

app.use("/api/projects", projectsRouter);
app.use("/api/field-reports", fieldReportsRouter);
app.use("/api/matching", matchingRouter);
app.use("/api/verification", verificationRouter);
app.use("/api/analytics", analyticsRouter);

// Root
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BharatForge API is running"
    });
});


// Database health check
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() AS time");

        res.json({
            success: true,
            server: "online",
            database: "connected",
            time: result.rows[0].time
        });

    } catch (error) {
        console.error("Database connection error:", error);

        res.status(500).json({
            success: false,
            server: "online",
            database: "disconnected",
            error: error.message
        });
    }
});


// Get activities
app.get("/api/activities", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a.activity_code,
                a.name,
                a.description,
                a.planned_progress,
                a.actual_progress,
                a.risk_level,
                a.status,
                a.planned_start,
                a.planned_finish,
                a.forecast_finish,
                a.potential_delay_days,
                p.project_code,
                p.name AS project_name
            FROM activities a
            JOIN projects p
                ON a.project_id = p.id
            ORDER BY a.id;
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Activities error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch activities"
        });
    }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
========================================
       BharatForge Backend
========================================
Server: http://localhost:${PORT}
API:    http://localhost:${PORT}/api
========================================
    `);
});