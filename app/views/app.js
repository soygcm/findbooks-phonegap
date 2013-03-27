var AppView = Parse.View.extend({
  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: "#all",
  events:{
    "touchstart .scrollable": "refreshScroll",
    "mousedown .scrollable": "refreshScroll",
    'touchstart button':'buttonActive',
    'touchend button':'buttonNoActive',
    'focus form input':'inputFocus',
    'focus form select':'inputFocus',
    'blur form input':'inputNoFocus',
    'blur form select':'inputNoFocus'
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
      this.logInView = new LogInView();
      this.makeScrolls();
      this.currentView = this.homeView;
      this.$loading = $('div.loading');
      this.$loading.hide();

      this.$('.front').hide();
      
      if (!app.internetAvailable()){   
        navigator.notification.alert("No se ha encontrado una conexión a internet, la applicación necesita una conexión para poder accesar al servidor. Lo sentimos...", null, "Sin Conexión a Internet", "Ok");
        this.hide();
        this.logInView.show();
      }else{
        if (Parse.User.current()) {
          this.show();
          this.logInView.hide();
        } else {
          this.hide();
          this.logInView.show();
        }
      }
    
  },
  buttonActive:function (e) {
    console.log('tratando de definir el fake-active');
    $(e.target).addClass("f-active");
  },
  buttonNoActive:function (e) {
    $(e.target).removeClass("f-active");
  },
  inputFocus: function (e) {
    $(e.target).parent().parent('label').addClass("f-focus");
  },
  inputNoFocus: function (e) {
    $(e.target).parent().parent('label').removeClass("f-focus");
  },
  hide:function  () {
    this.$(".view").not('#login').hide();
  },
  loading: function () {
    this.$loading.fadeIn(100);
  },
  notLoading:function () {
    this.$loading.fadeOut(100);
  },
  show:function  () {
    this.$(".view").not('#login').show();
    this.homeView.clearBooks();
    this.homeView.getBooks();
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