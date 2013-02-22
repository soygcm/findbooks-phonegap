var Book = Parse.Object.extend("Book");
var User = Parse.Object.extend("User");
var Offer = Parse.Object.extend("Offer");
// var AppState = Parse.Object.extend("AppState");
var BookList = Parse.Collection.extend({model: Book});
var OfferList = Parse.Collection.extend({model: Offer});