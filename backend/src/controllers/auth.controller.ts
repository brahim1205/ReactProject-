import {Request,Response} from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET= process.env.JWT_SECRET || "secret";

export class Authcontroller {
    register = async (req:Request, res:Response)=>{
        const {name, email, password}=req.body;

        // Validation des données
        if (!name || name.trim().length === 0) {
            return res.status(400).json({message: "Le nom est obligatoire"});
        }

        if (!email || email.trim().length === 0) {
            return res.status(400).json({message: "L'email est obligatoire"});
        }

        // Validation du format email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({message: "Format d'email invalide"});
        }

        if (!password || password.length < 4) {
            return res.status(400).json({message: "Le mot de passe doit contenir au moins 4 caractères"});
        }

        const  existingUser= await prisma.user.findUnique({where:{email}});
        if (existingUser){
            return res.status(400).json({message: "Cet email est déjà utilisé"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data:{name: name.trim(), email: email.trim().toLowerCase(), password:hashedPassword},
        });

        // Créer des tâches de bienvenue pour le nouvel utilisateur
        const welcomeTodos = [
            {
                title: "Bienvenue dans TodoList !",
                description: "Découvrez votre nouvelle application de gestion des tâches.",
                priority: "Moyenne",
                userId: user.id,
                createdBy: user.name,
            },
            {
                title: "Ajouter votre première tâche",
                description: "Cliquez sur 'Ajouter une tâche' pour créer votre première todo.",
                priority: "Basse",
                userId: user.id,
                createdBy: user.name,
            },
            {
                title: "Explorer les fonctionnalités",
                description: "Découvrez les filtres, la recherche et les priorités.",
                priority: "Basse",
                userId: user.id,
                createdBy: user.name,
            }
        ];

        await prisma.todo.createMany({
            data: welcomeTodos,
        });

        res.json({message:"Utilisateur créé avec succès",user});
    };

    //connexion
    login=async (req:Request, res:Response)=>{
        const {email,password}=req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return res.status(401).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifie que user.password existe et que password est bien transmis
        if (!password || !user.password) {
          return res.status(400).json({ message: "Mot de passe manquant" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if(!isValid){
            return res.status(401).json({message:"Identifiants Invalides"});
        }

        const token= jwt.sign({userId:user.id},JWT_SECRET,{
             expiresIn: "1h",
            });

        // Retourner les informations utilisateur (sans le mot de passe)
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl
        };

        res.json({message:"connexion reussie",token, user: userResponse});
    };
}