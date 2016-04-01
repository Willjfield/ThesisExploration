			//Precession means it doesn't work forever. It goes off.
			var obsPos = {latitude:41.895556,longitude:12.496667, elevation: .038} //rome
			//var obsPos = {latitude:40.6928,longitude:-73.9903, elevation: 0}//brooklyn
			var modelPath = 'models/Sundials/Ascoli/ObjID73_r2.obj'
			var texturePath = 'models/Sundials/Ascoli/ss_tex.jpg'
			var timeZone = 1

			var groundTexPath = 'models/Sundials/Ascoli/groundtext.jpg'
			var container;

			var camera, scene, renderer;

			var mouseX = 0, mouseY = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var controls;

			var speed, timeOffset, date, sumT
			var dial
			var planetArray = []

			init();
			animate();

			function init() {
				speed = 0
				timeOffset = 0
				sumT = 0

				var date = xpl.dateFromJday(xpl.now,timeZone)

				container = document.createElement( 'div' );
				document.body.appendChild( container );
				// scene

				scene = new THREE.Scene();
				camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
				camera.position.set(0,0,0);

				renderer = new THREE.WebGLRenderer({ alpha: true });
				renderer.setClearColor( 0x000000, 0 );
				renderer.shadowMap.enabled = true;

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

				directionalLight.shadowCameraRight     =  5;
				directionalLight.shadowCameraLeft     = -5;
				directionalLight.shadowCameraTop      =  5;
				directionalLight.shadowCameraBottom   = -5;
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
						var groundGeo = new THREE.BoxGeometry(25,.5,25)
						var groundMat = new THREE.MeshLambertMaterial({map: groundTex, /*color:0x307030,*/ side:THREE.DoubleSide})
						var groundMesh = new THREE.Mesh(groundGeo,groundMat)
						groundMesh.castShadow = true
						groundMesh.receiveShadow = true
						scene.add(groundMesh)
				})


				var gnomonGeo = new THREE.CylinderGeometry( .025, .025, 3, 16 );
				var gnomonMat = new THREE.MeshBasicMaterial( {color: 0x111111} );
				gnomonMesh = new THREE.Mesh( gnomonGeo, gnomonMat );
				gnomonMesh.rotateX(Math.PI/2)
				gnomonMesh.position.set(0,3.04,-1.48) 
				gnomonMesh.castShadow = true
				scene.add( gnomonMesh );

				for(var p in xpl.planets){
					if(p<6){
					var nullObj = new THREE.Object3D();
					if(p!=2){
						var geometry = new THREE.SphereGeometry( 5,8,8 );
						var material = new THREE.MeshBasicMaterial( { color: xpl.planets[p].texColor } );
					}else{
						var geometry = new THREE.SphereGeometry( 25,8,8 );
						var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
					}
					var sphere = new THREE.Mesh( geometry, material );
					sphere.position.set(0,0,-900)

					nullObj.add(sphere)
					p==2 ? nullObj.add( directionalLight ) : {}

					var pAltAz = xpl.PlanetAlt(p,xpl.now+timeOffset+sumT,obsPos)
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
					document.getElementById("loadAmount").remove()
					console.log( item, loaded, total );
				};

				var onProgress = function ( xhr ) {
					if ( xhr.lengthComputable ) {
						var percentComplete = xhr.loaded / xhr.total * 100;
						document.getElementById("loadAmount").innerHTML = (Math.round(percentComplete, 2) + '%')
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
					object.rotateX(-Math.PI/2)
					object.position.y=3

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
				xpl.updateTime()


				if(typeof dial != 'undefined'){
					dial._stepsPerRevolution = parseFloat(document.getElementById('timeSelector').value)
				}

				//DISPLAY DATE vs CALC DATE
				var date = xpl.dateFromJday(xpl.now+timeOffset+sumT)
				
				var dDay = date.day.toString()
				dDay.length<2 ? dDay = "0"+dDay : {}

				var dMo= date.month.toString()
				dMo.length<2 ? dMo = "0"+dMo : {}

				var dmin = date.minute.toString()
				if(dmin.length<2) dmin = "0"+dmin
				
				var dhour = date.hour//.toString()
				// dhour.length < 2 ? dhour = "0"+dhour :{}
				var dspHour = (dhour+timeZone)
				if(dspHour>23){dspHour=0}
				if(dspHour<0){dspHour=24+dspHour}

				var dtz = Math.sign(timeZone)>-1 ? "+" : {}

				var curJday = xpl.jday(date.year,date.month,date.day,date.hour,date.minute,date.sec)

				document.getElementById('date').innerHTML = "Date: " + dMo + "/" + dDay + "/" +date.year+ " (at meridian)"+
															"<br>Time: "+dspHour+":"+dmin +"(UTC"+dtz+timeZone+")";
				document.getElementById('latlong').innerHTML ="Latitude: "+obsPos.latitude+
																							"<br> Longitude: "+obsPos.longitude+
																							"<br> Elevation(m): "+obsPos.elevation*1000+
																							"<br>Sundial from Villa Palombara Massimi, Rome"

				for(var p =0;p<planetArray.length;p++){
						var pAltAz = xpl.PlanetAlt(p,xpl.now+timeOffset+sumT,obsPos)
						planetArray[p].rotation.set(pAltAz[0]*(Math.PI/180),-pAltAz[1]*(Math.PI/180),0,'YXZ')

				}
				var sunAlt = xpl.PlanetAlt(2,xpl.now+timeOffset+sumT,obsPos)[0]
				console.log(sunAlt)
				if(sunAlt>0){
					document.body.style.backgroundColor ='rgb(255,255,255)'
					var dayColor = 'rgb('+parseInt(sunAlt*3)+','+parseInt(sunAlt*4)+','+parseInt(sunAlt*5)+')'
					console.log(dayColor)
					document.body.style.backgroundColor = dayColor
				}else{
					document.body.style.backgroundColor ='#000010'
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

			document.getElementById('timeSelector').addEventListener("change", function() {
			    sumT+=timeOffset
			    timeOffset = 0
			    dial.set('value',0)
			});

			var logValue = function(e){
			        timeOffset = (e.newVal/14400)
			}

			YUI().use('dial', function(Y) {
			        dial = new Y.Dial({
			            min:-100000000000,
			            max:100000000000,
			            stepsPerRevolution:10,
			            value: 0,
			            strings:{label:'',resetStr: 'Reset'},
			            after : {
			               valueChange: Y.bind(logValue, dial)
			            }
			        });
			    dial.render("#demo");
			    var labels = document.getElementsByClassName('yui3-dial-label')
			    labels[0].style.visibility='hidden'
			    var resetButton = document.getElementsByClassName('yui3-dial-center-button')
			    resetButton[0].addEventListener('click',function(){
			            sumT = 0
			            timeOffset = 0
			            dial.set('value',0)
			        }, false)
			});