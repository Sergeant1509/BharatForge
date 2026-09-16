import pool from "../config/db.js";

function normalizeText(text = "") {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getWords(text = "") {
    return normalizeText(text)
        .split(" ")
        .filter(word => word.length > 2);
}

function calculateSimilarity(input, target) {
    const inputWords = getWords(input);
    const targetWords = getWords(target);

    if (!inputWords.length || !targetWords.length) {
        return 0;
    }

    const targetSet = new Set(targetWords);

    let matches = 0;

    for (const word of inputWords) {
        if (targetSet.has(word)) {
            matches++;
        }
    }

    // Exact normalized match
    if (normalizeText(input) === normalizeText(target)) {
        return 1;
    }

    // If every input word exists in the target,
    // treat it as a strong match.
    if (matches === inputWords.length) {
        return 0.90;
    }

    // Normal word-overlap score
    return matches / Math.max(inputWords.length, targetWords.length);
}

function calculateScore({
    description,
    activity,
    discipline
}) {
    const activityText = `
        ${activity.name || ""}
        ${activity.description || ""}
    `;

    let score = calculateSimilarity(
        description,
        activityText
    );

    // Discipline boost
    if (
        discipline &&
        activity.discipline &&
        normalizeText(discipline) === normalizeText(activity.discipline)
    ) {
        score += 0.10;
    }

    return Math.min(score, 1);
}

export async function matchActivity({
    projectId,
    discipline,
    description
}) {
    if (!projectId || !description) {
        throw new Error("projectId and description are required");
    }

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
    );

    const activities = result.rows;

    if (activities.length === 0) {
        return {
            matched: false,
            confidence: 0,
            status: "UNMATCHED",
            activity: null,
            candidates: []
        };
    }

    const scoredActivities = activities.map(activity => {
        const score = calculateScore({
            description,
            activity,
            discipline
        });

        return {
            ...activity,
            score
        };
    });

    scoredActivities.sort((a, b) => b.score - a.score);

    const bestMatch = scoredActivities[0];

    const confidence = Number(
        (bestMatch.score * 100).toFixed(2)
    );

    let status;

    if (confidence >= 80) {
        status = "AUTO_LINKED";
    } else if (confidence >= 50) {
        status = "REQUIRES_REVIEW";
    } else {
        status = "UNMATCHED";
    }

    return {
        matched: status === "AUTO_LINKED",
        confidence,
        status,

        activity: status !== "UNMATCHED"
            ? {
                id: bestMatch.id,
                activity_code: bestMatch.activity_code,
                name: bestMatch.name,
                discipline: bestMatch.discipline
            }
            : null,

        candidates: scoredActivities
            .slice(0, 5)
            .map(activity => ({
                id: activity.id,
                activity_code: activity.activity_code,
                name: activity.name,
                discipline: activity.discipline,
                confidence: Number(
                    (activity.score * 100).toFixed(2)
                )
            }))
    };
}