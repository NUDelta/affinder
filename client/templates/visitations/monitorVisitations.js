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
  const daysPeriod = Number(document.getElementById('daysPeriod').value);
  Session.set('daysPeriod', daysPeriod);
  const numUsersInCity = Number(document.getElementById('numUsersInCity').value);
  Session.set('numUsersInCity', numUsersInCity);
  let probabilityOfVisitationHistory = Object.assign({}, numFSQUsersPerCity);
  Object.keys(probabilityOfVisitationHistory).forEach((city) => {
    probabilityOfVisitationHistory[city] = null;
  });
  Session.set('probabilityOfVisitationHistory', probabilityOfVisitationHistory);
  Session.set('probMaxReferenceLimit', 25);
});

Template.monitorVisitations.events({
  // city-based model events
  'change #daysPeriod'(event) {
    Session.set('daysPeriod', Number(event.target.value));
  },
  'change #numUsersInCity'(event) {
    Session.set('numUsersInCity', Number(event.target.value));
  },
  'click tr'(event) {
    if (event.target.className == "city-label") {
      Session.set('cityForSimulation', event.target.innerHTML);
    }
  },
  'change #probMaxReferenceLimit'(event) {
    limit = event.target.value;
    Session.set('probMaxReferenceLimit', limit);
  },
  'click #saveProbabilityHistory'(event) {
    // TODO(rlouie): finish function
    let probabilityOfVisitationHistory = Session.get('probabilityOfVisitationHistory');
    Object.keys(probabilityOfVisitationHistory).forEach((city) => {
      const numTotalCheckins = totalCheckins(city);
      const numTotalUsersInCity = numFSQUsersPerCity[city];
      const totalDays = 365 // data collected over 1 - 1.5 years
      const daysPeriod = Session.get('daysPeriod');
      const numUsersInCity = Session.get('numUsersInCity');
      const prob = calculateProbabilityOfVisitation(numTotalCheckins, numTotalUsersInCity, totalDays, daysPeriod, numUsersInCity);
      const result = prob * 100;
      probabilityOfVisitationHistory[city] = result;
    });
    console.log(probabilityOfVisitationHistory);
    Session.set('probabilityOfVisitationHistory', probabilityOfVisitationHistory);
  },
});

export const calculateProbabilityOfVisitation = (numTotalCheckinsInCity, numTotalUsersInCity, totalDays, daysPeriod, numUsersInCity) => {
  // e.g., ~2000 checkins at churches
  // you have 52 periods (a week) in a year (360 / 7).
  // So you have ~40 people visiting a church on any given week, for the entire population in Foursquare.
  const expectedNumVisitsForPeriodForAllUsers = numTotalCheckinsInCity / (totalDays / daysPeriod)

  // But imagine we have a user population that is a fraction of FSQ, e.g., 1%
  // e.g., 10 people in our deploy population, but FSQ had 1000 people.
  // So what is expected number of people from YOUR population to visit churches?
  // Well 0.01 * 40 = 0.4 people visiting a church on any given week.
  // Or 40% chance someone will visit a church on any given week.
  const expectedVisitsForUserSubset = (numUsersInCity / numTotalUsersInCity) * expectedNumVisitsForPeriodForAllUsers;
  return Math.min(1, expectedVisitsForUserSubset);
}

Template.monitorVisitations.helpers({
  // ------ CITY-BASED MODEL HELPERS ------
  cityChoices() {
    return Object.keys(numFSQUsersPerCity);
  },
  totalCheckinsForCity() {
    const city = Session.get('cityForSimulation');
    if (!city) {
      return;
    }

    return totalCheckins(city);
  },

  probabilityOfVisitation(city) {
    const numTotalCheckins = totalCheckins(city);
    const numTotalUsersInCity = numFSQUsersPerCity[city];
    const totalDays = 365 // data collected over 1 - 1.5 years
    const daysPeriod = Session.get('daysPeriod');
    const numUsersInCity = Session.get('numUsersInCity');

    const prob = calculateProbabilityOfVisitation(numTotalCheckins, numTotalUsersInCity, totalDays, daysPeriod, numUsersInCity);
    const result = prob * 100;
    return result.toFixed(1);
  },

  progressContainerClass(city) {
    // if its the city in focus
    if (Session.get('cityForSimulation') === city) {
      return "progress-container-focused";
    }
    else {
      return "progress-container-unfocused";
    }
  },

  progressBarActiveStyling(city) {
    if (Session.get('cityForSimulation') === city) {
      return "progress-bar-striped active"
    }
    else {
      return ""
    }
  },

  progressBarWidth(prob) {
    const referenceValue = Session.get('probMaxReferenceLimit');
    const result = prob / referenceValue * 100;
    return result.toFixed(1);
  },

  progressHasRegressed(city) {
    // NOTE: for this helper to re-rerun, need to duplicate the compile blockly dependencies
    const numTotalCheckins = totalCheckins(city);
    const numTotalUsersInCity = numFSQUsersPerCity[city];
    const totalDays = 365 // data collected over 1 - 1.5 years
    const daysPeriod = Session.get('daysPeriod');
    const numUsersInCity = Session.get('numUsersInCity');
    const prob = calculateProbabilityOfVisitation(numTotalCheckins, numTotalUsersInCity, totalDays, daysPeriod, numUsersInCity);
    const currentProb = prob * 100;

    const probabilityOfVisitationHistory = Session.get('probabilityOfVisitationHistory');
    const oldProb = probabilityOfVisitationHistory[city];

    return currentProb <= oldProb;
  },

  oldProbability(city) {
    const probabilityOfVisitationHistory = Session.get('probabilityOfVisitationHistory');
    if (!probabilityOfVisitationHistory) {
      return null;
    }
    const oldProb = probabilityOfVisitationHistory[city];
    if (!oldProb) {
      return null;
    }
    return oldProb.toFixed(1);
  },

  regressionDifference(currentProb, oldProb) {
    const result = oldProb - currentProb;
    return result.toFixed(1);
  },

  improvedDifference(currentProb, oldProb) {
    const result = currentProb - oldProb;
    return result.toFixed(1);
  },
})

Template.personBasedMonitor.events({
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

Template.personBasedMonitor.helpers({
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
});