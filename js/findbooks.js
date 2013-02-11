window.scrollTo(0, 0); //No se si esta linea es necesaria

var librosArray = new Array('diary','hungergames', 'importa', 'logo', 'radical', 'startup', 'twilight');

Parse.$ = jQuery;

var parseApplicationId = "C4zgFUST9RGWSJ5scVpyB5G4co2gcMUpNPg0QpaI";
var parseRESTAPIKey = "pYnV60HdDrE8moVcRWnob0RBPzgllsOzDbspc5HU";
var parseJSKey = "C7Qy33Kz3SbWwNOoodEg6RiuIE7a4MlvoYo99kTZ";

Parse.initialize(parseApplicationId, parseJSKey);

var Book = Parse.Object.extend("Book");
var User = Parse.Object.extend("User");
var Offer = Parse.Object.extend("Offer");
var AppState = Parse.Object.extend("AppState");
var BookList = Parse.Collection.extend({model: Book});

// Icono de un libro en el estante
var BookView = Parse.View.extend({
  tagName:"li",
  events:{
    "click article.book": "viewBook"
  },
  template:_.template($("#book-template").html()),
  initialize: function() {

  },
  render: function(image) {
    imageJson = {"image":image};
    this.$el.html(this.template(imageJson));
    return this;
    // this.delegateEvents();
  },
  viewBook: function () {
    image = this.$('img').attr('src');
    appRouter.navigate('book/'+image, {trigger: true});
  }
});

var ToolbarView = Parse.View.extend({
  el: "#all",
  events:{
    "click button.search" : "search",
    "click button.find"   : "searchQuery", 
    "click button.back"   : "back",
    "click button.add"    : "add",
    "click .title-app"    : "home",
    "keypress #search-query": "searchEnter",
    // "touchmove #toolbar-main": "preventDefault"
  },
  initialize: function() {
    // _.bindAll(this, "logIn", "signUp");
    this.render();
    this.inputSearchQuery = this.$("#search-query");
  },
  render: function() {
    this.$el.append(_.template($("#toolbar-template").html()));
    this.delegateEvents();
  },
  search: function () {
    appRouter.navigate('search', {trigger: true});
  },
  isSearch: function () {
    this.$('.search-input').show();
    this.$('.title-app').hide();
    this.$('.find').show();
    this.$('.search').hide();
    this.$('.add').hide();
    this.$('.back').show();
    this.inputSearchQuery.focus();
  },
  searchEnter: function (e) {
    if (e.keyCode != 13) return;
    this.searchQuery();
  },
  searchQuery: function () {
    query = this.inputSearchQuery.val()
    if(query!=''){
      appRouter.navigate('search/'+encodeURI(query), {trigger: true});
    }
    this.inputSearchQuery.val('');
    this.$('.find').focus();
  },
  isHome: function () {
    this.$('.search-input').hide();
    this.$('.title-app').show();
    this.$('.find').hide();
    this.$('.search').show();      
    this.$('.add').show();
    this.$('.back').hide();      
  },
  back: function () {
    appRouter.navigate('', {trigger: true});
  },
  add:function(){
    appRouter.navigate('add', {trigger: true});
  },
  home:function(){
    if(appRouter.routes[Parse.history.fragment]=='home'){
      appView.homeView.toggleColumn();
    }else{
      appRouter.navigate('', {trigger: true});
    }
  },
  preventDefault: function (e) {
    e.preventDefault();
  },
});

var PopupView = Parse.View.extend({
  el: "#all",
  events:{
    'click .front':'backToHome'
  },
  initPopup: function (popupID) {
    this.front = this.$('.front');
    this.view = this.$(popupID);
  },
  show: function () {
    if(!this.view.hasClass('show')){
      this.view.show();
      this.front.addClass("show");
      this.front.show();
      self = this;
      window.setTimeout(function(){
        self.view.addClass("show");
      }, 1);
    }
  },
  hide: function () {
    if(this.view.hasClass('show') || this.view.is(":visible")){
      this.view.removeClass('show');
      front = this.front;
      view = this.view;
      window.setTimeout(function(){
        view.hide();
        thereIsPopup = $('.view.show').length;
        if (!thereIsPopup){
          front.removeClass('show');
          front.hide();
        }

      }, 410);

    }
  },
  backToHome:function (e) {
    if($(e.target).is('.front')){
      appRouter.navigate('', {trigger: true});
    }
  }
});

