var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera );
                                controls.damping = 0.2;
			
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.PlaneGeometry( 50, 50, 50,50 );
var wireFrameMaterial = new THREE.MeshBasicMaterial( { color: 0xdddddd, needsUpdate: true, wireframe: true,wireframeLinewidth: 2 } );
var solidMaterial = new THREE.MeshBasicMaterial( { needsUpdate: true, color: 0x111111 } );

for(var v=1;v<geometry.vertices.length-1;v++){
	geometry.vertices[v].z = (Math.random()*2)*((geometry.vertices[v-1].z+geometry.vertices[v+1].z)/2)
}
var wireLandscape = new THREE.Mesh( geometry, wireFrameMaterial );
var solidLandscape = new THREE.Mesh( geometry, solidMaterial)
scene.add( wireLandscape )
wireLandscape.add(solidLandscape)
solidLandscape.position.z = -.01

camera.position.z = 50;
var fc = 0
var render = function () {
	requestAnimationFrame( render );
	for(var v = 0; v<geometry.vertices.length;v++){
		wireLandscape.geometry.vertices[v].z += (Math.random()-.5)*.2
		wireLandscape.geometry.verticesNeedUpdate = true	
	}
	renderer.render(scene, camera);
};

render()
