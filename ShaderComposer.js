(function () {

	Illusion.ShaderComposer = function(params) {

	}

	var SHADER_MASK = Illusion.SHADER_MASK = {};
	SHADER_MASK.textures = 1 << 1;
	SHADER_MASK.pointLight = 1 << 2;

	Illusion.ShaderComposer.prototype.generateVertexShaderCode = function(params) {
		//Basic attributes
		var code = [];

		var basicVtx = [  
			"attribute vec3 aVertexPosition;",
			"attribute vec3 aVertexNormal;",
			"attribute vec2 aTextureCoord;",
			"uniform mat4 uVMatrix;",
			"uniform mat4 uMMatrix;",
			"uniform mat4 uPMatrix;",
			"varying vec3 vVertexNormal;",];

		code.push(basicVtx.join("\n"));

		if(params.colorTexture) {
			for(var i = 0; i < params.colorTexture.count; i++) {
				code.push("attribute vec2 aTextureCoordA" + ";");
				code.push("varying vec2 vUV" + i + ";" + "\n");
			}
		}

		//Start main function
		code.push("");
		code.push("void main(void) { ");

		//Pass textures as varying
		if(params.colorTexture) {
			for(var i = 0; i < params.colorTexture.count; i++) {
				code.push("	vUV" + i + " = aTextureCoord" + ";")
			}
			code.push("\n");
		}

		//Pass normals as varying
		code.push("	vVertexNormal = aVertexNormal;");


		//Compute the final vertex position
		code.push("	gl_Position = uPMatrix * uVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);");

		code.push("}");
		//End Main function


		console.log(code.join("\n"));

		return code.join("\n");
	}

	Illusion.ShaderComposer.prototype.generateFragmentShaderCode = function(params) {
		var code = [];

		code.push("precision highp float;");

		code.push("varying vec3 vVertexNormal;");

		//Check for textures
		if(params.colorTexture) {
			for(var i = 0; i < params.colorTexture.count; i++) {
				code.push("varying vec2 vUV" + i + ";");
				code.push("uniform sampler2D colorTexture" + i + ";" + "\n");
			}
		}

		if (params.baseColor) {
			code.push("uniform vec4 baseColor;");
		}

		//Add ambient light
		if(params.ambientLight) {
			code.push("uniform vec3 ambientLight;");
		}

		//Start main function
		code.push("void main(void) { ");

		code.push("	vec4 fragColor = vec4(0.0);");

		if(params.baseColor) {
			code.push("	fragColor += baseColor;");
		}

		if(params.colorTexture) {
			code.push("	vec4 colorTexture = vec4(0.0);");
			for(var i = 0; i < params.colorTexture.count; i++) {
				code.push("	colorTexture += texture2D(colorTexture" + i + ", vUV" + i + ".xy);");
			}

			code.push("	fragColor += colorTexture;");
		}

		//Compute ambient light
		if(params.ambientLight) {
			code.push("	fragColor = vec4(fragColor.rgb * ambientLight.rgb, 1.0);" + "\n");
		}

		code.push("	gl_FragColor = fragColor;");
		// End main function
		code.push("}");

		console.log("-----FRAGMENT-----");
		console.log(code.join("\n"));
		return code.join("\n");
	};

}) ();