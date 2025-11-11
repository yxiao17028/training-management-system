/// register.js
const API = window.location.origin + '/api';
const registerForm = document.getElementById('registerForm');
const rmsg = document.getElementById('rmsg');

function validateGmail(g) {
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}(\.[a-z]{2,})?$/.test(g);
}

function determineRole(code) {
  switch (code.trim().toUpperCase()) {
    case '0':
      return 'participant';
    case 'CCCD1234':
      return 'staff';
    case 'ADMIN1234':
      return 'admin';
    default:
      return null;
  }
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  rmsg.textContent = '';

  const name = document.getElementById('rname').value.trim();
  const gmail = document.getElementById('rgmail').value.trim();
  const password = document.getElementById('rpassword').value;
  const code = document.getElementById('rcode').value.trim();

  if (!name || !gmail || !password || !code) {
    rmsg.textContent = 'Please fill all fields.';
    return;
  }
  if (password.length < 8) {
    rmsg.textContent = 'Password must be at least 8 characters.';
    return;
  }
  if (!validateGmail(gmail)) {
    rmsg.textContent = 'Invalid gmail format.';
    return;
  }

  const role = determineRole(code);
  if (!role) {
    rmsg.textContent = 'Invalid verification code.';
    return;
  }

  try {
    const res = await fetch(API + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, gmail, password, verifyCode: code })
    });

    const data = await res.json();
    if (!res.ok) {
      rmsg.textContent = data.message || 'Registration failed';
      return;
    }

    alert(`Registration successful as ${role}. Please login.`);
    window.location.href = '/login.html';
  } catch (err) {
    rmsg.textContent = 'Network error';
  }
});
