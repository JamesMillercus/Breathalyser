export class TestClass{
	constructor(text){
		this.item = text;
		this.socket = io();
		console.log(this.item)
	}

	testFunction(){
		console.log("test function");
		this.socket.on('userSocket', function(val){
			console.log(val);
		});
	}
}