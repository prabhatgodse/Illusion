(function() {
	Illusion.Material = function(params) {
		this.uniforms = {};
		this.attributes = {};
		this.shaderProgram = null;
		this.textures = [];
		this.scene = params.scene;
	}

	Illusion.Material.prototype.fetchShaderFromUrl = function(vertUrl, fragUrl, ok) {
		var shader = new Illusion.ShaderComposer({});

		var shaderParams = {};
		shaderParams['ambientLight'] = this.scene.ambient;
		shaderParams['colorTexture'] = {count : this.textures.length};

		shaderVertexCode = shader.generateVertexShaderCode(shaderParams);
	    shaderFragmentCode = shader.generateFragmentShaderCode(shaderParams);
	    this.addShader(shaderVertexCode, shaderFragmentCode);
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
	    var iden = mat4.identity(mat4.create());
	    this.addUniform('uniformMatrix4fv', 'uVMatrix', iden);
	    this.addUniform('uniformMatrix4fv', 'uMMatrix', iden);
	    this.addUniform('uniformMatrix4fv', 'uPMatrix', iden);

	    //Add basic attributes
	    this.addAttribute('aVertexPosition');
	    this.addAttribute('aVertexNormal');
	    this.addAttribute("aTextureCoord");

	    for(var idx in this.textures) {
	    	var texture = this.textures[idx];
	    	var location = gl.getUniformLocation(this.shaderProgram, texture.uniform);
	    	if(location != null) {
	    		texture.location = location;
	    	}
	    }

	    if(this.scene.ambient) {
	    	this.addUniform('uniform3fv', 'ambientLight', this.scene.ambient.color);
	    }
	}

	Illusion.Material.prototype.addUniform = function(uniformType, uniformName, value) {
		this.uniforms[uniformName] = {
			type: uniformType,
			value: value
		};

		if(!this.shaderProgram) return;

		gl.useProgram(this.shaderProgram);
		var uniformLocation = gl.getUniformLocation(this.shaderProgram, uniformName);

		if(!uniformLocation) {
			console.log('ERROR: Unable to find uniform: ' + uniformName + ' in shader program');
			return;
		}
		this.uniforms[uniformName].programLocation = uniformLocation;

		gl.useProgram(this.shaderProgram);

		//Render all uniforms
		for(var key in this.uniforms) {
			var uniform = this.uniforms[key];
			//If uniform not linked to program then continue
			if(!uniform.programLocation) continue;

			if(uniform.type === 'uniformMatrix4fv') {
				gl[uniform.type](uniform.programLocation, false, uniform.value);
			}
			else if(uniform.type === 'uniform3fv') {
				gl[uniform.type](uniform.programLocation, uniform.value);
			}
			//gl[uniform.type]()
		}
	}

	Illusion.Material.prototype.setUniformValue = function(uniformName, value) {
		var uniform = this.uniforms[uniformName];
		if(uniform == null) {
			console.log('ERROR: setUniformValue no uniform found: ' + uniformName);
			return;
		}
		uniform.value = value;
	}

	Illusion.Material.prototype.addAttribute = function(attribName) {
		if(!this.shaderProgram) return;

		var programLocation = gl.getAttribLocation(this.shaderProgram, attribName);
		if(programLocation == null) {
			console.log("ERROR: Failed to get attribute location: " + attribName);
			return;
		}
		this.attributes[attribName] = {programLocation : programLocation};
	}

	/** Pass the Illusion.Texture object.
	@param type The type of texture color, normal, alpha, specular, environment
	*/
	Illusion.Material.prototype.addTexture = function(texture, type, uniformName) {
		this.textures.push({
			texture : texture, 
			type: type,
			uniform : uniformName
		});
	}

	Illusion.Material.prototype.renderMaterial = function() {
		if(this.shaderProgram == null) return;

		gl.useProgram(this.shaderProgram);

		//Render all uniforms
		for(var key in this.uniforms) {
			var uniform = this.uniforms[key];
			//If uniform not linked to program then continue
			if(!uniform.programLocation) continue;

			if(uniform.type === 'uniformMatrix4fv') {
				gl[uniform.type](uniform.programLocation, false, uniform.value);
			}
			else if(uniform.type === 'uniform3fv') {
				gl[uniform.type](uniform.programLocation, uniform.value);
			}
			//gl[uniform.type]()
		}

		//Render textures
		var tIdx = 0;
		for(var idx in this.textures) {
			var texture = this.textures[idx];
			if(texture.location != null) {
				gl.activeTexture(gl.TEXTURE0 + tIdx);
            	gl.bindTexture(gl.TEXTURE_2D, texture.texture.texture);
                gl.uniform1i(texture.location, idx);
			}
			tIdx += 1;
		}

		//Render lights
	}

}) ();