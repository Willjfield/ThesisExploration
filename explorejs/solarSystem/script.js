var tleLine1 = "1 25544U 98067A   16068.60811216  .00006572  00000-0  10711-3 0  9999"
var tleLine2 = "2 25544  51.6425 199.6230 0001553 265.2287 192.4960 15.53947737989335"
var tlObj = new explore.tle(tleLine1,tleLine2);
var xyz = tlObj.update();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.001, 1000 );
camera.position.set(0,0,100)

var renderer = new THREE.WebGLRenderer({ /*alpha: true*/ });
renderer.setSize( window.innerWidth, window.innerHeight );
//renderer.setClearColor( 0xffffff, 0);
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Infinity;
				controls.zoomSpeed = .001
				controls.rotateSpeed = .01
				controls.panSpeed = .01

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var t = 0;
var drawPlanets = []
var solScale = 100;
var planScale = 25000;

//SUN
var geometry = new THREE.SphereGeometry( explore.kmtoau(explore.sol.radius)*solScale,16,16 );
var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

//PLANETS
var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					//document.getElementById("loading").remove()
					//document.getElementById("loadAmount").remove()
					//console.log( item, loaded, total );
				};

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						//document.getElementById("loadAmount").innerHTML = (Math.round(percentComplete, 2) + '%')
					}
				};

				var onError = function ( xhr ) {
				};

var loader = new THREE.ImageLoader( manager );

function makePlanets(){
	for(var p in explore.planets){	
			var geometry = new THREE.SphereGeometry( explore.kmtoau(explore.planets[p].radius)*solScale,32,32 );
			console.log(explore.kmtoau(explore.planets[2].radius)*solScale)
			var material = new THREE.MeshLambertMaterial( { color:0xffffff} );
			var sphere = new THREE.Mesh( geometry, material );
			
			var materialW = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: true, wireframeLinewidth: .5 } );
			var geometryW = new THREE.SphereGeometry( explore.planets[p].radius/planScale,8,8 );
			var sphereW = new THREE.Mesh( geometryW, materialW );
			sphere.add(sphereW);

			var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
			sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
			sphere.rotateY(Math.PI/2)
			sphere.name = explore.planets[p].name
			drawPlanets.push(sphere);
		}
}

makePlanets()

drawPlanets.forEach(function(planet, index){
	var texturePath = "../data/images/"
		texturePath += planet.name + ".jpg"
		var ptexture
		loader.load( texturePath, function (image) {
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				drawPlanets[index].material.map = ptexture
				scene.add(drawPlanets[index])
				})		
});

var ISSGeo = new THREE.SphereGeometry( .0001,16,16 );
	var ISSMat = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
	var ISS = new THREE.Mesh(ISSGeo,ISSMat);
	scene.add(ISS)

camera.position.set(drawPlanets[2].position.x+.01,drawPlanets[2].position.y,drawPlanets[2].position.z)
//camera.lookAt(drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z)
//camera.rotateY(Math.PI/2)

var render = function () {
	//KEEP CAMERA LOOKING AT EARTH
	camera.position.set(drawPlanets[2].position.x-.01,drawPlanets[2].position.y,drawPlanets[2].position.z)
	explore.updateTime()
	var step = 0
	t+=step;
	//console.log(explore.now+t)
	//THIS XYZ THING NEEDS TO UPDATE WITH EXPLORE.NOW + T
	var xyz = tlObj.update();
	console.log(tlObj.getLookAnglesFrom(-73,40,0))
	var earthPosition = [drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z]
	xyz = tlObj.position_eci;

	var ISSPosition = explore.translatePositions([explore.kmtoau(xyz.x)*solScale,explore.kmtoau(-xyz.y)*solScale,explore.kmtoau(xyz.z)*solScale],earthPosition)
	ISS.position.set(ISSPosition[0],ISSPosition[1],ISSPosition[2]);

	requestAnimationFrame( render );
	//controls.update();
	
	for(p in drawPlanets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now+t);
		var deltaRotation = (24/explore.planets[p].dayLength)*(2*Math.PI)

		var curRotation = (deltaRotation*t)+(Math.PI/2)+.3
		//explore.planets[p].oblique*(Math.PI/180)
		drawPlanets[p].rotation.set(0,curRotation,0)
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale)
	}
	renderer.render(scene, camera);
};

document.addEventListener("keydown",function(event){
	if(event.keyCode === 16 || event.charCode === 16){
		controls.zoomSpeed = .1
		controls.rotateSpeed = 1
		controls.panSpeed = 1
	}
})

document.addEventListener("keyup",function(){
	controls.zoomSpeed = .001
	controls.rotateSpeed = .01
		controls.panSpeed = .01
	})

render();
