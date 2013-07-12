var AddEditView = PopupView.extend({
  events:{
    "change select.offer-type" : "selectOfferType"
  },
  initialize: function() {
    this.events = _.extend({},PopupView.prototype.events,this.events);
  },
  formVars: function () {
    this.inputTitle = this.view.find("[data-id=book-title]");
    this.inputAuthor = this.view.find("[data-id=author-name]");
    this.inputCategory = this.view.find("[data-id=category-name]");

    this.inputOfferType = this.view.find("[data-id=offer-type]");
    this.inputSellPrice = this.view.find("[data-id=sell-price]");
    this.inputLendTime = this.view.find("[data-id=lend-time]");
    this.inputLendTimeType = this.view.find("[data-id=lend-time-type]");
    this.inputRentPrice = this.view.find("[data-id=rent-price]");
    this.inputRentTime = this.view.find("[data-id=rent-time]");
    this.inputRentTimeType = this.view.find("[data-id=rent-time-type]");

    this.imagePhoto = this.view.find("[data-id=image-input-photo]>img");
    this.imagePhoto.attr("src")=="" ? this.imagePhoto.parent().hide() : this.imagePhoto;
    
    this.loadingBar = this.$(".loading-bar");
    this.loadingBarComplete = this.$(".loading-bar .complete");
  },
  selectOfferType: function(){
    this.view.find(".toggle-section").hide();
    offerType = this.view.find("select[data-id=offer-type]").find("option:selected").val();
    this.view.find("[data-id="+offerType+"]").show();
    appView.updateForms();
  },
  formValidate:function () {
    var error = "";

    if(this.inputTitle.val().trim() == "") error+="\n - Titulo es requerido.";
    if(this.inputAuthor.val().trim() == "") error+="\n - Autor/es es requerido.";
    if(this.inputCategory.val().trim() == "") error+="\n - Seleccione una categoría.";
    if(this.imagePhoto.attr("src")=="") error+="\n - Debe cargar una imagen para el libro";
    
    if(this.inputOfferType.val().trim() == "") 
      error+="\n - Seleccione un valor del campo 'Quiero'.";
    else {
      if(this.inputOfferType.val() == "sell"){
        if(this.inputSellPrice.val().trim() == "") error+="\n - Defina un precio de venta.";
        else if(isNaN(this.inputSellPrice.val().trim())) error+="\n - El precio de venta debe ser un número válido";
      } else if(this.inputOfferType.val() == "lend"){
        if(this.inputLendTime.val().trim() == "") error+="\n - Defina la cantidad de tiempo.";
        else if(isNaN(this.inputLendTime.val().trim())) error+="\n - La cantidad de tiempo debe ser un número válido";
      } else if(this.inputOfferType.val() == "rent"){
        if(this.inputRentPrice.val().trim() == "") error+="\n - Defina el precio/hora de alquiler.";
        else if(isNaN(this.inputRentPrice.val().trim())) error+="\n - El precio/hora de alquiler debe ser un número válido";

        if(this.inputRentTime.val().trim() == "") error+="\n - Defina la cantidad de tiempo.";
        else if(isNaN(this.inputRentTime.val().trim())) error+="\n - La cantidad de tiempo debe ser un número válido";
      } 
    }
    return error;
  }
});