const express = require("express");
const router = express.Router();

const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE SUBJECT

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