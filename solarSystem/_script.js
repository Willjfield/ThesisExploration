var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Math.PI*2

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var t = 0;
var drawPlanets = []
var solScale = 30;
var planScale = 2000;

//SUN
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

//PLANETS
for(var p in explore.planets){
	var geometry = new THREE.SphereGeometry( explore.planets[p].radius/planScale,8,8 );
	var material = new THREE.MeshLambertMaterial( { color: explore.planets[p].texColor, wireframe: true } );
	var sphere = new THREE.Mesh( geometry, material );
	var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
	sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale);
	drawPlanets.push(sphere);
	scene.add( sphere);
}

var render = function () {
	requestAnimationFrame( render );
	controls.update();
	t+=.1;
	for(p in drawPlanets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now+t);
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
	}
	renderer.render(scene, camera);
};

render();