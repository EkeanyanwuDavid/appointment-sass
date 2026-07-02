import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./src/config/env";
import connectDB from "./src/config/db";
import chalk from "chalk";
import passport from "./src/config/passport";
import session from "express-session";
import errorHandler from "./src/middleware/error.middleware";
import authRoutes from "./src/routes/auth.routes";
import businessRoutes from "./src/routes/business.route";
import staffRoutes from "./src/routes/staff.routes";
import serviceRoutes from "./src/routes/service.routes";
import availabilityRoutes from "./src/routes/availability.routes";
import bookingRoutes from "./src/routes/booking.routes";
import leaveRoutes from "./src/routes/leave.routes";
const app = express();

// connect to db
connectDB();

// middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());

//routes
app.use("/api/auth", authRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/leaves", leaveRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Bkly API is running" });
});

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(chalk.cyan(`✓ Server running on port ${env.port}`));
});

export default app;
