// Icono de un libro en el estante
var OfferLiView = Parse.View.extend({
  tagName:"li",
  events:{
    "click article.offer-li": "viewOffer"
  },
  template:_.template($("#offer-li-template").html()),
  initialize: function() {

  },
  render: function() {
    var modelJson = this.model.toJSON();
    modelJson.user = this.model.get('user').toJSON();
    var description;
    switch(modelJson.type){
      case 'sell':
        description = '¢'+modelJson.price;
        break;
      case 'rent':
        description = '¢'+modelJson.price+'/hora';
        break;
      case 'lend':
        description = '(Prestado)';
        break;
      case 'donate':
        description = '(Gratuito)';
        break;
    }
    modelJson.description = description;
    this.$el.html(this.template(modelJson));
    return this;
  },
  viewOffer: function () {
    // image = this.$('img').attr('src');
    // appView.bookDetailView.model = this.model;
    // appRouter.navigate('book/'+this.model.id, {trigger: true});
  }
});