var SearchView = PopupView.extend({
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
    this.render();
  },
  render: function() {
    this.$el.append(_.template($("#search-template").html()));
    this.delegateEvents();
    this.addFalseResults();
    this.initPopup('#search');
    this.hide();
  },
  searchQuery: function (query) {
    // query = query.replace(/-+/g, ' ');
    //console.log('buscando decodeURI: '+decodeURI(query));
    this.view.find('div>ul').append('<li>'+query+'</li>');
  },
  addFalseResults: function(){
    veces = 0;
    max = librosArray.length;
    for (var i = 0; i < 5; i++) {
      index = i-(max*veces);
      if (i-(veces*max)>=max-1) {
        veces++;
      }
      var bookView = new BookView();
      this.$("#search>div>ul").prepend(bookView.render(librosArray[index]).el);
    }
  }
});

var AddBookView = PopupView.extend({
  events:{
    // "click #add-book-done": "addNewBook",
    "click #add-book-done": "addNewBook",
    "click #book-photo" : "capturePhoto",
    "click #book-upload-image" : "uploadPhoto",
    "change #offer-type" : "selectOfferType"
  },
  // ? consoleLOg? para que es?
  consoleLog: function () {
    
  }, 
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
    this.render();
    this.initPopup('#add');

    this.inputTitle = this.$("#book-title");
    this.inputAuthor = this.$("#author-name");
    this.inputCategory = this.$("#category-name");

    this.inputOfferType = this.$("#offer-type");
    this.inputSellPrice = this.$("#sell-price");
    this.inputLendTime = this.$("#lend-time");
    this.inputLendTimeType = this.$("#lend-time-type");
    this.inputRentPrice = this.$("#rent-price");
    this.inputRentTime = this.$("#rent-time");
    this.inputRentTimeType = this.$("#rent-time-type");

    this.imagePhoto = this.$("#image-input-photo>img");
    // this.buttonUploadImage =  this.$("#book-upload-image");
    // this.imageData = this.$("#image-input-photo>img").attr("src");
    
    this.loadingBar = this.$(".loading-bar");
    this.loadingBarComplete = this.$(".loading-bar .complete");
    this.selectOfferType();

    /*this.file;

    $('#postedFile').bind("change", function(e) {
      var files = e.target.files || e.dataTransfer.files;
      // Our file var now holds the selected file
      file = files[0];
    });*/
  },
  render: function() {
    this.$el.append(_.template($("#add-template").html()));
    this.delegateEvents();
  },
  /// Alguna vez es llamado??
  toggle: function(){
    this.view.toggleClass('show');
  },
  selectOfferType: function(){
    this.$(".toggle-section").hide();
    this.$("#"+$("#offer-type").find("option:selected").val()).show();
    appView.updateForms();
    // console.log("#"+$(e.target).find("option:selected").val());
  },
  capturePhoto: function () {
    navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail,
    {
      quality: 50, 
      // destinationType: app.destinationType.DATA_URL
      destinationType: app.destinationType.FILE_URI
    });      
  },
  onPhotoDataSuccess: function(imageData) {
    // this no existe!!!! 
    appView.addBookView.imagePhoto.show();
    appView.addBookView.imagePhoto.attr("src", imageData);
    appView.addBookView.imageData = imageData;
  },
  onFail: function (message) {
    alert('Failed because: ' + message);
  },
  uploadPhoto: function () {
    var imageURI = this.imageData;
    var options = new FileUploadOptions();
    var fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.fileName=fileName;
    options.chunkedMode = false;
    options.params = {'front':true};
    self = this;
    var ft = new FileTransfer();
    ft.onprogress = function (e) {
      if (e.lengthComputable){
        self.setPercentageLoading(e.loaded / e.total);
      }
    }
    // ft.upload(imageURI, "https://api.parse.com/1/files/"+fileName, this.win, this.fail, options);
    ft.upload(imageURI, "http://test.mobileease.me/parse/upload.php", this.win, this.fail, options);
  },
  setPercentageLoading: function (percentage) {
    this.loadingBar.show();
    this.loadingBarComplete.width(percentage*100 + "%");
  },
  win: function (r) {
    //no existe this
    appView.addBookView.loadingBar.hide();
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    // console.log("Sent = " + r.bytesSent);
    appView.addBookView.imageUploadedResponse = jQuery.parseJSON(r.response.slice(0,-1));
    console.log("URL: "+ appView.addBookView.imageUploadedResponse.url);
    appView.addBookView.addNewBookToParse();
    // this.imageurl =  r.response
  },
  fail: function (error) {
    alert("An error has occurred: Code = " + error.code);
    $.each(error, function(index, val) {
      console.log(index+': '+val);
    });
  },
  addNewBook: function () {
    if(this.imagePhoto.attr("src")==""){
      alert("Tomale una Foto a tu libro antes de publicar tu oferta");
    }else{
      this.uploadPhoto();
    }
    // this.addNewBookToParse();
  },
  addNewBookToParse: function(e) {
    var self = this;    
    
    var inputTitle = this.inputTitle.val();
    var inputAuthor = this.inputAuthor.val();
    var inputCategory = this.inputCategory.val();

    var query = new Parse.Query(Book);
    query.equalTo('title', inputTitle);
    query.equalTo('author', inputAuthor);
    query.find({
      success: function (results){
        ////console.log("results");
        var offer = new Offer;
        offer.set('type', self.inputOfferType.val());

        switch(self.inputOfferType.val()){
          case 'sell':
            offer.set('price', self.inputSellPrice.val());
            break;
          case 'lend':
            offer.set('time', self.inputLendTime.val());
            offer.set('timeType', self.inputLendTimeType.val());
            break;
          case 'rent':
            offer.set('price', self.inputRentPrice.val());
            offer.set('time', self.inputRentTime.val());
            offer.set('timeType', self.inputRentTimeType.val());
            break;
        }
        offer.set({picture: {"name": self.imageUploadedResponse.name,"__type": "File"}});
        if(results.length==0){
          var book = new Book;
          book.set('title', inputTitle);
          book.set('author', inputAuthor);
          book.set('category', inputCategory);
        }else{
          var book = results[0];
        }
        offer.set('book', book);
        offer.save(null, {
          success: function (offer) {
            var bookOffers = book.relation('offers');
            bookOffers.add(offer);
            book.save(null, {
              success: function(book) {
                self.$('input').val('');
                self.imagePhoto.attr('src','');
                appRouter.navigate('', {trigger: true});
                // The object was saved successfully.
              },
              error: function(gameScore, error) {
                // The save failed.
                // error is a Parse.Error with an error code and description.
              }
            });
          }
        });
      },
      error: function(error){
        console.log("error");
        /*$.each(error, function(index, val) {
          console.log(index+': '+val);
        });*/
      }
    });
  }
});

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

