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