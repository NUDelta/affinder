import { VisitationModelCheckins, VisitationModelUsers } from "../../../lib/collections/collections";

Template.monitorVisitations.onCreated(function (){
  this.autorun(() => {
    if (Session.get('detectorId')) {
      this.subscribe('VisitationModelUsers', Session.get('detectorId'));
      this.subscribe('VisitationModelCheckins');
    }
  });
})

Template.monitorVisitations.onRendered(function() {
  city = document.getElementById('cityForSimulation').value;
  Session.set('cityForSimulation', city);
});

Template.monitorVisitations.events({
  // city-based model events
  'change #cityForSimulation'(event) {
    city = event.target.value;
    Session.set('cityForSimulation', city);
  },

  // person-based model events
  'click #samplePersonModel'(event) {
    const personLimitElement = document.getElementById('personLimit')
    const detectorId = Session.get('detectorId')
    if (!personLimitElement || !detectorId) {
      console.warn("samplePersonModel submission failed")
      return;
    }
    Meteor.call('sampleRandomUsers', {
      'limit': Number(personLimitElement.value),
      'detectorId': detectorId
    });
  },
  'change #uidForSimulation'(event) {
    uid = event.target.value;
    Session.set('uidForSimulation', uid);
  },


});

Template.monitorVisitations.helpers({
  sampledUserIds() {
    const detectorId = Session.get('detectorId')
    if (detectorId) {
      userObject = VisitationModelUsers.findOne({'_id': detectorId});
      if (userObject) {
        return userObject.users;
      }
    }
  },
  uidForSimulation() {
    return Session.get('uidForSimulation');
  },
  detectorLikelihood(uid) {
    const checkinData = VisitationModelCheckins.findOne({'uid': Number(uid)});
    debugger;
  }
})