  import { useEffect, useState } from "react";
import TodoItem from "./TodoItems";
import { Construction } from "lucide-react";

const TodoList = ({
  todos,
  users,
  currentUser,
  filter,
  search,
  onToggleComplete,
  onUpdate,
  onAssign,
  onDelete,
  loading,
  updatingIds = new Set()
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search]);

  let filteredTodos = [];

  if (filter === "Tous") {
    filteredTodos = todos;
  } else if (filter === "Mes tâches") {
    filteredTodos = todos.filter((todo) =>
      todo.userId === currentUser?.id || todo.createdBy === currentUser?.name
    );
  } else if (filter === "Assignées à moi") {
    filteredTodos = todos.filter((todo) => todo.assignedToId === currentUser?.id);
  } else if (filter === "En attente") {
    filteredTodos = todos.filter((todo) => todo.status === "pending");
  } else if (filter === "En cours") {
    filteredTodos = todos.filter((todo) => todo.status === "in_progress");
  } else if (filter === "Terminée") {
    filteredTodos = todos.filter((todo) => todo.status === "completed");
  } else {
    filteredTodos = todos.filter((todo) => todo.priority === filter);
  }

  // Apply search filter
  if (search.trim()) {
    const searchLower = search.toLowerCase();
    filteredTodos = filteredTodos.filter((todo) =>
      (todo.title || todo.text || "").toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredTodos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTodos = filteredTodos.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center flex-col p-10">
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm mt-4">Chargement des tâches...</p>
      </div>
    );
  }

  if (paginatedTodos.length > 0) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {paginatedTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onDelete={() => onDelete(todo.id)}
              onToggleComplete={onToggleComplete}
              onUpdate={onUpdate}
              onAssign={onAssign}
              currentUser={currentUser}
              users={users}
              isUpdating={updatingIds.has(todo.id)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              className="btn btn-circle btn-outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ‹
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} sur {totalPages}
            </span>

            <button
              className="btn btn-circle btn-outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              ›
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col p-5">
      <div>
        <Construction strokeWidth={1} className="w-40 h-40 text-primary" />
      </div>
      <p className="text-sm">Aucune tâche pour ce filtre</p>
    </div>
  );
};

export default TodoList;