import { exec } from 'child_process'

Template.naturalLanguageInput.events({
  'submit form': function(e) {
    e.preventDefault();

    var query = {
      query: $(e.target).find('[name=queryString]').val()
    };

    Queries.insert(query);
    // SEARCH_YELP_SCRIPT = "/Users/ryan/NUDelta/affordanceaware/search_yelp_places.py"
    // const cmd = `echo '${ data }' | python ${ SEARCH_YELP_SCRIPT }`;
    // const partners = JSON.parse(Meteor.wrapAsync(exec)(cmd));
  }	
})