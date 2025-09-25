import api from './api.js';

export const todoService = {
  async getAllTodos() {
    try {
      const response = await api.get('/todo');
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des tâches' };
    }
  },

  
  async createTodo(todoData) {
    try {
      const response = await api.post('/todo', todoData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la tâche' };
    }
  },


  async createTodoWithImage(formData) {
    try {
      const response = await api.post('/todo/with-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: "Erreur lors de la création de la tâche avec image" };
    }
  },

  async createTodoWithAudio(formData) {
    try {
      const response = await api.post('/todo/with-audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: "Erreur lors de la création de la tâche avec audio" };
    }
  },

  async createTodoWithMedia(formData) {
    try {
      const response = await api.post('/todo/with-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: "Erreur lors de la création de la tâche avec média" };
    }
  },


  async updateTodo(id, todoData) {
    try {
      const response = await api.patch(`/todo/${id}`, todoData);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification de la tâche' };
    }
  },


  async toggleComplete(id, completed) {
    try {
      const status = completed ? 'completed' : 'pending';
      const response = await api.patch(`/todo/${id}/toggle-complete`, { status });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du marquage de la tâche' };
    }
  },


  async assignTodo(id, assignedToId) {
    try {
      const response = await api.patch(`/todo/${id}/delegate`, { assignedToId });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'assignation de la tâche' };
    }
  },


  async deleteTodo(id) {
    try {
      const response = await api.delete(`/todo/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la tâche' };
    }
  },


  async updateImage(id, imageUrl) {
    try {
      const response = await api.patch(`/todo/${id}/image`, { imageUrl });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la mise à jour de l\'image' };
    }
  },

};
