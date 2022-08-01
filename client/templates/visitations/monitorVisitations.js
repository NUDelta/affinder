Template.monitorVisitations.onRendered(function() {
  city = document.getElementById('cityForSimulation').value;
  Session.set('cityForSimulation', city);
});

Template.monitorVisitations.events({
  'change #cityForSimulation'(event) {
    city = event.target.value;
    Session.set('cityForSimulation', city);
  }
});