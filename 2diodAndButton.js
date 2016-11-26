var http= require("http").createServer(handler);    //on req - hand
var io=require("socket.io").listen(http);    //socket.io for permanent connection between server and client    
var firmata = require("firmata");
var fs =require("fs");  //variable for file system for providing html

console.log("Starting the code");
var board = new firmata.Board("/dev/ttyACM0", function()
{
    console.log("Connecting to Arduino");
    console.log("Activete of Pin 8");
    board.pinMode(8, board.MODES.OUTPUT);  //!pin 13 as out
    console.log("Activete of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT);  //!pin 8 as out
});
function handler(req,res) 
{
    fs.readFile(__dirname+ "/2diodAndButtons.html",
    function (err, data)
        {
            if(err)
                {
                    res.writeHead(500,{"Content-Type":"text/plain"});
                    return res.end("Error loading html page");
                }
            res.writeHead(200);
            res.end(data);
        })
}       
http.listen(8080);   //listen on port 8080 
io.sockets.on("connection", function(socket) 
{
    console.log("commandToArduino");
    socket.on("commandToArduino", function(commandNo)
    {
        if (commandNo == "1") 
        {
            board.digitalWrite(13, board.HIGH); // write HIGH on pin 13
        }
        if (commandNo == 0) 
        {
            board.digitalWrite(13, board.LOW); // write LOW on pin 13
        }
        if (commandNo == "1") 
        {
            board.digitalWrite(8, board.HIGH); // write HIGH on pin 13
        }
        if (commandNo == 0) 
        {
            board.digitalWrite(8, board.LOW); // write LOW on pin 13
        }

    });
});