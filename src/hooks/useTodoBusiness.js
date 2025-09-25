import { useMemo } from 'react';
import { container } from '../container.js';


export const useTodoBusiness = () => {
  const todoBusinessService = useMemo(() => container.getTodoBusinessService(), []);

  const getAllTodos = async () => {
    return todoBusinessService.getAllTodos();
  };

  const createTodo = async (data) => {
    return todoBusinessService.createTodo(data);
  };

  const updateTodo = async (id, data) => {
    return todoBusinessService.updateTodo(id, data);
  };

  const deleteTodo = async (id) => {
    return todoBusinessService.deleteTodo(id);
  };

  const delegateTodo = async (id, assignedToId) => {
    return todoBusinessService.delegateTodo(id, assignedToId);
  };

  const updateImage = async (id, imageUrl) => {
    return todoBusinessService.updateImage(id, imageUrl);
  };

  const toggleComplete = async (id, completed) => {
    return todoBusinessService.toggleComplete(id, completed);
  };

  return {
    getAllTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    delegateTodo,
    updateImage,
    toggleComplete,
  };
};