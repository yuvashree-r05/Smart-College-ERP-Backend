const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const login = async (req, res, next) => {
    try {

        const { email, password } = req.body;

        // Check Student
        let user = await Student.findOne({ email }).select("+password");

        // If not Student, check Faculty
        if (!user) {
            user = await Faculty.findOne({ email }).select("+password");
        }

        // User not found
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.status(200).json({
            message: "Login Successful",
            token,
            role: user.role
        });

    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports = { login };