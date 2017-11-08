Template.rawFeatureDefinition.helpers({
  getRuleDef: function(id, featureName) {
    var obj = {};
    obj[featureName] = true;
    const out = Queries.findOne({_id: id}, {fields: obj});
    if (featureName in out)
      return out[featureName];
    else
      return "";
  }
})