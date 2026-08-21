const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const Result = require("../models/Result");
const Attendance = require("../models/Attendance");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// =========================
// ADMIN DASHBOARD
// =========================

/**
 * @swagger
 * /api/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard
 *     description: Returns overall statistics for students, faculty, subjects, results, attendance, and departments.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

router.get(
    "/dashboard/admin",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const totalStudents = await Student.countDocuments();

            const totalFaculty = await Faculty.countDocuments();

            const totalSubjects = await Subject.countDocuments();

            const totalResults = await Result.countDocuments();

            const totalAttendance = await Attendance.countDocuments();

            const totalDepartments = 7;

            res.status(200).json({

                message: "Admin dashboard fetched successfully",

                dashboard: {

                    totalStudents,

                    totalFaculty,

                    totalSubjects,

                    totalResults,

                    totalAttendance,

                    totalDepartments

                }

            });

        } catch (error) {

            next(error);

        }

    }
);


// =========================
// FACULTY DASHBOARD
// =========================

/**
 * @swagger
 * /api/dashboard/faculty:
 *   get:
 *     summary: Get faculty dashboard
 *     description: Returns dashboard statistics for the authenticated faculty member.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Faculty dashboard fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

router.get(
    "/dashboard/faculty",
    authenticate,
    authorize("faculty"),
    async (req, res, next) => {

        try {

            const subjectsHandled = await Subject.countDocuments({

                facultyId: req.user.facultyId

            });

            const attendanceTaken = await Attendance.countDocuments({

                facultyId: req.user.facultyId

            });

            const resultsUploaded = await Result.countDocuments();

            res.status(200).json({

                message: "Faculty dashboard fetched successfully",

                dashboard: {

                    subjectsHandled,

                    attendanceTaken,

                    resultsUploaded

                }

            });

        } catch (error) {

            next(error);

        }

    }
);


// =========================
// STUDENT DASHBOARD
// =========================

/**
 * @swagger
 * /api/dashboard/student:
 *   get:
 *     summary: Get student dashboard
 *     description: Returns academic and attendance statistics for the authenticated student.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Student dashboard fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

router.get(
    "/dashboard/student",
    authenticate,
    authorize("student"),
    async (req, res, next) => {

        try {

            const student = await Student.findById(req.user.id);

            if (!student) {

                return res.status(404).json({

                    message: "Student not found"

                });

            }

            const totalSubjects = await Subject.countDocuments({

                department: student.department,
                semester: student.semester

            });

            const totalResults = await Result.countDocuments({

                studentId: student.rollNumber

            });

            const totalAttendance = await Attendance.countDocuments({

                studentId: student.rollNumber

            });

            res.status(200).json({

                message: "Student dashboard fetched successfully",

                dashboard: {

                    name: student.name,
                    rollNumber: student.rollNumber,
                    department: student.department,
                    year: student.year,
                    semester: student.semester,
                    section: student.section,

                    totalSubjects,
                    totalResults,
                    totalAttendance

                }

            });

        } catch (error) {

            next(error);

        }

    }
);

module.exports = router; 