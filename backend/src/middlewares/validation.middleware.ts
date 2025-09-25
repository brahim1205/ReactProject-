import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface ValidatedRequest extends Request {
  validatedId?: number;
  validatedData?: any;
}


export const validateId = (req: ValidatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      logger.warn('Invalid ID parameter', { id: req.params.id, path: req.path });
      return res.status(400).json({
        success: false,
        message: "ID invalide",
        timestamp: new Date().toISOString()
      });
    }

    req.validatedId = id;
    next();
  } catch (error) {
    logger.error('Error validating ID', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({
      success: false,
      message: "Erreur de validation",
      timestamp: new Date().toISOString()
    });
  }
};


export const validateStatus = (req: ValidatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'completed'];

    if (!status || !validStatuses.includes(status)) {
      logger.warn('Invalid status parameter', { status, validStatuses });
      return res.status(400).json({
        success: false,
        message: `Le champ 'status' doit être l'un des suivants: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }

    req.validatedData = { status };
    next();
  } catch (error) {
    logger.error('Error validating status', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({
      success: false,
      message: "Erreur de validation",
      timestamp: new Date().toISOString()
    });
  }
};


export const validateAssignment = (req: ValidatedRequest, res: Response, next: NextFunction) => {
  try {
    const { assignedToId } = req.body;

    if (assignedToId === undefined) {
      logger.warn('Missing assignedToId parameter');
      return res.status(400).json({
        success: false,
        message: "assignedToId est requis",
        timestamp: new Date().toISOString()
      });
    }

    if (assignedToId === null) {
      req.validatedData = { assignedToId: null };
      return next();
    }

    const assignedToIdNum = Number(assignedToId);
    if (isNaN(assignedToIdNum) || assignedToIdNum <= 0) {
      logger.warn('Invalid assignedToId parameter', { assignedToId });
      return res.status(400).json({
        success: false,
        message: "assignedToId doit être un nombre valide positif ou null",
        timestamp: new Date().toISOString()
      });
    }

    req.validatedData = { assignedToId: assignedToIdNum };
    next();
  } catch (error) {
    logger.error('Error validating assignment', { error: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({
      success: false,
      message: "Erreur de validation",
      timestamp: new Date().toISOString()
    });
  }
};

export const validateRequired = (fields: string[]) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction) => {
    try {
      const missingFields = fields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        logger.warn('Missing required fields', { missingFields });
        return res.status(400).json({
          success: false,
          message: `Champs requis manquants: ${missingFields.join(', ')}`,
          timestamp: new Date().toISOString()
        });
      }

      next();
    } catch (error) {
      logger.error('Error validating required fields', { error: error instanceof Error ? error.message : String(error) });
      return res.status(500).json({
        success: false,
        message: "Erreur de validation",
        timestamp: new Date().toISOString()
      });
    }
  };
};