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
    // this.$("#personal>div>ul").empty();
    self = this;
    var user = Parse.User.current();
    this.userBooks = user.relation('books');
    this.userBooks = this.userBooks.query().collection();
    this.userBooks.fetch({
      success: function(books) {
        // appView.homeView.userBooks = books;
        appView.homeView.addUserBooks(books);
        // list contains the posts that the current user likes.
      }
    });
  },
  addUserBooks: function (books) {
    self = this;
    books.each(function(book) {
      self.addOneBook(book);
    });
  },
  addNewBook: function (bookNew) {
    var isNew = 0;
    var isNewPhoto = 0;
    self = this;
    jQuery.each(this.userBooks, function(index, book) {
      // console.log('bookNew:'+bookNew.get('title')+', book:'+book.get('title'));
      if(!(bookNew.get('title') == book.get('title') &&  bookNew.get('author') == bookNew.get('author'))){
        isNew++;
      }
      if(bookNew.get('picture').url != book.get('picture').url){
        isNewPhoto++;
      }
    });
    if(isNew>0){
      self.addOneBook(bookNew);
    }
    console.log('Es nuevo el libro? '+isNew+' Es nueva la foto? '+isNewPhoto);

  },
  addOneBook: function (book){
    // console.log(book);
    var view = new BookView({model: book});
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