// dashboard.js
const API = window.location.origin + '/api';
const who = document.getElementById('who');
const logoutBtn = document.getElementById('logoutBtn');
const programsDiv = document.getElementById('programs');

function getUser(){ try{ return JSON.parse(localStorage.getItem('user')||'{}'); }catch(e){ return {}; } }

async function loadPrograms(){
  try{
    const res = await fetch(API + '/programs');
    const data = await res.json();
    programsDiv.innerHTML = data.map(p=>`<div class="col-md-4"><div class="card mb-3"><div class="card-body"><h5>${p.title}</h5><p>${p.description || ''}</p><p><strong>Fee:</strong> ${p.fee||0}</p></div></div></div>`).join('');
  }catch(e){
    programsDiv.innerHTML = '<div class="text-danger">Could not load programs.</div>';
  }
}

logoutBtn.addEventListener('click', ()=>{
  localStorage.removeItem('token'); localStorage.removeItem('user');
  window.location.href = '/login.html';
});

document.addEventListener('DOMContentLoaded', ()=>{
  const user = getUser();
  if(!user.name){
    window.location.href = '/login.html';
    return;
  }
  who.textContent = `${user.name} (${user.role||''})`;
  loadPrograms();
});
