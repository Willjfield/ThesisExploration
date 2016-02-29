			var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var controls;

			init();
			animate();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );
				// scene

				scene = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
					camera.position.z = 100;

				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Math.PI*2

				var ambient = new THREE.AmbientLight( 0xffffff );
				scene.add( ambient );

				var directionalLight = new THREE.DirectionalLight( 0xffeedd );
				directionalLight.position.set( 0, 0, 1 );
				scene.add( directionalLight );
//Negative Z = North
				var geometry = new THREE.BoxGeometry( 1, 1, 1 );
				var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
				var cube = new THREE.Mesh( geometry, material );
				cube.position.set(0,-60,-50)
				scene.add( cube );
				// texture

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					console.log( item, loaded, total );
				};

				var texture = new THREE.Texture();

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};

				var loader = new THREE.ImageLoader( manager );
				loader.load( 'models/El_Caracol.1Surface_Color.jpg', function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );

				var loader = new THREE.OBJLoader( manager );
				loader.load( 'models/chichenitza.obj', function ( object ) {
					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material.map = texture;
						}
					} );

					object.position.y = - 80;
					object.scale.set(.01,.01,.01)
					scene.add( object );

				}, onProgress, onError );

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {
				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function animate() {
				requestAnimationFrame( animate );
				render();
			}

			function render() {
				controls.update();
				renderer.render( scene, camera );
			}
