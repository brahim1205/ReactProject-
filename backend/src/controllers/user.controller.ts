import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Classe utilitaire pour les réponses HTTP standardisées
class HttpResponse {
  static success<T>(res: Response, data: T, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

export class UserController {
  async getAll(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          profileImageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return HttpResponse.success(res, users);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return HttpResponse.error(res, 'Erreur lors de la récupération des utilisateurs', 500, error);
    }
  }

  async updateProfileImage(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id || '');
      if (isNaN(userId)) {
        return HttpResponse.error(res, 'ID utilisateur invalide', 400);
      }

      // Vérifier si un fichier a été uploadé
      if (!req.file) {
        return HttpResponse.error(res, 'Aucun fichier image fourni', 400);
      }

      // Créer l'URL de l'image
      const profileImageUrl = `/uploads/${req.file.filename}`;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { profileImageUrl },
        select: {
          id: true,
          name: true,
          email: true,
          profileImageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return HttpResponse.success(res, user);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la photo de profil:', error);
      return HttpResponse.error(res, 'Erreur lors de la mise à jour de la photo de profil', 500, error);
    }
  }
}
