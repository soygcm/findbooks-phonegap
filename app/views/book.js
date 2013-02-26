// Icono de un libro en el estante
var BookView = Parse.View.extend({
  tagName:"li",
  events:{
    "click article.book": "viewBook"
  },
  template:_.template($("#book-template").html()),
  initialize: function() {

  },
  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
  viewBook: function () {
    // image = this.$('img').attr('src');
    appView.bookDetailView.model = this.model;
    appRouter.navigate('book/'+this.model.id, {trigger: true});
  }
});