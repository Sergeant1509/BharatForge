import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/*
    Calculate activity risk based on:
    - Progress variance
    - Potential delay
    - Current activity status
*/
function calculateRisk({
    plannedProgress,
    actualProgress,
    potentialDelayDays,
    status
}) {
    const planned = Number(plannedProgress || 0);
    const actual = Number(actualProgress || 0);
    const delay = Number(potentialDelayDays || 0);

    const variance = actual - planned;

    // Completed activities are not considered active execution risk.
    if (status === "COMPLETED" || actual >= 100) {
        return "LOW";
    }

    // Severe execution delay.
    if (delay >= 30 || variance <= -20) {
        return "HIGH";
    }

    // Moderate execution delay.
    if (delay >= 7 || variance <= -10) {
        return "MEDIUM";
    }

    // No significant execution risk.
    return "LOW";
}


/*
    GET /api/analytics/activity-risk

    Returns activity-level execution,
    progress variance, delay and risk information.
*/
router.get("/activity-risk", async (req, res) => {
    try {
        
        const { project_id } = req.query

        const result = await pool.query(
            `
            SELECT
                id,
                activity_code,
                project_id,
                name,
                description,
                discipline,
                planned_progress,
                actual_progress,
                planned_start,
                planned_finish,
                forecast_finish,
                potential_delay_days,
                status,
                risk_level,
                actual_start,
                actual_finish
            FROM activities
            ${
                project_id
                    ? "WHERE project_id = $1"
                    : ""
            }
            ORDER BY id ASC
            `,
            project_id ? [project_id] : []
        )

        const activities = result.rows.map((activity) => {
            const plannedProgress =
                Number(activity.planned_progress || 0);

            const actualProgress =
                Number(activity.actual_progress || 0);

            const progressVariance = Number(
                (actualProgress - plannedProgress).toFixed(2)
            );

            const calculatedRisk = calculateRisk({
                plannedProgress,
                actualProgress,
                potentialDelayDays: activity.potential_delay_days,
                status: activity.status
            });

            return {
                id: activity.id,

                activity_code: activity.activity_code,

                project_id: activity.project_id,

                name: activity.name,

                description: activity.description,

                discipline: activity.discipline,

                planned_progress: plannedProgress,

                actual_progress: actualProgress,

                progress_variance: progressVariance,

                planned_start: activity.planned_start,

                planned_finish: activity.planned_finish,

                actual_start: activity.actual_start,

                actual_finish: activity.actual_finish,

                forecast_finish: activity.forecast_finish,

                potential_delay_days:
                    Number(activity.potential_delay_days || 0),

                status: activity.status,

                // Risk calculated dynamically by the analytics engine.
                risk_level: calculatedRisk,

                // Risk currently stored in the database.
                stored_risk_level: activity.risk_level
            };
        });

        res.json({
            success: true,
            count: activities.length,
            data: activities
        });

    } catch (error) {
        console.error(
            "Activity risk analytics error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to calculate activity risk",
            error: error.message
        });
    }
});


