import { ITodoService, ITodoRepository, IValidationService, CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../types/index.js';
import { TodoRepository } from '../repositories/TodoRepository.js';
import { ValidationService } from './ValidationService.js';
import { NotificationService } from './NotificationService.js';


export class TodoService implements ITodoService {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly validationService: IValidationService,
    private readonly notificationService?: NotificationService
  ) {}

  async getAllTodos(): Promise<TodoResponseDto[]> {
    const todos = await this.todoRepository.findAll();
    console.log('Retrieved todos:', todos.map(t => ({ id: t.id, title: t.title, audioUrl: t.audioUrl })));
    return todos;
  }

  async getTodoById(id: number): Promise<TodoResponseDto | null> {
    return this.todoRepository.findById(id);
  }

  async createTodo(data: CreateTodoDto): Promise<TodoResponseDto> {
    const validationErrors = this.validationService.validateTodoCreation(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    const todoData: CreateTodoDto = {
      ...data,
      priority: data.priority || 'Moyenne',
      createdBy: data.createdBy || 'Utilisateur',
    };

    return this.todoRepository.create(todoData);
  }

  async updateTodo(id: number, data: UpdateTodoDto, senderId?: number): Promise<TodoResponseDto> {
    const validationErrors = this.validationService.validateTodoUpdate(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    const existingTodo = await this.todoRepository.findById(id);
    if (!existingTodo) {
      throw new Error('Tâche non trouvée');
    }

    // Vérifier si la tâche est marquée comme terminée
    const wasCompleted = existingTodo.completed;
    const isBeingCompleted = data.completed === true && !wasCompleted;

    const updatedTodo = await this.todoRepository.update(id, data);

    // Créer une notification si la tâche vient d'être terminée
    if (isBeingCompleted && this.notificationService && existingTodo.assignedToId && senderId) {
      try {
        await this.notificationService.notifyTaskCompleted(id, existingTodo.title, senderId, existingTodo.assignedToId);
      } catch (error) {
        console.error('Erreur lors de la création de la notification de completion:', error);
        // Ne pas échouer l'opération principale si la notification échoue
      }
    }

    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    const existingTodo = await this.todoRepository.findById(id);
    if (!existingTodo) {
      throw new Error('Tâche non trouvée');
    }

    return this.todoRepository.delete(id);
  }


  async delegateTodo(id: number, assignedToId: number | null, senderId?: number): Promise<TodoResponseDto> {
    // Pour la désassignation, assignedToId peut être null
    if (assignedToId !== null && (assignedToId <= 0)) {
      throw new Error('ID d\'utilisateur assigné invalide');
    }

    const todo = await this.updateTodo(id, { assignedToId });

    // Créer une notification seulement si on assigne (pas pour la désassignation)
    if (this.notificationService && senderId && assignedToId !== null) {
      try {
        await this.notificationService.notifyTaskAssigned(id, todo.title, senderId, assignedToId);
      } catch (error) {
        console.error('Erreur lors de la création de la notification d\'assignation:', error);
        // Ne pas échouer l'opération principale si la notification échoue
      }
    }

    return todo;
  }


  async updateImage(id: number, imageUrl: string): Promise<TodoResponseDto> {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new Error('URL d\'image requise');
    }

    return this.updateTodo(id, { imageUrl: imageUrl.trim() });
  }
  async updateAudio(id: number, audioUrl: string): Promise<TodoResponseDto> {
    if (!audioUrl || audioUrl.trim().length === 0) {
      throw new Error('URL d\'audio requise');
    }

    return this.updateTodo(id, { audioUrl: audioUrl.trim() });
  }
}
