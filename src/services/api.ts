import type { POI } from '../types/POI';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Log API URL on startup (helps debug production issues)
console.log('[API] URL configured:', API_URL);

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Add auth header to requests
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Safe JSON parser with better error handling
const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  
  if (!text) {
    console.error('[API] Empty response from server');
    throw new Error('Le serveur ne répond pas. Réessayez dans quelques secondes.');
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('[API] Invalid JSON response:', text.substring(0, 200));
    throw new Error('Réponse invalide du serveur');
  }
};

// POI API
export const poiAPI = {
  // Get all POIs with optional filters
  getAll: async (filters?: {
    category?: string;
    massif?: string;
    search?: string;
  }): Promise<POI[]> => {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters?.massif && filters.massif !== 'all') {
      params.append('massif', filters.massif);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }

    const response = await fetch(`${API_URL}/pois?${params.toString()}`);
    const data = await safeJsonParse(response);
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération des POIs');
    }
    
    // Transform _id to id for frontend compatibility
    return data.data.map((poi: any) => ({
      ...poi,
      id: poi._id || poi.id,
    }));
  },

  // Get single POI by ID
  getById: async (id: string): Promise<POI> => {
    const response = await fetch(`${API_URL}/pois/${id}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'POI non trouvé');
    }
    
    // Transform _id to id for frontend compatibility
    return {
      ...data.data,
      id: data.data._id || data.data.id,
    };
  },

  // Get statistics
  getStats: async () => {
    const response = await fetch(`${API_URL}/pois/stats`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération des statistiques');
    }
    
    return data.data;
  },

  // Create new POI (requires auth)
  create: async (poiData: Partial<POI>): Promise<any> => {
    const response = await fetch(`${API_URL}/pois`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(poiData),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la création du POI');
    }
    
    return data;
  },

  // Toggle like (requires auth)
  toggleLike: async (poiId: string): Promise<{ likes: number; isLiked: boolean }> => {
    const response = await fetch(`${API_URL}/pois/${poiId}/like`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors du like');
    }
    
    return data.data;
  },

  // Toggle bookmark (requires auth)
  toggleBookmark: async (poiId: string): Promise<{ isBookmarked: boolean; bookmarksCount: number }> => {
    const response = await fetch(`${API_URL}/pois/${poiId}/bookmark`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors du bookmark');
    }
    
    return data.data;
  },

  // Get user's bookmarks (requires auth)
  getUserBookmarks: async (): Promise<string[]> => {
    const response = await fetch(`${API_URL}/pois/user/bookmarks`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération des bookmarks');
    }
    
    // Return array of POI IDs
    return data.data.map((poi: any) => poi._id || poi.id);
  },

  // Add comment (requires auth)
  addComment: async (poiId: string, text: string): Promise<any> => {
    const response = await fetch(`${API_URL}/pois/${poiId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ text }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de l\'ajout du commentaire');
    }
    
    return data;
  },

  // Add photo URL (requires auth)
  addPhoto: async (poiId: string, photoUrl: string): Promise<any> => {
    const response = await fetch(`${API_URL}/pois/${poiId}/photos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ photoUrl }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de l\'ajout de la photo');
    }
    
    return data;
  },

  // Upload photo file (requires auth)
  uploadPhoto: async (poiId: string, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('photo', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/pois/${poiId}/photos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type, browser will set it with boundary for multipart/form-data
      },
      body: formData,
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de l\'upload de la photo');
    }
    
    return data;
  },

  // Suggest POI edits (requires auth)
  suggestEdit: async (poiId: string, changes: any): Promise<any> => {
    const response = await fetch(`${API_URL}/pois/${poiId}/edit`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ changes }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la proposition de modification');
    }
    
    return data;
  },

  // Suggest exposition (requires auth) - Legacy
  suggestExposition: async (poiId: string, sunExposition: string): Promise<any> => {
    const response = await fetch(`${API_URL}/pois/${poiId}/exposition`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sunExposition }),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la proposition d\'exposition');
    }
    
    return data;
  },
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('[API] Login attempt to:', `${API_URL}/auth/signin`);
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur de connexion');
    }
    
    // Save token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  register: async (name: string, email: string, password: string) => {
    console.log('[API] Register attempt to:', `${API_URL}/auth/signup`);
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await safeJsonParse(response);
    
    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'inscription');
    }
    
    // Save token
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },
};

// Admin API
export const adminAPI = {
  // Delete a comment from a POI
  deleteComment: async (poiId: string, commentId: string): Promise<any> => {
    const response = await fetch(`${API_URL}/admin/pois/${poiId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la suppression du commentaire');
    }
    
    return data;
  },

  // Get user's contributions
  getUserContributions: async (): Promise<any[]> => {
    const response = await fetch(`${API_URL}/admin/user/contributions`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Erreur lors de la récupération des contributions');
    }
    
    return data.data;
  },
};
