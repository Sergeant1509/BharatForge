import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pg;

// Keep PostgreSQL DATE values as YYYY-MM-DD.
// This prevents JavaScript timezone conversion.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on("connect", () => {
    console.log("PostgreSQL connected");
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error:", error);
});

export default pool;