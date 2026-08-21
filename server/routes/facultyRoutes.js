const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");

const Faculty = require("../models/Faculty");
const upload = require("../middleware/multer");

// CREATE FACULTY

/**
 * @swagger
 * /api/faculty:
 *   post:
 *     summary: Create a new faculty member
 *     description: Creates a new faculty (or HOD/admin) record with profile information and an optional profile image. Admin only.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - facultyId
 *               - name
 *               - email
 *               - department
 *               - designation
 *               - password
 *               - profileImage
 *             properties:
 *               facultyId:
 *                 type: string
 *                 description: Unique faculty ID
 *               name:
 *                 type: string
 *                 description: Faculty name
 *               email:
 *                 type: string
 *                 description: Faculty email
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
 *                   - Administrator
 *                 description: Faculty department
 *               designation:
 *                 type: string
 *                 description: Job designation (e.g. Assistant Professor)
 *               phone:
 *                 type: number
 *                 description: Contact phone number
 *               role:
 *                 type: string
 *                 enum: [faculty, hod, admin]
 *                 description: Account role (defaults to "faculty" if omitted)
 *               password:
 *                 type: string
 *                 description: Account password (min 6 characters)
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Faculty profile image
 *     responses:
 *       201:
 *         description: Faculty saved successfully
 *       400:
 *         description: Invalid faculty data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/faculty:
 *   get:
 *     summary: Get all faculty
 *     description: Fetches a paginated list of faculty with optional search and filtering.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search faculty by name
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter faculty by department
 *       - in: query
 *         name: designation
 *         schema:
 *           type: string
 *         description: Filter faculty by designation
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort faculty by a field
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
 *         description: Number of faculty per page
 *     responses:
 *       200:
 *         description: Faculty fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

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

/**
 * @swagger
 * /api/faculty/{id}:
 *   get:
 *     summary: Get faculty by ID
 *     description: Fetches a single faculty member using their MongoDB ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the faculty
 *     responses:
 *       200:
 *         description: Faculty fetched successfully
 *       404:
 *         description: Faculty not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


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

/**
 * @swagger
 * /api/faculty/{id}:
 *   put:
 *     summary: Update a faculty member
 *     description: Updates an existing faculty member's information using their MongoDB ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the faculty
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
 *               designation:
 *                 type: string
 *               phone:
 *                 type: number
 *               role:
 *                 type: string
 *                 enum: [faculty, hod, admin]
 *     responses:
 *       200:
 *         description: Faculty updated successfully
 *       404:
 *         description: Faculty not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */


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

/**
 * @swagger
 * /api/faculty/{id}:
 *   delete:
 *     summary: Delete a faculty member
 *     description: Deletes a faculty member using their MongoDB ID. Admin only.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ID of the faculty
 *     responses:
 *       200:
 *         description: Faculty deleted successfully
 *       404:
 *         description: Faculty not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

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