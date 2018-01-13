Router.configure({	
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [
      Meteor.subscribe('querySummaries'),
      Meteor.subscribe('weatherFeatures'),
      Meteor.subscribe('movementFeatures')
    ];
  }
});
Router.route('/', {name: 'naturalLanguageInput'})
Router.route('/querysummarylist', {name: 'querySummaryList'});
Router.route('/editor/:_id', {
  name: 'queryBuilderPage',
  data: function() {
    return Queries.findOne(this.params._id); }
});

Router.onBeforeAction('dataNotFound', {only: 'queryBuilderPage'});