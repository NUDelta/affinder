// var categoryData = [ {
//     name: 'Mueseums',
//   },
//   {
//     name: 'Historical Tours',
// }, {
//     name: 'Uniforms',
//   }
// ];
Template.categoryList.helpers({
  categories: function() {
    return Categories.find();
  }
});