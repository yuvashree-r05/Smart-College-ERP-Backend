const express = require("express");
const router = express.Router();

const Notice = require("../models/Notice");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE NOTICE

/**
 * @swagger
 * /api/notice:
 *   post:
 *     summary: Create a new notice
 *     description: Creates a new notice. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - postedBy
 *               - expiryDate
 *             properties:
 *               title:
 *                 type: string
 *                 description: Notice title
 *               description:
 *                 type: string
 *                 description: Notice content
 *               postedBy:
 *                 type: string
 *                 description: Name/ID of the person posting the notice
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *                 description: Notice priority (defaults to Medium)
 *               department:
 *                 type: string
 *                 description: Target department (defaults to "All")
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: Date the notice expires
 *     responses:
 *       201:
 *         description: Notice created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.post(
    "/notice",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const notice = new Notice(req.body);

            await notice.save();

            res.status(201).json({
                message: "Notice created successfully",
                notice
            });

        } catch (error) {

            next(error);

        }

    }
);


// GET ALL NOTICES

/**
 * @swagger
 * /api/notices:
 *   get:
 *     summary: Get all notices
 *     description: Fetches all notices, sorted by most recent, with optional filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter notices by department
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *         description: Filter notices by priority
 *     responses:
 *       200:
 *         description: Notices fetched successfully
 *       404:
 *         description: No notices found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
    "/notices",
    authenticate,
    authorize("admin", "faculty", "student"),
    async (req, res, next) => {

        try {

            const {
                department,
                priority
            } = req.query;

            const filter = {};

            if (department) {

                filter.department = {
                    $regex: department,
                    $options: "i"
                };

            }

            if (priority) {

                filter.priority = priority;

            }

            const notices = await Notice.find(filter)
                .sort({ createdAt: -1 });

            if (notices.length === 0) {

                return res.status(404).json({
                    message: "No notices found"
                });

            }

            res.status(200).json({
                message: "Notices fetched successfully",
                count: notices.length,
                notices
            });

        } catch (error) {

            next(error);

        }

    }
);


// GET NOTICE BY ID

/**
 * @swagger
 * /api/notice/{id}:
 *   get:
 *     summary: Get notice by ID
 *     description: Fetches a single notice using its MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the notice
 *     responses:
 *       200:
 *         description: Notice fetched successfully
 *       404:
 *         description: Notice not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.get(
    "/notice/:id",
    authenticate,
    authorize("admin", "faculty", "student"),
    async (req, res, next) => {

        try {

            const notice = await Notice.findById(req.params.id);

            if (!notice) {

                return res.status(404).json({
                    message: "Notice not found"
                });

            }

            res.status(200).json({
                message: "Notice fetched successfully",
                notice
            });

        } catch (error) {

            next(error);

        }

    }
);


// UPDATE NOTICE

/**
 * @swagger
 * /api/notice/{id}:
 *   put:
 *     summary: Update a notice
 *     description: Updates an existing notice using its MongoDB ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the notice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               postedBy:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High]
 *               department:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Notice updated successfully
 *       404:
 *         description: Notice not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

router.put(
    "/notice/:id",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const notice = await Notice.findById(req.params.id);

            if (!notice) {

                return res.status(404).json({
                    message: "Notice not found"
                });

            }

            Object.assign(notice, req.body);

            await notice.save();

            res.status(200).json({
                message: "Notice updated successfully",
                notice
            });

        } catch (error) {

            next(error);

        }

    }
);


// DELETE NOTICE

/**
 * @swagger
 * /api/notice/{id}:
 *   delete:
 *     summary: Delete a notice
 *     description: Deletes a notice using its MongoDB ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the notice
 *     responses:
 *       200:
 *         description: Notice deleted successfully
 *       404:
 *         description: Notice not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


router.delete(
    "/notice/:id",
    authenticate,
    authorize("admin"),
    async (req, res, next) => {

        try {

            const notice = await Notice.findByIdAndDelete(req.params.id);

            if (!notice) {

                return res.status(404).json({
                    message: "Notice not found"
                });

            }

            res.status(200).json({
                message: "Notice deleted successfully"
            });

        } catch (error) {

            next(error);

        }

    }
);

module.exports = router;