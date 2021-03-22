import {Detectors} from "../../lib/collections/collections";
import {ReflectAndExpand, WORKSPACE} from "./blockly";
import {splitVarDeclarationAndRules} from "../../lib/detectors/detectors";

Template.detectorInputOutput.onCreated(function() {
  this.subscribe('Detectors');
});

Template.detectorInputOutput.onRendered(function() {
  Tracker.autorun((computation) => {
    // the current detector has not been saved into the database
    if (!Session.get('detectorId')) {
      let detectorDescription = $('input[name=detectorname]').val()
      if (detectorDescription) {
        // they forgot to save, so just save their current detector for them
        $('#saveDetectorForm').trigger('submit');
      } else {
        detectorDescription = prompt('Name your high-level situation detector:');
        $('input[name=detectorname]').val(detectorDescription);
        $('#saveDetectorForm').trigger('submit');
      }
      return;
    }

    // detector is finally saved! don't keep checking
    computation.stop();
  });
});

Template.detectorInputOutput.helpers({
  'searchInputText': function() {
    return Session.get('searchInputText');
  },

  baseline(){
    const baseline = Router.current().params.query.variant == 'B';
    return baseline;
  }
});

Template.detectorInputOutput.events({
  'click #show-abstraction-prompt': function(e) {
    let blocks = WORKSPACE.getAllBlocks(false);
    for (let i = 0, block; block = blocks[i]; i++) {
      blockName = ReflectAndExpand.parseBlockName(block);
      if (blockName) {
        let detectorDescription = $('input[name=detectorname]').val()
        block.setCommentText(ReflectAndExpand.reflectPromptText(blockName, detectorDescription));
        block.comment.setBubbleSize(300, 300); // large enough for reflect prompt, reflection, and expansion prompt
      }
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