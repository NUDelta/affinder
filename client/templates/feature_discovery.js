Template.searchBar.events({
  'click #foo-button': function(e) {
    alert("button was clicked");

    var newTree = defaultToolbox();
    newTree["placeCategories"] = "";
    WORKSPACE.updateToolbox(stringifyToolboxTree(newTree));
  }
})

