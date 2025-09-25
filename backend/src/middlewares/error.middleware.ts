import { Request, Response, NextFunction } from "express";

// Classe d'erreur personnalisée
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Interface pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

// Gestionnaire d'erreurs global
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  let statusCode = 500;
  let message = "Erreur interne du serveur";
  let errors: ValidationError[] | undefined;

  // Erreur opérationnelle (prévue)
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Erreur de validation Prisma
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = "Erreur de validation";
  }
  // Erreur de contrainte de base de données
  else if (error.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    switch (prismaError.code) {
      case 'P2002':
        statusCode = 409;
        message = "Contrainte d'unicité violée";
        break;
      case 'P2025':
        statusCode = 404;
        message = "Ressource non trouvée";
        break;
      default:
        statusCode = 400;
        message = "Erreur de base de données";
    }
  }
  // Erreur de validation Zod
  else if (error.name === 'ZodError') {
    statusCode = 400;
    message = "Données invalides";
    errors = (error as any).errors?.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message
    }));
  }

  // Log de l'erreur en développement
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    });
  }

  // Réponse d'erreur standardisée
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
      error: error.message
    })
  });
};

// Middleware pour capturer les erreurs asynchrones
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware pour les routes non trouvées
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): Response => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} non trouvée`,
    timestamp: new Date().toISOString()
  });
};