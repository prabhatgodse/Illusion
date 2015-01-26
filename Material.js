var MaterialLibrary = function(){
 
	/*private variables and methods (not accessible directly through the  mySingleton namespace): */
 
	function State(id) {
		this.id = id;
		console.log("State created", id);
	}
	State.prototype.setTexture = function() {
		console.log("Create texture");
	}

	var privateVar = 'bla';
	function createState(id){
		var ss = new State(id);
		return ss;
	}
 
	/* public variables and methods (can access private vars and methods ) */
	return {
		createState : function(id){
			return createState(id);
		},
		publicVar:'this is publicly accessible'
	}
}
 
var IllusionLibrary = MaterialLibrary();