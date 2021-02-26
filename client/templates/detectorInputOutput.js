import {Detectors} from "../../lib/collections/collections";
import {splitVarDeclarationAndRules} from "./blockly";

Template.detectorInputOutput.onCreated(function() {
  this.subscribe('Detectors');
});

Template.detectorInputOutput.onRendered(function() {
  document.getElementById('abstraction-prompt').style.display = "none";
});

Template.detectorInputOutput.helpers({
  'searchInputText': function() {
    return Session.get('searchInputText');
  },
});

Template.detectorInputOutput.events({
  'click #show-abstraction-prompt': function(e) {
    let x = document.getElementById('abstraction-prompt');
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  },
  'submit form': function(e) {
    e.preventDefault();
    let code = $('#compiledBlockly').val();
    var splitJS = splitVarDeclarationAndRules(code);

    let detector = {
      description: $('input[name=detectorname]').val(),
      variables: splitJS[0],
      rules: splitJS[1]
    };

    if (Session.get('detectorId')) {
      Detectors.update(Session.get('detectorId'), detector);
    } else {
      let detectorId = Detectors.insert(detector);
      Session.set('detectorId', detectorId);
    }
  }
});