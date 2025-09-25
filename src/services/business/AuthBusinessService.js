export class AuthBusinessService {

  constructor(apiService, validationService) {
    this.apiService = apiService;
    this.validationService = validationService;
  }


  async login(credentials) {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email et mot de passe requis');
    }

    if (!this.validationService.validateEmail(credentials.email)) {
      throw new Error('Format d\'email invalide');
    }

    try {
      const result = await this.apiService.login(credentials);

      if (result.token) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      return result;
    } catch (error) {
      console.error('Erreur métier lors de la connexion:', error);
      throw new Error('Échec de la connexion. Vérifiez vos identifiants.');
    }
  }


  async register(userData) {
    const validationErrors = this.validationService.validateUserRegistration(userData);
    if (validationErrors.length > 0) {
      throw new Error(`Validation échouée: ${validationErrors.join(', ')}`);
    }

    const normalizedData = {
      ...userData,
      email: userData.email.trim().toLowerCase(),
      name: userData.name.trim(),
    };

    try {
      const result = await this.apiService.register(normalizedData);

      if (result && result.user && result.user.id) {
        return result;
      }

      throw new Error('Inscription incomplète');
    } catch (error) {
      console.error('Erreur métier lors de l\'inscription:', error);
      throw new Error('Échec de l\'inscription. Veuillez réessayer.');
    }
  }

  logout() {

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }


  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    return !!(token && user);
  }


  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      this.logout(); 
      return null;
    }
  }


  getToken() {
    return localStorage.getItem('token');
  }


  validateToken(token) {
    if (!token || token.split('.').length !== 3) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp > currentTime;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      return false;
    }
  }
}