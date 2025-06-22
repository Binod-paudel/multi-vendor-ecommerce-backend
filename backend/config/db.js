import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to db at ${conn.connection.host}`);
  } catch (err) {
    console.log(`Error connected to db `, err.message);
    process.exit(1);
  }
};

export default connectDB;
