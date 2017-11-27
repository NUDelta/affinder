Template.googleImageSearch.helpers({
  imageSearchUrl: function(str) {
    const query = str.split(' ').join('+');
    return "https://www.google.com/search?q=" + query + "&tbm=isch";
  }
})