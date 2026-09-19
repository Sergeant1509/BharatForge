import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from .env");
}

const ai = new GoogleGenAI({
    apiKey: apiKey,
});

const extractionSchema = {
    type: "object",
    properties: {
        projectCode: {
            type: "string",
            nullable: true,
        },
        reportDate: {
            type: "string",
            nullable: true,
        },
        discipline: {
            type: "string",
            nullable: true,
        },
        activityDescription: {
            type: "string",
            nullable: true,
        },
        reportedProgress: {
            type: "number",
            nullable: true,
        },
        actualStart: {
            type: "string",
            nullable: true,
        },
        actualFinish: {
            type: "string",
            nullable: true,
        },
        status: {
            type: "string",
            nullable: true,
        },
        extractionConfidence: {
            type: "number",
        },
        needsReview: {
            type: "boolean",
        },
    },

    required: [
        "projectCode",
        "reportDate",
        "discipline",
        "activityDescription",
        "reportedProgress",
        "actualStart",
        "actualFinish",
        "status",
        "extractionConfidence",
        "needsReview",
    ],
};

const extractionPrompt = `
You are BharatForge AI, an infrastructure project execution-data
extraction system developed for Smart India Hackathon Problem Statement
SIH26122.

Analyze the provided Daily Progress Report, field report, scanned
document, site diary, or handwritten report.

Extract ONLY information that is actually visible in the document.

The extracted information will be used to connect fragmented field
execution data with L5/L6 schedule activities.

Extract these fields:

- projectCode
- reportDate
- discipline
- activityDescription
- reportedProgress
- actualStart
- actualFinish
- status
- extractionConfidence
- needsReview

Engineering disciplines may include:

Civil
Piping
Electrical
Instrumentation
HSE
Static Equipment
Rotating Equipment

Rules:

1. Never invent information.
2. Never invent an activity code.
3. Do not perform L5/L6 activity matching.
4. If information is unavailable, return null.
5. Dates must use YYYY-MM-DD.
6. reportedProgress must be between 0 and 100.
7. If handwriting is unclear, reduce extractionConfidence.
8. If an important field is uncertain, set needsReview to true.
9. activityDescription must describe the actual work performed.
10. Preserve the meaning of handwritten information.
11. This is document extraction only.
`;

export async function extractFieldReportFromImage(
    imageBuffer,
    mimeType
) 

{
    if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Image data is required");
    }

    if (!mimeType) {
        throw new Error("Image MIME type is required");
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: imageBuffer.toString("base64"),
                },
            },
            {
                text: extractionPrompt,
            },
        ],

        config: {
            responseMimeType: "application/json",
            responseJsonSchema: extractionSchema,
            temperature: 0,
        },
    });

    const text = response.text;

    if (!text) {
        throw new Error("Gemini returned an empty response");
    }

    let extracted;

    try {
        extracted = JSON.parse(text);
    } catch (error) {
        console.error("Gemini raw response:", text);
        throw new Error("Gemini returned invalid JSON");
    }

    return extracted;
}
export async function extractFieldReportFromPdf(
    pdfText
) {
    if (!pdfText || !pdfText.trim()) {
        throw new Error("PDF text is empty");
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: [
            {
                text: `
SOURCE TYPE: PDF DAILY PROGRESS REPORT

Extract the required field execution information from this
PDF content.

--- PDF CONTENT START ---
${pdfText}
--- PDF CONTENT END ---

${extractionPrompt}
                `,
            },
        ],

        config: {
            responseMimeType: "application/json",
            responseJsonSchema: extractionSchema,
            temperature: 0,
        },
    });

    const text = response.text;

    if (!text) {
        throw new Error("Gemini returned an empty response");
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini raw response:", text);
        throw new Error("Gemini returned invalid JSON");
    }
}


export async function extractFieldReportFromSpreadsheet(
    spreadsheetText
) {
    if (!spreadsheetText || !spreadsheetText.trim()) {
        throw new Error("Spreadsheet data is empty");
    }

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",

        contents: [
            {
                text: `
SOURCE TYPE: XLSX / XLS / CSV DAILY PROGRESS REPORT

Analyze the following structured spreadsheet data and extract
the actual field execution information.

--- SPREADSHEET CONTENT START ---
${spreadsheetText}
--- SPREADSHEET CONTENT END ---

${extractionPrompt}
                `,
            },
        ],

        config: {
            responseMimeType: "application/json",
            responseJsonSchema: extractionSchema,
            temperature: 0,
        },
    });

    const text = response.text;

    if (!text) {
        throw new Error("Gemini returned an empty response");
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini raw response:", text);
        throw new Error("Gemini returned invalid JSON");
    }
}