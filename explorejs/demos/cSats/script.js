var obs={}
var container, stats;
var camera, scene, controls, renderer, objects;
var pointLight;
var roty;	
var sphere,earth, skybox;
var earthMaterial;
var materialP,particles, particleCount, geoP, geoC, particlesP, particlesC;

var meshObs

var particleTrail = [];
var particleHeadArr = [];
var collisionArr = [];

var particleHead;

var lightDir= new THREE.Vector3(-1.0,0.0,-0.3);

var tlObj
var tle_data = []
var xyz = new THREE.Vector3()
var satellites = []

var timeOffset = 0
var sumT = 0
var earthAxis = new THREE.Vector3(0,1,0)

var viewLine
var myThreePosition
var linesArray = []
var viewGeometry, viewMaterial

var tourStage = 0
var tourPositions = [{ x: 0, y: 0 },{ x: 100, y: 100 },{ x: -100, y: 100 }];
var tourDollies = []
var tourRotations = []

var tweenStart = new TWEEN.Tween(tourPositions[0])
    .to(tourPositions[1], 5000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)
    

var tweenEnd = new TWEEN.Tween(tourPositions[1])
    .to(tourPositions[2], 5000)
    .easing(TWEEN.Easing.Sinusoidal.InOut)

tweenStart.chain(tweenEnd)

xpl.getTLE('classified', satellites, function(){
    
    for(var sat in satellites){
       tle_data.push(new xpl.tle(satellites[sat].line1,satellites[sat].line2))
       tle_data[sat].update()
    }

    navigator.geolocation.getCurrentPosition(function(location){
        obs.latitude = location.coords.latitude
        obs.longitude = location.coords.longitude
        obs.height = 0
        init()
        animate()
    }) 
})

