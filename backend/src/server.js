import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";

import projectsRouter from "./routes/projects.js";
import fieldReportsRouter from "./routes/fieldReports.js";
import matchingRouter from "./routes/matching.js";
import verificationRouter from "./routes/verification.js";
import analyticsRouter from "./routes/analytics.js";
import auditTrailRouter from "./routes/auditTrail.js";
import authRouter from "./routes/auth.js";
import ingestionRouter from "./routes/ingestion.js";
import scheduleIngestionRouter from "./routes/scheduleIngestion.js";

import cookieParser from "cookie-parser";

dotenv.config();

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());


// ========================================
// API INFORMATION
// ========================================

app.get("/api", (req, res) => {
    res.json({
        success: true,
        message: "BharatForge API is running",
        endpoints: {
            health: "/api/health",
            projects: "/api/projects",
            activities: "/api/activities",
            fieldReports: "/api/field-reports",
            matching: "/api/matching",
            verification: "/api/verification",
            analytics: "/api/analytics",
            ingestion: "/api/ingestion",
            schedule: "/api/ingestion/schedule",
        },
    });
});


// ========================================
// ROUTES
// ========================================

app.use("/api/auth", authRouter);

app.use("/api/ingestion", ingestionRouter);

/*
 * P6 Schedule Ingestion
 *
 * Dashboard calls:
 * POST /api/ingestion/schedule
 *
 * Therefore the router is mounted at:
 * /api/ingestion
 *
 * and scheduleIngestion.js should contain:
 * router.post("/schedule", ...)
 */
app.use("/api/ingestion", scheduleIngestionRouter);

app.use("/api/projects", projectsRouter);

app.use("/api/field-reports", fieldReportsRouter);

app.use("/api/matching", matchingRouter);

app.use("/api/verification", verificationRouter);

app.use("/api/analytics", analyticsRouter);

app.use("/api/audit-trail", auditTrailRouter);


// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "BharatForge API is running",
    });
});


// ========================================
// DATABASE HEALTH CHECK
// ========================================

app.get("/api/health", async (req, res) => {
    try {

        const result = await pool.query(
            "SELECT NOW() AS time"
        );

        res.json({
            success: true,
            server: "online",
            database: "connected",
            time: result.rows[0].time,
        });

    } catch (error) {

        console.error(
            "Database connection error:",
            error
        );

        res.status(500).json({
            success: false,
            server: "online",
            database: "disconnected",
            error: error.message,
        });
    }
});


// ========================================
// GET ACTIVITIES
// ========================================

app.get("/api/activities", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                a.id,
                a.activity_code,
                a.project_id,
                a.name,
                a.description,
                a.discipline,
                a.planned_progress,
                a.actual_progress,
                a.risk_level,
                a.status,
                a.planned_start,
                a.planned_finish,
                a.actual_start,
                a.actual_finish,
                a.forecast_finish,
                a.potential_delay_days,
                p.project_code,
                p.name AS project_name

            FROM activities a

            LEFT JOIN projects p
                ON a.project_id = p.id

            ORDER BY a.id ASC;
        `);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
        });

    } catch (error) {

        console.error(
            "Activities error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch activities",
            error: error.message,
        });
    }
});


// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });

});


// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((error, req, res, next) => {

    console.error(
        "Unhandled server error:",
        error
    );

    res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
    });

});


// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`
========================================
       BharatForge Backend
========================================
Server: http://localhost:${PORT}
API:    http://localhost:${PORT}/api
Schedule: POST /api/ingestion/schedule
========================================
    `);

});