const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authController");

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates a student or faculty member using email and password, and returns a JWT token along with the user's role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: User's registered email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token and role
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.post("/login", login);

module.exports = router;