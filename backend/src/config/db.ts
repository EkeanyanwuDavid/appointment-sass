import mongoose from "mongoose";
import { env } from "./env";
import chalk from "chalk";
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.mongodbUri, {});
    console.log(chalk.green(`✓ MongoDB connected: ${conn.connection.host}`));
  } catch (err) {
    console.log(chalk.red(`✗ MongoDB connection failed: ${err}`));
    process.exit(1);
  }
};

export default connectDB;
