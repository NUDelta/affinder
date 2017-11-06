Template.movementBlockBuilder.helpers({
  movementFeatures: function() {
    return MovementFeatures.find().fetch();
  },

  existingMovementBlocks: function() {
    return Queries.find({hasMovementRules: true}).fetch();
  },

  ruleForMovementFeature: function(featureName) {
    // TODO: if rules are already defined, place the rule
    // in the form input.
  }

});

Template.movementBlockBuilder.events({
  'submit form': function(e) {
    e.preventDefault();

    const ruleDefs = $(e.target).find(".def-rule");

    for (var i = ruleDefs.length - 1; i >= 0; i--) {
      var featureName = ruleDefs[i].id;
      var ruleText = ruleDefs[i].value;
      // FIXME: featureName isn't being saved as
      // variable value, just 'featureName' itself
      var rule = {
        featureName : ruleText        
      }

      if (ruleText) {
        Queries.update(this._id, {
          $set: {"hasMovementRules": true}, 
        });
      }

    }
  },

  'click .btn-redirect': function(e) {
    const url = $(e.target).attr('href')
    const id = url.split('/').pop()
    Router.go('queryBuilderPage', {_id: id});
  }


})