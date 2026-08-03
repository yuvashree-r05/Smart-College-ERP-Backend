const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const Faculty = require("../models/Faculty");
const upload = require("../middleware/multer");

// CREATE FACULTY


router.post("/faculty",authenticate, authorize("admin"),upload.single("profileImage"), async (req, res, next) => {
    try {

        const faculty = new Faculty({
            ...req.body,
        profileImage: req.file.filename});

        await faculty.save();

        res.status(201).json({
            message: "Faculty saved successfully",
            faculty
        });

    } catch (error) {

       
         next(error);

    }
});


// GET ALL FACULTY


router.get("/faculty", authenticate,authorize("admin", "hod", "faculty"), async (req, res, next) => {
    try {
        const search = req.query.search ;
        const department = req.query.department;
        const designation = req.query.designation;
        const sort = req.query.sort;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) ||10;
        const skip = (page - 1) * limit;
        const filter = {};
         
        if(department){
              filter.department={
                $regex: department,
                $options: "i"
            }
        }

        if(designation){
            filter.designation={
                $regex: designation,
                $options: "i"
            }
        }
        
        if(search){
            filter.name={
                $regex: search,
                $options: "i"
            }
        }
        const faculties = await Faculty.find(filter).sort(sort).skip(skip).limit(limit);

        res.status(200).json({
            message: "Faculty fetched successfully",
            faculties
        });

    } catch (error) {

        
         next(error);

    }
});

//
// GET FACULTY BY ID


router.get("/faculty/:id", authenticate,authorize("admin", "hod", "faculty"),async (req, res, next) => {
    try {

        const faculty = await Faculty.findById(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        res.status(200).json({
            message: "Faculty fetched successfully",
            faculty
        });

    } catch (error) {

        
         next(error);

    }
});


// UPDATE FACULTY


router.put("/faculty/:id", authenticate,authorize("admin"),async (req, res, next) => {
    try {

        const faculty = await Faculty.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        res.status(200).json({
            message: "Faculty updated successfully",
            faculty
        });

    } catch (error) {

      
         next(error);

    }
});

// DELETE FACULTY


router.delete("/faculty/:id",authenticate,authorize("admin"), async (req, res, next) => {
    try {

        const faculty = await Faculty.findByIdAndDelete(req.params.id);

        if (!faculty) {
            return res.status(404).json({
                message: "Faculty not found"
            });
        }

        res.status(200).json({
            message: "Faculty deleted successfully",
            faculty
        });

    } catch (error) {

       
         next(error);

    }
});

module.exports = router;