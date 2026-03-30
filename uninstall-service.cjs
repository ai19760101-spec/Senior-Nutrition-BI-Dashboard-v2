const Service = require('node-windows').Service;
const path = require('path');

// Create a new service object
const svc = new Service({
  name: 'SeniorNutritionAPI',
  script: path.join(__dirname, 'server/api.cjs')
});

// Listen for the "uninstall" event, which indicates the
// process is available as a service.
svc.on('uninstall', function () {
  console.log('Uninstallation Complete. The service is no longer a part of your system.');
});

// Start the uninstallation
svc.uninstall();
