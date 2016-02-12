var tleLine1 = "1 25544U 98067A   16040.89929207  .00012681  00000-0  19534-3 0  9990"
var tleLine2 = "2 25544  51.6455 337.7904 0007048  99.9517   6.8636 15.54554246985024"
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
	var geometry = new THREE.SphereGeometry( explore.planets[p].radius/planScale,8,8 );
	var material = new THREE.MeshLambertMaterial( { color: explore.planets[p].texColor } );
	var sphere = new THREE.Mesh( geometry, material );

	var materialW = new THREE.MeshLambertMaterial( { color: 0x000000, wireframe: true, wireframeLinewidth: .5 } );
	var sphereW = new THREE.Mesh( geometry, materialW );
	sphere.add(sphereW);
	
	var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
	sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
	sphere.rotation.set(explore.planets[p].oblique*(Math.PI/180),0,0);
	drawPlanets.push(sphere);
	scene.add( sphere);
}

	var ISSGeo = new THREE.SphereGeometry( .1,16,16 );
	var ISSMat = new THREE.MeshLambertMaterial( { color: 0x000000 } );
	var ISS = new THREE.Mesh(ISSGeo,ISSMat);
	drawPlanets[2].add(ISS)

var render = function () {
	var earthPosition = explore.SolarSystem(explore.planets[2],explore.now);
	xyz = tlObj.update();
	//SET ISS AND EARTH REFERENCE FRAMES!!
	console.log(xyz)
	//ISS.position.set((earthPosition[0]+(xyz.x/100000))*solScale,(earthPosition[2]+(xyz.y/100000))*solScale,(earthPosition[1]+(xyz.z/100000))*solScale);
	ISS.position.set((xyz.x/100000)*solScale,(xyz.y/100000)*solScale,(xyz.z/100000)*solScale);
	

	requestAnimationFrame( render );
	controls.update();

	var step = explore.minutesToSeconds(1);
	t+=step;
	//explore.updateTime(t);
	//console.log(explore.now);

	for(p in drawPlanets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
		
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale)
	}
	renderer.render(scene, camera);
};

render();