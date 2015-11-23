(function() {
	Illusion.Texture = function(params) {
		this.url = params.url;
		this.texture = null;
	}

	/** Download the texture form URL
	*/
	Illusion.Texture.prototype.loadTexture = function() {
		this.texture = gl.createTexture();
		this.texture.image = new Image();
		var self = this;
		this.texture.image.onload = function() {
			self.buildTexture();
		}
		this.texture.image.src = this.url;
	}

	/** Load the texture onto graphics memory.
	*/
	Illusion.Texture.prototype.buildTexture = function() {
		gl.bindTexture(gl.TEXTURE_2D, this.texture);
	    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture.image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	    gl.bindTexture(gl.TEXTURE_2D, null);
	}
}) ();