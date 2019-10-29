Router.configure({	
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [
      Meteor.subscribe('Detectors'),
      Meteor.subscribe('Queries'),
      Meteor.subscribe('ExampleSituations.HumanReadable')
    ];
  }
});
Router.route('/', {name: 'workspace'});
Router.route('/querysummarylist', {name: 'querySummaryList'});
Router.route('/examplesituations', {name: 'exampleSituations'});
Router.route('/editor/:_id', {
  name: 'queryBuilderPage',
  data: function() {
    return Queries.findOne(this.params._id); }
});

Router.onBeforeAction('dataNotFound', {only: 'queryBuilderPage'});