import { exec } from 'child_process'

Template.naturalLanguageInput.events({
  'submit form': function(e) {
    e.preventDefault();

    const queryString = $(e.target).find('[name=queryString]').val()

    // SEARCH_YELP_SCRIPT = "/Users/ryan/NUDelta/affordanceaware/search_yelp_places.py"
    // const cmd = `echo '${ queryString }' | python ${ SEARCH_YELP_SCRIPT }`;
    // console.log(queryString);
    // console.log(cmd);
    // const categories = Meteor.wrapAsync(exec)(cmd);
    // console.log(categories);


    var query = {
      query: queryString
    };
    query._id = Queries.insert(query);

    Router.go('queryBuilderPage', query);
  }
})