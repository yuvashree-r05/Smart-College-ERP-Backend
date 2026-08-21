const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE ATTENDANCE

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Mark student attendance
 *     description: Creates an attendance record for a student after validating the student and faculty IDs.
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
 *               - subjectCode
 *               - facultyId
 *               - department
 *               - semester
 *               - section
 *               - attendanceDate
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student roll number
 *                 example: "22CS035"
 *               subjectCode:
 *                 type: string
 *                 example: "CS401"
 *               facultyId:
 *                 type: string
 *                 description: Faculty ID
 *                 example: "FAC001"
 *               department:
 *                 type: string
 *                 example: "Computer Science Engineering"
 *               semester:
 *                 type: integer
 *                 example: 5
 *               section:
 *                 type: string
 *                 example: "A"
 *               attendanceDate:
 *                 type: string
 *                 example: "2026-08-20"
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late]
 *                 example: "Present"
 *               remarks:
 *                 type: string
 *                 example: "Attended the full class"
 *     responses:
 *       201:
 *         description: Attendance marked successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student or faculty not found
 *       500:
 *         description: Server error
 */

router.post(
    "/attendance",
    authenticate,
    authorize("admin", "faculty"),
    async (req, res, next) => {

        try {

            const student = await Student.findOne({
                rollNumber: req.body.studentId
            });

            if (!student) {
                return res.status(404).json({
                    message: "Student not found"
                });
            }

            const faculty = await Faculty.findOne({
                facultyId: req.body.facultyId
            });

            if (!faculty) {
                return res.status(404).json({
                    message: "Faculty not found"
                });
            }

            const attendance = new Attendance(req.body);

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


// GET ALL ATTENDANCE

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     description: Fetches attendance records with optional filtering by student ID, semester, department, subject code, and section.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter by student roll number
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *         description: Filter by semester
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: subjectCode
 *         schema:
 *           type: string
 *         description: Filter by subject code
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *         description: Filter by section
 *     responses:
 *       200:
 *         description: Attendance fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: No attendance records found
 *       500:
 *         description: Server error
 */

router.get(
    "/attendance",
    authenticate,
    authorize("admin", "hod", "faculty"),
    async (req, res, next) => {

        try {

            const {
                studentId,
                semester,
                department,
                subjectCode,
                section
            } = req.query;

            const filter = {};

            if (studentId) {
                filter.studentId = {
                    $regex: studentId,
                    $options: "i"
                };
            }

            if (semester) {
                filter.semester = Number(semester);
            }

            if (department) {
                filter.department = {
                    $regex: department,
                    $options: "i"
                };
            }

            if (subjectCode) {
                filter.subjectCode = {
                    $regex: subjectCode,
                    $options: "i"
                };
            }

            if (section) {
                filter.section = {
                    $regex: section,
                    $options: "i"
                };
            }

            const attendance = await Attendance.find(filter)
                .sort({
                    attendanceDate: -1,
                    studentId: 1
                });

            if (attendance.length === 0) {
                return res.status(404).json({
                    message: "No attendance records found"
                });
            }

            res.status(200).json({
                message: "Attendance fetched successfully",
                count: attendance.length,
                attendance
            });

        } catch (error) {

            next(error);

        }

    }
);


// GET ATTENDANCE BY ID

/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get attendance by ID
 *     description: Fetches a specific attendance record using its MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Attendance not found
 *       500:
 *         description: Server error
 */

router.get(
    "/attendance/:id",
    authenticate,
    authorize("admin", "hod", "faculty", "student"),
    async (req, res, next) => {

        try {

            const attendance = await Attendance.findById(req.params.id);

            if (!attendance) {
                return res.status(404).json({
                    message: "Attendance not found"
                });
            }

            res.status(200).json({
                message: "Attendance fetched successfully",
                attendance
            });

        } catch (error) {

            next(error);

        }

    }
);


// UPDATE ATTENDANCE

/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update attendance
 *     description: Updates an existing attendance record using its attendance ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectCode:
 *                 type: string
 *               facultyId:
 *                 type: string
 *               department:
 *                 type: string
 *               semester:
 *                 type: integer
 *               section:
 *                 type: string
 *               attendanceDate:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Present, Absent, Late]
 *               remarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Attendance not found
 *       500:
 *         description: Server error
 */

router.put(
    "/attendance/:id",
    authenticate,
    authorize("admin", "faculty"),
    async (req, res, next) => {

        try {

            const attendance = await Attendance.findById(req.params.id);

            if (!attendance) {
                return res.status(404).json({
                    message: "Attendance not found"
                });
            }

            Object.assign(attendance, req.body);

            await attendance.save();

            res.status(200).json({
                message: "Attendance updated successfully",
                attendance
            });

        } catch (error) {

            next(error);

        }

    }
);


// DELETE ATTENDANCE

/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete attendance
 *     description: Deletes an attendance record. Only administrators are allowed to delete attendance records.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Attendance not found
 *       500:
 *         description: Server error
 */

router.delete(
    "/attendance/:id",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const attendance = await Attendance.findByIdAndDelete(req.params.id);

            if (!attendance) {
                return res.status(404).json({
                    message: "Attendance not found"
                });
            }

            res.status(200).json({
                message: "Attendance deleted successfully"
            });

        } catch (error) {

            next(error);

        }

    }
);

module.exports = router;