const mongoose = require("mongoose");
const db = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@dbv1.xwe0tla.mongodb.net/?retryWrites=true&w=majority`;

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
