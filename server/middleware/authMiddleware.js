const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access Denied. No Token Provided."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log(decoded);

        req.user = decoded;

        next();

    } catch (error) {

        next(error);

    }

};

module.exports = authenticate;