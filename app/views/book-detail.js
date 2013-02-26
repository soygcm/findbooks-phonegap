var BookDetailView = PopupView.extend({
  template:_.template($("#book-detail-template").html()),
  model: {},
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);

  },
  render: function() {
    this.$el.find('#book-detail').remove();
    this.$el.append(this.template(this.model.toJSON()));
    appView.createScroll('book-detail');
    this.initPopup('#book-detail');
    this.getOfferList();
  },
  viewAndShow: function (bookID) {
    self = this;
    if (!this.model.toJSON){
      var query = new Parse.Query(Book);
      query.get(bookID, {
        success: function(book) {
          appView.bookDetailView.model = book;
          appView.bookDetailView.render();
          appView.bookDetailView.show();
        },
        error: function(book, error) {   }
      });
    }else{
      this.render();
      this.show();
    }
    
  },
  getOfferList:function () {
    self = this;
    this.offerList = new OfferList;
    this.offerList.query = new Parse.Query(Offer).equalTo("book", this.model);
    this.offerList.fetch({
      success: function(collection) {
        collection.each(function(object) {
          // console.log(object);
          self.$("#offer-list>ul").prepend('<li data-user="'+object.get('user').id+'">'+object.get('type')+'</li>');

          user = object.get('user');
          user.fetch({
            success: function(user) {
              var username = user.get("username");
              var id = user.id;
              self.$('#offer-list>ul>[data-user="'+id+'"]').html(username);
            }
          });

        });
      },
      error: function(collection, error) {
        // The collection could not be retrieved.
      }
    });
  }
});