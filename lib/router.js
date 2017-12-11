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
Router.route('/', {name: 'querySummaryList'});
Router.route('/wordbrainstorm/:_id', {
  name: 'wordBrainstorm',
  data: function() {
    return Queries.findOne(this.params._id);
  }
});
Router.route('/query/:_id', {
  name: 'queryBuilderPage',
  data: function() {
    return Queries.findOne(this.params._id); }
});

Router.onBeforeAction('dataNotFound', {only: 'queryBuilderPage'});