import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.bharatforge_token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.user = decoded

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication",
    })
  }
}

export default authMiddleware