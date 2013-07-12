var BookEditView = AddEditView.extend({
  template:_.template($("#add-edit-template").html()),
  model:{},
  events:{
    "click [data-id=book-save]": "saveBook",
    "click #book-photo" : "capturePhoto",
    "click #book-upload-image" : "uploadPhoto"
  }, 
  initialize: function() {
    this.events = _.extend({},AddEditView.prototype.events,this.events);
    // this.render();
  },
  render: function() {
    this.$el.find('#edit-book-view').remove();
    this.$el.append(this.template({id : 'edit-book', offer: this.model.toJSON(), book: this.model.get('book').toJSON()}));
    appView.createScroll('edit-book-content');
    this.initPopup('#edit-book-view');
    // this.consoleView();
    this.formVars();
    console.log(this.model);

    this.inputOfferType.val(this.model.get('type'));

    this.inputLendTimeType.val(this.model.get('timeType'));
    this.inputRentTimeType.val(this.model.get('timeType'));

    this.selectOfferType();

    this.view.find("[data-id=add-book-done], [data-id=book-delete], [data-id=book-save]").toggle();
    
    // this.$el.append(_.template($("#add-template").html()));
    // this.delegateEvents();
  },
  viewAndShow: function (bookID) {
    self = this;
    this.render();
    this.show();
    appView.updateForms();
    /*if (!this.model.toJSON){
      var query = new Parse.Query(Book);
      query.get(bookID, {
        success: function(book) {
          appView.bookDetailView.model = book;
          appView.bookDetailView.render();
        },
        error: function(book, error) {   }
      });
    }else{
      this.render();
      this.show();
    }*/
  },
  capturePhoto: function () {
    navigator.notification.confirm(
      'Cargar la foto para el libro desde:',
      this.onCaptureConfirm,
      'Cargar Foto',
      'Cámara,Mis Imágenes'
    );
    /*
    navigator.camera.getPicture(this.onPhotoDataSuccess, this.onFail,
    {
      quality: 50, 
      // destinationType: app.destinationType.DATA_URL
      destinationType: app.destinationType.FILE_URI
    });     */  
  },
  onCaptureConfirm:function(source){
    
    var PictureSourceType = function() {};
    PictureSourceType.PHOTO_LIBRARY = 0;
    PictureSourceType.CAMERA = 1;
    PictureSourceType.SAVEDPHOTOALBUM = 2;

    var imgSource = (source == 2)?PictureSourceType.PHOTO_LIBRARY:PictureSourceType.CAMERA;

    var options = { 
      quality: 50,
      //targetHeight: 400,
      destinationType: Camera.DestinationType.FILE_URI 
    };
    if (imgSource != undefined) 
      options["sourceType"] = imgSource;

    navigator.camera.getPicture(appView.addBookView.onPhotoDataSuccess, appView.addBookView.onFail, options);
  },
  onPhotoDataSuccess: function(imageData) {
    // this no existe!!!! 
    appView.addBookView.imagePhoto.parent().show();
    appView.addBookView.imagePhoto.attr("src", imageData);
    appView.addBookView.imageData = imageData;
  },
  onFail: function (message){
    navigator.notification.alert('Detalles: ' + message, null, "Error al cargar foto", "Ok");
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
    // console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    appView.addBookView.imageUploadedResponse = jQuery.parseJSON(r.response.slice(0,-1));
    appView.addBookView.addNewBookToParse();
  },
  fail: function (error) {
    navigator.notification.alert("An error has occurred: Code = " + error.code, null, "Error", "Ok");
    $.each(error, function(index, val) {
      console.log(index+': '+val);
    });
  },
  saveBook: function () {
    error = this.formValidate();
    if(error == "")

      console.log(this.model.get('picture').url +' == '+this.imagePhoto.attr("src"));

      // this.uploadPhoto();
    else
      app.isMobile ? navigator.notification.alert(error, null, "Campos Requeridos", "Ok") : console.log(error);
  },
  addNewBookToParse: function(e) {
    var self = this;
    
    var inputTitle = this.inputTitle.val();
    var inputAuthor = this.inputAuthor.val();
    var inputCategory = this.inputCategory.val();
    //Averigua si ya existe el libro
    var query = new Parse.Query(Book);
    query.equalTo('title', inputTitle);
    query.equalTo('author', inputAuthor);
    query.find({
      success: function (results){
        //crea la oferta
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
        offer.set('user', Parse.User.current());
        var offerACL = new Parse.ACL(Parse.User.current());
        offerACL.setPublicReadAccess(true);
        offer.setACL(offerACL);

        if(results.length==0){
          //Si el libro no existe, lo crea
          var book = new Book;
          book.set('title', inputTitle);
          book.set('author', inputAuthor);
          book.set('category', inputCategory);
        }else{
          //Si el libro si existe, lo usa 
          var book = results[0];
        }
        book.set({picture: {"name": self.imageUploadedResponse.name,"__type": "File"}});
        

        offer.set('book', book);
        offer.save(null, {
          success: function (offer) {

            book.save(null, {
              success:function (book) {
                var user = Parse.User.current();
                var userBooks = user.relation('books');
                userBooks.add(book);
                user.save(null, {success:function () {console.log('Usuario actualizado!');}});
                
                book.get('picture').url = self.imageUploadedResponse.url;

                console.log('Guardado Listo');
                appView.homeView.addNewBook(book);
                self.$('input').val('');
                self.imagePhoto.parent().hide();
                appRouter.navigate('', {trigger: true});
            }});
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