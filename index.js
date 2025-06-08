import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import postRoutes from './routes/post.route.js'
import quotesRoute from "./routes/quotes.route.js"
import commentRoutes from './routes/comment.route.js'
import cookieParser from "cookie-parser";
import cors from 'cors';
import path from 'path'

dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log(err);
  });


  const __dirname = path.resolve();
const app = express();

app.use(express.json({ limit: "50mb" })); 
app.use(cookieParser());


app.use(cors({
  origin: '*', // Or replace with: 'https://styledmaven.vercel.app'
  credentials: true
}));

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/quotes", quotesRoute);

// app.use(express.static(path.join(__dirname, '/client/dist')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
// });

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
