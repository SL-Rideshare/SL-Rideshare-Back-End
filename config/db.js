const mongoose = require("mongoose");
const db = process.env.DB_URL;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    console.log("mongodb is connected...");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
