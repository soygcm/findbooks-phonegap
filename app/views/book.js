// Icono de un libro en el estante
var BookView = Parse.View.extend({
  tagName:"li",
  events:{
    "click article.book.public": "viewBook",
    "click article.book.personal": "editBook"
  },
  template:_.template($("#book-template").html()),
  initialize: function() {

  },
  render: function(select) {
    this.$el.html(this.template(this.model.toJSON()));
    this.$('article.book').addClass(select);
    return this;
  },
  viewBook: function () {
    // image = this.$('img').attr('src');
    appView.bookDetailView.model = this.model;
    appRouter.navigate('book/'+this.model.id, {trigger: true});
  },
  editBook: function () {
    appView.bookEditView.model = this.model;
    appRouter.navigate('edit-book/'+this.model.id, {trigger: true});
  }
});