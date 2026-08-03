const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
{
    subjectCode: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },

    subjectName: {
        type: String,
        required: true,
        trim: true
    },

    department: {
        type: String,
        required: true,
        enum: [
            "Computer Science Engineering",
            "Information Technology",
            "Mechanical",
            "Electronics Communication Engineering",
            "Electronics and Electrical Engineering",
            "Civil Engineering",
            "Cyber Security"
        ]
    },

    semester: {
        type: Number,
        required: true,
        enum: [1,2,3,4,5,6,7,8]
    },

    credits: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },

    facultyId: {
        type: String,
        required: true,
        trim: true
    },

    regulation: {
        type: String,
        default: "R2022"
    },

    subjectType: {
        type: String,
        enum: ["Theory", "Lab", "Project"],
        default: "Theory"
    }

},
{
    timestamps: true
}
);

// Prevent duplicate subjects for same department & regulation
subjectSchema.index(
    {
        subjectCode: 1,
        department: 1,
        regulation: 1
    },
    {
        unique: true
    }
);

module.exports = mongoose.model("Subject", subjectSchema);