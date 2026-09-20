import pool from "../config/db.js"

const normalizeText = (text = "") => {
    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

const getWords = (text = "") => {
    return normalizeText(text)
        .split(" ")
        .filter((word) => word.length > 2)
}

const calculateSimilarity = (input, target) => {
    const inputWords = getWords(input)
    const targetWords = getWords(target)

    if (!inputWords.length || !targetWords.length) {
        return 0
    }

    const targetSet = new Set(targetWords)

    let matches = 0

    for (const word of inputWords) {
        if (targetSet.has(word)) {
            matches++
        }
    }

    if (
        normalizeText(input) ===
        normalizeText(target)
    ) {
        return 1
    }

    if (matches === inputWords.length) {
        return 0.9
    }

    return (
        matches /
        Math.max(
            inputWords.length,
            targetWords.length
        )
    )
}

const calculateActivityCodeMatch = (
    activityCode,
    targetCode
) => {
    if (!activityCode || !targetCode) {
        return false
    }

    return (
        normalizeText(activityCode) ===
        normalizeText(targetCode)
    )
}

const calculateScore = ({
    description,
    activity,
    discipline
}) => {
    const activityText = `
        ${activity.name || ""}
        ${activity.description || ""}
    `

    let score = calculateSimilarity(
        description,
        activityText
    )

    if (
        discipline &&
        activity.discipline &&
        normalizeText(discipline) ===
            normalizeText(activity.discipline)
    ) {
        score += 0.1
    }

    return Math.min(score, 1)
}

export const matchActivity = async ({
    projectId,
    discipline,
    description,
    activityCode
}) => {
    if (
        !projectId ||
        (!description && !activityCode)
    ) {
        throw new Error(
            "projectId and description are required"
        )
    }

    console.log(
        "========== ACTIVITY MATCH START =========="
    )

    console.log("MATCH INPUT:", {
        projectId,
        discipline,
        description,
        activityCode
    })

    /*
     * -------------------------------------------------------
     * STEP 1
     * Exact Activity Code inside the project
     * -------------------------------------------------------
     */

    if (activityCode) {
        const exactResult = await pool.query(
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
                status,
                risk_level
            FROM activities
            WHERE project_id = $1
              AND LOWER(TRIM(activity_code)) =
                  LOWER(TRIM($2))
            LIMIT 1
            `,
            [
                projectId,
                activityCode
            ]
        )

        console.log(
            "EXACT PROJECT ACTIVITY:",
            exactResult.rows.length
        )

        if (exactResult.rows.length > 0) {
            const activity =
                exactResult.rows[0]

            console.log(
                "EXACT ACTIVITY MATCH:",
                activity.activity_code
            )

            console.log(
                "========== ACTIVITY MATCH END =========="
            )

            return {
                matched: true,
                confidence: 100,
                status: "AUTO_LINKED",

                activity: {
                    id: activity.id,
                    activity_code:
                        activity.activity_code,
                    name: activity.name,
                    discipline:
                        activity.discipline
                },

                candidates: [
                    {
                        id: activity.id,
                        activity_code:
                            activity.activity_code,
                        name: activity.name,
                        discipline:
                            activity.discipline,
                        confidence: 100
                    }
                ]
            }
        }
    }

    /*
     * -------------------------------------------------------
     * STEP 2
     * Get all activities belonging to this project
     * -------------------------------------------------------
     */

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
            status,
            risk_level
        FROM activities
        WHERE project_id = $1
        `,
        [projectId]
    )

    const activities = result.rows

    console.log(
        "PROJECT ACTIVITIES FOUND:",
        activities.length
    )

    /*
     * -------------------------------------------------------
     * STEP 3
     * If project has no activities, try exact code globally
     *
     * This protects the demo from a project_id mismatch while
     * still requiring an exact Activity Code.
     * -------------------------------------------------------
     */

    if (
        activities.length === 0 &&
        activityCode
    ) {
        const globalExactResult =
            await pool.query(
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
                    status,
                    risk_level
                FROM activities
                WHERE LOWER(TRIM(activity_code)) =
                      LOWER(TRIM($1))
                LIMIT 1
                `,
                [activityCode]
            )

        console.log(
            "GLOBAL EXACT ACTIVITY:",
            globalExactResult.rows.length
        )

        if (
            globalExactResult.rows.length > 0
        ) {
            const activity =
                globalExactResult.rows[0]

            console.log(
                "PROJECT ID MISMATCH DETECTED."
            )

            console.log(
                "ACTIVITY PROJECT:",
                activity.project_id
            )

            console.log(
                "REQUEST PROJECT:",
                projectId
            )

            console.log(
                "========== ACTIVITY MATCH END =========="
            )

            return {
                matched: true,
                confidence: 100,
                status: "AUTO_LINKED",

                activity: {
                    id: activity.id,
                    activity_code:
                        activity.activity_code,
                    name: activity.name,
                    discipline:
                        activity.discipline
                },

                candidates: [
                    {
                        id: activity.id,
                        activity_code:
                            activity.activity_code,
                        name: activity.name,
                        discipline:
                            activity.discipline,
                        confidence: 100
                    }
                ]
            }
        }

        console.log(
            "NO ACTIVITY FOUND FOR EXACT CODE:",
            activityCode
        )

        console.log(
            "========== ACTIVITY MATCH END =========="
        )

        return {
            matched: false,
            confidence: 0,
            status: "UNMATCHED",
            activity: null,
            candidates: []
        }
    }

    /*
     * -------------------------------------------------------
     * STEP 4
     * Description-based matching
     * -------------------------------------------------------
     */

    if (activities.length === 0) {
        console.log(
            "NO ACTIVITIES FOUND FOR PROJECT:",
            projectId
        )

        console.log(
            "========== ACTIVITY MATCH END =========="
        )

        return {
            matched: false,
            confidence: 0,
            status: "UNMATCHED",
            activity: null,
            candidates: []
        }
    }

    const scoredActivities =
        activities.map((activity) => {
            let score = calculateScore({
                description,
                activity,
                discipline
            })

            /*
             * Exact Activity Code always wins.
             */
            if (
                activityCode &&
                calculateActivityCodeMatch(
                    activityCode,
                    activity.activity_code
                )
            ) {
                score = 1
            }

            return {
                ...activity,
                score
            }
        })

    scoredActivities.sort(
        (a, b) => b.score - a.score
    )

    const bestMatch =
        scoredActivities[0]

    const confidence = Number(
        (bestMatch.score * 100).toFixed(2)
    )

    let status

    if (confidence >= 80) {
        status = "AUTO_LINKED"
    } else if (confidence >= 50) {
        status = "REQUIRES_REVIEW"
    } else {
        status = "UNMATCHED"
    }

    console.log("BEST MATCH:", {
        activityId: bestMatch.id,
        activityCode:
            bestMatch.activity_code,
        score: bestMatch.score,
        confidence,
        status
    })

    console.log(
        "========== ACTIVITY MATCH END =========="
    )

    return {
        matched:
            status === "AUTO_LINKED",

        confidence,

        status,

        activity:
            status !== "UNMATCHED"
                ? {
                    id: bestMatch.id,
                    activity_code:
                        bestMatch.activity_code,
                    name: bestMatch.name,
                    discipline:
                        bestMatch.discipline
                }
                : null,

        candidates:
            scoredActivities
                .slice(0, 5)
                .map((activity) => ({
                    id: activity.id,
                    activity_code:
                        activity.activity_code,
                    name: activity.name,
                    discipline:
                        activity.discipline,
                    confidence: Number(
                        (
                            activity.score *
                            100
                        ).toFixed(2)
                    )
                }))
    }
}