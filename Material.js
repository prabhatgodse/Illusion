var MaterialLibrary = function(){
 
	/*private variables and methods (not accessible directly through the  mySingleton namespace): */
 
	function Material(id) {
		this.id = id;
		console.log("State created", id);
	}
	Material.prototype.createTextureWithUrl = function(id, url) {
		this.texture = new Texture(id, url);
		this.texture.init();
	}
	Material.prototype.setTexture = function(tex) {
		this.texture = tex;
	}

	function newMaterial(id){
		var ss = new Material(id);
		return ss;
	}

	/** A Generic texture class
	*/
	function Texture(id, url) {
		this.id = id;
		this.url = url;
	}
	Texture.prototype.init = function() {
		onLoadCallback = function(tex, image) {
			gl.bindTexture(gl.TEXTURE_2D, tex);
		    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		    gl.bindTexture(gl.TEXTURE_2D, null);
		}
		self = this;
		self.glTexture = gl.createTexture();
		image = new Image();
		image.onload = function () {
			onLoadCallback(self.glTexture, image);
			console.log("Loaded texture: " + self.id + " from url: " + self.url);
		}
		image.src = this.url;
	}

	function fetchTexture(id, url) {
		var tex = new Texture(id, url);
		tex.init();
		return tex;
	}
 
	/* public variables and methods (can access private vars and methods ) */
	return {
		newMaterial : function(id){
			return newMaterial(id);
		},
		fetchTexture: function(id, url) {
			return fetchTexture(id, url);
		}
	}
}
 
var IllusionLibrary = MaterialLibrary();