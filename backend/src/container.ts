import { PrismaClient } from '@prisma/client';
import { TodoService } from './services/TodoService';
import { ValidationService } from './services/ValidationService';
import { NotificationService } from './services/NotificationService';
import { TodoRepository } from './repositories/TodoRepository';
import { UserRepository } from './repositories/UserRepository';
import { ScheduledTaskUpdater, startScheduledTaskUpdater } from './services/ScheduledTaskUpdater';


class DependencyContainer {
  private static instance: DependencyContainer;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  getTodoRepository() {
    return new TodoRepository(this.prisma);
  }

  getUserRepository() {
    return new UserRepository(this.prisma);
  }

  getValidationService() {
    return new ValidationService();
  }

  getNotificationService() {
    return new NotificationService(this.prisma);
  }

  getTodoService() {
    return new TodoService(
      this.getTodoRepository(),
      this.getValidationService(),
      this.getNotificationService()
    );
  }

  getScheduledTaskUpdater() {
    return new ScheduledTaskUpdater(this.prisma);
  }

  startScheduledTaskUpdater(intervalMinutes: number = 1) {
    return startScheduledTaskUpdater(this.prisma, intervalMinutes);
  }

  getPrisma() {
    return this.prisma;
  }
}

export const container = DependencyContainer.getInstance();