import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import { useTodos } from "./hooks/useTodos.js";
import { useSocket } from "./hooks/useSocket.js";
import Navigation from "./components/Navigation.jsx";
import AuthForm from "./components/AuthForm.jsx";
import AddTodoForm from "./components/AddTodoForm.jsx";
import TodoFilters from "./components/TodoFilters.jsx";
import TodoList from "./components/TodoList.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { useState } from "react";

function Dashboard() {
  const { user } = useAuth();
  const { "*": subpath } = useParams();
  const [search, setSearch] = useState("");

  // Initialiser la connexion WebSocket pour les notifications temps réel
  useSocket();

  const filterMap = {
    "": "Tous",
    "urgent": "Urgente",
    "moyenne": "Moyenne",
    "basse": "Basse",
    "mes-taches": "Mes tâches",
    "assigner-a-moi": "Assignées à moi",
    "en-attente": "En attente",
    "en-cours": "En cours",
    "terminee": "Terminée"
  };

  const filter = filterMap[subpath] || "Tous";
  const {
    todos,
    users,
    loading,
    updatingIds,
    handleTodoAdded,
    handleToggleComplete,
    handleUpdateTodo,
    handleAssignTodo,
    handleDeleteTodo
  } = useTodos(user);

  return (
    <div className="min-h-screen bg-base-200 overflow-hidden">
      <Navigation />
      <div className="flex justify-center">
        <div className="w-2/3 flex flex-col gap-4 my-15 bg-base-300 p-5 rounded-2xl overflow-hidden">
          <AddTodoForm onTodoAdded={handleTodoAdded} currentUser={user} />
          <TodoFilters
            filter={filter}
            todos={todos}
            search={search}
            setSearch={setSearch}
            currentUser={user}
          />
          <TodoList
            todos={todos}
            users={users}
            currentUser={user}
            filter={filter}
            search={search}
            onToggleComplete={handleToggleComplete}
            onUpdate={handleUpdateTodo}
            onAssign={handleAssignTodo}
            onDelete={handleDeleteTodo}
            loading={loading}
            updatingIds={updatingIds}
          />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function AppContent() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
