// verify.js
const verifyForm = document.getElementById('verifyForm');
const vmsg = document.getElementById('vmsg');
verifyForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  vmsg.textContent = '';
  const code = document.getElementById('code').value.trim();
  if(code === 'CCCD1234'){
    // mark verified in sessionStorage and go to register page
    sessionStorage.setItem('verified', 'true');
    window.location.href = 'register.html';
  } else {
    vmsg.textContent = 'Invalid verification code. Please try again.';
  }
});
