// login.js
const API = window.location.origin + '/api';
const loginForm = document.getElementById('loginForm');
const msgEl = document.getElementById('msg');

loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  msgEl.textContent = '';
  const name = document.getElementById('name').value.trim();
  const gmail = document.getElementById('gmail').value.trim();
  const password = document.getElementById('password').value;
  if(!name || !gmail || !password){ msgEl.textContent='Please fill all fields.'; return; }
  try{
    const res = await fetch(API + '/auth/login', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, gmail, password })
    });
    const data = await res.json();
    if(!res.ok){ msgEl.textContent = data.message || 'Login failed'; return; }
    // store token if present
    if(data.token){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user || {})); }
    else if(data.user){ localStorage.setItem('user', JSON.stringify(data.user)); }
    setTimeout(()=>{
    window.location.href = data.redirect || '/index.html';
  }, 150);
  }catch(err){
    msgEl.textContent = 'Network error';
  }
});
