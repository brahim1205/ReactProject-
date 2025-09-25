import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, User, CheckCircle, Clock, AlertCircle } from "lucide-react";

const TodoFilters = ({ filter, todos, search, setSearch, currentUser }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const urgentCount = todos.filter((t) => t.priority === "Urgente").length;
  const mediumCount = todos.filter((t) => t.priority === "Moyenne").length;
  const lowCount = todos.filter((t) => t.priority === "Basse").length;
  const totalCount = todos.length;

  const myTasksCount = todos.filter((t) => t.userId === currentUser?.id || t.createdBy === currentUser?.name).length;
  const assignedToMeCount = todos.filter((t) => t.assignedToId === currentUser?.id).length;

  const pendingCount = todos.filter((t) => t.status === "pending").length;
  const inProgressCount = todos.filter((t) => t.status === "in_progress").length;
  const completedCount = todos.filter((t) => t.status === "completed").length;

  const tabs = [
    { id: "all", label: "Tous", count: totalCount, icon: Filter },
    { id: "priority", label: "Priorité", count: urgentCount + mediumCount + lowCount, icon: AlertCircle },
    { id: "personal", label: "Mes tâches", count: myTasksCount + assignedToMeCount, icon: User },
    { id: "status", label: "Statut", count: pendingCount + inProgressCount + completedCount, icon: Clock },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "all":
        return (
          <div className="space-y-2">
            <button
              className={`btn btn-soft w-full justify-start ${filter === "Tous" ? "btn-primary" : ""}`}
              onClick={() => navigate("/dashboard")}
              aria-label={`Voir toutes les tâches (${totalCount})`}
            >
              <Filter className="w-4 h-4 mr-2" />
              <span>Toutes les tâches</span>
              <span className="badge badge-ghost ml-auto">{totalCount}</span>
            </button>
          </div>
        );

      case "priority":
        return (
          <div className="space-y-2">
            <button
              className={`btn btn-soft w-full justify-start ${filter === "Urgente" ? "btn-error" : ""}`}
              onClick={() => navigate("/dashboard/urgent")}
              aria-label={`Filtrer par priorité urgente (${urgentCount})`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>Urgente</span>
              <span className="badge badge-ghost ml-auto">{urgentCount}</span>
            </button>

            <button
              className={`btn btn-soft w-full justify-start ${filter === "Moyenne" ? "btn-warning" : ""}`}
              onClick={() => navigate("/dashboard/moyenne")}
              aria-label={`Filtrer par priorité moyenne (${mediumCount})`}
            >
              <Clock className="w-4 h-4 mr-2" />
              <span>Moyenne</span>
              <span className="badge badge-ghost ml-auto">{mediumCount}</span>
            </button>

            <button
              className={`btn btn-soft w-full justify-start ${filter === "Basse" ? "btn-info" : ""}`}
              onClick={() => navigate("/dashboard/basse")}
              aria-label={`Filtrer par priorité basse (${lowCount})`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Basse</span>
              <span className="badge badge-ghost ml-auto">{lowCount}</span>
            </button>
          </div>
        );

      case "personal":
        return (
          <div className="space-y-2">
            <button
              className={`btn btn-soft w-full justify-start ${filter === "Mes tâches" ? "btn-primary" : ""}`}
              onClick={() => navigate("/dashboard/mes-taches")}
              aria-label={`Voir mes tâches (${myTasksCount})`}
            >
              <User className="w-4 h-4 mr-2" />
              <span>Mes tâches</span>
              <span className="badge badge-ghost ml-auto">{myTasksCount}</span>
            </button>

            <button
              className={`btn btn-soft w-full justify-start ${filter === "Assignées à moi" ? "btn-secondary" : ""}`}
              onClick={() => navigate("/dashboard/assigner-a-moi")}
              aria-label={`Voir les tâches assignées à moi (${assignedToMeCount})`}
            >
              <User className="w-4 h-4 mr-2" />
              <span>Assignées à moi</span>
              <span className="badge badge-ghost ml-auto">{assignedToMeCount}</span>
            </button>
          </div>
        );

      case "status":
        return (
          <div className="space-y-2">
            <button
              className={`btn btn-soft w-full justify-start ${filter === "En attente" ? "btn-info" : ""}`}
              onClick={() => navigate("/dashboard/en-attente")}
              aria-label={`Voir les tâches en attente (${pendingCount})`}
            >
              <Clock className="w-4 h-4 mr-2" />
              <span>En attente</span>
              <span className="badge badge-ghost ml-auto">{pendingCount}</span>
            </button>

            <button
              className={`btn btn-soft w-full justify-start ${filter === "En cours" ? "btn-warning" : ""}`}
              onClick={() => navigate("/dashboard/en-cours")}
              aria-label={`Voir les tâches en cours (${inProgressCount})`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>En cours</span>
              <span className="badge badge-ghost ml-auto">{inProgressCount}</span>
            </button>

            <button
              className={`btn btn-soft w-full justify-start ${filter === "Terminée" ? "btn-success" : ""}`}
              onClick={() => navigate("/dashboard/terminee")}
              aria-label={`Voir les tâches terminées (${completedCount})`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>Terminée</span>
              <span className="badge badge-ghost ml-auto">{completedCount}</span>
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 flex-1 h-fit mb-6">
      <div className="join w-full">
        <div className="join-item flex items-center px-3 bg-base-200">
          <Search className="w-4 h-4 text-base-content/60" />
        </div>
        <input
          id="todo-search"
          name="todo-search"
          type="text"
          placeholder="Rechercher..."
          className="input input-bordered join-item flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher des tâches par titre"
          autoComplete="off"
        />
      </div>

      <div className="tabs tabs-boxed bg-base-100 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab tab-sm ${activeTab === tab.id ? "tab-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              aria-label={`Voir les filtres ${tab.label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="badge badge-xs ml-1">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-base-100 rounded-lg p-3 border">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TodoFilters;