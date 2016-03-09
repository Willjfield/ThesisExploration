var tleLine1 = "1 25544U 98067A   16043.59063867  .00017039  00000-0  25889-3 0  9993"
var tleLine2 = "2 25544  51.6448 324.3640 0006823 108.4277 310.7755 15.54658286985448"
var tlObj = new explore.tle(tleLine1,tleLine2);
var xyz = tlObj.update();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(0,0,100)

var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setClearColor( 0xffffff, 0);
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera);
				controls.minDistance = 0;

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
	var geometry = new THREE.SphereGeometry( explore.planets[p].radius/planScale,32,16 );
	var material = new THREE.MeshLambertMaterial( { color: explore.planets[p].texColor } );
	var sphere = new THREE.Mesh( geometry, material );

	var materialW = new THREE.MeshLambertMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: .5 } );
	var sphereW = new THREE.Mesh( geometry, materialW );
	sphere.add(sphereW);
	
	var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
	sphere.position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale);
	sphere.rotation.set(explore.planets[p].oblique*(Math.PI/180),0,0);
	drawPlanets.push(sphere);
	scene.add( sphere);
}

	var ISSGeo = new THREE.SphereGeometry( .1,16,16 );
	var ISSMat = new THREE.MeshLambertMaterial( { color: 0x000000 } );
	var ISS = new THREE.Mesh(ISSGeo,ISSMat);
	scene.add(ISS)

var render = function () {
	var earthPosition = explore.SolarSystem(explore.planets[2],explore.now);
	tlObj.update();
	console.log(tlObj.getLookAnglesFrom(-74,42, 1))

	xyz = tlObj.position_eci;

	//z-axis is flipped between iss and solar system frames? Also, 
	var ISSPosition = explore.translatePositions([xyz.x/150000,xyz.y/150000,-xyz.z/150000],earthPosition)
	ISS.position.set(ISSPosition[0]*solScale,ISSPosition[1]*solScale,ISSPosition[2]*solScale);

	requestAnimationFrame( render );
	controls.update();

	var step = .001;
	t+=step;

	for(p in drawPlanets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
		drawPlanets[p].rotation.set(-explore.planets[p].oblique*(Math.PI/180),0,0);
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[1]*solScale,curPosition[2]*solScale)
	}
	renderer.render(scene, camera);
};

render();