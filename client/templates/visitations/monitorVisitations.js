import { compiledBlocklyDep } from '../blockly'
import { VisitationModelCheckins, VisitationModelUsers } from "../../../lib/collections/collections";
import { totalCheckins, numFSQUsersPerCity } from "./visitations";

Template.monitorVisitations.onCreated(function (){
  // this.autorun(function() {
  //   if (Session.get('detectorId')) {
  //     this.subscribe('VisitationModelUsers', Session.get('detectorId'));
  //     this.subscribe('VisitationModelCheckins');
  //   }
  // });
})

Template.monitorVisitations.onRendered(function() {
  city = document.getElementById('cityForSimulation').value;
  Session.set('cityForSimulation', city);
  const daysPeriod = Number(document.getElementById('daysPeriod').value);
  Session.set('daysPeriod', daysPeriod);
  const numUsersInCity = Number(document.getElementById('numUsersInCity').value);
  Session.set('numUsersInCity', numUsersInCity);
});

Template.monitorVisitations.events({
  // city-based model events
  'change #cityForSimulation'(event) {
    city = event.target.value;
    Session.set('cityForSimulation', city);
  },
  'change #daysPeriod'(event) {
    Session.set('daysPeriod', Number(event.target.value));
  },
  'change #numUsersInCity'(event) {
    Session.set('numUsersInCity', Number(event.target.value));
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
  // ------ CITY-BASED MODEL HELPERS ------
  totalCheckinsForCity() {
    compiledBlocklyDep.depend();
    const city = Session.get('cityForSimulation');
    if (!city) {
      return;
    }
    return totalCheckins(city);
  },

  probabilityOfVisitation() {
    compiledBlocklyDep.depend();
    const city = Session.get('cityForSimulation');
    const numTotalCheckins = totalCheckins(city);
    debugger;
    if (!numTotalCheckins) {
      return;
    }
    debugger;
    const numTotalUsersInCity = numFSQUsersPerCity[city];
    // data collected over 1 - 1.5 years
    const totalDays = 365
    const daysPeriod = Session.get('daysPeriod');
    const numUsersInCity = Session.get('numUsersInCity');

    // e.g., ~2000 checkins at churches
    // you have 52 periods (a week) in a year (360 / 7).
    // So you have ~40 people visiting a church on any given week, for the entire population in Foursquare.
    const expectedNumVisitsForPeriodForAllUsers = numTotalCheckins / (totalDays / daysPeriod)

    // But imagine we have a user population that is a fraction of FSQ, e.g., 1%
    // e.g., 10 people in our deploy population, but FSQ had 1000 people.
    // So what is expected number of people from YOUR population to visit churches?
    // Well 0.01 * 40 = 0.4 people visiting a church on any given week.
    // Or 40% chance someone will visit a church on any given week.
    const expectedVisitsForUserSubset = (numUsersInCity / numTotalUsersInCity) * expectedNumVisitsForPeriodForAllUsers;
    return Math.min(1, expectedVisitsForUserSubset.toPrecision(2));
  },

  // ------ PERSON-BASED HELPERS -------
  displayPersonBased() {
    // for now, do not focus on person based models
    return false;
  },
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
    // Get a model of visitations (here based on a single user)
    const checkinData = VisitationModelCheckins.findOne({'uid': Number(uid)});
    // Find the location categories in the construction

    // Find the corresponding categories in the model of visitations

    // Output the results
  },
})