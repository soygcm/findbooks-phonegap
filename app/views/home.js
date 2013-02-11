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
    this.addFalseBooks();
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
  addFalseBooks: function(){
    veces = 0;
    max = librosArray.length;
    for (var i = 0; i < 20; i++) {
      index = i-(max*veces);
      if (i-(veces*max)>=max-1) {
        veces++;
      }
      var view1 = new BookView();
      this.$("#personal>div>ul").prepend(view1.render(librosArray[index]).el);
    }
    veces = 0;
    for (var i = 0; i < 50; i++) {
      index = i-(max*veces);
      if (i-(veces*max)>=max-1) {
        veces++;
      }
      var view2 = new BookView();
      this.$("#highlight>div>ul").prepend(view2.render(librosArray[index]).el);
    }
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