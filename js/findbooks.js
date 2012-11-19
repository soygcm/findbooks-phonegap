$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("C4zgFUST9RGWSJ5scVpyB5G4co2gcMUpNPg0QpaI", "C7Qy33Kz3SbWwNOoodEg6RiuIE7a4MlvoYo99kTZ");

  // Book Model
  // ----------

  var Book = Parse.Object.extend("Book");

  // This is the transient application state, not persisted on Parse
  /*var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });*/

  // Book Collection
  // ---------------

  var BookList = Parse.Collection.extend({
    // Reference to this collection's model.
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
    },

    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
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
      // this.model.destroy();
/*      var query = new Parse.Query(Book);
      query.get(this.model.id,{
        success: function(book){
          var bookUsers = book.relation("users");
          bookUsers.remove(Parse.User.current());
        },
        error: function(object, error){
          console.log(error.message);
        }
      });*/
      
      var bookUsers = this.model.relation("users");
      bookUsers.remove(Parse.User.current());
      this.model.save();
      this.remove();
    }

  });

  // The Application
  // ---------------

  // The main view that lets a user manage their todo items
  var ManageBooksView = Parse.View.extend({

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress input.field":  "createOnEnter",
      "click .log-out": "logOut"
    },

    el: ".content",

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'logOut', 'createOnEnter');

      // Main books management template
      this.$el.html(_.template($("#manage-books-template").html()));
      
      this.inputTitle = this.$("#book-title");
      this.inputAuthor = this.$("#book-author");
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

      // state.on("change", this.filter, this);
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
      this.$("#book-list").append(view.render().el);
    },

    // Add all items in the Todos collection at once.
    addAll: function(collection, filter) {
      this.$("#book-list").html("");
      this.books.each(this.addOne);
    },

    // Only adds some todos, based on a filtering function that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#book-list").html("");
      this.books.chain().filter(filter).each(function(item) { self.addOne(item) });
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
        new ManageBooksView();
      } else {
        new LogInView();
      }
    }
  });

  // var state = new AppState;

  new AppView;
});
