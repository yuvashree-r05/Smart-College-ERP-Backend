const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Result = require("../models/Result");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// CREATE RESULT

/**
 * @swagger
 * /api/result:
 *   post:
 *     summary: Create a new result
 *     description: Creates a semester result for a student and automatically calculates subject totals, grades, grade points, and semester GPA.
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
 *               - department
 *               - semester
 *               - subjects
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: Student roll number
 *                 example: "2024CSE001"
 *               department:
 *                 type: string
 *                 example: "CSE"
 *               semester:
 *                 type: integer
 *                 example: 4
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - subjectCode
 *                     - credits
 *                   properties:
 *                     subjectCode:
 *                       type: string
 *                       example: "CS401"
 *                     internal1:
 *                       type: number
 *                       example: 40
 *                     internal2:
 *                       type: number
 *                       example: 40
 *                     assignment:
 *                       type: number
 *                       example: 20
 *                     semesterExam:
 *                       type: number
 *                       example: 90
 *                     credits:
 *                       type: number
 *                       example: 4
 *     responses:
 *       201:
 *         description: Result saved successfully
 *       400:
 *         description: Invalid result data or semester is higher than the student's current semester
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

router.post(
    "/result",
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

            if (req.body.semester > student.semester) {
                return res.status(400).json({
                    message: `Cannot upload Semester ${req.body.semester} result. Student is currently studying in Semester ${student.semester}.`
                });
            }

            const result = new Result(req.body);

            await result.save();

            res.status(201).json({
                message: "Result saved successfully",
                result
            });

        } catch (error) {

            next(error);

        }

    }
);

// GET ALL RESULTS (FILTERS)

/**
 * @swagger
 * /api/results:
 *   get:
 *     summary: Get all results
 *     description: Fetches all student results with optional filtering by student ID, semester, and department.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter results by student roll number
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *         description: Filter results by semester
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter results by department
 *     responses:
 *       200:
 *         description: Results fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */

router.get(
    "/results",
    authenticate,
    authorize("admin", "hod", "faculty"),
    async (req, res, next) => {

        try {

            const {
                studentId,
                semester,
                department
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

            const results = await Result.find(filter).sort({ semester: 1 }).lean();

            res.status(200).json({
                message: "Results fetched successfully",
                count: results.length,
                results
            });

        } catch (error) {

            next(error);

        }

    }
);

// GET RESULT BY ID

/**
 * @swagger
 * /api/result/{id}:
 *   get:
 *     summary: Get result by ID
 *     description: Fetches a specific result using its MongoDB result ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */

router.get(
    "/result/:id",
    authenticate,
    authorize("admin", "hod", "faculty", "student"),
    async (req, res, next) => {

        try {

            const result = await Result.findById(req.params.id);

            if (!result) {
                return res.status(404).json({
                    message: "Result not found"
                });
            }

            res.status(200).json({
                message: "Result fetched successfully",
                result
            });

        } catch (error) {

            next(error);

        }

    }
);

// UPDATE RESULT

/**
 * @swagger
 * /api/result/{id}:
 *   put:
 *     summary: Update a result
 *     description: Updates an existing student result. Grades, grade points, totals, and semester GPA are recalculated when the result is saved.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               department:
 *                 type: string
 *               semester:
 *                 type: integer
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     subjectCode:
 *                       type: string
 *                     internal1:
 *                       type: number
 *                     internal2:
 *                       type: number
 *                     assignment:
 *                       type: number
 *                     semesterExam:
 *                       type: number
 *                     credits:
 *                       type: number
 *     responses:
 *       200:
 *         description: Result updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */

router.put(
    "/result/:id",
    authenticate,
    authorize("admin", "faculty"),
    async (req, res, next) => {

        try {

            const result = await Result.findById(req.params.id);

            if (!result) {
                return res.status(404).json({
                    message: "Result not found"
                });
            }

            Object.assign(result, req.body);

            await result.save();

            res.status(200).json({
                message: "Result updated successfully",
                result
            });

        } catch (error) {

            next(error);

        }

    }
);

// DELETE RESULT

/**
 * @swagger
 * /api/result/{id}:
 *   delete:
 *     summary: Delete a result
 *     description: Deletes a student result using its result ID. Only administrators are allowed to delete results.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Result not found
 *       500:
 *         description: Server error
 */

router.delete(
    "/result/:id",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const result = await Result.findByIdAndDelete(req.params.id);

            if (!result) {
                return res.status(404).json({
                    message: "Result not found"
                });
            }

            res.status(200).json({
                message: "Result deleted successfully"
            });

        } catch (error) {

            next(error);

        }

    }
);

module.exports = router;