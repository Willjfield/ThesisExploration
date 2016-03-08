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
				controls.zoomSpeed = .01
				controls.rotateSpeed = .1
				controls.panSpeed = .1

var light = new THREE.PointLight( 0xffffff, 1, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

var t = 0;
var drawPlanets = []
var solScale = 10;
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
					console.log( item, loaded, total );
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
for(var p in explore.planets){
	var texturePath = "../data/images/"
	texturePath += explore.planets[p].name + ".jpg"
	loader.load( texturePath, function ( image ) {
					var ptexture = new THREE.Texture();
					ptexture.image = image;
					ptexture.needsUpdate = true;
			

	var geometry = new THREE.SphereGeometry( explore.kmtoau(explore.planets[p].radius)*solScale*100,16,16 );
	var material = new THREE.MeshLambertMaterial( { map:ptexture, side:THREE.DoubleSide } );
	var sphere = new THREE.Mesh( geometry, material );
	

	var materialW = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: true, wireframeLinewidth: .5 } );
	var geometryW = new THREE.SphereGeometry( explore.planets[p].radius/planScale,8,8 );
	var sphereW = new THREE.Mesh( geometryW, materialW );
	sphere.add(sphereW);

	var curPosition = explore.SolarSystem(explore.planets[p],explore.now);
	sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
	drawPlanets.push(sphere);
	scene.add( sphere);
	} );
}

var render = function () {
	requestAnimationFrame( render );
	controls.update();
	var step = 0
	t+=step;
	/*set target to planet
	var jtar = explore.SolarSystem(explore.planets[4],explore.now+t)
	var target = new THREE.Vector3(jtar[0]*solScale,jtar[1]*solScale,jtar[2]*solScale)
	controls.target = target
	*/
	for(p in drawPlanets){
		var curPosition = explore.SolarSystem(explore.planets[p],explore.now+t);
		var deltaRotation = -(24/explore.planets[p].dayLength)*(2*Math.PI)

		var curRotation = (deltaRotation*t)
		drawPlanets[p].rotation.set(explore.planets[p].oblique*(Math.PI/180),curRotation,0)
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
	controls.zoomSpeed = .01
	controls.rotateSpeed = .1
		controls.panSpeed = .1
	})

render();
