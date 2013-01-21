var app = {
  initialize: function() {
      this.bindEvents();
  },
  bindEvents: function () {
    document.addEventListener("deviceready", this.onDeviceReady, false);
  },
  onDeviceReady: function () {
    app.receivedEvent('deviceready');
  },
  receivedEvent: function (id) {
    

    this.pictureSource=navigator.camera.PictureSourceType;
    this.destinationType=navigator.camera.DestinationType;

    console.log('Received Event: ' + id);
    console.log(this.pictureSource);
  }
};