let routes=[{key:"dashboard",label:"Dashboard"},{key:"appointments",label:"Appointments"},{key:"doctors",label:"Doctors"},{key:"patients",label:"Patients"},{key:"payments",label:"Payments"}];
const isLoggedIn=()=>!!localStorage.getItem('medicapp-crm-token');
const setAuth=(t,e)=>{localStorage.setItem('medicapp-crm-token',t);localStorage.setItem('medicapp-crm-user',JSON.stringify(e));};
const clearAuth=()=>{localStorage.removeItem('medicapp-crm-token');localStorage.removeItem('medicapp-crm-user');};
const renderLogin=()=>{$("#pageTitle").text("Login");$("#pageContent").html(`
    <div class='row justify-content-center'>
      <div class='col-md-5'>
        <div class='card p-4'>
          <h4 class='mb-3'>Sign In</h4>
          <form id='loginForm'>
            <div class='mb-3'><label class='form-label'>Email</label><input type='email' class='form-control' name='email' required></div>
            <div class='mb-3'><label class='form-label'>Password</label><input type='password' class='form-control' name='password' required minlength='4'></div>
            <button class='btn btn-primary w-100' type='submit'>Login</button>
          </form>
          <div class='mt-3 text-center'><a href='#' id='showRegister'>Create account</a></div>
        </div>
      </div>
    </div>
  `);
  $("#loginForm").off('submit').on('submit',async function(o){o.preventDefault();const e=$('[name=email]').val().trim(),n=$('[name=password]').val().trim();if(!e||!n){alert('Fill credentials');return;}try{const r=await DataService.login(e,n);setAuth(r.token,r.user);alert('Login success');renderNav();navigate('dashboard')}catch(o){alert('Login failed: '+o.message)}});
  $('#showRegister').off('click').on('click',function(o){o.preventDefault();renderRegister();});
};
const renderRegister=()=>{$("#pageTitle").text("Register");$("#pageContent").html(`
    <div class='row justify-content-center'>
      <div class='col-md-5'>
        <div class='card p-4'>
          <h4 class='mb-3'>Create Account</h4>
          <form id='registerForm'>
            <div class='mb-3'><label class='form-label'>Name</label><input type='text' class='form-control' name='name' required></div>
            <div class='mb-3'><label class='form-label'>Email</label><input type='email' class='form-control' name='email' required></div>
            <div class='mb-3'><label class='form-label'>Password</label><input type='password' class='form-control' name='password' required minlength='4'></div>
            <div class='mb-3'><label class='form-label'>Role</label><select class='form-select' name='role'><option value='marketing'>Marketing</option><option value='doctor'>Doctor</option><option value='admin'>Admin</option></select></div>
            <button class='btn btn-primary w-100' type='submit'>Register</button>
          </form>
          <div class='mt-3 text-center'><a href='#' id='showLogin'>Already have account</a></div>
        </div>
      </div>
    </div>
  `);
  $("#registerForm").off('submit').on('submit',async function(o){o.preventDefault();const n=$('[name=name]').val().trim(),r=$('[name=email]').val().trim(),a=$('[name=password]').val().trim(),i=$('[name=role]').val();if(!n||!r||!a){alert('Fill all fields');return;}try{await DataService.register(n,r,a,i);alert('Registered. Please login.');renderLogin()}catch(o){alert('Register failed: '+o.message)}});
  $('#showLogin').off('click').on('click',function(o){o.preventDefault();renderLogin();});
};
const renderNav=()=>{if(!isLoggedIn()){$('#sidebar').hide();$('#btnLogout').hide();return;}$('#sidebar').show();$('#btnLogout').show();var t,e=$("#navLinks").empty();for(t of routes){var n=$(`<a href='#${t.key}' class='nav-link text-dark'>${t.label}</a>`);e.append(n)}};
renderDashboard=()=>{$("#pageTitle").text("Dashboard"),$("#pageContent").html(`
    <div class='row g-3'>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Appointments</div>
          <div class='display-6'>${DataService.getAll("appointments").length}</div>
        </div>
      </div>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Doctors</div>
          <div class='display-6'>${DataService.getAll("doctors").length}</div>
        </div>
      </div>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Patients</div>
          <div class='display-6'>${DataService.getAll("patients").length}</div>
        </div>
      </div>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Payments</div>
          <div class='display-6'>${DataService.getAll("payments").length}</div>
        </div>
      </div>
    </div>
  `)},renderAppointments=()=>{$("#pageTitle").text("Appointments");var t=DataService.getAll("appointments");$("#pageContent").html(`
    <div class='mb-3'>
      <button id='btnAddAppointment' class='btn btn-primary'>+ Add Appointment</button>
    </div>
    <div class='table-responsive'>
      <table id='tableAppointments' class='table table-striped'>
        <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${t.map(t=>`<tr data-id='${t.id}'><td>${t.date}</td><td>${t.patient}</td><td>${t.doctor}</td><td>${t.status}</td><td><button class='btn btn-sm btn-secondary btnEdit'>Edit</button> <button class='btn btn-sm btn-danger btnDelete'>Delete</button></td></tr>`).join("")}</tbody>
      </table>
    </div>
  `),$("#tableAppointments").DataTable()},attachEvents=()=>{$("#themeSwitch").on("change",function(){$(this).is(":checked")?($("body").attr("data-theme","dark"),$("#sidebar").addClass("bg-dark text-white"),$("#sidebar .nav-link").addClass("text-light").removeClass("text-dark")):($("body").attr("data-theme","light"),$("#sidebar").removeClass("bg-dark text-white"),$("#sidebar .nav-link").addClass("text-dark").removeClass("text-light"))}),$("#btnLogout").on("click",()=>{clearAuth();renderNav();renderLogin();}),$("#navLinks").on("click","a",function(t){t.preventDefault();t=$(this).attr("href").slice(1);navigate(t)})},navigate=t=>{if(!isLoggedIn()&&"login"!==t&&"register"!==t){renderLogin();return;}switch(t){case"login":renderLogin();break;case"register":renderRegister();break;case"appointments":renderAppointments();break;case"doctors":renderDoctors();break;case"patients":renderPatients();break;case"payments":renderPayments();break;default:renderDashboard()}},renderDoctors=()=>{$("#pageTitle").text("Doctors");DataService.getAll("doctors");$("#pageContent").html(`
    <p>Under construction</p>
  `)},renderPatients=()=>{$("#pageTitle").text("Patients"),$("#pageContent").html("<p>Under construction</p>")},renderPayments=()=>{$("#pageTitle").text("Payments"),$("#pageContent").html("<p>Under construction</p>")},DataService=($(function(){renderNav(),attachEvents(),navigate(location.hash.slice(1)||"dashboard")}),(()=>{const API_BASE='http://localhost:5000/api';
      let a='medicapp-crm-data',e={appointments:[],doctors:[],patients:[],payments:[]};
      let n=(()=>{let t=localStorage.getItem(a);if(t)try{return JSON.parse(t)}catch(t){console.warn('Invalid saved state, resetting',t)}return e})();
      const d=t=>n[t]||[];
      const saveState=()=>localStorage.setItem(a,JSON.stringify(n));
      const userKey='medicapp-crm-users';
      const loadUsers=()=>{let t=localStorage.getItem(userKey);if(!t)return[];try{return JSON.parse(t)}catch(e){return[]}};
      const saveUsers=t=>localStorage.setItem(userKey,JSON.stringify(t));
      const apiFetch=async(t,o={})=>{const r=localStorage.getItem('medicapp-crm-token');const h={'Content-Type':'application/json',...(o.headers||{})};if(r)h.Authorization=`Bearer ${r}`;const s=await fetch(t,{...o,headers:h});if(!s.ok){let b=await s.text();throw new Error(`API error ${s.status}: ${b}`)}return await s.json()};
      return{
        getAll:async t=>{try{let r=await apiFetch(`${API_BASE}/${t}?_page=1&_limit=100`);return r.data||r}catch(o){return[...d(t)]}},
        getById:async(t,o)=>{try{return await apiFetch(`${API_BASE}/${t}/${o}`)}catch(e){return d(t).find(t=>t.id===o)||null}},
        create:async(t,o)=>{try{return await apiFetch(`${API_BASE}/${t}`,{method:'POST',body:JSON.stringify(o)})}catch(e){let r={id:Date.now().toString(36)+Math.random().toString(36).slice(2),...o},u=d(t);u.push(r),n[t]=u,saveState();return r}},
        update:async(t,o,r)=>{try{return await apiFetch(`${API_BASE}/${t}/${o}`,{method:'PUT',body:JSON.stringify(r)})}catch(e){let u=d(t),f=u.findIndex(t=>t.id===o);if(f===-1)return null;u[f]={...u[f],...r},n[t]=u,saveState();return u[f]}},
        remove:async(t,o)=>{try{return await apiFetch(`${API_BASE}/${t}/${o}`,{method:'DELETE'})}catch(e){n[t]=d(t).filter(t=>t.id!==o),saveState();return{ok:!0}}},
        reset:async()=>{n=e,saveState();return{ok:!0}},
        register:async(t,o,r,p='marketing')=>{try{return await apiFetch(`${API_BASE}/auth/register`,{method:'POST',body:JSON.stringify({name:t,email:o,password:r,role:p})})}catch(err){const users=loadUsers();if(users.some(u=>u.email===o))throw new Error('Email already registered');const user={id:Date.now().toString(36)+Math.random().toString(36).slice(2),name:t,email:o,password:r,role:p};users.push(user);saveUsers(users);const token='local-'+Date.now();localStorage.setItem('medicapp-crm-token',token);localStorage.setItem('medicapp-crm-user',JSON.stringify({id:user.id,name:user.name,email:user.email,role:user.role}));return {token,user:{id:user.id,name:user.name,email:user.email,role:user.role}}}},
        login:async(t,o)=>{try{return await apiFetch(`${API_BASE}/auth/login`,{method:'POST',body:JSON.stringify({email:t,password:o})})}catch(err){const users=loadUsers();const user=users.find(u=>u.email===t&&u.password===o);if(!user)throw new Error('Invalid credentials');const token='local-'+Date.now();localStorage.setItem('medicapp-crm-token',token);localStorage.setItem('medicapp-crm-user',JSON.stringify({id:user.id,name:user.name,email:user.email,role:user.role}));return {token,user:{id:user.id,name:user.name,email:user.email,role:user.role}}}},
        me:async()=>{try{return await apiFetch(`${API_BASE}/auth/me`)}catch(err){const token=localStorage.getItem('medicapp-crm-token');if(token && token.startsWith('local-')){return JSON.parse(localStorage.getItem('medicapp-crm-user')||'null');}throw err;}}
      };
    })());