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
