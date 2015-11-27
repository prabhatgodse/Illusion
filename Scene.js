(function() {
	Illusion.Scene = function(params) {
		this.objects = [] || params.objects;
		this.ambient = {};
		this.directionLight = [];
		this.pointLight = [];
	}

	Illusion.Scene.prototype.addObject = function(object) {
		this.objects.push(object);
	};

	//Scene rendering function for camera
	Illusion.Scene.prototype.renderSceneToCamera = function(camera) {
		//Render all objects to the camera class
		for(var idx in this.objects) {
			var object = this.objects[idx];
			object.renderObject(camera.projectionMatrix, camera.matrix);

			if(enableAnimation)
				object.animationCallback();
		}
	};

	/**Add light parameters to scene
	@params light Parameters of light {direction & color}, {point position, color}
	{ambient color}, {cone light...}
	@params type "DIRECTION", "POINT", "AMBIENT"
	*/
	Illusion.Scene.prototype.addLight = function(light, type) {
		if(type === "DIRECTION") {
			this.directionLight.push(light);
		}
		else if(type === "POINT") {
			this.pointLight.push(light);
		}
		else if(type === "AMBIENT") {
			this.ambient = light;
		}
	}

}) ();