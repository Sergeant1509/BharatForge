import express from "express";
import { matchActivity } from "../services/activityMatcher.js";

const router = express.Router();

// POST /api/matching/match
router.post("/match", async (req, res) => {
    try {
        const {
            projectId,
            discipline,
            description
        } = req.body;

        if (!projectId || !description) {
            return res.status(400).json({
                success: false,
                message: "projectId and description are required"
            });
        }

        const result = await matchActivity({
            projectId,
            discipline,
            description
        });

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("Activity matching error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to match activity",
            error: error.message
        });
    }
});

export default router;