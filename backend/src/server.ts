import app from "./app";
import dotenv from "dotenv";
import { container } from "./container";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

dotenv.config()
const port = 3011

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware d'authentification Socket.IO
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret") as { userId: number };
        socket.data.userId = decoded.userId;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
    console.log('User connected:', socket.data.userId);

    // Rejoindre une room spécifique à l'utilisateur
    socket.join(`user_${socket.data.userId}`);

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.data.userId);
    });
});

// Fonction pour envoyer des notifications en temps réel
export const sendNotification = (userId: number, notification: any) => {
    io.to(`user_${userId}`).emit('notification', notification);
};

server.listen(port, () => {
    console.log(`le server s'execute sur : http://localhost:${port}`);

    // Démarrer le service de mise à jour automatique des tâches planifiées
    try {
        container.startScheduledTaskUpdater(1); // Vérification toutes les 1 minute
        console.log(' ScheduledTaskUpdater démarré avec succès');
    } catch (error) {
        console.error(' Erreur lors du démarrage de ScheduledTaskUpdater:', error);
    }
});


