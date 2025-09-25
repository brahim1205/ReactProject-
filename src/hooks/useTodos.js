import { useState, useEffect, useCallback } from "react";
import { useTodoBusiness } from "./useTodoBusiness.js";
import { userService } from "../services/userService.js";
import { useToastContext } from "../contexts/ToastContext.jsx";


export const useTodos = (currentUser) => {
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState(new Set());

  const todoBusiness = useTodoBusiness();
  const { showError, showSuccess } = useToastContext();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [todosData, usersData] = await Promise.all([
        todoBusiness.getAllTodos(),
        userService.getAllUsers()
      ]);
      setTodos(todosData);
      setUsers(usersData);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      showError("Erreur de chargement", "Impossible de charger les données. Veuillez rafraîchir la page.");
    } finally {
      setLoading(false);
    }
  }, [todoBusiness, showError]);


  useEffect(() => {
    loadData();
  }, []); 

  const handleTodoAdded = useCallback((newTodo) => {
    setTodos(prev => [newTodo, ...prev]);
  }, []);

  const handleToggleComplete = useCallback(async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

    setUpdatingIds(prev => new Set([...prev, id]));

    const newTodos = todos.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        };
      }
      return t;
    });
    setTodos(newTodos);

    try {
      await todoBusiness.toggleComplete(id, newStatus === 'completed');
    } catch (error) {
      console.error("Erreur lors du marquage comme terminé:", error);
      showError("Erreur", "Impossible de mettre à jour la tâche");

      const revertedTodos = todos.map(t => {
        if (t.id === id) {
          return {
            ...t,
            status: todo.status,
            completedAt: todo.completedAt
          };
        }
        return t;
      });
      setTodos(revertedTodos);
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [todos, todoBusiness, showSuccess, showError]);

  const handleUpdateTodo = useCallback(async (id, newText, newPriority) => {
    const now = new Date();
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newTodos = todos.map(t => {
      if (t.id === id) {
        return {
          ...t,
          title: newText,
          priority: newPriority,
          updatedAt: now.toISOString(),
          updatedBy: currentUser?.name || "Utilisateur"
        };
      }
      return t;
    });
    setTodos(newTodos);

    try {
      await todoBusiness.updateTodo(id, {
        title: newText,
        priority: newPriority
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);

      const revertedTodos = todos.map(t => {
        if (t.id === id) {
          return {
            ...t,
            title: todo.title,
            priority: todo.priority,
            updatedAt: todo.updatedAt,
            updatedBy: todo.updatedBy
          };
        }
        return t;
      });
      setTodos(revertedTodos);
    }
  }, [todos, currentUser?.name, todoBusiness]);

  const handleAssignTodo = useCallback(async (id, assignedToId) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    try {
      const assignedUser = assignedToId ? users.find(u => u.id === assignedToId) : null;

      const newTodos = todos.map(t => {
        if (t.id === id) {
          return {
            ...t,
            assignedTo: assignedUser,
            assignedToId: assignedToId
          };
        }
        return t;
      });
      setTodos(newTodos);

      await todoBusiness.delegateTodo(id, assignedToId);
    } catch (error) {
      console.error("Erreur lors de l'assignation:", error);
      showError("Erreur d'assignation", assignedToId ? "Impossible d'assigner la tâche" : "Impossible de se désassigner");

      const revertedTodos = todos.map(t => {
        if (t.id === id) {
          return {
            ...t,
            assignedTo: todo.assignedTo,
            assignedToId: todo.assignedToId
          };
        }
        return t;
      });
      setTodos(revertedTodos);
    }
  }, [todos, users, todoBusiness, showSuccess, showError]);

  const handleDeleteTodo = useCallback(async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newTodos = todos.filter(t => t.id !== id);
    setTodos(newTodos);

    try {
      await todoBusiness.deleteTodo(id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setTodos(prev => [todo, ...prev]);
    }
  }, [todos, todoBusiness]);

  return {
    todos,
    users,
    loading,
    updatingIds,
    handleTodoAdded,
    handleToggleComplete,
    handleUpdateTodo,
    handleAssignTodo,
    handleDeleteTodo
  };
};