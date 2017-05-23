var hardware = module.exports = {


	constructor(){

	},

	errorChecker: function(colourCorrect){
	  	for(var x = 0; x < 144;x++) if(strip.pixel(x).color().color != colourCorrect) strip.pixel(x).color(colourCorrect);
	},

	activateLeds: function(light){
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
	  },


	senseAlcohol: function(alcoholReading){
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
};