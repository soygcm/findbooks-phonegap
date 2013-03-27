var AddBookView = PopupView.extend({
  events:{
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
    this.initPopup('#add-view');

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
    this.imagePhoto.parent().hide();
    
    this.loadingBar = this.$(".loading-bar");
    this.loadingBarComplete = this.$(".loading-bar .complete");
    this.selectOfferType();
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
  addNewBook: function () {
    var error = "";

    if($("#book-title").val().trim() == "") error+="\n - Titulo es requerido.";
    if($("#author-name").val().trim() == "") error+="\n - Autor/es es requerido.";
    if($("#category-name").val().trim() == "") error+="\n - Seleccione una categoría.";
    if(this.imagePhoto.attr("src")=="") error+="\n - Debe cargar una imagen para el libro";
    
    if($("#offer-type").val().trim() == "") 
      error+="\n - Seleccione un valor del campo 'Quiero'.";
    else {
      if($("#offer-type").val() == "sell"){
        if($("#sell-price").val().trim() == "") error+="\n - Defina un precio de venta.";
        else if(isNaN($("#sell-price").val().trim())) error+="\n - El precio de venta debe ser un número válido";
      } else if($("#offer-type").val() == "lend"){
        if($("#lend-time").val().trim() == "") error+="\n - Defina la cantidad de tiempo.";
        else if(isNaN($("#lend-time").val().trim())) error+="\n - La cantidad de tiempo debe ser un número válido";
      } else if($("#offer-type").val() == "rent"){
        if($("#rent-price").val().trim() == "") error+="\n - Defina el precio/hora de alquiler.";
        else if(isNaN($("#rent-price").val().trim())) error+="\n - El precio/hora de alquiler debe ser un número válido";

        if($("#rent-time").val().trim() == "") error+="\n - Defina la cantidad de tiempo.";
        else if(isNaN($("#rent-time").val().trim())) error+="\n - La cantidad de tiempo debe ser un número válido";
      } 
    }

    if(error == "")
      this.uploadPhoto();
    else 
      navigator.notification.alert(error, null, "Campos Requeridos", "Ok");
    // this.addNewBookToParse();
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