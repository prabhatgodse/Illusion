(function () {

	var ShaderComposer = Illusion.ShaderComposer = {};

	function initShaderCode(callback) {

	    function getShader(shaderScript, type) {
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
	    var shaderFragmentCode = "";
	    var shaderVertexCode = "";
	    jQuery.get("shader_fragment.frag", function(data) {
	        shaderFragmentCode = data;
	        jQuery.get("shader_vertex.vert", function(data) {
	            shaderVertexCode = data;
	            var frag = getShader(shaderFragmentCode, "fragment");
	            var vert = getShader(shaderVertexCode, "vertex");
	            initShaders(vert, frag);
	            callback();
	        })
	    })
	}

	function initShaders(vertexShader, fragmentShader) {
	    var shaderProgram = gl.createProgram();
	    gl.attachShader(shaderProgram, vertexShader);
	    gl.attachShader(shaderProgram, fragmentShader);
	    gl.linkProgram(shaderProgram);

	    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	        alert("Could not initialise shaders");
	    }

	    gl.useProgram(shaderProgram);
	    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

	    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
	    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

	    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram, "uMMatrix");
	    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram, "uVMatrix");
	    shaderProgram.lightMVMatrix =  gl.getUniformLocation(shaderProgram, "lightMVMatrix");
	    shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	    shaderProgram.samplerDepthUniform = gl.getUniformLocation(shaderProgram, "uDepthSampler");
	    shaderProgram.alphaUniform = gl.getUniformLocation(shaderProgram, "uAlpha");
	    shaderProgram.layerTexture = gl.getUniformLocation(shaderProgram, "layerTextures");
	    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	    shaderProgram.pointLightPosition = gl.getUniformLocation(shaderProgram, "pointLightPosition");
	    shaderProgram.pointLightDiffuseColor = gl.getUniformLocation(shaderProgram, "uPointLightDiffuseColor");
	    shaderProgram.pointLightSpecularColor = gl.getUniformLocation(shaderProgram, "uPointLightSpecularColor");
	    shaderProgram.phongComponent = gl.getUniformLocation(shaderProgram, "uPhongComponent");
	    shaderProgram.materialDiffuseColor = gl.getUniformLocation(shaderProgram, "uMaterialDiffuseColor");
	    shaderProgram.materialSpecularColor = gl.getUniformLocation(shaderProgram, "uMaterialSpecularColor");
	    shaderProgram.useTexture = gl.getUniformLocation(shaderProgram, "useTexture");

	    shaderProgram.pointLights = [];
	    shaderProgram.pointLights[0] = {position:{}, diffuseColor:{}, specularColor:{}};
	    shaderProgram.pointLights[0].position = gl.getUniformLocation(shaderProgram, "point_lights[0].position");
	    shaderProgram.pointLights[0].diffuseColor = gl.getUniformLocation(shaderProgram, "point_lights[0].diffuseColor");
	    shaderProgram.pointLights[0].specularColor = gl.getUniformLocation(shaderProgram, "point_lights[0].specularColor");

	    shaderProgram.pointLights[1] = {position:{}, diffuseColor:{}, specularColor:{}};
	    shaderProgram.pointLights[1].position = gl.getUniformLocation(shaderProgram, "point_lights[1].position");
	    shaderProgram.pointLights[1].diffuseColor = gl.getUniformLocation(shaderProgram, "point_lights[1].diffuseColor");
	    shaderProgram.pointLights[1].specularColor = gl.getUniformLocation(shaderProgram, "point_lights[1].specularColor");

	    //Link Spot lights to GLSL code
	    shaderProgram.spotLights = [];
	    shaderProgram.spotLights[0] = {position:{}, direction:{}, coneAngle:{}, spotColor:{}, linearAtt:{}};
	    shaderProgram.spotLights[0].position = gl.getUniformLocation(shaderProgram, "spot_lights[0].position");
	    shaderProgram.spotLights[0].direction = gl.getUniformLocation(shaderProgram, "spot_lights[0].direction");
	    shaderProgram.spotLights[0].coneAngle = gl.getUniformLocation(shaderProgram, "spot_lights[0].coneAngle");
	    shaderProgram.spotLights[0].spotColor = gl.getUniformLocation(shaderProgram, "spot_lights[0].color");
	    shaderProgram.spotLights[0].linearAtt = gl.getUniformLocation(shaderProgram, "spot_lights[0].linearAtt");

	    ShaderComposer.shaderProgram = shaderProgram;
	}

	ShaderComposer.getShaderByMask = function(mask, callback) {
		initShaderCode(callback);
	}
	
})();