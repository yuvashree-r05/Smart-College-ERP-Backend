const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Result = require("../models/Result");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

// CREATE RESULT

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