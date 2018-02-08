Template.workspace.events({
  'submit form': function(e) {
    e.preventDefault();
    code = $('#compiledBlockly').val();
    var splitJS = splitVarDeclarationAndRules(code)

    detector = {
      description: $('input[name=detectorname]').val(),
      variables: splitJS[0],
      rules: splitJS[1]
    }

    if (Session.get('detectorId')) {
      Detectors.update(Session.get('detectorId'), detector);
    } else {
      detectorId = Detectors.insert(detector);
      Session.set('detectorId', detectorId);
    }
  }
})