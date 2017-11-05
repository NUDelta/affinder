Template.weatherBlockBuilder.helpers({
  weatherFeatures: function() {
    return WeatherFeatures.find().fetch();
  }
});