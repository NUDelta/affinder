Template.weatherBlockBuilder.helpers({
  weatherFeatures: function() {
    return WeatherFeatures.find().fetch();
  },

  existingWeatherBlocks: function() {
    return Queries.find({hasWeatherRules: true}).fetch();
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

Template.weatherBlockBuilder.events({
  'submit form': function(e) {
    e.preventDefault();

    const ruleDefs = $(e.target).find(".def-rule");

    for (var i = ruleDefs.length - 1; i >= 0; i--) {
      var featureName = ruleDefs[i].id;
      var ruleText = ruleDefs[i].value;
      
      var obj = {};
      obj[featureName] = ruleText;
      obj["hasWeatherRules"] = true;

      if (ruleText)
        Queries.update(this._id, {$set: obj});

    }
  },

  'click .btn-redirect': function(e) {
    const url = $(e.target).attr('href')
    const id = url.split('/').pop()
    Router.go('queryBuilderPage', {_id: id});
  }

})