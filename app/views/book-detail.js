var BookDetailView = PopupView.extend({
  template:_.template($("#book-detail-template").html()),
  model: {},
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
  },
  render: function() {
    this.$el.find('#book-detail').remove();
    this.$el.append(this.template(this.model));
    appView.createScroll('book-detail');
    this.initPopup('#book-detail');
  },
  viewAndShow: function (bookID, bookPhoto) {
    this.model = {"id": bookID, "photo":bookPhoto};
    this.render();
    this.show();
  }
});