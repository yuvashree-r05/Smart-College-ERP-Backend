const express = require("express");
const router = express.Router();

const Notice = require("../models/Notice");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE NOTICE

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