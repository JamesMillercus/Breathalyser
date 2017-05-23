//** SET UP ALL LOCAL SERVER / SOCKET VARS **//
var express = require('express');
var app = express();
app.set('port', process.env.PORT || 3000);
var http = require('http').Server(app);
var io = require('socket.io')(http);

//** SET UP HARDWARE **//
var pixel = require("node-pixel");
var five = require("johnny-five");
var opts = {};
opts.port = process.argv[2] || "";
var board = new five.Board(opts);


//** SERVE PUG FILES **//
app.set('views', __dirname + '/public/views');
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {    
    res.render('content', { title : 'Home'} )
});

http.listen(app.get('port'));

//** SOCKET COMMUNICATION **//
io.on('connection', function(socket){
  console.log('a user connected');
  io.emit('userSocket', 'connected user yo!');
  socket.on('userSocket', function(msg){
    io.emit('userSocket', msg);
  });
});

//** HARDWARE VARIABLES **//
let strip;
//create an object to store different drunk levels
let drunkData = {

	drunkLevels: [	
		sober = 100,
		giggly = 550,
		tipsy = 650,
		tiddled = 700,
		pissed = 800,
		twatted = 850,
		fcked = 950,
		dud = 1500
	],

	ledLength: [
		soberL = 0,
		gigglyL = 10,
		tipsyL = 30,
		tiddledL = 50,
		pissedL = 70,
		twattedL = 90,
		fckedL = 144,
		dud = 150
	],

	drunkStrings: [
		"sober",
		"giggly",
		"tipsy",
		"tiddled",
		"pissed",
		"twatted",
		"fcked",
		"dud"
	]
}

let sensorVariables = {
	//console log breathalyser values
	allowReading: true,
	oldValue: drunkData.drunkLevels[0],
	oldActive: null,
	readyToStart: false,
	animation: null,
	//readings from breathalyser
	readingsArr: [], 
	total: 0, 
	average: 0
}

//arduino code
board.on("ready", function() {
  strip = new pixel.Strip({
  	data: 6, 
  	length: 144,
    color_order: pixel.COLOR_ORDER.RGB,
  	board: this,
  	controller: "FIRMATA",
  });


  this.pinMode(5, five.Pin.ANALOG);
  this.analogRead(5, function(alcoholReading) {
    if(sensorVariables.readyToStart) activateLeds(senseAlcohol(alcoholReading));
  });

  strip.on("ready", function() {
        // do stuff with the strip here
        console.log("strip ready");
    	strip.color([0, 255, 0]); // Sets strip using an array
        strip.show(); // make the strip latch and update the LEDs
    	console.log(strip.pixel(2).color());
        sensorVariables.animation = setTimeout(function(){ 
        	strip.off();
        	errorChecker("black");
        	sensorVariables.readyToStart = true;
        }, 2000);
  });
});


function errorChecker(colourCorrect){
  	for(var x = 0; x < 144;x++) if(strip.pixel(x).color().color != colourCorrect) strip.pixel(x).color(colourCorrect);
}

function activateLeds(light){
  	if(light){
	  	console.log(light);
	  	if(sensorVariables.oldActive != light){
	  		sensorVariables.allowReading = false;
	  		console.log("timer begin now!!!!")
	  		clearTimeout(sensorVariables.animation);
	  		sensorVariables.animation = setTimeout(function(){ 
	  	    	strip.color([0, 0, 0]); // Sets strip using an array
	  	    	strip.show();
			  	if(light == drunkData.drunkLevels[0]){
				  	console.log("sober active!");
				  	strip.off();
			  	}
			  	else{
		  			for(var i = 1; i < drunkData.drunkLevels[i]; i++){
		  				if(light == drunkData.drunkLevels[i]){
		  	    			console.log(drunkData.drunkStrings[i] + " active!");	
		  	    			console.log(drunkData.ledLength[i] + " = length");	
		  					for(var x = 0; x < drunkData.ledLength[i]; x++){
						  		strip.pixel(x).color([0, 255, 0]);
						  	}	
		  				}
		  			}
				  	strip.show();
			  	} 
			  	sensorVariables.allowReading = true;
		    }, 2000);
	  	}
	  	sensorVariables.oldActive = light;
	}
  }


function senseAlcohol(alcoholReading){
  	sensorVariables.readingsArr.push(alcoholReading);
	if(sensorVariables.readingsArr.length >= 50){
		for (var i = 0; i < sensorVariables.readingsArr.length; i++) sensorVariables.total += sensorVariables.readingsArr[i];
		sensorVariables.average = parseInt(sensorVariables.total/sensorVariables.readingsArr.length);
		if(sensorVariables.allowReading) console.log("alcohol reading = " + sensorVariables.average);
		sensorVariables.readingsArr.shift();
		sensorVariables.total=0;
		for(let x = 0; x < drunkData.drunkLevels.length; x++){
			if(sensorVariables.average >= drunkData.drunkLevels[x] && sensorVariables.average < (drunkData.drunkLevels[x+1]) ){
				if(sensorVariables.oldValue != drunkData.drunkLevels[x]) {
					sensorVariables.oldValue = drunkData.drunkLevels[x];
					return(drunkData.drunkLevels[x]);		
				}
				sensorVariables.oldValue = drunkData.drunkLevels[x];
			}			
		}
	}
}