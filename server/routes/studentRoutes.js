const Student = require("../models/Student");
const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/multer");


// delete student

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student
 *     description: Deletes a student using their MongoDB ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the student
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a student
 *     description: Updates an existing student's information using their MongoDB ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the student
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               department:
 *                 type: string
 *               semester:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     description: Fetches a single student using their MongoDB ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the student
 *     responses:
 *       200:
 *         description: Student fetched successfully
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     description: Fetches a paginated list of students with optional search and filtering.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search students by name
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter students by department
 *       - in: query
 *         name: semester
 *         schema:
 *           type: string
 *         description: Filter students by semester
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort students by a field
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of students per page
 *     responses:
 *       200:
 *         description: Students fetched successfully
 *       500:
 *         description: Server error
 */


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

/**
 * @swagger
 * /api/student:
 *   post:
 *     summary: Create a new student
 *     description: Creates a new student with profile information and an optional profile image.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rollNumber
 *               - email
 *               - department
 *               - year
 *               - semester
 *               - section
 *               - password
 *               - profileImage
 *             properties:
 *               name:
 *                 type: string
 *                 description: Student name
 *               rollNumber:
 *                 type: string
 *                 description: Unique roll number
 *               email:
 *                 type: string
 *                 description: Student email
 *               department:
 *                 type: string
 *                 enum:
 *                   - Computer Science Engineering
 *                   - Information Technology
 *                   - Mechanical
 *                   - Electronics Communication Engineering
 *                   - Electronics and Electrical Engineering
 *                   - Civil Engineering
 *                   - Cyber Security
 *                 description: Student department
 *               year:
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: Current year of study
 *               semester:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5, 6, 7, 8]
 *                 description: Student semester
 *               section:
 *                 type: string
 *                 enum: [A, B, C]
 *                 description: Class section
 *               phone:
 *                 type: string
 *                 description: 10-digit phone number
 *               password:
 *                 type: string
 *                 description: Account password (min 6 characters)
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Student profile image
 *     responses:
 *       201:
 *         description: Student saved successfully
 *       400:
 *         description: Invalid student data
 *       500:
 *         description: Server error
 *       401:
 *         description: Unauthorized 
 */

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