function map (val, in_min, in_max, out_min, out_max) {
  return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function init() {
                      
        roty = 0;

        container = document.createElement('div');
        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight,.01, 6000 );
        camera.position.set( 0, 0, 1500 );

        controls = new THREE.OrbitControls( camera );
                                controls.damping = 0.2;
                                controls.minDistance = 0;
                                controls.maxDistance = 2700;
                                controls.minPolarAngle = 0; // radians
                                controls.maxPolarAngle = Infinity;
                                controls.addEventListener( 'change',render);
			

        scene = new THREE.Scene();

        // Grid
        var size = 500, step = 100;

       //Background
        var geometryBG = new THREE.SphereGeometry( 5000, 48, 48 );
        var materialBG = new THREE.MeshLambertMaterial( {  map: THREE.ImageUtils.loadTexture( '../../lib/data/images/milkywaypan_brunier.jpg' ), color: 0xffffff, emmisive: 0xffffff} );

        skybox = new THREE.Mesh( geometryBG, materialBG);
        skybox.material.side = THREE.DoubleSide;
        skybox.rotateX(60*(Math.PI/180))
        scene.add( skybox );

        //Earth
        var earthGeo = new THREE.SphereGeometry(100,48,48);

        earthMaterial = new THREE.ShaderMaterial( {
            uniforms: {
                time: { type: "f", value: 1.0 },
        		resolution: { type: "v2", value: new THREE.Vector2() },
        		texOffset: {type: "f", value: 0.2},
        		sunDirection: { type: "v3", value: lightDir},
                dayTexture: { type: "t", value: new THREE.ImageUtils.loadTexture( "textures/bluemarble_map_4096_comp.jpg" ) },
                nightTexture: { type: "t", value: new THREE.ImageUtils.loadTexture( "textures/Earth_night_4096_comp.jpg" ) },
        		normalTexture: { type: "t", value: new THREE.ImageUtils.loadTexture( "textures/earthbump_4096_comp.jpg") },
        		cloudTexture: { type: "t", value: new THREE.ImageUtils.loadTexture("textures/earth_clouds_comp.jpg")}
            },
            attributes: {
                vertexOpacity: { type: 'f', value: [] }
            },
            vertexShader: document.getElementById( 'vertexShader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentShader' ).textContent
	   
        } );
        earthMaterial.uniforms.cloudTexture.value.wrapS = THREE.RepeatWrapping;

        earth = new THREE.Mesh(earthGeo,earthMaterial);
        
        scene.add(earth);
        lightDir.applyAxisAngle(earthAxis,(Math.PI)-xpl.planets[2].rotationAt(xpl.now+timeOffset)+.2)
        earth.rotateZ((xpl.curEarthOblique(xpl.now+timeOffset+sumT))*Math.PI/180)
        // Lights
        scene.add( new THREE.AmbientLight( 1 * 0x202020 ) );

        pointLight = new THREE.PointLight( 0xffffff, .2 );
        scene.add( pointLight );
        var my_geodetic = new xpl.createGeodetic(obs.longitude,obs.latitude, obs.height);
        var myposition = xpl.satellite.geodetic_to_ecf(my_geodetic)
        myThreePosition = new THREE.Vector3(myposition.x*.0156,myposition.z*.0156,myposition.y*-.0156)
        var rotateGeo = (xpl.curEarthOblique(xpl.now+timeOffset+sumT))*Math.PI/180
        myThreePosition.applyAxisAngle( new THREE.Vector3(0,0,1),rotateGeo)
        
        var geometryObs= new THREE.SphereGeometry( 1, 48, 48 );
        var materialObs = new THREE.MeshBasicMaterial( {  color: 0xff0000} );

        meshObs = new THREE.Mesh( geometryObs, materialObs);
        meshObs.position.set(myThreePosition.x,myThreePosition.y,myThreePosition.z)
        scene.add( meshObs );

        renderer = new THREE.WebGLRenderer({ antialias: true, autoClear: true });
        renderer.setSize( window.innerWidth, window.innerHeight );
        container.appendChild( renderer.domElement );

        createSats()

        tweenStart.onUpdate(function() {
         camera.position.x = this.x
        })
        tweenEnd.onUpdate(function() {
         camera.position.x = this.x
        })
        //tweenStart.start()
        camera.position.set( 0, 0, 1500 );
        window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadImage( path ) {
    var image = document.createElement( 'img' );
    var texture = new THREE.Texture( image, THREE.UVMapping )
    image.onload = function () { texture.needsUpdate = true; };
    image.src = path;
    return texture;
}

function animate(time) {
    tour()
    xpl.batchTLEUpdate(tle_data, timeOffset+sumT)

    skybox.rotation.z = ((xpl.now+timeOffset+sumT)%1)*2*Math.PI
    var date = xpl.dateFromJday(xpl.now+timeOffset+sumT)
    var minute = date.minute
    date.minute<10 ? minute = '0'+date.minute.toString() : {}
    document.getElementById('curDate').innerHTML=date.day+'/'+date.month+'/'+date.year+'<br>'+date.hour+':'+minute + " UTC"

    if(typeof dial != 'undefined'){
        dial._stepsPerRevolution = parseFloat(document.getElementById('timeSelector').value)
    }
    // setTimeout(function() {
        var lightDir= new THREE.Vector3(-1.0,0.0,-0.3);
        lightDir.applyAxisAngle(earthAxis,(Math.PI)-xpl.planets[2].rotationAt(xpl.now+timeOffset+sumT)+.2)
        requestAnimationFrame( animate );
        TWEEN.update(time);
        xpl.batchTLEUpdate(tle_data, timeOffset+sumT)
	   earthMaterial.uniforms.sunDirection.value = lightDir 
     	earthMaterial.uniforms.texOffset.value = (timeOffset+sumT)/-10;	
        for(var sat in tle_data){
            var lookAngles = tle_data[sat].getLookAnglesFrom(obs.longitude,obs.latitude,0)
            if(lookAngles.elevation>15){
                tle_data[sat].visible = true
            }else{
                tle_data[sat].visible = false
            }
            //lookAngles.name = satellites[sat].id.replace(/[0-9]/g, '')
            //visibileSatsLookAngles.push(lookAngles)
        }
	createSats();
    //}, 1000/30);

	controls.update();

    render();
    
   if(particleHeadArr.length>0){
   	scene.remove(particleHeadArr[0]);
	particleHeadArr.shift();	
   }
    
    if(particleTrail.length>500){
    	scene.remove(particleTrail[0]);
	   particleTrail.shift();
    }

    if(collisionArr.length>20){
    	scene.remove(collisionArr[0]);
	collisionArr.shift();
    }
    scene.remove( viewLine );

    TWEEN.update()
}

function render() { 
    var timer = Date.now() * 0.0001;
    if(typeof pointLight != 'undefined'){
        pointLight.position.x = 0;
        pointLight.position.y = 0;
        pointLight.position.z = -100;
    }
    skybox.position.copy(camera.position)
    renderer.render( scene, camera );
}

function createSats(){ 

                geoP= new THREE.Geometry({ verticesNeedUpdate: true});
                geoC= new THREE.Geometry({ verticesNeedUpdate: true});
                var viewGeometry = new THREE.Geometry({ verticesNeedUpdate: true});

                for ( i = 0; i < tle_data.length; i ++ ) {

                                                var vertex = new THREE.Vector3();

                                                vertex.x = tle_data[i].position_ecf.x*.0156;
                                                vertex.y = tle_data[i].position_ecf.z*.0156;
                                                vertex.z = tle_data[i].position_ecf.y*-.0156;

                                                geoP.vertices.push( vertex );

                                                if(tle_data[i].visible){
                                                        viewGeometry.vertices.push(
                                                            new THREE.Vector3(myThreePosition.x,myThreePosition.y,myThreePosition.z),
                                                            new THREE.Vector3(vertex.x,vertex.y,vertex.z)
                                                        )
                                                }
                }

	                   materialP = new THREE.PointCloudMaterial( { size: 3, sizeAttenuation: false, transparent: true, alpha: .5 } );
                        materialP.color.setHSL( 1.0, 0.0, 1 );
				
                        materialT = new THREE.PointCloudMaterial( { size: 1, sizeAttenuation: false, transparent: true, alpha: .5 } );
                       materialT.color.setHSL(.6,1,.6); 	

                        particleHead = new THREE.PointCloud( geoP, materialP );
                        particleHead.sortParticles = true;
			
			trailSection = new THREE.PointCloud(geoP,materialT);
			trailSection.sortParticles = true;		
			particleTrail.push(trailSection);
			for(p in particleTrail){
				scene.add(particleTrail[p])
			}
			
			particleHeadArr.push(particleHead)
			for(p in particleHeadArr){
				scene.add(particleHeadArr[p])
			}

            viewMaterial = new THREE.LineBasicMaterial({
            color: 0x00aa00
             });

            viewLine = new THREE.Line( viewGeometry, viewMaterial );
            if(viewGeometry.vertices.length>0 && tourStage>0){
                scene.add( viewLine );
            }
            
}

function tour(){
    switch(tourStage){
        case 0:
            controls.rotateLeft(.01)
        break
        case 1:
            if(Math.abs(controls.getAzimuthalAngle()-((obs.longitude+90-(xpl.curEarthOblique(xpl.now+timeOffset+sumT)))*xpl.DEG2RAD))>.1){
                controls.rotateLeft(.1)
            }
            if(Math.abs(controls.getPolarAngle()-(obs.latitude*xpl.DEG2RAD))>.1){
                controls.rotateUp(.1)
            }
            controls.target = myThreePosition
        break
        case 2:

        break
    }
}
var dial
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


