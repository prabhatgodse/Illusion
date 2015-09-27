var controls;

function init() {
	console.log("Three js app");

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );


	var light = new THREE.AmbientLight( 0xffffff ); // soft white light
	scene.add( light );

	var geometry = new THREE.BoxGeometry(1, 1, 1);
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	var cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	camera.position.z = 5;

	controls = new THREE.OrbitControls( camera, renderer.domElement );

	function render() {
		requestAnimationFrame( render );
		renderer.render( scene, camera );
		controls.update();
	}

	render();
}