var LogInView = Parse.View.extend({
  events: {
    "submit form.login-form": "logIn",
    "submit form.signup-form": "signUp"
  },

  el: ".content",
  
  initialize: function() {
    _.bindAll(this, "logIn", "signUp");
    this.render();
  },

  logIn: function(e) {
    var self = this;
    var username = this.$("#login-username").val();
    var password = this.$("#login-password").val();
    
    Parse.User.logIn(username, password, {
      success: function(user) {
        new ManageBooksView();
        self.undelegateEvents();
        delete self;
      },

      error: function(user, error) {
        self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
        this.$(".login-form button").removeAttr("disabled");
      }
    });

    this.$(".login-form button").attr("disabled", "disabled");

    return false;
  },

  signUp: function(e) {
    var self = this;
    var username = this.$("#signup-username").val();
    var password = this.$("#signup-password").val();
    
    Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
      success: function(user) {
        new ManageBooksView();
        self.undelegateEvents();
        delete self;
      },

      error: function(user, error) {
        self.$(".signup-form .error").html(error.message).show();
        this.$(".signup-form button").removeAttr("disabled");
      }
    });

    this.$(".signup-form button").attr("disabled", "disabled");

    return false;
  },

  render: function() {
    this.$el.html(_.template($("#login-template").html()));
    this.delegateEvents();
  }
});

