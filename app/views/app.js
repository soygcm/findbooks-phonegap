var AppView = Parse.View.extend({
  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: "#all",
  events:{
    "touchstart .scrollable": "refreshScroll",
    "mousedown .scrollable": "refreshScroll",
  },
  scrollable : [],
  initialize: function() {

  },
  render: function() {
    this.homeView = new HomeView();
    this.addBookView = new AddBookView();
    this.searchView = new SearchView();
    this.bookDetailView = new BookDetailView();
    this.toolbarView = new ToolbarView();
    this.makeScrolls();
    this.logInView = new LogInView();
      
    if (Parse.User.current()) {
      this.show();
      this.logInView.hide();
      this.currentView = this.homeView;
    } else {
      console.log(this.logInView);
      this.hide();
      this.logInView.show();
      // this.currentView = this.logInView;
    }
  },
  hide:function  () {
    this.$(".view").hide();
  },
  show:function  () {
    this.$(".view").show();
  },
  updateForms: function(){
    $("form .input").each(function() {
      $(this).width($(this).parent().width()-$(this).prev(".label").width()-10);
    });
  },
  hideCurrentView: function () {
    this.currentView.hide(); 
  },
  setCurrentView: function (view) {
    this.currentView = view;
  },
  makeScrolls: function () {
    self = this;
    this.$('.scrollable').each(function(){
      id = $(this).attr('id');
      self.createScroll(id);
    });
  },
  createScroll: function (id) {
    this.scrollable.push({'id' : id, 'scroll' : new iScroll(id, {
      onBeforeScrollStart:function (e) {
        var nodeType = e.explicitOriginalTarget ? e.explicitOriginalTarget.nodeName.toLowerCase():(e.target ? e.target.nodeName.toLowerCase():'');
        if(nodeType !='select' && nodeType !='option' && nodeType !='input' && nodeType!='textarea'){
          e.preventDefault();
        }else{
          window.scrollTo(0, 0);
          console.log('scrollTo 0,0');
        }     
      },
      hScroll: false,
      vScrollbar: true
    })});
  },
  refreshScroll: function (e) {
    id = $(e.target).closest(".scrollable").attr('id');
    scroll = this.scrollable.filter(function (scroll) {
     return scroll.id == id;
    });
    scroll[0].scroll.refresh();
  },
  //que es esto?
  preventDefault: function (e) {
    e.preventDefault();
  }
});