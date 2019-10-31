import {Detectors} from "../../lib/collections/collections";

Template.detectorInputOutput.events({
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