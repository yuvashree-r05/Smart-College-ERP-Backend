const mongoose = require("mongoose");

const subjectResultSchema = new mongoose.Schema({

    subjectCode: {
        type: String,
        required: true
    },

    internal1: {
        type: Number,
        default: 0,
        min: 0
    },

    internal2: {
        type: Number,
        default: 0,
        min: 0
    },

    assignment: {
        type: Number,
        default: 0,
        min: 0
    },

    semesterExam: {
        type: Number,
        default: 0,
        min: 0
    },

    total: {
        type: Number,
        default: 0
    },

    grade: {
        type: String,
        enum: ["O","A+","A","B+","B","C","RA"],
        default: "RA"
    },

    credits: {
        type: Number,
        required: true
    },

    gradePoint: {
        type: Number,
        default: 0
    }

});

const resultSchema = new mongoose.Schema({

    studentId: {
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

    subjects: [subjectResultSchema],

    semesterGPA: {
        type: Number,
        default: 0
    }

},
{
    timestamps: true
});

resultSchema.pre("save", function(next){

    let totalCredits = 0;
    let weightedGradePoints = 0;

    this.subjects.forEach(subject => {

        subject.total =
            subject.internal1 +
            subject.internal2 +
            subject.assignment +
            subject.semesterExam;

        if(subject.total >= 180){
            subject.grade = "O";
            subject.gradePoint = 10;
        }
        else if(subject.total >= 160){
            subject.grade = "A+";
            subject.gradePoint = 9;
        }
        else if(subject.total >= 140){
            subject.grade = "A";
            subject.gradePoint = 8;
        }
        else if(subject.total >= 120){
            subject.grade = "B+";
            subject.gradePoint = 7;
        }
        else if(subject.total >= 100){
            subject.grade = "B";
            subject.gradePoint = 6;
        }
        else if(subject.total >= 90){
            subject.grade = "C";
            subject.gradePoint = 5;
        }
        else{
            subject.grade = "RA";
            subject.gradePoint = 0;
        }

        totalCredits += subject.credits;
        weightedGradePoints += subject.gradePoint * subject.credits;

    });

    if(totalCredits > 0){
        this.semesterGPA = Number((weightedGradePoints / totalCredits).toFixed(2));
    }
    else{
        this.semesterGPA = 0;
    }

    //next();

});

module.exports = mongoose.model("Result", resultSchema);