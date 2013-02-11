var AddBookView = PopupView.extend({
  events:{
    // "click #add-book-done": "addNewBook",
    "click #add-book-done": "addNewBook",
    "click #book-photo" : "capturePhoto",
    "click #book-upload-image" : "uploadPhoto",
    "change #offer-type" : "selectOfferType"
  },
  // ? consoleLOg? para que es?
  consoleLog: function () {
    
  }, 
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
    this.render();
    this.initPopup('#add');

    this.inputTitle = this.$("#book-title");
    this.inputAuthor = this.$("#author-name");
    this.inputCategory = this.$("#category-name");

    this.inputOfferType = this.$("#offer-type");
    this.inputSellPrice = this.$("#sell-price");
    this.inputLendTime = this.$("#lend-time");
    this.inputLendTimeType = this.$("#lend-time-type");
    this.inputRentPrice = this.$("#rent-price");
    this.inputRentTime = this.$("#rent-time");
    this.inputRentTimeType = this.$("#rent-time-type");

    this.imagePhoto = this.$("#image-input-photo>img");
    // this.buttonUploadImage =  this.$("#book-upload-image");
    // this.imageData = this.$("#image-input-photo>img").attr("src");
    
    this.loadingBar = this.$(".loading-bar");
    this.loadingBarComplete = this.$(".loading-bar .complete");
    this.selectOfferType();

    /*this.file;

    $('#postedFile').bind("change", function(e) {
      var files = e.target.files || e.dataTransfer.files;
      // Our file var now holds the selected file
      file = files[0];
    });*/
  },
  render: function() {
    this.$el.append(_.template($("#add-template").html()));
    this.delegateEvents();
  },
  /// Alguna vez es llamado??
  toggle: function(){
    this.view.toggleClass('show');
  },
  selectOfferType: function(){
    this.$(".toggle-section").hide();
    this.$("#"+$("#offer-type").find("option:selected").val()).show();
    appView.updateForms();
    // console.log("#"+$(e.target).find("option:selected").val());
  },
  capturePhoto: function () {
    navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail,
    {
      quality: 50, 
      // destinationType: app.destinationType.DATA_URL
      destinationType: app.destinationType.FILE_URI
    });      
  },
  onPhotoDataSuccess: function(imageData) {
    // this no existe!!!! 
    appView.addBookView.imagePhoto.show();
    appView.addBookView.imagePhoto.attr("src", imageData);
    appView.addBookView.imageData = imageData;
  },
  onFail: function (message) {
    alert('Failed because: ' + message);
  },
  uploadPhoto: function () {
    var imageURI = this.imageData;
    var options = new FileUploadOptions();
    var fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.fileName=fileName;
    options.chunkedMode = false;
    options.params = {'front':true};
    self = this;
    var ft = new FileTransfer();
    ft.onprogress = function (e) {
      if (e.lengthComputable){
        self.setPercentageLoading(e.loaded / e.total);
      }
    }
    // ft.upload(imageURI, "https://api.parse.com/1/files/"+fileName, this.win, this.fail, options);
    ft.upload(imageURI, "http://test.mobileease.me/parse/upload.php", this.win, this.fail, options);
  },
  setPercentageLoading: function (percentage) {
    this.loadingBar.show();
    this.loadingBarComplete.width(percentage*100 + "%");
  },
  win: function (r) {
    //no existe this
    appView.addBookView.loadingBar.hide();
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    // console.log("Sent = " + r.bytesSent);
    appView.addBookView.imageUploadedResponse = jQuery.parseJSON(r.response.slice(0,-1));
    console.log("URL: "+ appView.addBookView.imageUploadedResponse.url);
    appView.addBookView.addNewBookToParse();
    // this.imageurl =  r.response
  },
  fail: function (error) {
    alert("An error has occurred: Code = " + error.code);
    $.each(error, function(index, val) {
      console.log(index+': '+val);
    });
  },
  addNewBook: function () {
    if(this.imagePhoto.attr("src")==""){
      alert("Tomale una Foto a tu libro antes de publicar tu oferta");
    }else{
      this.uploadPhoto();
    }
    // this.addNewBookToParse();
  },
  addNewBookToParse: function(e) {
    var self = this;    
    
    var inputTitle = this.inputTitle.val();
    var inputAuthor = this.inputAuthor.val();
    var inputCategory = this.inputCategory.val();

    var query = new Parse.Query(Book);
    query.equalTo('title', inputTitle);
    query.equalTo('author', inputAuthor);
    query.find({
      success: function (results){
        ////console.log("results");
        var offer = new Offer;
        offer.set('type', self.inputOfferType.val());

        switch(self.inputOfferType.val()){
          case 'sell':
            offer.set('price', self.inputSellPrice.val());
            break;
          case 'lend':
            offer.set('time', self.inputLendTime.val());
            offer.set('timeType', self.inputLendTimeType.val());
            break;
          case 'rent':
            offer.set('price', self.inputRentPrice.val());
            offer.set('time', self.inputRentTime.val());
            offer.set('timeType', self.inputRentTimeType.val());
            break;
        }
        offer.set({picture: {"name": self.imageUploadedResponse.name,"__type": "File"}});
        if(results.length==0){
          var book = new Book;
          book.set('title', inputTitle);
          book.set('author', inputAuthor);
          book.set('category', inputCategory);
        }else{
          var book = results[0];
        }
        offer.set('book', book);
        offer.save(null, {
          success: function (offer) {
            var bookOffers = book.relation('offers');
            bookOffers.add(offer);
            book.save(null, {
              success: function(book) {
                self.$('input').val('');
                self.imagePhoto.attr('src','');
                appRouter.navigate('', {trigger: true});
                // The object was saved successfully.
              },
              error: function(gameScore, error) {
                // The save failed.
                // error is a Parse.Error with an error code and description.
              }
            });
          }
        });
      },
      error: function(error){
        console.log("error");
        /*$.each(error, function(index, val) {
          console.log(index+': '+val);
        });*/
      }
    });
  }
});