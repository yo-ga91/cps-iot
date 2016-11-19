var http= require("http");
var firmata = require("firmata");


console.log("Starting the code");
var board = new firmata.Board("/dev/ttyACM0", function()
{
    console.log("Connecting to Arduino");
    console.log("Activete of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT);  //!pin 13 as out
    console.log("Activete of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT);  //!pin 8 as out
});

var io=require("soket.io").listen(http);    //socket.io for permanent connection between server and client    

io.sockets.on("connection", function(socket) {
    socket.on("commandToArduino", function(commandNo){
        if (commandNo == "1") {
            board.digitalWrite(13, board.HIGH); // write HIGH on pin 13
        }
        if (commandNo == 0) {
            board.digitalWrite(13, board.LOW); // write LOW on pin 13
        }
    });
});

http.createServer(function(req,res) 
{

    var socket = io.connect("172.16.22.118:8080"); // create socket - connect to it
    
    function on () 
    {
        socket.emit("commandToArduino", 1);
    }

    function off () 
    {
        socket.emit("commandToArduino", 0);
    } 
    
    
    var parts=req.url.split("/"),           //split request on / character
    operator1 = parseInt(parts[1],10),       //10 is radex - decimal notation
    operator2 = parseInt(parts[2],10);       //10 is radex - decimal notation

    if(operator1==0)
    {
        console.log("Putting LED to OFF.");
        board.digitalWrite(13, board.LOW);
    }
    if (operator1==1)
    {
        console.log("Putting LED to ON");
        board.digitalWrite(13, board.HIGH);
    }
    if(operator2==0)
    {
        console.log("Putting LED to OFF.");
        board.digitalWrite(8, board.LOW);
    }
    if (operator2==1)
    {
        console.log("Putting LED to ON");
        board.digitalWrite(8, board.HIGH);
//    }
    res.writeHead(200,{"Content-Type":"text/plain"});    //200=OK
    res.write("For test write into broweser 123.1.2.3:8080/1 \n");
    res.end("The value of the operator is:"+operator1);
//    res.end("The value of the operator is:"+operator2);
    }
}).listen(8080, "172.16.22.118");   //listen on port 8080
