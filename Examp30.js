// JavaScript File
/*********************************************************************        
University of Maribor ************************************************
Faculty of Organizational Sciences ***********************************
Cybernetics & Decision Support Systems Laboratory ********************
Andrej Škraba ********************************************************
*********************************************************************/

var firmata = require("firmata");

var board = new firmata.Board("/dev/ttyACM0",function(){
    console.log("Priključitev na Arduino");
    console.log("Firmware: " + board.firmware.name + "-" + board.firmware.version.major + "." + board.firmware.version.minor); // izpišemo verzijo Firmware
    console.log("Omogočimo pine");
    board.pinMode(13, board.MODES.OUTPUT);    
    
    board.pinMode(2, board.MODES.OUTPUT); // direction of DC motor
    board.pinMode(3, board.MODES.PWM); // PWM of motor i.e. speed of rotation
    board.pinMode(4, board.MODES.OUTPUT); // direction DC motor
    board.digitalWrite(2,1); // initialization of digital pin 2 to rotate Left on start
    board.digitalWrite(4,0); // initialization of digital pin 2 to rotate Left on start
    board.analogWrite(3,50);
    
    
    
    
});

var fs  = require("fs");

var options = {
  key: fs.readFileSync('privatekey.pem'),
  cert: fs.readFileSync('certificate.pem')
};

var https = require("https").createServer(options, handler) // tu je pomemben argument "handler", ki je kasneje uporabljen -> "function handler (req, res); v tej vrstici kreiramo server! (http predstavlja napo aplikacijo - app)
  , io  = require("socket.io").listen(https, { log: false })
  , url = require("url");

send404 = function(res) {
    res.writeHead(404);
    res.write("404");
    res.end();
}

//process.setMaxListeners(0); 

//********************************************************************************************************
// Simple routing ****************************************************************************************
//********************************************************************************************************
function handler (req, res) { // handler za "response"; ta handler "handla" le datoteko index.html
    var path = url.parse(req.url).pathname; // parsamo pot iz url-ja
    
    switch(path) {
    
    case ('/') : // v primeru default strani

    fs.readFile(__dirname + "/Examp30.html",
    function (err, data) { // callback funkcija za branje tekstne datoteke
        if (err) {
            res.writeHead(500);
            return res.end("Napaka pri nalaganju strani pwmbutton...html");
        }
        
    res.writeHead(200);
    res.end(data);
    });
     
    break;    
            
    default: send404(res);
            
    }
}
//********************************************************************************************************
//********************************************************************************************************
//********************************************************************************************************

https.listen(8080); // določimo na katerih vratih bomo poslušali | vrata 80 sicer uporablja LAMP | lahko določimo na "router-ju" (http je glavna spremenljivka, t.j. aplikacija oz. app)

console.log("Use (S) httpS! - System Start - Use (S) httpS!"); // na konzolo zapišemo sporočilo (v terminal)

var sendDataToClient = 1; // flag to send data to the client

var STARTctrlFW = 0; // flag for control algorithm start

