//# sourceMappingURL=satellite.js.map
//ISS:http://www.celestrak.com/NORAD/elements/stations.txt
/*
var tleLine1 = "1 25544U 98067A   16040.89929207  .00012681  00000-0  19534-3 0  9990"
var tleLine2 = "2 25544  51.6455 337.7904 0007048  99.9517   6.8636 15.54554246985024"*/

//canyon 1
var tleLine1 = "1 03334U 68063A   15352.84992916 0.00000000  00000-0  00000-0 0    03"
var tleLine2 = "2 03334  14.2712 328.9565 0937054 121.4864 248.0078  0.99241369"

var tlObj = new explore.tle(tleLine1,tleLine2);
var xyz = tlObj.update()
console.log(xyz)

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,100)

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setClearColor( 0xffffff, 0);
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera);
				//controls.enableDamping = true;
				//controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				/*controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Infinity;*/

var light = new THREE.PointLight( 0x0066ff, 1, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

//SUN
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshBasicMaterial( { color: 0x004488 } );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );



var render = function () {
	xyz = tlObj.update()

	requestAnimationFrame( render );
	controls.update();
	renderer.render(scene, camera);
};

render();