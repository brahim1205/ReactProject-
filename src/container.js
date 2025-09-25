import { ValidationService } from './services/business/ValidationService.js';
import { TodoBusinessService } from './services/business/TodoBusinessService.js';
import { AuthBusinessService } from './services/business/AuthBusinessService.js';
import { todoService } from './services/todoService.js';
import { authService } from './services/authService.js';


class DependencyContainer {
  constructor() {
    this.validationService = null;
    this.todoBusinessService = null;
    this.authBusinessService = null;
  }

  static getInstance() {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  getValidationService() {
    if (!this.validationService) {
      this.validationService = new ValidationService();
    }
    return this.validationService;
  }

  getTodoBusinessService() {
    if (!this.todoBusinessService) {
      this.todoBusinessService = new TodoBusinessService(
        todoService,
        this.getValidationService()
      );
    }
    return this.todoBusinessService;
  }

  getAuthBusinessService() {
    if (!this.authBusinessService) {
      this.authBusinessService = new AuthBusinessService(
        authService,
        this.getValidationService()
      );
    }
    return this.authBusinessService;
  }

  // Services API (pour compatibilité)
  getTodoService() {
    return todoService;
  }

  getAuthService() {
    return authService;
  }
}

export const container = DependencyContainer.getInstance();