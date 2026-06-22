require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

connectDB();

const app = express();

app.set("etag", false);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Static folder for uploaded files (assignment attachments, photos, etc.)
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", time: new Date() }),
);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/teachers", require("./routes/teacherRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  ),
);
