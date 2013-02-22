var HomeView = Parse.View.extend({
  el: "#all",
  events:{
    'swipeRight .doble-column': "onSwipeRight",
    'swipeLeft .doble-column': "onSwipeLeft",
    'tap .column.right':'showRightColumn',
    'tap .column.left':'showLeftColumn'
  },
  initialize: function() {
    // _.bindAll(this, "logIn", "signUp");
    this.render();
    this.mainView = this.$('#home');
    this.personalOffers = new OfferList;
    this.personalOffers.query = new Parse.Query('Offer');
    this.personalOffers.query.equalTo("user", Parse.User.current());
    this.personalOffers.bind('add', this.addOne);//? Alguna vez se usa?
    this.getUserBooks();
  },
  render: function() {
    this.$el.prepend(_.template($("#home-template").html()));
    this.delegateEvents();
  },
  toggleColumn: function(){
    this.mainView.toggleClass('show-right');
  },
  showRightColumn: function(){
    this.mainView.addClass('show-right'); 
  },
  showLeftColumn: function () {
    this.mainView.removeClass('show-right'); 
  },
  getUserBooks: function(){
    this.$("#personal>div>ul").empty();
    self = this;

    Parse.Cloud.run('getUserBooks', {}, {
      success: function (result){
        appView.homeView.addPersonalOffers(result)
        console.log(result);
      }
    });
  },
  addPersonalOffers: function (offers) {
    self = this;
    jQuery.each(offers, function(index, offer) {
      self.addOne(offer);
    });
  },
  addOne: function (offer){
    console.log(this.$);
    var view = new BookView({model: offer});
    this.$("#personal>div>ul").prepend(view.render().el);
    // console.log(offer);
  },
  hide: function () {
    
  }, 
  onSwipeRight: function (e) {
    this.showLeftColumn();
  },
  onSwipeLeft: function () {
    this.showRightColumn();
  }
});