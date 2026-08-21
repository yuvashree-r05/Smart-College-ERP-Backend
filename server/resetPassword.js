const mongoose = require("mongoose");
const Faculty = require("./models/Faculty");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await Faculty.findOne({ email: "admin@abc.edu.in" });

  if (!user) {
    console.log("User not found");
    process.exit();
  }

  user.password = "admin123";
  await user.save(); // hashes properly now

  console.log("Password hashed and updated");
  process.exit();
});