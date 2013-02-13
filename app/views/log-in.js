var LogInView = Parse.View.extend({
  events: {
    "submit form.login-form": "logIn",
    "submit form.signup-form": "signUp"
  },
  el: "#all",
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
        // new ManageBooksView();
        self.undelegateEvents();
        self.hide();
        appView.show();
        appView.addBookView.hide();
      },
      error: function(user, error) {
        self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
        this.$(".login-form button").removeAttr("disabled");
      }
    });
    this.$(".login-form button").attr("disabled", "disabled");
    return false;
  },
  hide:function  () {
    this.$('#login').hide();
  },
  show:function  () {
    this.$('#login').show();
  },
  signUp: function(e) {
    var self = this;
    var username = this.$("#signup-username").val();
    var password = this.$("#signup-password").val();
    Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
      success: function(user) {
        // new ManageBooksView();
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
    this.$el.prepend(_.template($("#login-template").html()));
    this.delegateEvents();
  }
});