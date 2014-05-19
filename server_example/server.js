// Load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var io      = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");           // EasyRTC external module

// Add request module to call XirSys servers
var request = require("request");

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();

httpApp.use(express.static(__dirname + "/static/"));

// Start Express http server on port 8080
var webServer = http.createServer(httpApp).listen(8080);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});

easyrtc.on("getIceConfig", function(connectionObj, callback) {
  
    // This object will take in an array of XirSys STUN and TURN servers
    var iceConfig = [];

    request.post('https://api.xirsys.com/getIceServers', {
        form: {
            ident: "< Your username >",
            secret: "< Your secret API token >",
            domain: "< www.yourdomain.com >",
            application: "default",
            room: "default",
            secure: 1
        },
        json: true
    },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // data.d.iceServers is where the array of ICE servers lives
            iceConfig = body.d.iceServers;  
            console.log(iceConfig);
            callback(null, iceConfig);
        }
    });
});

// Start EasyRTC server
var rtc = easyrtc.listen(httpApp, socketServer);