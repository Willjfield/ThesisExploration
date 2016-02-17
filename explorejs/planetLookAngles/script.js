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

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var t = 0;
var drawPlanets = []
var solScale = 30;
var planScale = 5000;

//SUN
var geometry = new THREE.SphereGeometry( 5,16,16 );
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

//PLANETS
for(var p in explore.planets){
	var geometry = new THREE.SphereGeometry( explore.planets[p].radius/planScale,8,8 );
	var material = new THREE.MeshLambertMaterial( { color: explore.planets[p].texColor } );
	var sphere = new THREE.Mesh( geometry, material );

	var materialW = new THREE.MeshLambertMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: .5 } );
	var sphereW = new THREE.Mesh( geometry, materialW );
	sphere.add(sphereW);
	
	var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
	sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
	drawPlanets.push(sphere);
	scene.add( sphere);
}

var render = function () {
	requestAnimationFrame( render );
	controls.update();
	var step = 0;
	t+=step;

	//console.log(t)
	for(p in drawPlanets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now+t);
		var deltaRotation = -(24/explore.planets[p].dayLength)*(2*Math.PI)

		var curRotation = (deltaRotation*t)
		drawPlanets[p].rotation.set(explore.planets[p].oblique*(Math.PI/180),curRotation,0)
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale)
	}
	renderer.render(scene, camera);
};
    var posMars = explore.SolarSystem(explore.planets[1],explore.now)
    //console.log(posMars)
    var obsPos = {latitude:40.67,longitude:-74}
    var earthPos = explore.SolarSystem(explore.planets[2],explore.now)
    var sunPos = [earthPos[0]*-1,earthPos[1]*-1,earthPos[2]*-1]
    var marsRaDec = explore.radecr(posMars,sunPos,explore.now,obsPos)
    var lookAngles = explore.radec2aa(marsRaDec[0],marsRaDec[1],explore.now,obsPos)
    console.log(lookAngles)
   // console.log(explore.PlanetAlt(3,explore.now,obsPos)) 
/*
document.addEventListener("click", function(){ 
	t+=365.25; 
});
*/

render();
