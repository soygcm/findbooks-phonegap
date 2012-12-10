function isTouchDevice(){
  try{
    document.createEvent("TouchEvent");
    $("#highlight").prepend('isTouchDevice')
    return true;
  }catch(e){
    return false;
  }
}
function touchScroll(id){
  if(isTouchDevice()){ //if touch events exist...
    var el=document.getElementById(id);
    var scrollStartPos=0;

    document.getElementById(id).addEventListener("touchstart", function(event) {
      scrollStartPos=this.scrollTop+event.touches[0].pageY;
      event.preventDefault();
    },false);

    document.getElementById(id).addEventListener("touchmove", function(event) {
      this.scrollTop=scrollStartPos-event.touches[0].pageY;
      event.preventDefault();
    },false);
  }
}



$(function() {

  touchScroll("highlight");

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("C4zgFUST9RGWSJ5scVpyB5G4co2gcMUpNPg0QpaI", "C7Qy33Kz3SbWwNOoodEg6RiuIE7a4MlvoYo99kTZ");

  // Book Model
  // ----------

  var Book = Parse.Object.extend("Book");
  var User = Parse.Object.extend("User");

  var AppState = Parse.Object.extend("AppState");

  // Book Collection
  // ---------------

  var BookList = Parse.Collection.extend({
    model: Book
  });

  // Book Item View
  // --------------

  // The DOM element for a book item...
  var BookView = Parse.View.extend({

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
      /*this.bookUsers.query().find({
        success: function(users) {
          $.each(users, function(i, user){
            console.log(user.attributes.username);
          });
        }
      });*/
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

  var searchBooks = Parse.View.extend({

  });

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    initialize: function() {
      this.render();
    },

    render: function() {
      if (Parse.User.current()) {
        this.manageBooksView = new ManageBooksView();
      } else {
        new LogInView();
      }
    }
  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "search/:query": "search",
      "search":"search",
      "add": "add"
    },
    add: function () {
      state.set({route:'add'});
      $('section.add').show();
      $('section.search').hide();
    },
    search: function (query) {
      // var manageBookView = new ManageBooksView();
      appView.manageBooksView.searchQuery(query);

      state.set({route:'search', query:query});
      $('section.add').hide();
      $('section.search').show();
      // new ManageBooksView.searchQuery(query);
    }
  });

  var state = new AppState;
  var appRouter = new AppRouter;
  var appView = new AppView;
  Parse.history.start();

  /*appRouter.on('route:search', function (query) {
    appView.manageBooksView.searchQuery(query);
  });*/

  // var state = new AppState; new AppView;
});
