const express = require("express");
const router = express.Router();

const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE SUBJECT

/**
 * @swagger
 * /api/subject:
 *   post:
 *     summary: Create a new subject
 *     description: Creates a new subject, linked to an existing faculty via facultyId. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subjectCode
 *               - subjectName
 *               - department
 *               - semester
 *               - credits
 *               - facultyId
 *             properties:
 *               subjectCode:
 *                 type: string
 *                 description: Unique subject code (e.g. CS301)
 *               subjectName:
 *                 type: string
 *                 description: Subject name
 *               department:
 *                 type: string
 *                 enum:
 *                   - Computer Science Engineering
 *                   - Information Technology
 *                   - Mechanical
 *                   - Electronics Communication Engineering
 *                   - Electronics and Electrical Engineering
 *                   - Civil Engineering
 *                   - Cyber Security
 *                 description: Department offering the subject
 *               semester:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5, 6, 7, 8]
 *                 description: Semester the subject belongs to
 *               credits:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 6
 *                 description: Credit value of the subject
 *               facultyId:
 *                 type: string
 *                 description: facultyId of the faculty teaching this subject (must already exist)
 *               regulation:
 *                 type: string
 *                 description: Regulation batch (defaults to "R2022")
 *               subjectType:
 *                 type: string
 *                 enum: [Theory, Lab, Project]
 *                 description: Type of subject (defaults to Theory)
 *     responses:
 *       201:
 *         description: Subject saved successfully
 *       404:
 *         description: Faculty not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
    "/subject",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const faculty = await Faculty.findOne({
                facultyId: req.body.facultyId
            });

            if (!faculty) {
                return res.status(404).json({
                    message: "Faculty not found"
                });
            }

            const subject = new Subject(req.body);

            await subject.save();

            res.status(201).json({
                message: "Subject saved successfully",
                subject
            });

        } catch (error) {

            next(error);

        }

    }
);


// GET ALL SUBJECTS

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     description: Fetches all subjects.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subjects fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
    "/subjects",
    authenticate,
    authorize("admin", "hod", "faculty", "student"),
    async (req, res, next) => {

        try {

            const subjects = await Subject.find();

            res.status(200).json({
                message: "Subjects fetched successfully",
                subjects
            });

        } catch (error) {

            next(error);

        }

    }
);


// GET SUBJECT BY ID

/**
 * @swagger
 * /api/subject/{id}:
 *   get:
 *     summary: Get subject by ID
 *     description: Fetches a single subject using its MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the subject
 *     responses:
 *       200:
 *         description: Subject fetched successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
    "/subject/:id",
    authenticate,
    authorize("admin", "hod", "faculty", "student"),
    async (req, res, next) => {

        try {

            const subject = await Subject.findById(req.params.id);

            if (!subject) {
                return res.status(404).json({
                    message: "Subject not found"
                });
            }

            res.status(200).json({
                message: "Subject fetched successfully",
                subject
            });

        } catch (error) {

            next(error);

        }

    }
);


// UPDATE SUBJECT

/**
 * @swagger
 * /api/subject/{id}:
 *   put:
 *     summary: Update a subject
 *     description: Updates an existing subject using its MongoDB ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the subject
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subjectCode:
 *                 type: string
 *               subjectName:
 *                 type: string
 *               department:
 *                 type: string
 *               semester:
 *                 type: integer
 *               credits:
 *                 type: integer
 *               facultyId:
 *                 type: string
 *               regulation:
 *                 type: string
 *               subjectType:
 *                 type: string
 *                 enum: [Theory, Lab, Project]
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.put(
    "/subject/:id",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const subject = await Subject.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!subject) {
                return res.status(404).json({
                    message: "Subject not found"
                });
            }

            res.status(200).json({
                message: "Subject updated successfully",
                subject
            });

        } catch (error) {

            next(error);

        }

    }
);


// DELETE SUBJECT

/**
 * @swagger
 * /api/subject/{id}:
 *   delete:
 *     summary: Delete a subject
 *     description: Deletes a subject using its MongoDB ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the subject
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.delete(
    "/subject/:id",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const subject = await Subject.findByIdAndDelete(req.params.id);

            if (!subject) {
                return res.status(404).json({
                    message: "Subject not found"
                });
            }

            res.status(200).json({
                message: "Subject deleted successfully",
                subject
            });

        } catch (error) {

            next(error);

        }

    }
);

module.exports = router;