			//http://www.ancient-astronomy.org/webapplications/gordon/SundialNavigatorProject/CurrentVersion/index.html
			//var obsPos = {latitude:42.85,longitude:13.583333, elevation: .154}
			var obsPos = {latitude:0,longitude:180, elevation: 0}
			var modelPath = 'models/Sundials/Ascoli/ObjID574_r0.obj'
			var texturePath = 'models/Sundials/Ascoli/ss_tex.jpg'
			var timeZone = 1

			var groundTexPath = 'models/Sundials/Ascoli/groundtext.jpg'
			var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var controls;

			var speed, tOffset, date

			var planetArray = []

			//debug slider
			var zGnomon = 0
			var yGnomon = 0

			init();
			animate();

			function init() {
				speed = 0
				tOffset = 0
				document.getElementById("speedSlider").min = -1
				document.getElementById("speedSlider").max = 1
				document.getElementById("speedSlider").step = .0001


				container = document.createElement( 'div' );
				document.body.appendChild( container );
				// scene

				scene = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set(0,0,0);

				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0x111116, 1);
				renderer.shadowMap.enabled = true;
				//renderer.shadowMapType = THREE.PCFSoftShadowMap;
				//renderer.shadowMapSoft = true;

				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				controls = new THREE.OrbitControls(camera, renderer.domElement);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Math.PI*2

				 var ambient = new THREE.AmbientLight( 0x292939 );
				 scene.add( ambient );

				var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
 			 	directionalLight.position.set( 0, 0, -500 );
				directionalLight.castShadow	= true

				directionalLight.shadowCameraRight     =  10;
				directionalLight.shadowCameraLeft     = -10;
				directionalLight.shadowCameraTop      =  10;
				directionalLight.shadowCameraBottom   = -10;
				directionalLight.shadowCameraNear   = 1;
				directionalLight.shadowCameraFar   = 800;
				directionalLight.shadowCameraVisible = true

				directionalLight.shadowDarkness = .1;
				directionalLight.shadowMapWidth = 1024;
				directionalLight.shadowMapHeight = 1024;

			var loader = new THREE.ImageLoader( manager );
			loader.load(groundTexPath, function(image){
						var groundTex = new THREE.Texture();
						groundTex.image = image
						groundTex.needsUpdate = true;
						//groundTex.wrapS = groundTex.wrapT = THREE.RepeatWrapping;
						//groundTex.repeat.set( 10, 10 );
						var groundGeo = new THREE.BoxGeometry(25,.5,25)
						var groundMat = new THREE.MeshLambertMaterial({map: groundTex, /*color:0x307030,*/ side:THREE.DoubleSide})
						var groundMesh = new THREE.Mesh(groundGeo,groundMat)
						groundMesh.castShadow = true
						groundMesh.receiveShadow = true
						scene.add(groundMesh)
				})


				var gnomonGeo = new THREE.CylinderGeometry( .05, .05, 1.5, 16 );
				var gnomonMat = new THREE.MeshBasicMaterial( {color: 0x111111} );
				gnomonMesh = new THREE.Mesh( gnomonGeo, gnomonMat );
				gnomonMesh.rotation.set(Math.PI/2,0,0)
				gnomonMesh.position.set(0,4.85,-.55+zGnomon)
				gnomonMesh.castShadow = true
				scene.add( gnomonMesh );

				for(var p in explore.planets){
					if(p<6){
					var nullObj = new THREE.Object3D();
					if(p!=2){
						var geometry = new THREE.SphereGeometry( 10,8,8 );
						var material = new THREE.MeshBasicMaterial( { color: explore.planets[p].texColor } );
					}else{
						var geometry = new THREE.SphereGeometry( 15,8,8 );
						var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
					}
					var sphere = new THREE.Mesh( geometry, material );
					sphere.position.set(0,0,-900)

					nullObj.add(sphere)
					p==2 ? nullObj.add( directionalLight ) : {}

					var pAltAz = explore.PlanetAlt(p,explore.now+tOffset,obsPos)
					nullObj.rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')
					planetArray.push(nullObj)
					scene.add( nullObj )
				}
				}

				//when done, add the venusNull to the scene
				// texture

				var manager = new THREE.LoadingManager();
				manager.onProgress = function ( item, loaded, total ) {
					document.getElementById("loading").remove()
					console.log( item, loaded, total );
				};

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						console.log( Math.round(percentComplete, 2) + '% downloaded' );
					}
				};

				var onError = function ( xhr ) {
				};



				/*For image texture
				var texture = new THREE.Texture();
				loader.load( texturePath, function ( image ) {
					texture.image = image;
					texture.needsUpdate = true;
					texture.receiveShadow = true;
					texture.castShadow = true;
				} );
				*/
				var loader = new THREE.OBJLoader( manager );
				loader.load( modelPath, function ( object ) {
					object.traverse( function ( child ) {
						if ( child instanceof THREE.Mesh ) {
							child.material = new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
							child.geometry.computeVertexNormals();

							child.castShadow = true
							child.receiveShadow = true
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
				console.log(speed)
				if(Math.abs(speed) < .2){
					speed *= .01
				}
				if(Math.abs(speed)>.2 && Math.abs(speed)<.5) {
					speed *= .1 
				}else{
					if(Math.abs(speed)>.7 && Math.abs(speed)<.9){
					speed *= 1.1
				}else{
					if(Math.abs(speed)>.9 && Math.abs(speed)<.99){
					speed *= 10
				}else{
					if(Math.abs(speed)==1){
						speed *= 200
					}
				}
				}
				}

				
				console.log("new "+speed)


				tOffset+=speed
				date = explore.dateFromJday(explore.now+tOffset,timeZone)
				var dmin = date.minute.toString()
				if(dmin.length<2) dmin = "0"+dmin

				document.getElementById('date').innerHTML = "Date: " + date.month+ "/"+date.day+"/"+date.year+
																										"<br> Time: "+date.hour+":"+dmin;
				document.getElementById('latlong').innerHTML ="Latitude: "+obsPos.latitude+
																										"<br> Longitude: "+obsPos.longitude+
																										"<br> Elevation(m): "+obsPos.elevation*1000

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

			function gzMouseDown(){
				zGnomon = parseFloat(document.getElementById("zGnomon").value)
				gnomonMesh.position.z = -.55+zGnomon
				console.log(gnomonMesh.position)
			}

			function gyMouseDown(){
				yGnomon = parseFloat(document.getElementById("yGnomon").value)
				gnomonMesh.position.y = 4.85-yGnomon
				console.log(gnomonMesh.position)
			}

			//FOR PLACING GNOMON
			// document.getElementById("zGnomon").min = -2
			// document.getElementById("zGnomon").max = 2
			// document.getElementById("zGnomon").step = .0001
			//
			// document.getElementById("yGnomon").min = -2
			// document.getElementById("yGnomon").max = 2
			// document.getElementById("yGnomon").step = .0001
