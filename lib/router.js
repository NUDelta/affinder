Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
});
Router.route('/', {name: 'workspace'})
Router.route('/querysummarylist', {name: 'querySummaryList'});
Router.route('/examplesituations', {name: 'exampleSituations'});
Router.route('/editor/:_id', {
  name: 'queryBuilderPage',
  data: function() {
    return Queries.findOne(this.params._id); }
});

Router.onBeforeAction('dataNotFound', {only: 'queryBuilderPage'});