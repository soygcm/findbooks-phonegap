var PopupView = Parse.View.extend({
  el: "#all",
  events:{
    'click .front':'backToHomeOutPopup',
    "click button#close": "backToHome",
  },
  initPopup: function (popupID) {
    this.front = this.$('.front');
    this.view = this.$(popupID);
  },
  show: function () {
    if(!this.view.hasClass('show')){
      this.view.show();
      app.OSGeneration == 'old' ? this.front.show() : this.front.fadeIn(200); 
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
          app.OSGeneration == 'old' ? front.hide() : front.fadeOut(200);
        }
      }, 410);
    }
  },
  backToHomeOutPopup:function (e) {
    if($(e.target).is('.front')){
      appRouter.navigate('', {trigger: true});
    }
  },
  backToHome:function () {
    appRouter.navigate('', {trigger: true});
  }
});