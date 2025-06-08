require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 5000;

const authRoute = require("./routes/auth.routes");
const slotRoute = require("./routes/slot.routes");
const bookRoute = require("./routes/booking.routes");

const adminRoute = require("./routes/admin.routes");

const errorMiddleware = require("./middlewares/error.middleware");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/", (req, res) => {
  res.send("Hello From Express !");
});

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/slot", slotRoute);
app.use("/api/v1/book", bookRoute);

/**
 * ADMIN PANEL ROUTES
 */
app.use("/api/v1/admin", adminRoute);

app.use(errorMiddleware);

/**
 * CRONS
 */
require("./util/scheduler"); // This will start the cron job


app.listen(PORT, async () => {
  console.log(`Server running on port http://localhost:${PORT}`);
 try {
   await connectDB();
 } catch (error) {
  consol.error("db not connected");
 }
});