io.sockets.on("connection", function(socket) 
{                                               // od oklepaja ( dalje imamo argument funkcije on -> ob 'connection' se prenese argument t.j. funkcija(socket) 
                                                // ko nekdo pokliče IP preko "browser-ja" ("browser" pošlje nekaj node.js-u) se vzpostavi povezava = "connection" oz.
                                                // je to povezava = "connection" oz. to smatramo kot "connection"
                                                // v tem primeru torej želi client nekaj poslati (ko nekdo z browserjem dostopi na naš ip in port)
                                                // ko imamo povezavo moramo torej izvesti funkcijo: function (socket)
                                                // pri tem so argument podatki "socket-a" t.j. argument = socket
                                                // ustvari se socket_id
/*    
    socket.on("left", function(data) 
    {                                           // ko je socket ON in je posredovan preko connection-a: ukazArduinu (t.j. ukaz: išči funkcijo ukazArduinu)
        board.digitalWrite(13, board.HIGH);     // na pinu 3 zapišemo vrednost HIGH
    });
    
	socket.on("center", function(data) 
	{
        board.digitalWrite(13, board.LOW);      // na pinu 3 zapišemo vrednost HIGH
    });
    
    socket.on("right", function(data) 
    {                                           // ko je socket ON in je posredovan preko connection-a: ukazArduinu (t.j. ukaz: išči funkcijo ukazArduinu)
        board.digitalWrite(13, board.HIGH);     // na pinu 3 zapišemo vrednost HIGH
    });
*/

    socket.on("left", function(value)
    {
    board.digitalWrite(2,value.AIN1);
    board.digitalWrite(4,value.AIN2);
    socket.emit("messageToClient", "Direction: left");
    });
    
    socket.on("right", function(value)
    {
    board.digitalWrite(2,value.AIN1);
    board.digitalWrite(4,value.AIN2);
    socket.emit("messageToClient", "Direction: right");
    });
    
    socket.on("center", function(value)
    {
    board.analogWrite(3,value);
    socket.emit("messageToClient", "STOP");
    });
    
    
    
    
     socket.on("sendPosition", function(position){
    readAnalogPin0Flag = 0; // to stop reading from pin 0
    desiredValue = position; // now the desired value from the GUI takes control
    socket.emit("messageToClient", "Position set to: position.")
	 
	      socket.on("stopControlAlgorithm", function(){
	          stopControlAlgorithm();
	      });
	 
	      sendValueViaSocket = function (value) {
	          io.sockets.emit("messageToClient", value);
      }
	 
	      sendStaticMsgViaSocket = function (value) {
	          io.sockets.emit("staticMsgToClient", value);
	      }
 
	  });
	 
  });
	 
	  function controlAlgorithm (parameters) {
	      if (parameters.ctrlAlgNo == 1) {
	          pwm = parameters.pCoeff*(desiredValue-actualValue);
                errSumAbs += Math.abs(desiredValue-actualValue);
	          if(pwm > pwmLimit) {pwm = pwmLimit}; // to limit the value for pwm / positive
	          if(pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit the value for pwm / negative
	          if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // določimo smer če je > 0
	          if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // določimo smer če je < 0
	          board.analogWrite(3, Math.round(Math.abs(pwm)));
				}
			if (parameters.ctrlAlgNo == 3) {
		    err = desiredValue - actualValue; // error as difference between desired and actual val.
			errSum += err; // sum of errors | like integral
			errSumAbs += Math.abs(err);
			dErr = err - lastErr; // difference of error
			pwm = parameters.Kp2*err+parameters.Ki2*errSum+parameters.Kd2*dErr; // PID expression
			console.log(parameters.Kp2 + "|" + parameters.Ki2 + "|" + parameters.Kd2);
			lastErr = err; // save the value of error for next cycle to estimate the derivative
			if (pwm > pwmLimit) {pwm =  pwmLimit}; // to limit pwm values
			if (pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit pwm values
			if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // direction if > 0
			if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // direction if < 0
			board.analogWrite(3, Math.abs(pwm));
	          
	        //  console.log(Math.round(pwm));
	      }
	      if (parameters.ctrlAlgNo == 2) {
	          err = desiredValue - actualValue; // error
	          errSum += err; // sum of errors, like integral
         errSumAbs += Math.abs(err);         
         dErr = err - lastErr; // difference of error
         // for sending to client we put the parts to global scope
         KpE=parameters.Kp1*err;
         KiIedt=parameters.Ki1*errSum;
         KdDe_dt=parameters.Kd1*dErr;
         pwm = KpE + KiIedt + KdDe_dt; // above parts are used
	     lastErr = err; // save the value for the next cycle
	     if(pwm > pwmLimit) {pwm = pwmLimit}; // to limit the value for pwm / positive
          if(pwm < -pwmLimit) {pwm = -pwmLimit}; // to limit the value for pwm / negative
	          if (pwm > 0) {board.digitalWrite(2,1); board.digitalWrite(4,0);}; // določimo smer če je > 0
	          if (pwm < 0) {board.digitalWrite(2,0); board.digitalWrite(4,1);}; // določimo smer če je < 0
	          board.analogWrite(3, Math.abs(pwm));        
	      }
	  };
	 
  function sendValues (socket) {
	      socket.emit("clientReadValues",
	      { // json notation between curly braces
      "desiredValue": desiredValue,
      "actualValue": actualValue,
        "pwm": pwm,
        "err": err,
        "errSum": errSum,
     "dErr": dErr,
     "KpE": KpE,
     "KiIedt": KiIedt,
     "KdDe_dt": KdDe_dt,	     
     "errSumAbs": errSumAbs
     });
 
     
     
	  };
	  function startControlAlgorithm (parameters) {
	      if (controlAlgorithmStartedFlag == 0) {
	          controlAlgorithmStartedFlag = 1; // set flag that the algorithm has started
	          intervalCtrl = setInterval(function() {controlAlgorithm(parameters); }, 30); // na 30ms klic
	          console.log("Control algorithm " + parameters.ctrlAlgNo + " started");
	          sendStaticMsgViaSocket("Control algorithm " + parameters.ctrlAlgNo + " started | " + json2txt(parameters));
			  parametersStore = parameters; // store to report back to the client on algorithm stop
      }
	  };
	 
    
    
    
    
    

