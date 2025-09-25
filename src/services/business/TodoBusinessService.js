
export class TodoBusinessService {

  constructor(apiService, validationService) {
    this.apiService = apiService;
    this.validationService = validationService;
  }


  async getAllTodos() {
    try {
      const todos = await this.apiService.getAllTodos();

      if (!Array.isArray(todos)) {
        console.error('Erreur: la réponse API n\'est pas un array:', todos);
        throw new Error('Format de réponse invalide');
      }

      return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Erreur métier lors de la récupération des tâches:', error);
      throw new Error('Impossible de récupérer les tâches');
    }
  }

  async createTodo(data) {

    const validationErrors = this.validationService.validateTodoCreation(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    const todoData = {
      ...data,
      priority: data.priority || 'Moyenne',
      createdBy: data.createdBy || 'Utilisateur',
    };

    try {
      return await this.apiService.createTodo(todoData);
    } catch (error) {
      console.error('Erreur métier lors de la création:', error);
      throw new Error('Impossible de créer la tâche');
    }
  }

  async updateTodo(id, data) {

    const validationErrors = this.validationService.validateTodoUpdate(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    if (!id || id <= 0) {
      throw new Error('ID de tâche invalide');
    }

    try {
      return await this.apiService.updateTodo(id, data);
    } catch (error) {
      console.error('Erreur métier lors de la mise à jour:', error);
      throw new Error('Impossible de mettre à jour la tâche');
    }
  }

  async deleteTodo(id) {
    if (!id || id <= 0) {
      throw new Error('ID de tâche invalide');
    }

    try {
      await this.apiService.deleteTodo(id);
    } catch (error) {
      console.error('Erreur métier lors de la suppression:', error);
      throw new Error('Impossible de supprimer la tâche');
    }
  }

  async delegateTodo(id, assignedToId) {
    if (assignedToId !== null && (assignedToId <= 0)) {
      throw new Error('ID d\'utilisateur assigné invalide');
    }

    return this.updateTodo(id, { assignedToId });
  }

  async updateImage(id, imageUrl) {
    if (!imageUrl || imageUrl.trim().length === 0) {
      throw new Error('URL d\'image requise');
    }

    return this.updateTodo(id, { imageUrl: imageUrl.trim() });
  }

  async toggleComplete(id, completed) {
    if (typeof completed !== 'boolean') {
      throw new Error('Le statut de completion doit être un booléen');
    }

    if (!id || id <= 0) {
      throw new Error('ID de tâche invalide');
    }

    try {
      return await this.apiService.toggleComplete(id, completed);
    } catch (error) {
      console.error('Erreur métier lors du basculement du statut:', error);
      throw new Error('Impossible de basculer le statut de la tâche');
    }
  }
}