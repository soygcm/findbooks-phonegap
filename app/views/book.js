// Icono de un libro en el estante
var BookView = Parse.View.extend({
  tagName:"li",
  events:{
    "click article.book": "viewBook"
  },
  template:_.template($("#book-template").html()),
  initialize: function() {

  },
  render: function(image) {
    imageJson = {"image":image};
    this.$el.html(this.template(imageJson));
    return this;
    // this.delegateEvents();
  },
  viewBook: function () {
    image = this.$('img').attr('src');
    appRouter.navigate('book/'+image, {trigger: true});
  }
});