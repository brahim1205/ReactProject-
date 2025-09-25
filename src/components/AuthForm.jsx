import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const AuthForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const { login, register } = useAuth();

  // Déterminer le mode initial basé sur l'URL
  useEffect(() => {
    const path = location.pathname;
    setIsLogin(path === '/login');
  }, [location.pathname]);

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = "Le nom est obligatoire";
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Format d'email invalide";
      }
    }

    if (!formData.password) {
      newErrors.password = "Le mot de passe est obligatoire";
    } else if (formData.password.length < 4) {
      newErrors.password = "Le mot de passe doit contenir au moins 4 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        });
        navigate('/dashboard');
      } else {
        await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setMessage('Inscription réussie ! Redirection vers la page de connexion...');
        setMessageType('success');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      let errorMessage = 'Une erreur est survenue';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (error.message.includes('non trouvé')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('déjà utilisé')) {
          errorMessage = 'Cet email est déjà utilisé';
        } else if (error.message.includes('Invalides')) {
          errorMessage = 'Email ou mot de passe incorrect';
        } else {
          errorMessage = error.message;
        }
      }

      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    if (isLogin) {
      navigate('/register');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>

          {message && (
            <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom</span>
                </label>
                <input
                  id="auth-name"
                  name="name"
                  type="text"
                  placeholder="Votre nom"
                  className={`input input-bordered ${errors.name ? 'input-error' : ''}`}
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                  aria-label="Nom complet"
                  autoComplete="name"
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name}</span>
                  </label>
                )}
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={handleInputChange}
                required
                aria-label="Adresse email"
                autoComplete="email"
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Mot de passe</span>
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  className={`input input-bordered pr-10 ${errors.password ? 'input-error' : ''}`}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  aria-label="Mot de passe"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 btn btn-ghost btn-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
              </button>
            </div>
          </form>

          <div className="divider">ou</div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={toggleMode}
            aria-label={isLogin ? 'Aller à la page d\'inscription' : 'Aller à la page de connexion'}
          >
            {isLogin ? 'Créer un compte' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
