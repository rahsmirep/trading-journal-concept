// Logout functionality

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear authentication token from localStorage
      localStorage.removeItem('token');

      // Optionally show a message
      console.log('Logged out successfully');

      // Redirect to login page
      window.location.href = 'login.html';
    });
  }
});
