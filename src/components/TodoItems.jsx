import { useMemo, useState, useEffect, useRef, memo, useCallback } from "react";
import { Trash, User, Calendar, Clock, Edit2, Check, X, UserPlus, Bell, MoreVertical } from "lucide-react";
import AudioVisualizer from "./AudioVisualizer";

const TodoItem = memo(({ todo, onDelete, onToggleComplete, onUpdate, onAssign, currentUser, users, isUpdating = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.title || todo.text);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const dropdownRef = useRef(null);
  const actionsMenuRef = useRef(null);
  const audioRef = useRef(null);
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users || [];
    return (users || []).filter(u => (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q));
  }, [search, users]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isMounted) return;

      if (dropdownRef.current && dropdownRef.current.contains && !dropdownRef.current.contains(event.target)) {
        setShowAssignDropdown(false);
      }
      if (actionsMenuRef.current && actionsMenuRef.current.contains && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showAssignDropdown || showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAssignDropdown, showActionsMenu, isMounted]);

  const isOwner = todo.userId === currentUser?.id || todo.createdBy === currentUser?.name;
  const isAssigned = todo.assignedToId === currentUser?.id;
  const canEdit = (isOwner || isAssigned) && todo.status !== 'completed';
  const canAssign = isOwner && todo.status !== 'completed';
  const canUnassign = isAssigned && todo.status !== 'completed'; // L'utilisateur assigné peut se désassigner
  const canToggleComplete = (isOwner || isAssigned) && todo.status !== 'completed';
  const canDelete = isOwner;

  const handleSaveEdit = useCallback(() => {
    if (editText.trim() && canEdit) {
      onUpdate(todo.id, editText.trim(), todo.priority); // Garder la priorité existante
      setIsEditing(false);
    }
  }, [editText, canEdit, onUpdate, todo.id, todo.priority]);

  const handleCancelEdit = useCallback(() => {
    setEditText(todo.title || todo.text);
    setIsEditing(false);
  }, [todo.title, todo.text]);

  const handleAssign = useCallback((userId) => {
    if (canAssign) {
      onAssign(todo.id, userId);
      setShowAssignDropdown(false);
    }
  }, [canAssign, onAssign, todo.id]);

  const stop = (e) => e.stopPropagation();

  if (!isMounted) {
    return null;
  }

  return (
    <div
      className={`card bg-base-100 shadow-lg ${
        todo.status === 'completed' ? 'border-2 border-success/60' :
        todo.status === 'in_progress' ? 'border-2 border-warning/60' :
        'border border-base-200'
      }`}
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {canToggleComplete && (
                <div className="relative">
                  <input
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); !isUpdating && onToggleComplete(todo.id); }}
                    type="checkbox"
                    className={`checkbox checkbox-sm ${
                      todo.status === 'completed' ? 'checkbox-success' :
                      todo.status === 'in_progress' ? 'checkbox-warning' :
                      'checkbox-info'
                    } ${isUpdating ? 'opacity-50' : ''}`}
                    checked={todo.status === 'completed'}
                    readOnly
                    disabled={isUpdating}
                  />
                  {isUpdating && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="loading loading-spinner loading-xs"></div>
                    </div>
                  )}
                </div>
              )}

              {isEditing ? (
                <div className="flex-1">
                  <input
                    type="text"
                    className="input input-sm input-bordered w-full"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Modifier le titre de la tâche..."
                  />
                </div>
              ) : (
                <>
                  <span className={`text-lg font-bold ${todo.status === 'completed' ? 'line-through text-base-content/60' : ''}`}>
                    {todo.title || todo.text}
                  </span>

                  {(todo.startDateTime || todo.endDateTime) && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs bg-info/20 text-info px-2 py-1 rounded-full">
                        📅 Planifiée
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
               <span
                 className={`badge badge-sm ${
                   todo.priority === "Urgente"
                     ? "badge-error"
                     : todo.priority === "Moyenne"
                     ? "badge-warning"
                     : "badge-success"
                 }`}
               >
                 {todo.priority}
               </span>

               <span className={`inline-flex items-center gap-1 badge badge-sm ${
                 todo.status === 'completed' ? 'badge-success' :
                 todo.status === 'in_progress' ? 'badge-warning' :
                 'badge-info'
               }`}>
                 <span className="w-2 h-2 rounded-full bg-current"></span>
                 {todo.status === 'completed' ? 'Terminée' :
                  todo.status === 'in_progress' ? 'En cours' :
                  'En attente'}
               </span>

               {todo.assignedTo && (
                 <span className="inline-flex items-center gap-1 badge badge-sm badge-primary">
                   <User className="w-3 h-3" />
                   Assignée à {todo.assignedTo.name}
                 </span>
               )}
             </div>

            {todo.imageUrl && (
              <div className="mb-3">
                <img src={`http://localhost:3011${todo.imageUrl}`} alt="Tâche" className="w-full h-32 object-cover rounded" />
              </div>
            )}
             {todo.audioUrl && todo.audioUrl.startsWith('/uploads/') && (
               <div className="mb-3">
                 {console.log(`🎵 Rendering audio for todo ${todo.id}: ${todo.audioUrl}`)}
                 <audio
                   ref={audioRef}
                   controls
                   className="w-full"
                   preload="metadata"
                   onPlay={() => setIsAudioPlaying(true)}
                   onPause={() => setIsAudioPlaying(false)}
                   onEnded={() => setIsAudioPlaying(false)}
                   onTimeUpdate={(e) => {
                     // Limiter la lecture à 30 secondes maximum
                     if (e.target.currentTime >= 30) {
                       e.target.pause();
                       e.target.currentTime = 0;
                       setIsAudioPlaying(false);
                     }
                   }}
                   onError={(e) => {
                     console.error('Audio load error for todo', todo.id, ':', e);
                     console.error('Failed URL:', `http://localhost:3011${todo.audioUrl}`);
                   }}
                 >
                   <source src={`http://localhost:3011${todo.audioUrl}`} type="audio/webm" />
                   <source src={`http://localhost:3011${todo.audioUrl}`} type="audio/mp4" />
                   <source src={`http://localhost:3011${todo.audioUrl}`} type="audio/wav" />
                   <source src={`http://localhost:3011${todo.audioUrl}`} type="audio/mpeg" />
                   Votre navigateur ne supporte pas l'élément audio.
                 </audio>
                 <div className="text-xs text-base-content/60 mt-1">
                   Lecture limitée à 30 secondes
                 </div>
                 <AudioVisualizer
                   isPlaying={isAudioPlaying}
                 />
               </div>
             )}
             {todo.audioUrl && !todo.audioUrl.startsWith('/uploads/') && (
               <div className="mb-3 text-warning text-sm">
                 ⚠️ Audio blob détecté (ignoré): {todo.audioUrl.substring(0, 50)}...
               </div>
             )}


            <div className="flex flex-col gap-1 text-sm text-base-content/70">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Créé par: <strong>{todo.user?.name || todo.createdBy}</strong></span>
              </div>

              {todo.assignedTo && (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Assigné à: <strong>{todo.assignedTo.name}</strong></span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Créé le {new Date(todo.createdAt).toLocaleDateString('fr-FR')} à {new Date(todo.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {todo.completedAt && (
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span>Terminée le {new Date(todo.completedAt).toLocaleDateString('fr-FR')} à {new Date(todo.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {todo.startDateTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-info" />
                  <span>Début: {new Date(todo.startDateTime).toLocaleDateString('fr-FR')} à {new Date(todo.startDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {todo.endDateTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  <span>Fin: {new Date(todo.endDateTime).toLocaleDateString('fr-FR')} à {new Date(todo.endDateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSaveEdit(); }}
                  className="btn btn-sm btn-success btn-outline"
                  aria-label="Sauvegarder les modifications"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCancelEdit(); }}
                  className="btn btn-sm btn-ghost btn-outline"
                  aria-label="Annuler les modifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {canAssign && (
                  <div ref={dropdownRef} className={`dropdown dropdown-left ${showAssignDropdown ? 'dropdown-open' : ''}`}>
                    <button
                      className="btn btn-sm btn-warning btn-outline"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAssignDropdown(!showAssignDropdown); }}
                      aria-label="Assigner la tâche"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    {showAssignDropdown && (
                      <ul className="dropdown-content z-[10] menu p-2 shadow-lg bg-base-100 rounded-box w-72 max-h-80 overflow-auto border border-base-300">
                        <li className="menu-title">
                          <span className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4" />
                            Assigner la tâche
                          </span>
                        </li>

                        <li className="px-2 py-2">
                          <div className="form-control">
                            <input
                              id={`search-users-${todo.id}`}
                              name={`search-users-${todo.id}`}
                              type="text"
                              className="input input-sm input-bordered w-full"
                              placeholder="Rechercher un utilisateur..."
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoComplete="off"
                              aria-label="Rechercher un utilisateur à assigner"
                            />
                          </div>
                        </li>

                        {canUnassign && (
                          <>
                            <li className="divider my-1"></li>
                            <li>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm w-full text-left justify-start text-error hover:bg-error/10"
                                onClick={(e) => { stop(e); handleAssign(null); }}
                                aria-label="Se désassigner de la tâche"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Se désassigner
                              </button>
                            </li>
                          </>
                        )}

                        {filteredUsers && filteredUsers.length > 0 && (
                          <>
                            {(canUnassign || todo.assignedToId) && <li className="divider my-1"></li>}
                            <li className="menu-title text-xs opacity-70">
                              <span>Utilisateurs disponibles</span>
                            </li>
                            {filteredUsers.map(user => (
                              <li key={user.id}>
                                <button
                                  type="button"
                                  className={`btn btn-ghost btn-sm w-full text-left justify-start ${
                                    user.id === todo.assignedToId ? 'bg-primary/10 text-primary' : ''
                                  }`}
                                  onClick={(e) => { stop(e); handleAssign(user.id); }}
                                  aria-label={`Assigner la tâche à ${user.name}`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{user.name}</span>
                                    {user.id === todo.assignedToId && (
                                      <Check className="w-4 h-4 text-primary" />
                                    )}
                                  </div>
                                </button>
                              </li>
                            ))}
                          </>
                        )}

                        {(!filteredUsers || filteredUsers.length === 0) && (
                          <li className="px-4 py-2 text-center text-sm opacity-60">
                            {search.trim() ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}

                {(canEdit || canDelete) && (
                  <div ref={actionsMenuRef} className={`dropdown dropdown-left ${showActionsMenu ? 'dropdown-open' : ''}`}>
                    <button
                      className="btn btn-sm btn-ghost btn-outline"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowActionsMenu(!showActionsMenu); }}
                      aria-label="Ouvrir le menu d'actions"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {showActionsMenu && (
                      <ul className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-40">
                        {canEdit && (
                          <li>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm w-full text-left justify-start"
                              onClick={(e) => { stop(e); setIsEditing(true); setShowActionsMenu(false); }}
                              aria-label="Modifier la tâche"
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Modifier
                            </button>
                          </li>
                        )}

                        {canDelete && (
                          <li>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm w-full text-left justify-start text-error"
                              onClick={(e) => { stop(e); onDelete(); setShowActionsMenu(false); }}
                              aria-label="Supprimer la tâche"
                            >
                              <Trash className="w-4 h-4 mr-2" />
                              Supprimer
                            </button>
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

TodoItem.displayName = 'TodoItem';

const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.todo.id === nextProps.todo.id &&
    prevProps.todo.title === nextProps.todo.title &&
    prevProps.todo.status === nextProps.todo.status &&
    prevProps.todo.priority === nextProps.todo.priority &&
    prevProps.todo.assignedToId === nextProps.todo.assignedToId &&
    prevProps.isUpdating === nextProps.isUpdating &&
    prevProps.currentUser?.id === nextProps.currentUser?.id &&
    prevProps.users?.length === nextProps.users?.length
  );
};

export default memo(TodoItem, arePropsEqual);
