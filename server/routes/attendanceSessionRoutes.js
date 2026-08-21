const express = require("express");
const router = express.Router();

const { v4: uuidv4 } = require("uuid");
const QRCode = require("qrcode");

const Attendance = require("../models/Attendance");
const AttendanceSession = require("../models/AttendanceSession");
const Subject = require("../models/Subject");
const Student = require("../models/Student");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE ATTENDANCE SESSION (GENERATE QR)

/**
 * @swagger
 * /api/attendance-session:
 *   post:
 *     summary: Create attendance session
 *     description: Allows a faculty member to create an attendance session and generate a QR code valid for 2 minutes.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - facultyId
 *               - subjectCode
 *               - department
 *               - semester
 *               - section
 *             properties:
 *               facultyId:
 *                 type: string
 *                 description: Faculty ID
 *               subjectCode:
 *                 type: string
 *                 description: Subject code
 *               department:
 *                 type: string
 *                 description: Department name
 *               semester:
 *                 type: integer
 *                 example: 5
 *               section:
 *                 type: string
 *                 example: "A"
 *     responses:
 *       201:
 *         description: Attendance session created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied. Only faculty can create an attendance session.
 *       404:
 *         description: Subject not found
 *       500:
 *         description: Server error
 */

router.post(
    "/attendance-session",
    authenticate,
    authorize("faculty"),
    async (req, res, next) => {

        try {

            const {
                facultyId,
                subjectCode,
                department,
                semester,
                section
            } = req.body;


            const subject = await Subject.findOne({
                subjectCode
            });

            if (!subject) {
                return res.status(404).json({
                    message: "Subject not found"
                });
            }


            const token = uuidv4();


            const expiresAt = new Date(
                Date.now() + 2 * 60 * 1000
            );


            const attendanceSession = new AttendanceSession({

                facultyId,
                subjectCode,
                department,
                semester,
                section,
                token,
                expiresAt

            });

            await attendanceSession.save();


            const qrData = JSON.stringify({

                sessionId: attendanceSession._id,
                token

            });


            const qrCode = await QRCode.toDataURL(qrData);


            res.status(201).json({

                message: "Attendance session created successfully",

                attendanceSession,

                qrCode

            });

        } catch (error) {

            next(error);

        }

    }
);

// SCAN QR AND MARK ATTENDANCE

/**
 * @swagger
 * /api/attendance-session/scan:
 *   post:
 *     summary: Scan QR and mark attendance
 *     description: Allows an authenticated student to mark attendance using a valid and active attendance session QR token.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - sessionId
 *               - token
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student roll number
 *                 example: "22CS035"
 *               sessionId:
 *                 type: string
 *                 description: Attendance session ID received when the faculty creates the session
 *               token:
 *                 type: string
 *                 description: Unique attendance session token received from the QR code
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       400:
 *         description: Invalid QR code, expired session, closed session, duplicate attendance, or student details do not match the attendance session
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied. Only students can scan and mark attendance.
 *       404:
 *         description: Student or attendance session not found
 *       500:
 *         description: Server error
 */

router.post(
    "/attendance-session/scan",
    authenticate,
    authorize("student"),
    async (req, res, next) => {

        try {

            const {
                studentId,
                sessionId,
                token
            } = req.body;


            // CHECK STUDENT

            const student = await Student.findOne({
                rollNumber: studentId
            });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }


            // CHECK SESSION

            const attendanceSession = await AttendanceSession.findById(sessionId);

            if (!attendanceSession) {
                return res.status(404).json({
                    message: "Attendance session not found"
                });
            }


            // CHECK ACTIVE

            if (!attendanceSession.isActive) {
                return res.status(400).json({
                    message: "Attendance session is closed"
                });
            }


            // CHECK TOKEN

            if (attendanceSession.token !== token) {
                return res.status(400).json({
                    message: "Invalid QR Code"
                });
            }


            // CHECK EXPIRY

            if (attendanceSession.expiresAt < new Date()) {

                attendanceSession.isActive = false;

                await attendanceSession.save();

                return res.status(400).json({
                    message: "QR Code has expired"
                });

            }


            // CHECK DEPARTMENT

            if (student.department !== attendanceSession.department) {
                return res.status(400).json({
                    message: "Student department does not match."
                });
            }


            // CHECK SEMESTER

            if (student.semester !== attendanceSession.semester) {
                return res.status(400).json({
                    message: "Student semester does not match."
                });
            }


            // CHECK SECTION

            if (student.section !== attendanceSession.section) {
                return res.status(400).json({
                    message: "Student section does not match."
                });
            }


            // CHECK DUPLICATE ATTENDANCE

            const attendanceDate = new Date().toISOString().split("T")[0];

            const existingAttendance = await Attendance.findOne({

                studentId,

                subjectCode: attendanceSession.subjectCode,

                attendanceDate

            });

            if (existingAttendance) {
                return res.status(400).json({
                    message: "Attendance already marked."
                });
            }


            // SAVE ATTENDANCE

            const attendance = new Attendance({

                studentId,

                subjectCode: attendanceSession.subjectCode,

                facultyId: attendanceSession.facultyId,

                department: attendanceSession.department,

                semester: attendanceSession.semester,

                section: attendanceSession.section,

                attendanceDate,

                status: "Present"

            });

            await attendance.save();


            res.status(201).json({

                message: "Attendance marked successfully",

                attendance

            });

        } catch (error) {

            next(error);

        }

    }
);

module.exports = router;