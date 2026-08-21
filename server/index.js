const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
require("dotenv").config();

const app = express(); 
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const resultRoutes = require("./routes/resultRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const attendanceSessionRoutes = require("./routes/attendanceSessionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");


// API ROUTES
app.use("/api", studentRoutes);
app.use("/api", facultyRoutes);
app.use("/api", resultRoutes);
app.use("/api", subjectRoutes);
app.use("/api", attendanceRoutes);
app.use("/api", noticeRoutes);
app.use("/api", attendanceSessionRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", authRoutes);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

// MONGO DB CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(()=> console.log ("Mongo DB Connected Successfully "))
  .catch((err) => console.log(err));

// TEST ROUTE
app.get("/",(req,res)=>{
    res.send("Student Management System Running Successfully ");
});

// app.post("/students", (req, res)=>{
//     console.log(req.body);
//     res.send("Students Received Successfully");
// });

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT} `);
});