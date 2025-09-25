import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

import authRoute from "./routes/auth.routes";
import userRoute from "./routes/user.routes";
import todoRoute from "./routes/todo.routes";
import notificationRoute from "./routes/notification.routes";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API TodoList en cours d'exécution",
    version: "1.0.0",
    status: "OK"
  });
});

app.use("/auth", authRoute);
app.use("/users", userRoute);
app.use("/todo", todoRoute);
app.use("/notifications", notificationRoute);

app.use("/uploads", (req, res, next) => {
  console.log(`Serving file: ${req.path}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  console.log('CORS headers set for uploads');
  next();
}, express.static(path.join(__dirname, "../uploads")));

// Middleware pour les routes non trouvées
app.use(notFoundHandler);

// Middleware de gestion d'erreurs global
app.use(errorHandler);

export default app;