/*
    GET /api/analytics/project-summary

    Returns project-level dashboard metrics.
*/
router.get("/project-summary", async (req, res) => {
    try {

        /*
            Fetch activity information.
        */
       const { project_id } = req.query

        const activityResult = await pool.query(
            `
            SELECT
                id,
                project_id,
                planned_progress,
                actual_progress,
                potential_delay_days,
                status,
                risk_level
            FROM activities
            ${
                project_id
                    ? "WHERE project_id = $1"
                    : ""
            }
            `,
            project_id ? [project_id] : []
        )


        /*
            Fetch field-report matching information.
        */
        const reportResult = await pool.query(
    `
    SELECT
        matching_status
    FROM field_reports
    ${
        project_id
            ? "WHERE project_id = $1"
            : ""
    }
    `,
    project_id ? [project_id] : []
)


        const activities = activityResult.rows;


        /*
            Activity metrics
        */

        const totalActivities =
            activities.length;


        const completedActivities =
            activities.filter(
                activity =>
                    activity.status === "COMPLETED"
            ).length;


        const inProgressActivities =
            activities.filter(
                activity =>
                    activity.status === "IN_PROGRESS"
            ).length;


        /*
            An activity is considered delayed if:
            - its status is DELAYED
            OR
            - it has positive potential delay days.
        */
        const delayedActivities =
            activities.filter(
                activity =>
                    activity.status === "DELAYED" ||
                    Number(
                        activity.potential_delay_days || 0
                    ) > 0
            ).length;


        /*
            Risk metrics
        */

        const highRiskActivities =
            activities.filter(
                activity =>
                    activity.risk_level === "HIGH"
            ).length;


        const mediumRiskActivities =
            activities.filter(
                activity =>
                    activity.risk_level === "MEDIUM"
            ).length;


        const lowRiskActivities =
            activities.filter(
                activity =>
                    activity.risk_level === "LOW"
            ).length;


        /*
            Progress metrics
        */

        const totalPlannedProgress =
            activities.reduce(
                (sum, activity) =>
                    sum +
                    Number(
                        activity.planned_progress || 0
                    ),
                0
            );


        const totalActualProgress =
            activities.reduce(
                (sum, activity) =>
                    sum +
                    Number(
                        activity.actual_progress || 0
                    ),
                0
            );


        /*
            Calculate average planned progress.
        */
        const averagePlannedProgress =
            totalActivities > 0
                ? Number(
                      (
                          totalPlannedProgress /
                          totalActivities
                      ).toFixed(2)
                  )
                : 0;


        /*
            Calculate average actual progress.
        */
        const averageActualProgress =
            totalActivities > 0
                ? Number(
                      (
                          totalActualProgress /
                          totalActivities
                      ).toFixed(2)
                  )
                : 0;


        /*
            Calculate overall progress variance.
        */
        const progressVariance =
            Number(
                (
                    averageActualProgress -
                    averagePlannedProgress
                ).toFixed(2)
            );


        /*
            Field-report metrics
        */

        const unmatchedReports =
            reportResult.rows.filter(
                report =>
                    report.matching_status ===
                    "UNMATCHED"
            ).length;


        const reportsRequiringReview =
            reportResult.rows.filter(
                report =>
                    report.matching_status ===
                    "REQUIRES_REVIEW"
            ).length;


        const autoLinkedReports =
            reportResult.rows.filter(
                report =>
                    report.matching_status ===
                    "AUTO_LINKED"
            ).length;


        const verifiedReports =
            reportResult.rows.filter(
                report =>
                    report.matching_status ===
                    "VERIFIED"
            ).length;


        /*
            Return project summary.
        */
        res.json({
            success: true,

            data: {

                /*
                    Activity summary
                */
                activities: {
                    total: totalActivities,

                    completed:
                        completedActivities,

                    in_progress:
                        inProgressActivities,

                    delayed:
                        delayedActivities
                },


                /*
                    Risk distribution
                */
                risk: {
                    high:
                        highRiskActivities,

                    medium:
                        mediumRiskActivities,

                    low:
                        lowRiskActivities
                },


                /*
                    Progress summary
                */
                progress: {
                    average_planned:
                        averagePlannedProgress,

                    average_actual:
                        averageActualProgress,

                    variance:
                        progressVariance
                },


                /*
                    Field-report processing summary
                */
                field_reports: {

                    total:
                        reportResult.rows.length,

                    auto_linked:
                        autoLinkedReports,

                    verified:
                        verifiedReports,

                    unmatched:
                        unmatchedReports,

                    requires_review:
                        reportsRequiringReview
                }
            }
        });

    } catch (error) {

        console.error(
            "Project summary analytics error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to calculate project summary",
            error: error.message
        });
    }
});


export default router;