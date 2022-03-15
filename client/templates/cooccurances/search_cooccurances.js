import { Router } from 'meteor/iron:router';
import Blockly from 'blockly';
import {getSelectPlaceTag} from '../example_situation_search';
import {Cooccurances} from '../../../lib/collections/collections'

import {
  WORKSPACE,
  addReflectionPromptToBlocks,
  createGetVariable,
  wrapBlocksInXml,
} from "../blockly";

Template.searchCooccurances.onCreated(function() {
  this.autorun(() => {
    this.subscribe('Cooccurances');
  });
});

Template.searchCooccurances.helpers({
  'cooccuringCategories'() {
    const category = Session.get('placeTagToAnalyze');
    const res = Cooccurances.findOne({category: category})
    return res.cooccurances;
  },
})

Template.searchCooccurances.events({
  'submit form#cooccurances': function(e, target) {
    e.preventDefault();
    const selectedPlaceTag = getSelectPlaceTag()
    Session.set('placeTagToAnalyze', selectedPlaceTag) // form input can get lost
    Meteor.call('searchCooccurances', {category: selectedPlaceTag});
  },
  'click .btn-add-cat': function(e) {
    const cat2add = e.target.closest('li').getAttribute('placeCategory');

    let block = createGetVariable(cat2add);
    let blocks = Blockly.Xml.textToDom(wrapBlocksInXml(block));
    if (blocks.firstElementChild) {
      Blockly.Xml.appendDomToWorkspace(blocks, WORKSPACE);
    }
    const baseline = Router.current().params.query.variant == 'B';
    if (!baseline) {
      addReflectionPromptToBlocks();
    }
  },
})
