var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera, renderer.domElement);

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 10, 0, 0 );
scene.add( light );

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( -10, 0, 0 );
scene.add( light );

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 10, 0 );
scene.add( light );

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, -10, 0 );
scene.add( light );

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, 10 );
scene.add( light );

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, -10 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var t = 0;

var planets = []
var solScale = 30;
	
//MERCURY - white
var geometry = new THREE.SphereGeometry( 1,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[0],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[0] );
console.log(curPosition)

//VENUS - orange
var geometry = new THREE.SphereGeometry( 2,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0xff9933 } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[1],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[1] );
console.log(curPosition)

//SUN - yellow
var geometry = new THREE.SphereGeometry( 7,16,16 );
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[2],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[2] );
console.log(curPosition)

//MARS - red
var geometry = new THREE.SphereGeometry( 2,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[3],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[3] );
console.log(curPosition)

//JUPITER - pink
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0xff4d88 } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[4],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[4] );
console.log(curPosition)

//Saturn - green
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[5],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[5] );
console.log(curPosition)

//Uranus - blue
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0x0055ff } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[6],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[6] );
console.log(curPosition)

//Neptune - purple
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshLambertMaterial( { color: 0x730099 } );
var sphere = new THREE.Mesh( geometry, material );
var curPosition = explore.SolarSystem(explore.planets[7],explore.now);
sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
planets.push(sphere);
scene.add( planets[7] );
console.log(curPosition)

//Init through array
/*
for(p in explore.planets){
	
	var geometry = new THREE.BoxGeometry( p/2, p/2, p/2 );
	var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
	var sphere = new THREE.Mesh( geometry, material );
	planets.push(sphere);
	scene.add( planets[p] );
	var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
	planets[p].position.set(curPosition[0]*20,curPosition[1]*20,curPosition[2]*20)
	console.log(curPosition)
	if(p==2){
		planets[p].material.color.set(0xffffff);
	}
}
*/

camera.position.z = 5;

var render = function () {
	requestAnimationFrame( render );
	controls.update();
	t+=.1;

	for(p in planets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now+t);
		planets[p].position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
	}

	renderer.render(scene, camera);

};



render();