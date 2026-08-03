const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    studentId: {
        type: String,
        required: true
    },

    subjectCode: {
        type: String,
        required: true
    },

    facultyId: {
        type: String,
        required: true
    },

    department: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true,
        enum: [1,2,3,4,5,6,7,8]
    },

    section: {
        type: String,
        required: true
    },

    attendanceDate: {
        type: String,
        required: true
        //default: Date.now
    },

    checkInTime: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        enum: ["Present","Absent","Late"],
        default: "Present"
    },

    remarks: {
        type: String,
        default: ""
    }

},
{
    timestamps: true
});

attendanceSchema.index(
    {
        studentId: 1,
        subjectCode: 1,
        attendanceDate: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Attendance", attendanceSchema);