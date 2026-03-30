const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'SeniorNutritionAPI',
  description: 'Backend API for Senior Nutrition BI Dashboard (Modernized)',
  script: path.join(__dirname, 'server/api.cjs'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
  console.log('Installation Complete. Starting Service...');
  svc.start();
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', function () {
  console.log('This service is already installed.');
});

// Listen for the "start" event
svc.on('start', function() {
  console.log(svc.name + ' service started!\nVisit http://localhost:3002 to verify.');
});

svc.install();
