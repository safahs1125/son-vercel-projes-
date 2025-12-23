// Auto-detect backend URL based on environment
export const getBackendURL = () => {
  // If explicitly set in env, use it
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // Auto-detect based on current domain
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//localhost:${port || 3000}`;
    }
    
    // Vercel production/preview
    return `${protocol}//${hostname}`;
  }
  
  // Fallback
  return 'http://localhost:3000';
};

export const BACKEND_URL = getBackendURL();
