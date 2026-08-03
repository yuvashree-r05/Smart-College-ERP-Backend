const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const studentSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must contain atleast 3 characters"],
      maxlength: [30, "Name must not exceed not 30 characters"],
      trim: true
    },
    rollNumber :{
        type: String,
        required : true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match:/^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    department:{
        type: String,
        required: true,
        enum: ["Computer Science Engineering",
       "Information Technology", "Mechanical", 
       "Electronics Communication Engineering", 
       "Electronics and Electrical Engineering",
       "Civil Engineering", "Cyber Security"]
    },
    year:{
        type: Number,
        required: true,
        enum:[1,2,3,4]
    },
    semester: {
        type: Number,
        required: true,
        enum:[1,2,3,4,5,6,7,8]
    },
    section:{
        type: String,
        required: true,
        enum:["A","B","C"]
    },
    phone:{
        type: String,
        minlength: 10,
        maxlength: 10
    },
    profileImage:{
    type:String,
    required: true
    },
    role: {
    type: String,
    enum: ["student"],
    default: "student"
    },
    password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must contain at least 6 characters"],
    select: false
    }

});

studentSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);

    //next();

});

module.exports = mongoose.model("Student" , studentSchema);