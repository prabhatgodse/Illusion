(function() {

	Illusion.ShapeNode = function(id) {
		this.vao = ext.createVertexArrayOES();
	    this.geo = new Illusion_Geometry();
	    this.id = id;
	    this.diffuseColor = {r:0.0, g:0.0, b:0.0};
	    this.specularColor = {r:0.0, g:0.0, b:0.0};
	    this.phongComponent = 10.0;  //The shineness factor of the specular color.
	    this.alpha = 1.0;
	    this.isTransparent = false;
	    this.textureArray = [];

	    this.translateMatrix = [0.0, 0.0, 0.0];
	    this.scaleMatrix = [1.0, 1.0, 1.0];
	    this.rotateX = 0.0;
	    this.rotateY = 0.0;
	    this.rotateZ = 0.0;

	    //Order in which objects are rendered.
	    // 1: meaning this object is rendered first
	    this.renderOrder = 1.0;
	    this.vertexBuffer = 0;
	}

    Illusion.ShapeNode.prototype.setDiffuseColor = function(r, g, b) {
        this.diffuseColor.r = r;
        this.diffuseColor.g = g;
        this.diffuseColor.b = b;
    };

    Illusion.ShapeNode.prototype.setSpecularColor = function(r, g, b) {
        this.specularColor.r = r;
        this.specularColor.g = g;
        this.specularColor.b = b;
    }

    Illusion.ShapeNode.prototype.setPhongComponent = function(p) {
        self.phongComponent = p;
    }

    Illusion.ShapeNode.prototype.setAlpha = function(a) {
        self.alpha = a;
    }

    Illusion.ShapeNode.prototype.addTexture = function(tex) {
        this.textureArray.push(tex);
    }

    Illusion.ShapeNode.prototype.createAnimation = function() {

    }

    Illusion.ShapeNode.prototype.animationCallback = function(){};

    Illusion.ShapeNode.prototype.applyTransformations = function(mat) {
        this.translateMatrix = mat;
    }

    Illusion.ShapeNode.prototype.applyScaling = function(mat) {
        this.scaleMatrix = mat;
    }

    Illusion.ShapeNode.prototype.makeTransparentWithAlpha = function(a) {
        this.isTransparent = true;
        this.alpha = a;
    }

    Illusion.ShapeNode.prototype.buildGeometryWithObjFile = function(obj_file_path) {
        var thisObj = this;
        jQuery.get(obj_file_path, function(data) {
            var mesh = new obj_loader.Mesh(data);
            thisObj.geo.vertices = mesh.vertices;
            thisObj.geo.normals = mesh.vertexNormals;
            thisObj.geo.uvs = mesh.textures;
            thisObj.geo.indices = mesh.indices;
            ILLUSION_LOADED_OBJECT_COUNT += 1;
            webGLStart();
        });
    }

    Illusion.ShapeNode.prototype.renderObject = function() {
        if (this.isTransparent) {
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
            gl.enable(gl.BLEND);
            gl.uniform1f(shaderProgram.alphaUniform, this.alpha);
        } else {
            gl.enable(gl.DEPTH_TEST)
            gl.disable(gl.BLEND);
            gl.uniform1f(shaderProgram.alphaUniform, 1.0);
        }
        //Set the material base colors
        if (this.textureArray.length == 0) {
            gl.uniform1i(shaderProgram.useTexture, false);
        } else {
            gl.uniform1i(shaderProgram.useTexture, true);
        }
        gl.uniform3f(shaderProgram.materialDiffuseColor, this.diffuseColor.r, this.diffuseColor.g, this.diffuseColor.b);
        gl.uniform3f(shaderProgram.materialSpecularColor, this.specularColor.r, this.specularColor.g, this.specularColor.b);
        gl.uniform1f(shaderProgram.phongComponent, this.phongComponent);
        //Set the textures
        if  (this.textureArray.length > 1) {
            gl.uniform1i(shaderProgram.layerTexture, true);
        } else {
            gl.uniform1i(shaderProgram.layerTexture, false);
        }
        var tIdx = 0;
        for (var idx in this.textureArray) {
            gl.activeTexture(gl.TEXTURE0 + tIdx);
            gl.bindTexture(gl.TEXTURE_2D, this.textureArray[idx]);
            if(tIdx == 0)
                gl.uniform1i(shaderProgram.samplerUniform, idx);
            else
                gl.uniform1i(shaderProgram.samplerDepthUniform, idx);
            tIdx += 1;
        }
        mat4.identity(mMatrix);
        mat4.translate(mMatrix, this.translateMatrix);
        mat4.scale(mMatrix, this.scaleMatrix);
        mat4.rotate(mMatrix, degToRad(this.rotateX), [1, 0, 0]);
        mat4.rotate(mMatrix, degToRad(this.rotateY), [0, 1, 0]);
        mat4.rotate(mMatrix, degToRad(this.rotateZ), [0, 0, 1]);

        ext.bindVertexArrayOES(this.vao);
    }
})();