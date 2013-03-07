var ToolbarView = Parse.View.extend({
  el: "#all",
  events:{
    "click button.search" : "search",
    "click button.find"   : "searchQuery", 
    "click button.back"   : "back",
    "click button.add"    : "add",
    "click header"    : "home",
    "keypress #search-query": "searchEnter"
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
  home:function(e){
    console.log($(e.target));
    if($(e.target).is('h1')){

      if(appRouter.routes[Parse.history.fragment]=='home'){
        appView.homeView.toggleColumn();
      }else{
        appRouter.navigate('', {trigger: true});
      }
    }
  },
  logOut:function  () {
    appView.logInView.logOut();
  },
  //sirve esta funcion?
  preventDefault: function (e) {
    e.preventDefault();
  },
});