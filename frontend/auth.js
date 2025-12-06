// Authentication form handler

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const switchToSignup = document.getElementById('switchToSignup');
  const switchToLogin = document.getElementById('switchToLogin');
  const loginFormElement = document.getElementById('loginFormElement');
  const signupFormElement = document.getElementById('signupFormElement');
  const loginStatus = document.getElementById('loginStatus');
  const signupStatus = document.getElementById('signupStatus');

  // Form switching
  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    loginStatus.textContent = '';
  });

  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    signupStatus.textContent = '';
  });

  // Login form submission
  loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showStatus(loginStatus, 'Please fill in all fields', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showStatus(loginStatus, 'Please enter a valid email', 'error');
      return;
    }

    try {
      showStatus(loginStatus, 'Logging in...', 'info');

      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        showStatus(loginStatus, 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        const error = await response.json();
        showStatus(loginStatus, error.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showStatus(loginStatus, 'An error occurred. Please try again.', 'error');
    }
  });

  // Signup form submission
  signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!name || !email || !password || !confirmPassword) {
      showStatus(signupStatus, 'Please fill in all fields', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showStatus(signupStatus, 'Please enter a valid email', 'error');
      return;
    }

    if (password.length < 8) {
      showStatus(signupStatus, 'Password must be at least 8 characters', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showStatus(signupStatus, 'Passwords do not match', 'error');
      return;
    }

    if (!agreeTerms) {
      showStatus(signupStatus, 'Please agree to the Terms & Conditions', 'error');
      return;
    }

    try {
      showStatus(signupStatus, 'Creating account...', 'info');

      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        showStatus(signupStatus, 'Account created! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        const error = await response.json();
        showStatus(signupStatus, error.message || 'Signup failed', 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showStatus(signupStatus, 'An error occurred. Please try again.', 'error');
    }
  });
});

// Helper functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type}`;
}
