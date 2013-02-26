var AppRouter = Parse.Router.extend({
  routes: {
    "search/:query" : "searchQuery",
    "search" : "search",
    // "home": 'home',
    "" : "home",
    "add": "add",
    "book/:id":"viewBook",
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
    if (Parse.User.current()) {
      appView.addBookView.hide();//? porque se necesita?
      appView.toolbarView.isHome();
      appView.setCurrentView(appView.homeView);
    } else {
      
    }
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
    appView.bookDetailView.viewAndShow(id);
    appView.setCurrentView(appView.bookDetailView);
  }
});