var BookDetailView = PopupView.extend({
  template:_.template($("#book-detail-template").html()),
  model: {},
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
  },
  render: function() {
    this.$el.find('#book-detail').remove();
    this.$el.append(this.template(this.model));
    appView.createScroll('book-detail');
    this.initPopup('#book-detail');
  },
  viewAndShow: function (bookID, bookPhoto) {
    this.model = {"id": bookID, "photo":bookPhoto};
    this.render();
    this.show();
  }
});

var AppView = Parse.View.extend({
  // Instead of generating a new element, bind to the existing skeleton of
  // the App already present in the HTML.
  el: $("#all"),
  events:{
    "touchstart .scrollable": "refreshScroll",
    "mousedown .scrollable": "refreshScroll",
  },
  scrollable : [],
  initialize: function() {
    // console.log('--------- AppView initialize --------');
    // this.bindGlobalEvents();
  },
  render: function() {
    this.homeView = new HomeView();
    
    this.addBookView = new AddBookView();
    this.searchView = new SearchView();
    this.bookDetailView = new BookDetailView();
    this.toolbarView = new ToolbarView();

    this.currentView = this.homeView;
    
    this.makeScrolls();

    /*if (Parse.User.current()) {
      this.manageBooksView = new ManageBooksView();
    } else {
      new LogInView();
    }*/
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
  preventDefault: function (e) {
    e.preventDefault();
  }
});

var AppRouter = Parse.Router.extend({
  routes: {
    "search/:query" : "searchQuery",
    "search" : "search",
    // "home": 'home',
    "" : "home",
    "add": "add",
    "book/*path":"viewBook",
  },
  add: function () {
    appView.hideCurrentView();
    appView.toolbarView.isHome();
    appView.addBookView.show();
    appView.updateForms();
    appView.currentView = appView.addBookView;
  },
  home: function (){
    appView.hideCurrentView();
    appView.addBookView.hide();
    appView.toolbarView.isHome();
    appView.setCurrentView(appView.homeView);
  },
  searchQuery: function (query) {
    appView.searchView.show();
    appView.toolbarView.isSearch();
    appView.searchView.searchQuery(decodeURI(query));
    appView.setCurrentView(appView.searchView);
  },
  search: function () {
    appView.hideCurrentView();
    appView.searchView.show();
    appView.toolbarView.isSearch();
    appView.setCurrentView(appView.searchView);
  },
  viewBook: function (id) {
    appView.hideCurrentView();
    appView.toolbarView.isHome();
    appView.bookDetailView.viewAndShow("45", id);
    appView.setCurrentView(appView.bookDetailView);
  }
});


var appView = new AppView;
var appRouter;

var app = {
  initialize: function() {
      $(window).resize(appView.updateForms);
      this.bindGlobalEvents();
  },
  bindGlobalEvents: function () {
    
    console.log(navigator.userAgent);
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        document.addEventListener("deviceready", this.onDeviceReady, false);
        if (navigator.userAgent.match(/(Android)/)){
          document.addEventListener("backbutton", function(e) {                
            window.history.back();
          }, false);
        }
        if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)){
          document.addEventListener('touchmove', function (e) {
            e.preventDefault();
          }, false);
        }
    } else {
        this.isMobile = false;
        this.startAppView();
    }

  },
  onDeviceReady: function () {
    console.log('Device is Ready');
    app.receivedEvent('deviceready');
  },
  receivedEvent: function (id) {
    this.isMobile = true;
    
    this.pictureSource=navigator.camera.PictureSourceType;
    this.destinationType=navigator.camera.DestinationType;

    console.log('Received Event: ' + id);
    this.startAppView();
  },
  startAppView: function () {
    appView.render();
    appRouter = new AppRouter;
    Parse.history.start();
  }
};

$(document).ready(function() {
  app.initialize();
});
