Template.movementBlockBuilder.helpers({
  movementFeatures: function() {
    return MovementFeatures.find().fetch();
  },

  existingMovementBlocks: function() {
    return Queries.find({hasMovementRules: true}).fetch();
  },

  getRuleDef: function(id, featureName) {
    var obj = {};
    obj[featureName] = true;
    const out = Queries.findOne({_id: id}, {fields: obj});
    if (featureName in out)
      return out[featureName];
    else
      return "";
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