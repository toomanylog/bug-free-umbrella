// Polyfills pour le navigateur

// Polyfill pour process.env utilisé par axios
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.env = window.process.env || {};
}

// Import des polyfills si nécessaire
try {
  // Ces imports sont optionnels et peuvent être absents
  // selon les besoins de l'application
  require('process');
  require('buffer');
} catch (e) {
  console.warn('Polyfills optionnels non chargés:', e);
}

// Export vide pour que TypeScript considère ce fichier comme un module
export {}; 