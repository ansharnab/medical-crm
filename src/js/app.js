const routes = [
  { key:'dashboard', label:'Dashboard' },
  { key:'appointments', label:'Appointments' },
  { key:'doctors', label:'Doctors' },
  { key:'patients', label:'Patients' },
  { key:'payments', label:'Payments' },
];

const renderNav = () => {
  const nav = $('#navLinks').empty();
  for (const route of routes) {
    const a = $(`<a href='#${route.key}' class='nav-link text-dark'>${route.label}</a>`);
    nav.append(a);
  }
};

const renderDashboard = () => {
  $('#pageTitle').text('Dashboard');
  $('#pageContent').html(`
    <div class='row g-3'>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Appointments</div>
          <div class='display-6'>${DataService.getAll('appointments').length}</div>
        </div>
      </div>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Doctors</div>
          <div class='display-6'>${DataService.getAll('doctors').length}</div>
        </div>
      </div>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Patients</div>
          <div class='display-6'>${DataService.getAll('patients').length}</div>
        </div>
      </div>
      <div class='col-md-3'>
        <div class='card p-3'>
          <div class='h5'>Payments</div>
          <div class='display-6'>${DataService.getAll('payments').length}</div>
        </div>
      </div>
    </div>
  `);
};

const renderAppointments = () => {
  $('#pageTitle').text('Appointments');
  const list = DataService.getAll('appointments');
  $('#pageContent').html(`
    <div class='mb-3'>
      <button id='btnAddAppointment' class='btn btn-primary'>+ Add Appointment</button>
    </div>
    <div class='table-responsive'>
      <table id='tableAppointments' class='table table-striped'>
        <thead><tr><th>Date</th><th>Patient</th><th>Doctor</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${list.map((x)=>`<tr data-id='${x.id}'><td>${x.date}</td><td>${x.patient}</td><td>${x.doctor}</td><td>${x.status}</td><td><button class='btn btn-sm btn-secondary btnEdit'>Edit</button> <button class='btn btn-sm btn-danger btnDelete'>Delete</button></td></tr>`).join('')}</tbody>
      </table>
    </div>
  `);
  $('#tableAppointments').DataTable();
};

const attachEvents = () => {
  $('#themeSwitch').on('change', function() {
    const dark = $(this).is(':checked');
    if (dark) {
      $('body').attr('data-theme','dark');
      $('#sidebar').addClass('bg-dark text-white');
      $('#sidebar .nav-link').addClass('text-light').removeClass('text-dark');
    } else {
      $('body').attr('data-theme','light');
      $('#sidebar').removeClass('bg-dark text-white');
      $('#sidebar .nav-link').addClass('text-dark').removeClass('text-light');
    }
  });

  $('#btnLogout').on('click', () => {
    alert('Logout action triggered');
  });

  $('#navLinks').on('click','a', function(e){
    e.preventDefault();
    const route = $(this).attr('href').slice(1);
    navigate(route);
  });
};

const navigate = (routeKey) => {
  switch(routeKey) {
    case 'appointments': renderAppointments(); break;
    case 'doctors': renderDoctors(); break;
    case 'patients': renderPatients(); break;
    case 'payments': renderPayments(); break;
    default: renderDashboard(); break;
  }
};

const renderDoctors = () => {
  $('#pageTitle').text('Doctors');
  const list = DataService.getAll('doctors');
  $('#pageContent').html(`
    <p>Under construction</p>
  `);
};

const renderPatients = () => {
  $('#pageTitle').text('Patients');
  $('#pageContent').html(`<p>Under construction</p>`);
};

const renderPayments = () => {
  $('#pageTitle').text('Payments');
  $('#pageContent').html(`<p>Under construction</p>`);
};

$(function(){
  renderNav();
  attachEvents();
  navigate(location.hash.slice(1) || 'dashboard');
});