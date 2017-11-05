Router.configure({	
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [
      Meteor.subscribe('querySummaries'),
      Meteor.subscribe('weatherFeatures')
    ];
  }
});
Router.route('/', {name: 'querySummaryList'});
Router.route('/query/:_id', {
  name: 'queryBuilderPage',
  data: function() {
    return Queries.findOne(this.params._id); }
});

Router.onBeforeAction('dataNotFound', {only: 'queryBuilderPage'});