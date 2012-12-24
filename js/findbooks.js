// http://chris-barr.com/index.php/entry/scrolling_a_overflowauto_element_on_a_touch_screen_device/
function isTouchDevice(){
  try{
    document.createEvent("TouchEvent");
    // $("#highlight").prepend('isTouchDevice')
    return true;
  }catch(e){
    return false;
  }
}

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
  document.addEventListener("backbutton", onBackKeyDown, false);
}
function onBackKeyDown() 
{
  console.log('back to the future!!');
}

$(function() {

  
  var librosArray = new Array('diary','hungergames', 'importa', 'logo', 'radical', 'startup', 'twilight');

  /*$(".toolbar h1").toggle(function () {
    $(".doble-column .column.right").animate({"margin-right": '-61%'});
    $(".doble-column .column.left").animate({"margin-left": 0});
  },function () {
    $(".doble-column .column.right").animate({"margin-right": 0});
    $(".doble-column .column.left").animate({"margin-left": '-61%'});
  });*/

  var highlightScroll;
  var personalScroll;

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

  var BookList = Parse.Collection.extend({
    model: Book
  });

  // Book Item View
  // --------------

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
          console.log(error.code);
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

      console.log(this.model.id);
      appRouter.navigate('book/'+this.model.id);
      this.bookUsers.query().find({
        success: function(users) {
          $.each(users, function(i, user){
            console.log(user.attributes.username);
          });
        }
      });
    }

  });

  // The Application
  // ---------------

  // The main view that lets a user manage their todo items
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
        console.log('buscando esto: '+query);

        var queryMatchesTitle = new Parse.Query(Book);
        queryMatchesTitle.matches("title", query, 'im');
        
        var queryMatchesAuthor = new Parse.Query(Book);
        queryMatchesAuthor.matches("author", query, 'im');
        
        var queryResults = Parse.Query.or(queryMatchesTitle, queryMatchesAuthor);

        queryResults.find({
          success: function(books) {
            this.$(".search .spinner").hide();
            $.each(books, function(i, book) {
              // console.log(book);
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
          console.log("results");
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
          console.log("error");
          
        }
      });
    }
  });

  var BookView = Parse.View.extend({
    tagName:"li",
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
    }
  });

  var ToolbarView = Parse.View.extend({
    el: "#all",
    events:{
      "click button.search" : "search",
      "click button.find": "searchQuery", 
      "click button.back" : "back",
      "keypress #search-query": "searchEnter"
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
      appRouter.navigate('search');
      appRouter.search();
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
      if(this.inputSearchQuery.val()!=''){
        appRouter.navigate('search/'+this.inputSearchQuery.val());
        appView.searchView.searchQuery(this.inputSearchQuery.val());
      }
      this.inputSearchQuery.val('');
      this.$('.find').focus();
      console.log('lose blur');
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
      appRouter.navigate('');
      appRouter.home();
    }
  });

  var SearchView = Parse.View.extend({
    el: "#all",
    initialize: function() {
      this.render();
      this.view = this.$('#search');
    },
    render: function() {
      this.$el.append(_.template($("#search-template").html()));
      this.delegateEvents();
    },
    show: function () {
      console.log('search');
      if(this.view.hasClass('show')){
        return true;
      }else{
        this.view.addClass("show");
        return false;
      }
      // this.$('#home').toggleClass("show-sidebar");
    },
    searchQuery: function (query) {
      console.log('buscando: '+query);
      this.view.find('div>ul').append('<li>'+query+'</li>');
    },
    hide: function () {
      this.view.removeClass('show');
    }
  });

  var HomeView = Parse.View.extend({
    el: "#all",
    initialize: function() {
      // _.bindAll(this, "logIn", "signUp");
      this.render();
      this.addFalseBooks();
    },
    render: function() {
      this.$el.append(_.template($("#home-template").html()));
      this.delegateEvents();
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
      highlightScroll = new iScroll('highlight');
      personalScroll = new iScroll('personal');
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

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#all"),

    initialize: function() {
      this.render();
    },

    render: function() {
      this.toolbarView = new ToolbarView();
      this.homeView = new HomeView();
      this.searchView = new SearchView();
      /*if (Parse.User.current()) {
        this.manageBooksView = new ManageBooksView();
      } else {
        new LogInView();
      }*/
    }
  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "search/:query": "searchQuery",
      "search":"search",
      // "home": 'home',
      "" : "home",
      "add": "add"
    },
    add: function () {
      // state.set({route:'add'});
      $('section.add').show();
      $('section.search').hide();
    },
    home: function (){
      appView.searchView.hide();
      appView.toolbarView.isHome();
      // state.set({route:'search', query:query});
    },
    searchQuery: function (query) {
      // var manageBookView = new ManageBooksView();
      appView.searchView.show();
      appView.searchView.searchQuery(query);
      appView.toolbarView.isSearch();
      // state.set({route:'search', query:query});
      // $('section.add').hide();
      // $('section.search').show();
      // new ManageBooksView.searchQuery(query);
    },
    search: function () {
      appView.searchView.show();
      appView.toolbarView.isSearch();
      // state.set({route:'search'});
    }
  });

  // var state = new AppState;
  var appRouter = new AppRouter;
  var appView = new AppView;
  Parse.history.start();

  $$(".toolbar h1").tap(function () {
    $$(".doble-column").toggleClass('show-right');
  });

  $$(".doble-column").touch(function () {
    highlightScroll.refresh();
    personalScroll.refresh();
  });

  $$(".doble-column .column.right").tap(function () {
    $$(".doble-column").addClass('show-right');
  });

  $$(".doble-column .column.left").tap(function () {
    $$(".doble-column").removeClass('show-right');
  });

  $$(".doble-column").swipeRight(function () {
    $$(".doble-column").removeClass('show-right');
  });
  $$(".doble-column").swipeLeft(function () {
    $$(".doble-column").addClass('show-right');
  });
  $$(".book").tap(function () {
    $$(this).toggleClass('rotate');
  })

  /*appRouter.on('route:search', function (query) {
    appView.manageBooksView.searchQuery(query);
  });*/

  // var state = new AppState; new AppView;
});
