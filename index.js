import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log("Server Started at http://localhost:", PORT);
    });
  })
  .catch((err) => {
    console.log("mongo error", err);
  });
