const API_BASE_URL = 'http://localhost:3011';

class UserService {
  async updateProfileImage(userId, imageFile) {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-image`, {
      method: 'PATCH',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la mise à jour de la photo de profil');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Erreur lors de la mise à jour');
    }

    return result.data;
  }

  async getAllUsers() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Erreur lors de la récupération');
    }

    return result.data;
  }
}

export const userService = new UserService();
