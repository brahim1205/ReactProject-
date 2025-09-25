import { Response, Request } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { ValidatedRequest, validateId, validateStatus, validateAssignment, validateRequired } from "../middlewares/validation.middleware.js";
import { ITodoService, CreateTodoDto, UpdateTodoDto } from "../types/index.js";
import prisma from "../config/prisma";
import { sendNotification } from "../server";
import logger from "../utils/logger";

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

  static validationError(res: Response, errors: string[]) {
    return res.status(400).json({
      success: false,
      message: "Erreurs de validation",
      errors,
      timestamp: new Date().toISOString()
    });
  }
}


export class TodoController {
  constructor(private readonly todoService: ITodoService) {}

  private parseIdParam(idParam: string | undefined): number | null {
    if (!idParam) return null;
    const id = Number(idParam);
    return isNaN(id) ? null : id;
  }

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const todos = await this.todoService.getAllTodos();
      return HttpResponse.success(res, todos);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la récupération des tâches", 500, error);
    }
  };

  getById = async (req: ValidatedRequest, res: Response) => {
    try {
      const todo = await this.todoService.getTodoById(req.validatedId!);
      if (!todo) {
        return HttpResponse.error(res, "Tâche introuvable", 404);
      }

      return HttpResponse.success(res, todo);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la récupération de la tâche", 500, error);
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const data: CreateTodoDto = req.body;
      const todo = await this.todoService.createTodo(data);
      return HttpResponse.success(res, todo, 201);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la création", 400, error);
    }
  };

  private extractTodoData = (body: any, file?: Express.Multer.File, files?: { [fieldname: string]: Express.Multer.File[] }): CreateTodoDto => {
    const { title, userId, description, priority, createdBy } = body;

    const data: CreateTodoDto = {
      title,
      userId: Number(userId),
      description: description || undefined,
      priority: priority || "Moyenne",
      createdBy: createdBy || "Utilisateur",
    };

    if (files) {
      // Pour createWithMedia (plusieurs fichiers)
      if (files?.image?.[0]) {
        data.imageUrl = `/uploads/${files.image[0].filename}`;
      }
      if (files?.audio?.[0]) {
        data.audioUrl = `/uploads/${files.audio[0].filename}`;
      }
    } else if (file) {
      // Pour createWithImage ou createWithAudio (un seul fichier)
      const fieldName = file.fieldname;
      if (fieldName === 'image') {
        data.imageUrl = `/uploads/${file.filename}`;
      } else if (fieldName === 'audio') {
        data.audioUrl = `/uploads/${file.filename}`;
      }
    }

    return data;
  };

  createWithImage = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response) => {
    try {
      const data = this.extractTodoData(req.body, req.file);
      const todo = await this.todoService.createTodo(data);
      return HttpResponse.success(res, todo, 201);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la création avec image", 400, error);
    }
  };

  createWithAudio = async (req: AuthRequest & { file?: Express.Multer.File }, res: Response) => {
    try {
      const data = this.extractTodoData(req.body, req.file);
      const todo = await this.todoService.createTodo(data);
      return HttpResponse.success(res, todo, 201);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la création avec audio", 400, error);
    }
  };

  createWithMedia = async (req: AuthRequest & { files?: { [fieldname: string]: Express.Multer.File[] } }, res: Response) => {
    try {
      const data = this.extractTodoData(req.body, undefined, req.files as { [fieldname: string]: Express.Multer.File[] });
      const todo = await this.todoService.createTodo(data);
      return HttpResponse.success(res, todo, 201);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la création avec média", 400, error);
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const id = this.parseIdParam(req.params.id);
      if (id === null) {
        return HttpResponse.error(res, "ID invalide", 400);
      }

      const data: UpdateTodoDto = req.body;
      const oldTodo = await this.todoService.getTodoById(id);
      const todo = await this.todoService.updateTodo(id, data, req.userId);

      // Créer une notification pour le propriétaire ou l'assignateur si c'est quelqu'un d'autre qui modifie
      if (oldTodo && req.userId) {
        let recipientId: number | null = oldTodo.userId;

        // Si la tâche est assignée et que l'utilisateur actuel est l'assigné, notifier l'assignateur
        if (oldTodo.assignedToId && oldTodo.assignedToId === req.userId) {
          recipientId = oldTodo.userId; // L'assignateur reçoit la notification
        } else if (oldTodo.userId !== req.userId) {
          recipientId = oldTodo.userId; // Le propriétaire reçoit la notification
        } else {
          recipientId = null; // Pas de notification si c'est le propriétaire qui modifie sa propre tâche
        }

        if (recipientId && recipientId !== req.userId) {
          const modifier = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { name: true }
          });

          await prisma.notification.create({
            data: {
              type: 'task_updated',
              title: 'Tâche modifiée',
              message: `${modifier?.name || 'Quelqu\'un'} a modifié votre tâche "${todo.title}"`,
              recipientId: recipientId,
              senderId: req.userId,
              todoId: id,
              todoTitle: todo.title
            }
          });
        }
      }

      return HttpResponse.success(res, todo);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la mise à jour", 400, error);
    }
  };

  updatePartial = async (req: AuthRequest, res: Response) => {
    try {
      const id = this.parseIdParam(req.params.id);
      if (id === null) {
        return HttpResponse.error(res, "ID invalide", 400);
      }

      const data: UpdateTodoDto = req.body;
      const todo = await this.todoService.updateTodo(id, data);
      return HttpResponse.success(res, todo);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la mise à jour partielle", 400, error);
    }
  };

  toggleComplete = async (req: ValidatedRequest, res: Response) => {
    try {
      const { status } = req.validatedData || req.body;
      let newStatus: string;

      if (typeof status === 'string' && ['pending', 'in_progress', 'completed'].includes(status)) {
        newStatus = status;
      } else {
        return HttpResponse.error(res, "Le champ 'status' doit être 'pending', 'in_progress' ou 'completed'", 400);
      }

      const oldTodo = await this.todoService.getTodoById(req.validatedId!);
      const todo = await this.todoService.updateTodo(req.validatedId!, { status: newStatus });
      const userId = (req as any).userId;

      // Créer une notification système pour l'utilisateur lui-même
      if (userId) {
        const statusMessage = newStatus === 'completed' ? 'terminée' : newStatus === 'in_progress' ? 'en cours' : 'en attente';

        await prisma.notification.create({
          data: {
            type: 'task_self_update',
            title: 'Tâche mise à jour',
            message: `Tâche "${todo.title}" marquée comme ${statusMessage}`,
            recipientId: userId,
            senderId: userId, // Lui-même
            todoId: req.validatedId!,
            todoTitle: todo.title
          }
        });
      }

      // Créer une notification au créateur ou assignateur pour tous les changements de statut par quelqu'un d'autre
      if (oldTodo && userId) {
        let recipientId: number | null = oldTodo.userId;

        // Si la tâche est assignée et que l'utilisateur actuel est l'assigné, notifier l'assignateur
        if (oldTodo.assignedToId && oldTodo.assignedToId === userId) {
          recipientId = oldTodo.userId; // L'assignateur reçoit la notification
        } else if (oldTodo.userId !== userId) {
          recipientId = oldTodo.userId; // Le propriétaire reçoit la notification
        } else {
          recipientId = null; // Pas de notification si c'est le propriétaire qui modifie sa propre tâche
        }

        if (recipientId && recipientId !== userId) {
          const modifier = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true }
          });

          const statusMessage = newStatus === 'completed' ? 'terminée' :
                               newStatus === 'in_progress' ? 'en cours' : 'en attente';

          await prisma.notification.create({
            data: {
              type: newStatus === 'completed' ? 'task_completed' : 'task_updated',
              title: newStatus === 'completed' ? 'Tâche terminée' : 'Tâche mise à jour',
              message: `${modifier?.name || 'Quelqu\'un'} a ${newStatus === 'completed' ? 'terminé' : 'modifié'} votre tâche "${todo.title}"`,
              recipientId: recipientId,
              senderId: userId,
              todoId: req.validatedId!,
              todoTitle: todo.title
            }
          });
        }
      }

      return HttpResponse.success(res, todo);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors du changement de statut", 400, error);
    }
  };

  remove = async (req: AuthRequest, res: Response) => {
    try {
      const id = this.parseIdParam(req.params.id);
      if (id === null) {
        return HttpResponse.error(res, "ID invalide", 400);
      }

      await this.todoService.deleteTodo(id);
      return res.status(204).send();
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la suppression", 400, error);
    }
  };

  delegate = async (req: AuthRequest, res: Response) => {
    try {
      const id = this.parseIdParam(req.params.id);
      if (id === null) {
        return HttpResponse.error(res, "ID invalide", 400);
      }

      const { assignedToId } = req.body;
      if (!assignedToId) {
        return HttpResponse.error(res, "assignedToId est requis", 400);
      }

      const assignedToIdNum = Number(assignedToId);
      if (isNaN(assignedToIdNum)) {
        return HttpResponse.error(res, "assignedToId doit être un nombre valide", 400);
      }

      const todo = await this.todoService.delegateTodo(id, assignedToIdNum, req.userId);

      logger.info('Task assigned', {
        todoId: id,
        assignedToId: assignedToIdNum,
        assignerId: req.userId,
        todoTitle: todo.title
      });

      // Créer une notification pour l'utilisateur assigné seulement si ce n'est pas lui-même
      if (req.userId !== assignedToIdNum) {
        try {
          const notification = await prisma.notification.create({
            data: {
              type: 'task_assigned',
              title: 'Nouvelle tâche assignée',
              message: `Une tâche vous a été assignée: "${todo.title}"`,
              recipientId: assignedToIdNum,
              senderId: req.userId || null,
              todoId: id,
              todoTitle: todo.title
            }
          });

          logger.info('Task assignment notification created', {
            notificationId: notification.id,
            recipientId: assignedToIdNum,
            todoId: id
          });

          // Envoyer la notification en temps réel via WebSocket
          const notificationData = {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            sender: req.userId ? await prisma.user.findUnique({
              where: { id: req.userId },
              select: { id: true, name: true, profileImageUrl: true }
            }) : null,
            todoId: notification.todoId,
            todoTitle: notification.todoTitle,
            createdAt: notification.createdAt,
            isRead: false
          };

          sendNotification(assignedToIdNum, notificationData);
          logger.info('Real-time notification sent', { userId: assignedToIdNum, notificationId: notification.id });
        } catch (error) {
          logger.error('Error creating/sending notification', {
            error: error instanceof Error ? error.message : String(error),
            todoId: id,
            recipientId: assignedToIdNum
          });
        }
      } else {
        logger.debug('No notification created (self-assignment)', { userId: req.userId, todoId: id });
      }

      return HttpResponse.success(res, { message: "Tâche déléguée avec succès", todo });
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la délégation", 400, error);
    }
  };

  updateAudio = async (req: AuthRequest, res: Response) => {
    try {
      const id = this.parseIdParam(req.params.id);
      if (id === null) {
        return HttpResponse.error(res, "ID invalide", 400);
      }

      const { audioUrl } = req.body;
      if (!audioUrl) {
        return HttpResponse.error(res, "audioUrl est requis", 400);
      }

      const todo = await this.todoService.updateAudio(id, audioUrl);
      return HttpResponse.success(res, todo);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la mise à jour de l'audio", 400, error);
    }
  };

  updateImage = async (req: AuthRequest, res: Response) => {
    try {
      const id = this.parseIdParam(req.params.id);
      if (id === null) {
        return HttpResponse.error(res, "ID invalide", 400);
      }

      const { imageUrl } = req.body;
      if (!imageUrl) {
        return HttpResponse.error(res, "imageUrl est requis", 400);
      }

      const todo = await this.todoService.updateImage(id, imageUrl);
      return HttpResponse.success(res, todo);
    } catch (error: any) {
      return HttpResponse.error(res, "Erreur lors de la mise à jour de l'image", 400, error);
    }
  };
}
