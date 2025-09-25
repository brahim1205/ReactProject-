
export class ValidationService {

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }


  validatePassword(password) {
    const errors = [];

    if (!password || password.length < 4) {
      errors.push("Le mot de passe doit contenir au moins 4 caractères");
    }

    return errors;
  }


  validateUserRegistration(data) {
    const errors = [];

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

  validateTodoCreation(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push("Le titre de la tâche est obligatoire");
    }

    if (!data.userId || data.userId <= 0) {
      errors.push("L'ID de l'utilisateur est obligatoire");
    }

    return errors;
  }

  validateTodoUpdate(data) {
    const errors = [];

    if (data.assignedToId !== undefined && (data.assignedToId <= 0)) {
      errors.push("ID d'utilisateur assigné invalide");
    }

    return errors;
  }
}