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
    if (!app.internetAvailable()){   
        navigator.notification.alert("No se ha encontrado una conexión a internet, la applicación necesita una conexión para poder accesar al servidor. Lo sentimos...", null, "Sin Conexión a Internet", "Ok");     
        return false;
    }

    var self = this;
    var username = this.$("#login-username").val();
    var password = this.$("#login-password").val();
    self.$(".login-form .error").html("");
	
    if((username.trim()=="") || (password.trim()=="")){
		  self.$(".login-form .error").html("Please insert your Username and/or Password to login").show();
    } else {
      appView.loading();
      Parse.User.logIn(username, password, {
        success: function(user) {
          // self.undelegateEvents();
          appView.notLoading();
          self.hide();
          appView.show();
        },
        error: function(user, error) {
		      appView.notLoading();
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          this.$(".login-form button").removeAttr("disabled");
        }
      });
      this.$(".login-form button").attr("disabled", "disabled");
    }
    return false;
  },
  hide:function  () {
    this.$('#login').hide();
  },
  show:function  () {
    this.$(".login-form button").removeAttr('disabled');
    this.$('#login').show();
  },
  signUp: function(e) {
    if (!app.internetAvailable()){   
        navigator.notification.alert("No se ha encontrado una conexión a internet, la applicación necesita una conexión para poder accesar al servidor. Lo sentimos...", null, "Sin Conexión a Internet", "Ok");     
        return false;
    }
    
    var self = this;
    var username = this.$("#signup-username").val();
    var password = this.$("#signup-password").val();
	self.$(".login-form .error").html("");

    if((username.trim()=="") || (password.trim()=="")){
      self.$(".signup-form .error").html("Please insert an Username and a Password to Sign Up").show();
    } else {
      appView.loading();
      Parse.User.signUp(username, password, null, {
        success: function(user) {
          // self.undelegateEvents();
          appView.notLoading();
          self.hide();
          appView.show();
        },
        error: function(user, error) {
          appView.notLoading();
          self.$(".signup-form .error").html(error.message).show();
          this.$(".signup-form button").removeAttr("disabled");
        }
      });
      this.$(".signup-form button").attr("disabled", "disabled");
    }
    return false;
  },
  logOut: function () {
    Parse.User.logOut();
    // appView.undelegateEvents();
    appView.hide();
    this.show();
  },
  render: function() {
    this.$el.prepend(_.template($("#login-template").html()));
    this.delegateEvents();
  }
});