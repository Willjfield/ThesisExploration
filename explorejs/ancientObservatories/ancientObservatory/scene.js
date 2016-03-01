			var obsPos = {latitude:20.6792,longitude:-88.5707}
			var modelPath = 'models/chichenitza.obj'
			var texturePath = 'models/El_Caracol.1Surface_Color.jpg'

			var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var controls;

			var speed, tOffset, date

			var planetArray = []

			init();
			animate();

			function init() {
				speed = 0
				tOffset = 0
				document.getElementById("speedSlider").min = -8
				document.getElementById("speedSlider").max = 8
				document.getElementById("speedSlider").step = .01

				container = document.createElement( 'div' );
				document.body.appendChild( container );
				// scene

				scene = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set(0,0,0);

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

				var light = new THREE.PointLight( 0xffffff, 10, 1000 );
light.position.set( 50, 100, 50 );
scene.add( light );

				for(var p in explore.planets){
					var nullObj = new THREE.Object3D();
					if(p!=2){
						var geometry = new THREE.SphereGeometry( 10,8,8 );
						var material = new THREE.MeshLambertMaterial( { color: explore.planets[p].texColor } );
					}else{
						var geometry = new THREE.SphereGeometry( 15,8,8 );
						var material = new THREE.MeshLambertMaterial( { color: 0xffff00 } );
					}
					var sphere = new THREE.Mesh( geometry, material );
					sphere.position.set(0,0,-900)

					nullObj.add(sphere)

					var pAltAz = explore.PlanetAlt(p,explore.now+tOffset,obsPos)
					nullObj.rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
					planetArray.push(nullObj)
					scene.add( nullObj )
				}

				//when done, add the venusNull to the scene
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
				loader.load( texturePath, function ( image ) {

					texture.image = image;
					texture.needsUpdate = true;

				} );

				var loader = new THREE.OBJLoader( manager );
				loader.load( modelPath, function ( object ) {
					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material = new THREE.MeshLambertMaterial( {color: 0xffffff, map: texture, needsUpdate: true} );//.map = texture;
						}
					} );

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
				speed = parseFloat(document.getElementById("speedSlider").value)
				if(speed>0){
					tOffset+=speed*speed*speed
				}else{
					tOffset+=speed*speed*speed
				}
				date = explore.dateFromJday(explore.now+tOffset,-5)
				document.getElementById('#date').innerHTML = date.month+ "/"+date.day+"/"+date.year+" "+date.hour+":"+date.minute

				for(var p in planetArray){
						var pAltAz = explore.PlanetAlt(p,explore.now+tOffset,obsPos)
						planetArray[p].rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
				}
				requestAnimationFrame( animate );
				render();
			}

			function render() {
				controls.update();
				renderer.render( scene, camera );
			}

			function mouseUp(){
				document.getElementById("speedSlider").value = 0
			}
