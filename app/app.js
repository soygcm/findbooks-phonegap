window.scrollTo(0, 0); //No se si esta linea es necesaria

var librosArray = new Array('diary','hungergames', 'importa', 'logo', 'radical', 'startup', 'twilight');

Parse.$ = jQuery;

var parseApplicationId = "C4zgFUST9RGWSJ5scVpyB5G4co2gcMUpNPg0QpaI";
var parseRESTAPIKey = "pYnV60HdDrE8moVcRWnob0RBPzgllsOzDbspc5HU";
var parseJSKey = "C7Qy33Kz3SbWwNOoodEg6RiuIE7a4MlvoYo99kTZ";

Parse.initialize(parseApplicationId, parseJSKey);

var appView = new AppView;
var appRouter;

var app = {
  initialize: function() {
      $(window).resize(appView.updateForms);
      this.bindGlobalEvents();
  },
  bindGlobalEvents: function () {
    
    console.log(navigator.userAgent);
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        document.addEventListener("deviceready", this.onDeviceReady, false);
        if (navigator.userAgent.match(/(Android)/)){
          document.addEventListener("backbutton", function(e) {                
            window.history.back();
          }, false);
        }
        if (navigator.userAgent.match(/(iPhone|iPod|iPad)/)){
          document.addEventListener('touchmove', function (e) {
            e.preventDefault();
          }, false);
        }
    } else {
        this.isMobile = false;
        this.startAppView();
    }

  },
  onDeviceReady: function () {
    console.log('Device is Ready');
    app.receivedEvent('deviceready');
  },
  receivedEvent: function (id) {
    this.isMobile = true;
    
    this.pictureSource=navigator.camera.PictureSourceType;
    this.destinationType=navigator.camera.DestinationType;

    console.log('Received Event: ' + id);
    this.startAppView();
  },
  startAppView: function () {
    appView.render();
    appRouter = new AppRouter;
    Parse.history.start();
  }
};

$(document).ready(function() {
  app.initialize();
});
