var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera );
                                controls.damping = 0.2;
			
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.PlaneGeometry( 50, 50, 50,50 );
var material = new THREE.MeshBasicMaterial( { color: 0xdddddd, wireframe: true } );

for(var v=0;v<geometry.vertices.length;v++){
	geometry.vertices[v].z = Math.random()*2
}
var landscape = new THREE.Mesh( geometry, material );

scene.add( landscape );

camera.position.z = 50;

var render = function () {

	requestAnimationFrame( render );
	landscape.rotation.x = -45

	renderer.render(scene, camera);
};

render();
