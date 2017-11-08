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
  },

  'click .btn-redirect': function(e) {
    const url = $(e.target).attr('href')
    const id = url.split('/').pop()
    Router.go('queryBuilderPage', {_id: id});
  },

  'click .btn-use-lego': function(e) {
    lego_id = $(e.target).parent().attr('id');
    query_id = $(e.target).attr('queryId')

    // TODO: not sure about ands/ors
    Queries.update(query_id, {
      $addToSet: {"subLegos": lego_id}
    });
  }


})