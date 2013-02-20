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
    var offerJson = this.model.toJSON();
    offerJson.book = this.model.get('book').toJSON();
    console.log(offerJson);
    if (!offerJson.picture.url){
      offerJson.picture = this.model.picture;
    }
    // console.log(offerJson);
    this.$el.html(this.template(offerJson));
    return this;
    // this.delegateEvents();
  },
  viewBook: function () {
    image = this.$('img').attr('src');
    appRouter.navigate('book/'+image, {trigger: true});
  }
});