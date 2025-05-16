export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: 'cd0a66c293314bce91e0810930117a0f',
        client_secret: 'e5f05c8775f44f9f8fce13dcd499ea74',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to refresh token');
    }

    // Update tokens in localStorage
    localStorage.setItem('spotify_access_token', data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    localStorage.setItem('spotify_token_expires_at', Date.now() + (data.expires_in * 1000));

    return data.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

export function isTokenExpired() {
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  if (!expiresAt) return true;
  return Date.now() > parseInt(expiresAt);
}

export async function getValidAccessToken() {
  if (isTokenExpired()) {
    return await refreshAccessToken();
  }
  return localStorage.getItem('spotify_access_token');
} 