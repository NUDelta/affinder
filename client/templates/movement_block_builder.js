Template.movementBlockBuilder.helpers({
  rawFeatures: function() {
    // data context for rawFeatureBuilder
    return MovementFeatures.find().fetch();
  },

  existingMovementBlocks: function() {
    return Queries.find({hasMovementRules: true}).fetch();
  }

});

Template.movementBlockBuilder.events({
  'submit form': function(e) {
    e.preventDefault();

    const ruleDefs = $(e.target).find(".def-rule");

    for (var i = ruleDefs.length - 1; i >= 0; i--) {
      var featureName = ruleDefs[i].id;
      var ruleText = ruleDefs[i].value;

      var obj = {};
      obj[featureName] = ruleText;
      obj["hasMovementRules"] = true;

      if (ruleText)
        Queries.update(this._id, {$set: obj})

    }
  }
})