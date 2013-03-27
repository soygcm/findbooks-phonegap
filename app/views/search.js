var SearchView = PopupView.extend({
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
    this.render();
  },
  render: function() {
    this.$el.append(_.template($("#search-template").html()));
    this.delegateEvents();
    this.addFalseResults();
    this.initPopup('#search-view');
    this.hide();
  },
  searchQuery: function (query) {
    // query = query.replace(/-+/g, ' ');
    //console.log('buscando decodeURI: '+decodeURI(query));
    this.view.find('div>ul').append('<li>'+query+'</li>');
  },
  addFalseResults: function(){
    /*veces = 0;
    max = librosArray.length;
    for (var i = 0; i < 5; i++) {
      index = i-(max*veces);
      if (i-(veces*max)>=max-1) {
        veces++;
      }
      var bookView = new BookView();
      this.$("#search>div>ul").prepend(bookView.render(librosArray[index]).el);
    }*/
  }
});