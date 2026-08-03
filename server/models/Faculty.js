const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const facultySchema = new mongoose.Schema({
   facultyId:{
     type: String,
     required: true,
     unique: true,
   },
   name:{
    type: String,
    required: [true, "Name is required" ],
    uppercase: true,
    minlength: [3, "Name must contain atleast 3 characters"],
    maxlength: [30, "Name must not exceed more than 30 characters"],
    trim: true
   },
   email:{
    type: String,
    required: true,
    unique: true,
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
       "Civil Engineering", "Cyber Security",
    "Administrator"]
   },
   designation:{
    type: String,
    required: true
   }, 
   phone:{
    type: Number,
    required: false
   },
    profileImage:{
    type:String,
    required: true

    },
    role: {
    type: String,
    enum: ["faculty","hod","admin"],
    default: "faculty"
},
   password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must contain at least 6 characters"],
    select: false
}

});

facultySchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);

    //next();

});
module.exports = mongoose.model("Faculty", facultySchema);