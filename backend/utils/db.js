import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function connectDb() {
  //mongo db connections
  try {
    // console.log(process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database");
  } catch (error) {
    console.log("something went wrong in connecting database");
    console.log(error);
  }
}

connectDb();