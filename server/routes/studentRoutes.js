const Student = require("../models/Student");
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/multer");


// delete student

router.delete("/students/:id", authenticate, authorize("admin"), async (req, res, next) => {

    try {

        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

        res.status(200).json({
            message: "Student deleted successfully",
            student
        });

    } catch (error) {

         next(error);

    }

});

// update student 

router.put("/students/:id", authenticate, authorize("admin"),async(req,res,next)=>{
try{
 const student = await Student.findByIdAndUpdate(req.params.id,req.body, {new:true});
 if (!student) {
            return res.status(404).json({
                message: "Student not found"
            });
        }

 res.status(200).json({
   message: "Student updated",
   student: student
 });
}
catch(error){
    next(error);
};
});

// GET STUDENT by ID 

router.get("/students/:id", authenticate, authorize("admin", "hod", "faculty", "student"),async(req,res,next)=>{
   try{
     const student = await Student.findById(req.params.id);
     if(!student){
        return res.status(404).json({
          message: "Student not found"
        });
     }
     res.status(200).json({
      message: "Student fetched successfuly",
      student: student 
     });
   }
   catch(error){
    next(error);
   }
});

//GET all the students 

router.get("/students", authenticate, authorize("admin", "hod", "faculty"),async(req,res,next)=>{
   try{
      const search = req.query.search;
      const department = req.query.department;
      const semester = req.query.semester;
      const sort = req.query.sort;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) ||10;
      const skip = (page - 1) * limit;
      const filter = {};
      
      if(semester){
          filter.semester = semester;
      }
      if(department){
          filter.department = department;
      }

      if(search){
         filter.name = {
            $regex: search,
            $options: "i"
         }
      }

      const students = await Student.find(filter).sort(sort).skip(skip).limit(limit);
   
      res.status(200).json({
         message: "Students fetched successfully",
         students: students
      });
   }
   catch(error){
       next(error);
   }
});

// SAVE STUDENTS 

router.post("/student",authenticate, authorize("admin"),upload.single("profileImage"),async(req, res, next)=>{
    try{
       const student = new Student ({
         ...req.body,
         profileImage: req.file.filename
      });
       await student.save()  
       res.status(201).json({
        message: "student saved successfully",
        student
       });
    }
    catch(error)
    {
      next(error);
    }
});

module.exports = router;

