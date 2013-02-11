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