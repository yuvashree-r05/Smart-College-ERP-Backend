const express = require("express");
const router = express.Router();

const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");


// CREATE ATTENDANCE

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