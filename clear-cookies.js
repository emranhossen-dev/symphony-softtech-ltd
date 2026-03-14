// Run this in browser console to clear problematic cookies
console.log('🧹 CLEARING PROBLEMATIC COOKIES...');

// Clear the problematic 'auth-token' cookie
document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Clear localStorage
localStorage.removeItem('auth-token');

// Clear sessionStorage
sessionStorage.clear();

console.log('✅ All auth data cleared!');
console.log('🔄 Please refresh the page and login again');

// Show current cookies
console.log('🍪 Current cookies:', document.cookie);
