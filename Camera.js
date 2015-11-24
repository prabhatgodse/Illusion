(function() {
	Illusion.Camera = function(viewAngle, aspectRatio, nearPlane, farPlane) {
		this.viewAngle = viewAngle;
		this.aspectRatio = aspectRatio;
		this.nearPlane = nearPlane;
		this.farPlane = farPlane;
		this.matrix = mat4.create();
		this.rotateMatrix = mat4.create();
		mat4.identity(this.rotateMatrix);

		this.projectionMatrix = mat4.create();
		this.updateProjectionMatrix();

		this.rotateSpeed = 10;
		this.eye = {x: 0.0, y : 0.0, z : -5.0} ;
		this.updateCameraMatrix();
	}

	Illusion.Camera.prototype.rotateWithMouseMove = function(dx, dy) {
		var newRotate = mat4.create();
		mat4.identity(newRotate);
        mat4.rotate(newRotate, degToRad(dx / this.rotateSpeed), [0, 1, 0]);
        mat4.rotate(newRotate, degToRad(dy / this.rotateSpeed), [1, 0, 0]);

        mat4.multiply(newRotate, this.rotateMatrix, this.rotateMatrix);
        this.updateCameraMatrix();
        
	}

	Illusion.Camera.prototype.setEyePosition = function(x, y, z) {
		this.eye.x = x;
		this.eye.y = y;
		this.eye.z = z;
		this.updateCameraMatrix();
	}

	Illusion.Camera.prototype.updateCameraMatrix = function() {
		//Update matrix
		this.updateProjectionMatrix();

        mat4.identity(this.matrix);
        mat4.translate(this.matrix, [-this.eye.x,
        							 -this.eye.y,
        							 -this.eye.z]);

        mat4.multiply(this.matrix, this.rotateMatrix);
	};

	Illusion.Camera.prototype.updateAspectRatio = function(ratio) {
		this.aspectRatio = ratio;
		this.updateProjectionMatrix();
	}


	Illusion.Camera.prototype.updateProjectionMatrix = function() {
		mat4.perspective(this.viewAngle, this.aspectRatio, 
						 this.nearPlane, this.farPlane, this.projectionMatrix);
	}
}) ();