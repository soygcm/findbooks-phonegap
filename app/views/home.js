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
    this.personalOffers.query = new Parse.Query(Offer);
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
    // self = this;
    this.personalOffers.fetch({
      success: function(offers) {
        appView.homeView.offerCount = offers.length;
        offers.each(function(offer) {
          appView.homeView.getBookOffer(offer);
        });
      },
      error: function(collection, error) {
        // The collection could not be retrieved.
      }
    });
  },
  getBookOffer: function (offer) {
    self = this;
    var book = offer.get("book");
    book.fetch({
      success: function(book) {
        self.offerCount--;
        if (self.offerCount == 0) {
          self.addPersonalOffers(self.personalOffers);
        };
      }
    });
  },
  addPersonalOffers: function (offers) {
    self = this;
    offers.each(function(offer) {
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