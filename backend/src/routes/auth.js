import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

import pool from "../config/db.js"
import authMiddleware from "../middleware/auth.js"

const router = express.Router()


// ========================================
// CREATE JWT
// ========================================

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  )
}


// ========================================
// SET AUTH COOKIE
// ========================================

const setAuthCookie = (res, token) => {
  res.cookie("bharatforge_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}


// ========================================
// SIGNUP
// ========================================

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      identifier,
      password,
    } = req.body || {}

    if (!name || !identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email/mobile and password are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      })
    }

    const cleanName = name.trim()
    const cleanIdentifier = identifier.trim()

    const isEmail = cleanIdentifier.includes("@")

    let existingUser

    if (isEmail) {
      existingUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanIdentifier]
      )
    } else {
      existingUser = await pool.query(
        `
        SELECT id
        FROM users
        WHERE mobile = $1
        LIMIT 1
        `,
        [cleanIdentifier]
      )
    }

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email/mobile already exists",
      })
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    )

    let result

    if (isEmail) {
      result = await pool.query(
        `
        INSERT INTO users (
          name,
          email,
          password_hash
        )
        VALUES ($1, LOWER($2), $3)
        RETURNING
          id,
          name,
          email,
          mobile,
          role,
          is_active,
          created_at
        `,
        [
          cleanName,
          cleanIdentifier,
          passwordHash,
        ]
      )
    } else {
      result = await pool.query(
        `
        INSERT INTO users (
          name,
          mobile,
          password_hash
        )
        VALUES ($1, $2, $3)
        RETURNING
          id,
          name,
          email,
          mobile,
          role,
          is_active,
          created_at
        `,
        [
          cleanName,
          cleanIdentifier,
          passwordHash,
        ]
      )
    }

    const user = result.rows[0]

    const token = createToken(user)

    setAuthCookie(res, token)

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    })
  } catch (error) {
    console.error("Signup error:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to create account",
    })
  }
})


// ========================================
// LOGIN
// ========================================

router.post("/login", async (req, res) => {
  try {
    const {
      identifier,
      password,
    } = req.body || {}

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/mobile and password are required",
      })
    }

    const cleanIdentifier = identifier.trim()

    const isEmail = cleanIdentifier.includes("@")

    let result

    if (isEmail) {
      result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          mobile,
          password_hash,
          role,
          is_active
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [cleanIdentifier]
      )
    } else {
      result = await pool.query(
        `
        SELECT
          id,
          name,
          email,
          mobile,
          password_hash,
          role,
          is_active
        FROM users
        WHERE mobile = $1
        LIMIT 1
        `,
        [cleanIdentifier]
      )
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password",
      })
    }

    const user = result.rows[0]

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive",
      })
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash
    )

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/mobile or password",
      })
    }

    delete user.password_hash

    const token = createToken(user)

    setAuthCookie(res, token)

    return res.json({
      success: true,
      message: "Login successful",
      user,
    })
  } catch (error) {
    console.error("Login error:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    })
  }
})


// ========================================
// CURRENT USER
// ========================================

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        mobile,
        role,
        is_active,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    return res.json({
      success: true,
      user: result.rows[0],
    })
  } catch (error) {
    console.error("Auth me error:", error)

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    })
  }
})


// ========================================
// LOGOUT
// ========================================

router.post("/logout", (req, res) => {
  res.clearCookie("bharatforge_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  return res.json({
    success: true,
    message: "Logged out successfully",
  })
})


export default router