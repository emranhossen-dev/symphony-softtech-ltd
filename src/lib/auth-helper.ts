/**
 * Helper function to get auth token from localStorage or cookie
 * This standardizes token retrieval across all admin pages
 */
export function getAuthToken(): string | null {
  // Try localStorage first (auth_token)
  let token = localStorage.getItem('auth_token');
  
  // Try localStorage second (token - for backward compatibility)
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  // Try cookie as fallback
  if (!token) {
    const cookieToken = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('auth-token='))
      ?.split('=')[1];
    token = cookieToken || null;
  }
  
  return token;
}

/**
 * Helper function to get auth headers for API requests
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Helper function to handle auth errors and redirect to login
 */
export function handleAuthError(router: any, message?: string) {
  console.error(message || 'Authentication error');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  router.push('/login');
}
