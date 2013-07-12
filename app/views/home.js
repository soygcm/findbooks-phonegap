var HomeView = Parse.View.extend({
  el: "#all",
  events:{
    'swipeRight .doble-column': "onSwipeRight",
    'swipeLeft .doble-column': "onSwipeLeft",
    'tap .column.right':'showRightColumn',
    'tap .column.left':'showLeftColumn',
    "click button.log-out": "logOut"
  },
  initialize: function() {
    // _.bindAll(this, "logIn", "signUp");
    this.render();
    this.mainView = this.$('#home');
  },
  render: function() {
    this.$el.prepend(_.template($("#home-template").html()));
    this.delegateEvents();
  },
  logOut:function  () {
    appView.logInView.logOut();
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
  clearBooks: function () {
    this.$("ul.grid").empty();
  },
  getBooks: function(){
    appView.loading();
    self = this;
    if(user = Parse.User.current()){

      this.offerList = new OfferList;
      this.offerList.query = new Parse.Query(Offer).equalTo("user", user);
      this.offerList.fetch({
        success: function(offers) {
          self.offerListCount = 0;
          // collection.length;
          console.log(offers)
          offers.each(function(offer) {
            book = offer.get('book');
            book.fetch({
              success: function(book) {
                self.offerListCount++;
                if (self.offerListCount == offers.length) {
                  self.addOffers(offers, 'personal');
                  self.getPublicBooks();
                }
              }
            });

          });
        },
        error: function(collection, error) {
          // The collection could not be retrieved.
        }
      });

      /*this.userBooks = user.relation('books');
      this.userBooks = this.userBooks.query().collection();
      this.userBooks.fetch({
        success: function(books) {
          appView.homeView.addBooks(books, 'personal');
          self.getPublicBooks();
        }
      });*/
    }else{
      this.getPublicBooks();
    }
  },
  getPublicBooks:function () {
    self = this;
    if(this.userBooks){
      var booksIdArray = new Array();
      this.userBooks.each(function (book) {
        booksIdArray.push(book.id);
      });
      this.publicBooks = new BookList;
      this.publicBooks.query = new Parse.Query(Book).notContainedIn("objectId", booksIdArray).limit(10);
      this.publicBooks.fetch({
        success: function(books) {
          appView.notLoading();
          appView.homeView.addBooks(books, 'public');
        },
        error:function (b, message) {
          appView.notLoading();
          navigator.notification.alert(message, null, "Error", "Ok");
        }
      });
    }else{
      this.publicBooks = new BookList;
      this.publicBooks.query = new Parse.Query(Book).limit(10);
      this.publicBooks.fetch({
        success: function(books) {
          appView.notLoading();
          appView.homeView.addBooks(books, 'public');
        },
        error:function (b, message) {
          appView.notLoading();
          navigator.notification.alert(message, null, "Error", "Ok");
        }
      });
    }
  },
  addOffers: function (offers, select) {
    self = this;
    offers.each(function(offer) {
      self.addOneBook(offer, select);
    });

    /*books.each(function(book) {
      self.addOneBook(book, select);
    });*/
  },
  addBooks: function (books, select) {
    self = this;
    books.each(function(book) {
      self.addOneBook(book, select);
    });
  },
  addNewBook: function (bookNew) {
    var isNew = 0;
    var isNewPhoto = 0;
    self = this;
    jQuery.each(this.userBooks.models, function(index, book) {
      if(!(bookNew.get('title') == book.get('title') &&  bookNew.get('author') == bookNew.get('author'))){
        isNew++;
      }
      if(bookNew.get('picture').url != book.get('picture').url){
        isNewPhoto++;
      }
    });
    if(isNew>0){
      self.addOneBook(bookNew, 'personal');
    }
    console.log('Es nuevo el libro? '+isNew+' Es nueva la foto? '+isNewPhoto);

  },
  addOneBook: function (book, select){
    // console.log(book);
    var bookView = new BookView({model: book});
    this.$('ul#'+select).prepend(bookView.render(select).el);
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