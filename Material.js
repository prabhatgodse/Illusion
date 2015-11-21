(function() {
	Illusion.Material = function(params) {
		this.uniforms = {};
		this.shaderProgram = 0;
	}

	Illusion.Material.prototype.fetchShaderFromUrl = function(vertUrl, fragUrl, ok) {
		var shaderFragmentCode = "";
	    var shaderVertexCode = "";
	    var self = this;

	    jQuery.get(fragUrl, function(data) {
	        shaderFragmentCode = data;
	        jQuery.get(vertUrl, function(data) {
	            shaderVertexCode = data;
	            self.addShader(shaderVertexCode, shaderFragmentCode);
	            if(ok) ok();
	        });
	    });
	}

	Illusion.Material.prototype.compileShader = function(shaderScript, type) {
		if (!shaderScript) {
	        return null;
	    }
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, shaderScript);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

            console.log(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
	}

	/** Pass the shader code text.
	*/
	Illusion.Material.prototype.addShader = function(vertex, fragment) {
		//Compile the shader
		var vertCompiled = this.compileShader(vertex, "vertex");

		if(!vertCompiled) {
			console.log("Illusion.Material.prototype.addShader: Failed to compile vertex shader");
			return;
		}

		var fragCompiled = this.compileShader(fragment, "fragment");
		if(!fragCompiled) {
			console.log("Illusion.Material.prototype.addShader: Failed to compile fragment shader");
			return;
		}

		var program = gl.createProgram();
		gl.attachShader(program, vertCompiled);
		gl.attachShader(program, fragCompiled);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			var error = gl.getProgramInfoLog(program)
	        console.log('FATAL: Unable to LINK shader program: ' + error);
	    }
	    this.shaderProgram = program;

	    //Link shader program with uniforms and attributes.
	    this.addUniform('uniformMatrix4fv', 'uPMatrix', mat4.create());
	}

	Illusion.Material.prototype.addUniform = function(uniformType, uniformName, value) {
		this.uniforms[uniformName] = {
			type: uniformType,
			value: value
		};
		if(!this.shaderProgram) return;

		var uniformLocation = gl.getUniformLocation(this.shaderProgram, uniformName);

		if(uniformLocation == gl.INVALID_VALUE ||
			uniformLocation == gl.INVALID_OPERATION) {
			console.log('ERROR: Unable to find uniform: ' + uniformName + ' in shader program');
			return;
		}
		this.uniforms[uniformName].programLocation = uniformLocation;
	}

	Illusion.Material.prototype.renderMaterial = function() {
		//Render all uniforms
		for(var uniform in this.uniforms) {
			gl.useProgram(this.shaderProgram);

			//gl[uniform.type]()
		}
	};
}) ();