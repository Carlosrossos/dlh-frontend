/**
 * Parse une erreur API et retourne un message lisible
 */
export function parseApiError(error: unknown): string {
  // Erreur réseau
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
  }

  // Erreur avec message
  if (error instanceof Error) {
    const message = error.message;
    
    // Messages d'erreur connus à traduire
    const errorTranslations: Record<string, string> = {
      'Failed to fetch': 'Impossible de contacter le serveur',
      'Network Error': 'Erreur réseau',
      'Internal server error': 'Erreur serveur interne',
      'User already exists': 'Un compte existe déjà avec cet email',
      'Invalid credentials': 'Email ou mot de passe incorrect',
      'User not found': 'Utilisateur non trouvé',
      'Unauthorized': 'Vous devez être connecté',
      'Forbidden': 'Accès non autorisé',
      'Not found': 'Ressource non trouvée',
      'Email and password are required': 'Email et mot de passe requis',
      'Password must be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    };

    return errorTranslations[message] || message;
  }

  // Erreur inconnue
  return 'Une erreur inattendue est survenue';
}

/**
 * Gère une réponse API et lance une erreur si nécessaire
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  let data: any;
  
  try {
    data = await response.json();
  } catch {
    // Si la réponse n'est pas du JSON valide
    if (!response.ok) {
      throw new Error(`Erreur serveur (${response.status})`);
    }
    throw new Error('Réponse invalide du serveur');
  }

  if (!response.ok) {
    throw new Error(data.error || `Erreur ${response.status}`);
  }

  return data;
}

/**
 * Codes d'erreur HTTP avec messages
 */
export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Requête invalide',
  401: 'Vous devez être connecté',
  403: 'Accès non autorisé',
  404: 'Ressource non trouvée',
  408: 'Délai d\'attente dépassé',
  429: 'Trop de requêtes, veuillez réessayer plus tard',
  500: 'Erreur serveur interne',
  502: 'Serveur temporairement indisponible',
  503: 'Service indisponible',
  504: 'Délai d\'attente du serveur dépassé',
};

export function getHttpErrorMessage(status: number): string {
  return HTTP_ERROR_MESSAGES[status] || `Erreur ${status}`;
}
