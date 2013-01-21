

  window.scrollTo(0, 0);
  
  var librosArray = new Array('diary','hungergames', 'importa', 'logo', 'radical', 'startup', 'twilight');

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("C4zgFUST9RGWSJ5scVpyB5G4co2gcMUpNPg0QpaI", "C7Qy33Kz3SbWwNOoodEg6RiuIE7a4MlvoYo99kTZ");

  // App Models
  // ----------
  var Book = Parse.Object.extend("Book");
  var User = Parse.Object.extend("User");
  var AppState = Parse.Object.extend("AppState");

  // App Collections
  // ---------------
  var BookList = Parse.Collection.extend({model: Book});

  // The DOM element for a book item...
  var BookView_old = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#book-template').html()),

    // The DOM events specific to an item.
    events: {
      "dblclick label"      : "edit",
      "click label"         : "viewOwners",
      "click .destroy"      : "clear",
      "keypress .edit"      : "updateOnEnter"
      // "blur .edit"          : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Todo and a TodoView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
      this.bookUsers = this.model.relation("users");
    },

    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).attr('id', this.model.id);
      this.inputTitle = this.$('.edit.title');
      this.inputAuthor = this.$('.edit.author');

      return this;
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.inputTitle.focus();
      this.inputAuthor.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      this.model.save({title: this.inputTitle.val(), author: this.inputAuthor.val()},
      {
        success: function(){

        },
        error: function(error){
          ////console.log(error.code);
        }
      });
      $(this.el).removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.bookUsers.remove(Parse.User.current());
      this.model.save();
      this.remove();
    },
    viewOwners: function () {

      //console.log(this.model.id);
      appRouter.navigate('book/'+this.model.id);
      this.bookUsers.query().find({
        success: function(users) {
          $.each(users, function(i, user){
            //console.log(user.attributes.username);
          });
        }
      });
    }
  });

  // The Application
  // ---------------

  var ManageBooksView = Parse.View.extend({

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #add>.field":  "createOnEnter",
      "click .log-out": "logOut",
      "keypress #search-query": "search"
    },

    el: ".content",

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'logOut', 'createOnEnter', 'search', 'searchQuery');

      // Main books management template
      this.$el.html(_.template($("#manage-books-template").html()));
      
      this.inputTitle = this.$("#book-title");
      this.inputAuthor = this.$("#book-author");
      this.inputSearchQuery = this.$("#search-query");
      // this.allCheckbox = this.$("#toggle-all")[0];

      // Create our collection of Todos
      this.books = new BookList;
      

      // Setup the query for the collection to look for todos from the current user
      this.books.query = new Parse.Query(Book);
      this.books.query.equalTo("users", Parse.User.current());
      
      this.books.bind('add',     this.addOne);
      this.books.bind('reset',   this.addAll);
      this.books.bind('all',     this.render);

      // Fetch all the todo items for this user
      this.books.fetch();

      
      /*appRouter.on("route:search", function (query) {
        self.searchQuery(query);
      });
      */
      // state.on("change", this.searchQuery, this);
    },

    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {

      this.delegateEvents();

      // this.allCheckbox.checked = !remaining;
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(book) {
      var view = new BookView({model: book});
      this.$(".add #book-list").append(view.render().el);
    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      this.$(".add #book-list").html("");
      this.books.each(this.addOne);
    },

    // Only adds some todos, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$(".add #book-list").html("");
      this.books.chain().filter(filter).each(function(item) { self.addOne(item) });
    },
    search: function (e) {
      if (e.keyCode != 13) return;
      if(this.inputSearchQuery.val()!=''){
        appRouter.navigate('search/'+this.inputSearchQuery.val());
        this.searchQuery(this.inputSearchQuery.val());
      }
      this.$(".search .spinner").hide();
      /*
      var query = new Parse.Query(BarbecueSauce);
      query.contains("name", "Extra Spicy!");
      */
    },

    searchQuery: function(query){
      if(query!=undefined && query!='' && query!=' '){
        this.$(".search .spinner").show();
        this.$(".search #book-list").html("");
        var self = this;
        this.inputSearchQuery.val(query);
        this.$("#toolbar a.search").attr('href', '#search/'+query);
        //console.log('buscando esto: '+query);

        var queryMatchesTitle = new Parse.Query(Book);
        queryMatchesTitle.matches("title", query, 'im');
        
        var queryMatchesAuthor = new Parse.Query(Book);
        queryMatchesAuthor.matches("author", query, 'im');
        
        var queryResults = Parse.Query.or(queryMatchesTitle, queryMatchesAuthor);

        queryResults.find({
          success: function(books) {
            this.$(".search .spinner").hide();
            $.each(books, function(i, book) {
              // //console.log(book);
              var view = new BookView({model: book});
              self.$(".search #book-list").append(view.render().el);
            });


          }
        });  
      }else{
        this.$(".search .spinner").hide();
      }

      

    },
    // If you hit return in the main input field, create new Todo model
    createOnEnter: function(e) {
      var self = this;
      if (e.keyCode != 13) return;
      // alert('key != 13 and field val = '+this.inputTitle.val());
      
      var inputTitle = this.inputTitle.val();
      var inputAuthor = this.inputAuthor.val();

      var query = new Parse.Query(Book);
      query.equalTo('title', inputTitle);
      query.equalTo('author', inputAuthor);
      query.find({
        success: function (results){
          //console.log("results");
          if(results.length==0){
            var book = new Book;
            var bookUsers = book.relation('users');
            book.set('title', inputTitle);
            book.set('author', inputAuthor);
            bookUsers.add(Parse.User.current());
            self.books.add(book);
            book.save();
            self.inputTitle.val('');
            self.inputAuthor.val('');
          }else{
            var book = results[0];
            var bookUsers = book.relation('users');
            bookUsers.add(Parse.User.current());
            self.books.add(book);
            book.save();
            self.inputTitle.val('');
            self.inputAuthor.val(''); 
          }
        },
        error: function(error){
          //console.log("error");
          
        }
      });
    }
  });

  var BookView = Parse.View.extend({
    tagName:"li",
    events:{
      "click article.book": "viewBook"
    },
    template:_.template($("#book-template").html()),
    initialize: function() {

      // _.bindAll(this, "logIn", "signUp");
      // this.render();
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
      //console.log('lose blur');
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
        // //console.log(Hello.caller.toString());
        window.setTimeout(function(){
          // front.hide();
          view.hide();
          thereIsPopup = $('.view.show').length;
          // thereIs
          if (!thereIsPopup){
            front.removeClass('show');
            front.hide();
          }

        }, 410);

      }
    },
    backToHome:function (e) {
      // //console.log('trying');
      if($(e.target).is('.front')){
        appRouter.navigate('', {trigger: true});
      }
    }
  });

  var SearchView = PopupView.extend({
    // el: "#all",
    initialize: function() {
      this.events = _.extend({},PopupView.prototype.events,this.events);
      this.render();
      
      
      /*this.render();
      this.view = this.$('#search');*/
    },
    render: function() {
      this.$el.append(_.template($("#search-template").html()));
      this.delegateEvents();
      this.addFalseResults();
      this.initPopup('#search');
      this.hide();
    },
    /*show: function () {
      //console.log('search');
      if(this.view.hasClass('show')){
        return true;
      }else{
        this.view.addClass("show");
        return false;
      }

      // this.$('#home').toggleClass("show-sidebar");
    },*/
    searchQuery: function (query) {
      // query = query.replace(/-+/g, ' ');
      //console.log('buscando decodeURI: '+decodeURI(query));
      this.view.find('div>ul').append('<li>'+query+'</li>');
    },
    /*hide: function () {
      this.view.removeClass('show');
    },*/
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
      // searchScroll = new iScroll('search');
      // searchScroll.refresh();
    }
  });

  var AddBookView = PopupView.extend({
    events:{
      // "click #add-book-done": "addNewBook",
      "click #add-book-done": "addNewBook",
      "click #book-photo" : "capturePhoto"
    },
    consoleLog: function () {
      //console.log('click');
    }, 
    initialize: function() {
      // this.stopPropagationEvent  = ('ontouchstart' in window)?'touchstart':'mousedown';
      this.events = _.extend({},PopupView.prototype.events,this.events);
      this.render();
      this.initPopup('#add');

      this.inputTitle = this.$("#book-title");
      this.inputAuthor = this.$("#author-name");
      this.inputCategory = this.$("#category-name");

      /*$.each(navigator, function(index, val) {
        console.log(index+': '+val);
      });*/


      // this.pictureSource=navigator.camera.PictureSourceType;
      // this.destinationType = navigator.camera.DestinationType;

    },
    render: function() {
      this.$el.append(_.template($("#add-template").html()));
      this.delegateEvents();
    },
    toggle: function(){
      this.view.toggleClass('show');
    },
    capturePhoto: function () {
      navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail, { quality: 50 });      
    },
    onPhotoDataSuccess: function(imageData) {
      console.log ("data:image/jpeg;base64," + imageData);
      this.imagePhoto = $("#image-input-photo>img");
      this.imagePhoto.attr("src", imageData);
    },
    onFail: function (message) {
      alert('Failed because: ' + message);
    },
    addNewBook: function(e) {
      var self = this;

      //console.log('Agregando');

      // if (e.keyCode != 13) return;
      // alert('key != 13 and field val = '+this.inputTitle.val());
      
      

      var inputTitle = this.inputTitle.val();
      var inputAuthor = this.inputAuthor.val();
      var inputCategory = this.inputCategory.val();

      var query = new Parse.Query(Book);
      query.equalTo('title', inputTitle);
      query.equalTo('author', inputAuthor);
      query.find({
        success: function (results){
          ////console.log("results");
          if(results.length==0){
            var book = new Book;
            // var bookUsers = book.relation('users');
            book.set('title', inputTitle);
            book.set('author', inputAuthor);
            book.set('category', inputCategory);
            // bookUsers.add(Parse.User.current());
            // self.books.add(book);
            book.save();
            self.inputTitle.val('');
            self.inputAuthor.val('');
            self.inputCategory.val('');
            // self.hide();
          }else{
            var book = results[0];
            // var bookUsers = book.relation('users');
            // bookUsers.add(Parse.User.current());
            // self.books.add(book);
            // book.save();
            self.inputTitle.val('');
            self.inputAuthor.val('');
            self.inputCategory.val('');

          }
        },
        error: function(error){
          //console.log("error");
          
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
      // event.preventDefault();
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
      // _.bindAll(this, "logIn", "signUp");

      // this.view = this.$el.find('#add');
      // this.render();
    },
    render: function() {
      // this.template(this.model.toJSON());
      this.$el.find('#book-detail').remove();
      // //console.log(this.template);
      this.$el.append(this.template(this.model));
      appView.createScroll('book-detail');
      this.initPopup('#book-detail');
      // this.delegateEvents();
    },
    viewAndShow: function (bookID, bookPhoto) {
      // //console.log(bookID+", "+bookPhoto);
      this.model = {"id": bookID, "photo":bookPhoto};
      this.render();
      // this.view = this.$el.find('#book-detail');
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
        ////console.log($(this).parent().width()-$(this).prev(".label").width()-10);
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
        ////console.log(id);
        self.createScroll(id);
      });
    },
    createScroll: function (id) {
      this.scrollable.push({'id' : id, 'scroll' : new iScroll(id, {
        onBeforeScrollStart:function (e) {
          ////console.log('onBeforeScrollStart');
          // e.stopPropagation();
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
      console.log('touchstart mousedown -------- appView refreshScroll: '+ id+' --------');
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
      // appView.hideCurrentView();
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

      /*appView.toolbarView.isSearch();*/
      // state.set({route:'search'});
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
        this.bindGlobalEvents();
    },
    bindGlobalEvents: function () {
      // self = this;
      $(window).resize(appView.updateForms());
      alert(navigator.userAgent);
      if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
          ////console.log('iPhone|iPod|iPad|Android|BlackBerry');
          document.addEventListener("deviceready", this.onDeviceReady, false);
          if (navigator.userAgent.match(/(Android)/)){
            document.addEventListener("backbutton", function(e) {
              ////console.log("Back button pressed!!!!");                 
              window.history.back();
            }, false);
          }
          if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)){
            document.addEventListener('touchmove', function (e) {
              e.preventDefault();
              //// console.log('document.touchmove -> preventDefault');
            }, false);
          }
      } else {
          this.isMobile = false;
          this.startAppView();
      }

    },
    onDeviceReady: function () {
      alert('Device is Ready');
      app.receivedEvent('deviceready');
    },
    receivedEvent: function (id) {

      this.isMobile = true;
      

      this.pictureSource=navigator.camera.PictureSourceType;
      this.destinationType=navigator.camera.DestinationType;

      /*$.each(navigator.camera, function(index, val) {
        console.log(index+': '+val+' <br>');
      });*/
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

  // ////console.log(appRouter.routes[Parse.history.fragment]);
});
