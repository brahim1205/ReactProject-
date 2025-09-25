import { useState } from 'react';

export const useProfileImage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadProfileImage = async (file, userId) => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:3011/users/${userId}/profile-image`, {
        method: 'PATCH',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'upload');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadProfileImage,
    uploading,
    error,
  };
};