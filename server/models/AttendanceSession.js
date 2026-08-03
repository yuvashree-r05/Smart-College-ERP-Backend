const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
{
    facultyId: {
        type: String,
        required: true
    },

    subjectCode: {
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

    token: {
        type: String,
        required: true,
        unique: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    expiresAt: {
        type: Date,
        required: true
    }
},
{
    timestamps: true
});

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);