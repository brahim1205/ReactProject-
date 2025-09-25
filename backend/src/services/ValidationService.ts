import { IValidationService, CreateUserDto, CreateTodoDto, UpdateTodoDto } from '../types/index.js';


export class ValidationService implements IValidationService {

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (!password || password.length < 4) {
      errors.push("Le mot de passe doit contenir au moins 4 caractères");
    }

    return errors;
  }


  validateUserRegistration(data: CreateUserDto): string[] {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push("Le nom est obligatoire");
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push("L'email est obligatoire");
    } else if (!this.validateEmail(data.email)) {
      errors.push("Format d'email invalide");
    }

    const passwordErrors = this.validatePassword(data.password);
    errors.push(...passwordErrors);

    return errors;
  }


  validateTodoCreation(data: CreateTodoDto): string[] {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push("Le titre de la tâche est obligatoire");
    }

    if (!data.userId || data.userId <= 0) {
      errors.push("L'ID de l'utilisateur est obligatoire");
    }

    return errors;
  }


  validateTodoUpdate(data: UpdateTodoDto): string[] {
    const errors: string[] = [];

    if (data.assignedToId !== undefined && (data.assignedToId <= 0)) {
      errors.push("ID d'utilisateur assigné invalide");
    }

    return errors;
  }
}