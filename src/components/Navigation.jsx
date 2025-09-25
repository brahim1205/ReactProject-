import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useProfileImage } from '../hooks/useProfileImage.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { useToastContext } from '../contexts/ToastContext.jsx';
import { LogOut, User, LogIn, UserPlus, Camera, Bell } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, updateUser } = useAuth();
  const { uploadProfileImage } = useProfileImage();
  const { notifications, markAsRead, loading: notificationsLoading } = useNotifications(user?.id);
  const { showSuccess, showError } = useToastContext();

  const sortedNotifications = [...(notifications || [])].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredNotifications = sortedNotifications.filter(notification => notification.sender?.name);
  const filteredUnreadCount = filteredNotifications.filter(notification => !notification.isRead).length;
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && profileMenuRef.current.contains && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationsRef.current && notificationsRef.current.contains && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch {
      showError('Erreur', 'Impossible de marquer la notification comme lue');
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && user?.id) {
      try {
        const updatedUser = await uploadProfileImage(file, user.id);
        updateUser({ profileImageUrl: updatedUser.profileImageUrl });
        showSuccess('Photo de profil', 'Photo mise à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de l\'upload:', error);
        showError('Erreur', 'Impossible de mettre à jour la photo de profil');
      }
    }
    event.target.value = '';
  };

  const triggerFileInput = () => {
    document.getElementById('profile-image-upload').click();
  };

  return (
    <div className="navbar bg-gradient-to-r from-primary/10 via-base-100 to-secondary/10 shadow-lg">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">TodoList App</a>
      </div>
      <div className="flex-none gap-2">
        {isAuthenticated ? (
          <>
            <div ref={notificationsRef} className="dropdown dropdown-end">
              <button
                className={`btn btn-circle ${filteredUnreadCount > 0 ? 'btn-error' : 'btn-ghost'}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <div className="indicator">
                  <Bell className={`w-5 h-5 ${filteredUnreadCount > 0 ? 'text-white' : ''}`} />
                  {filteredUnreadCount > 0 && (
                    <span className="badge badge-xs badge-error indicator-item text-white">
                      {filteredUnreadCount > 99 ? '99+' : filteredUnreadCount}
                    </span>
                  )}
                </div>
              </button>
              {showNotifications && (
                <div className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-80 max-h-96 overflow-y-auto overflow-x-hidden">
                  <div className="py-2">
                    {notificationsLoading ? (
                      <div className="px-4 py-8 text-center">
                        <div className="loading loading-spinner loading-sm"></div>
                        <p className="text-xs text-base-content/50 mt-2">Chargement...</p>
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-base-content/50">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <div
                          key={`notification-${notification.id}`}
                          className={`px-2 py-3 hover:bg-base-200 cursor-pointer border-b border-base-200 last:border-b-0`}
                          onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                                {notification.sender?.profileImageUrl ? (
                                  <img
                                    src={`http://localhost:3011${notification.sender.profileImageUrl}`}
                                    alt={notification.sender.name}
                                    className="rounded-full w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-base-content break-words leading-tight">
                                    <span className="font-semibold">
                                      {notification.type === 'task_self_update' ? 'Vous' :
                                       notification.sender?.name || 'Système'}
                                    </span>
                                    {' '}
                                    {notification.type === 'task_assigned' ? 'vous a assigné une tâche' :
                                     notification.type === 'task_completed' ? 'a terminé votre tâche' :
                                     notification.type === 'task_updated' ? 'a modifié votre tâche' :
                                     notification.type === 'task_self_update' ? 'avez' :
                                     'a interagi avec votre tâche'}
                                  </p>
                                  <p className="text-xs text-base-content/60 mt-1 truncate">
                                    "{notification.title}"
                                  </p>
                                  <p className="text-xs text-base-content/50 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-1"></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div ref={profileMenuRef} className="dropdown dropdown-end">
              <button
                className="btn btn-ghost btn-circle avatar"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="w-8 rounded-full bg-primary flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img src={`http://localhost:3011${user.profileImageUrl}`} alt="Profile" />
                  ) : (
                    <User className="w-5 h-5 text-primary-content" />
                  )}
                </div>
              </button>
              {showProfileMenu && (
                <ul className="dropdown-content z-[10] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li className="menu-title">
                    <span>{user?.name || 'Utilisateur'}</span>
                  </li>
                  <li>
                    <button onClick={triggerFileInput} className="w-full text-left">
                      <Camera className="w-4 h-4" />
                      Changer photo
                    </button>
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfileImageUpload}
                    />
                  </li>
                  <li>
                    <button onClick={handleLogout} className="w-full text-left">
                      <LogOut className="w-4 h-4" />
                      Déconnexion
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-primary btn-sm">
              <LogIn className="w-4 h-4 mr-1" />
              Connexion
            </Link>
            <Link to="/register" className="btn btn-outline btn-sm">
              <UserPlus className="w-4 h-4 mr-1" />
              Inscription
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;
