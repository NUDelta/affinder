Router.configure({	
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [
      Meteor.subscribe('querySummaries'),
      Meteor.subscribe('blockSearch', 'shopping'),
      Meteor.subscribe('weatherFeatures'),
      Meteor.subscribe('movementFeatures')
    ];
  }
});
Router.route('/', {name: 'querySummaryList'});
Router.route('/query/:_id', {
  name: 'queryBuilderPage',
  data: function() {
    // Meteor.subscribe('blockSearch');

    return Queries.findOne(this.params._id); }
});

Router.onBeforeAction('dataNotFound', {only: 'queryBuilderPage'});