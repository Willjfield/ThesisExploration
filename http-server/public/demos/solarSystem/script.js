// var tleLine1 = "1 25544U 98067A   16072.60311259  .00012306  00000-0  19343-3 0  9998"
// var tleLine2 = "2 25544  51.6438 179.7093 0001431 279.1916 222.9068 15.54042739989958"
// var tlObj = new xpl.tle(tleLine1,tleLine2);
var tlObj
var satellites = []
var xyz = new THREE.Vector3()

var url = '../../lib/data/ISS.json'
var xmlhttp = new XMLHttpRequest();
xmlhttp.open("GET", url, true);
xmlhttp.onreadystatechange = function() {
	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	    var tleresponse = JSON.parse(xmlhttp.responseText);
	    for(var s = 0; s<tleresponse.length;s+=3){
	    		satellites.push({
	    			id: tleresponse[s].TLE_LINE0,
	    			line1 : tleresponse[s].TLE_LINE1,
	    			line2 : tleresponse[s].TLE_LINE2
	    		})

	        }
	        //console.log(satellites[0])
	        tlObj = new xpl.tle(satellites[0].line1,satellites[0].line2)
    }
}

xmlhttp.send(null);

var dial

var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera( 65, window.innerWidth/window.innerHeight, 0.000001, 1000 );
camera.position.set(0,0,100)

var focusedPlanet = 2

var renderer = new THREE.WebGLRenderer();


renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls(camera);
				controls.enableDamping = true;
				controls.dampingFactor = 0.25;
				controls.minDistance = 0;
				controls.minPolarAngle = 0; // radians
				controls.maxPolarAngle = Infinity;

				controls.zoomSpeed = 1
				controls.rotateSpeed = 1
				controls.panSpeed = 1

var initDate = new Date()
var timeZone = parseInt(initDate.getTimezoneOffset()/60)*-1

var light = new THREE.PointLight( 0xffffff, 1.5, 0 );
light.position.set( 0, 0, 0 );
scene.add( light );

var light = new THREE.AmbientLight( 0x343434 ); // soft white light
scene.add( light );

var t = 0;
var sumT = 0
var step = 0
var drawPlanets = []
var solScale = 1;
xpl.setScale(solScale)
var planScale = 250000;

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

//SUN
var sunTexture = new THREE.Texture();
	loader.load( '../../lib/data/images/Sun.jpg', function ( image ) {
	sunTexture.image = image;
	sunTexture.needsUpdate = true;				

	var sunGeometry = new THREE.SphereGeometry(xpl.kmtoau(xpl.sol.radius)*solScale,32,32);
	var sunMaterial = new THREE.MeshLambertMaterial( { emissiveMap:sunTexture,emissive: 0xffffff, emissiveIntensity:2 } );
	var material = new THREE.MeshLambertMaterial( { map:image } );
	var sphere = new THREE.Mesh( sunGeometry, sunMaterial );
	scene.add( sphere );
})

var wireFrameMeshes=[]
function makePlanets(){
	for(var p in xpl.planets){	
			var geometry = new THREE.SphereGeometry( xpl.kmtoau(xpl.planets[p].radius)*solScale,48,48 );
			var material = new THREE.MeshLambertMaterial( { color:0xffffff ,/*wireframe: true*/} );
			var sphere = new THREE.Mesh( geometry, material );
			
			var materialW = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true, wireframeLinewidth: 1 } );
			var geometryW = new THREE.SphereGeometry( xpl.planets[p].radius/planScale,6,6);
			var sphereW = new THREE.Mesh( geometryW, materialW );
			wireFrameMeshes.push(sphereW)

			var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now);
			sphere.position.set(curPosition[0]*solScale,curPosition[2]*solScale,curPosition[1]*solScale);
			sphere.rotateX(-xpl.planets[p].oblique*Math.PI/180)
			sphere.name = xpl.planets[p].name
			drawPlanets.push(sphere);
		}
}

makePlanets()
    
var mwGeo = new THREE.SphereGeometry(900,48,48)
var mwMat = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.DoubleSide})
var mwMesh = new THREE.Mesh(mwGeo,mwMat)

loader.load("../../lib/data/images/milkywaypan_brunier.jpg",function (image){
    var texture = new THREE.Texture()
    texture.image = image
    texture.needsUpdate = true
    mwMesh.material.map = texture
    //how to get tilt of galactic plane?
    mwMesh.rotation.set(0,0,60*Math.PI/180)
    scene.add(mwMesh)
})

function addLabel(planet){
	//var size = 256;
	var canvas = document.createElement('canvas')

	canvas.className='label'
	//console.log(canvas)
	document.body.appendChild(canvas)
	var ctx = canvas.getContext('2d');
	canvas.width = 256
	canvas.height = 128
	ctx.font = '48pt Arial';
	ctx.fontWeight = 'bolder'
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle="rgba(0, 0, 200, 0)";
    ctx.fill();
	ctx.fillStyle = 'white';
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(planet.name, canvas.width / 2, canvas.height / 2);

	var stexture = new THREE.Texture(canvas);
	stexture.needsUpdate = true;

	var parentObj = new THREE.Object3D()

	var smaterial = new THREE.MeshBasicMaterial({ map: stexture, alphaMap:stexture, transparent: true});
	var sgeometry = new THREE.PlaneGeometry( .05, .025 );
	var smesh = new THREE.Mesh( sgeometry, smaterial );

	var pointer = new THREE.Geometry()
	pointer.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(0,.06,0))
	var pointerLine = new THREE.LineBasicMaterial({
		color: 0xffffff});
	var line = new THREE.Line(pointer,pointerLine );
	line.name=planet.name+"_labelLine"
	line.position.copy(planet.position)
	line.geometry.verticesNeedUpdate = true
	
	scene.add(line)
	parentObj.add(smesh)

	parentObj.name=planet.name+"_label"
	parentObj.position.copy(planet.position)
	parentObj.position.y+=.075

	scene.add( parentObj );
}

drawPlanets.forEach(function(planet, index){
	var texturePath = "../../lib/data/images/"
		texturePath += planet.name + ".jpg"
		var ptexture
		loader.load( texturePath, function (image) {
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				drawPlanets[index].material.map = ptexture
				scene.add(drawPlanets[index])
				addLabel(drawPlanets[index])
				})		
});

var moonGeo = new THREE.SphereGeometry(xpl.kmtoau(1736.482)*solScale,32,32)
var moonMat = new THREE.MeshLambertMaterial({color:0xffffff})
var moonMesh = new THREE.Mesh(moonGeo,moonMat)
var earthCenter = new THREE.Object3D()
earthCenter.position.copy(drawPlanets[2].position)
scene.add(earthCenter)


var obs = {latitude:0,longitude:0,elevation:0}
var moonPosition = xpl.MoonPos(xpl.now+t+sumT, obs)
moonMesh.position.x = xpl.kmtoau(moonPosition[9])

loader.load( "../../lib/data/images/Moon.jpg", function (image) {
				ptexture = new THREE.Texture();
				ptexture.image = image;
				ptexture.needsUpdate = true;
				moonMesh.material.map = ptexture
				moonMesh.rotateY(Math.PI)
				earthCenter.add(moonMesh)
				earthCenter.rotation.y = moonPosition[3]*(Math.PI/180)
				earthCenter.rotation.x = drawPlanets[2].rotation.x+(moonPosition[4]*(Math.PI/180))
				})	

var ISSGeo = new THREE.SphereGeometry( .000001*solScale,16,16 );
var ISSMat = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
var ISSeciMat = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
var ISS_ecf = new THREE.Mesh(ISSGeo,ISSMat);
var ISS_eci = new THREE.Mesh(ISSGeo,ISSeciMat)
	//scene.add(ISS_eci)
	//drawPlanets[2].add(ISS_ecf)

var loader = new THREE.OBJLoader( manager );
var modelPath = '../../lib/data/3D/ISS'

var mtlLoader = new THREE.MTLLoader();
mtlLoader.load( modelPath+'.mtl', function( materials ) {
	materials.preload();
	loader.load( modelPath+'.obj', function ( object ) {
		var objLoader = new THREE.OBJLoader();
		//loader.setMaterials( materials );

		object.traverse( function ( child ) {
		if ( child instanceof THREE.Mesh ) {
			//console.log(materials.materials)
			child.materials = materials.materials//new THREE.MeshLambertMaterial( {/*map: texture*/color:0x888888, needsUpdate: true, side:THREE.DoubleSide} );
			child.geometry.computeVertexNormals();
			child.castShadow = true
			child.receiveShadow = true
		}
		} );

		object.scale.set(.00001,.00001,.00001)
		// object.rotateX(-Math.PI/2)
		// object.position.y=3
		drawPlanets[2].add(object)

	});

}, onProgress, onError );



	///TEST EARTH AXES
	/*
	var testGeo = new THREE.SphereGeometry(.0002,16,16);
	var testMaty = new THREE.MeshBasicMaterial({color:0x00ff00})
	var testMeshy = new THREE.Mesh(testGeo,testMaty)
	drawPlanets[2].add(testMeshy)
	testMeshy.position.y = .005
	var testMatx = new THREE.MeshBasicMaterial({color:0xff0000})
	var testMeshx = new THREE.Mesh(testGeo,testMatx)
	drawPlanets[2].add(testMeshx)
	testMeshx.position.x = .005
	var testMatz = new THREE.MeshBasicMaterial({color:0x0000ff})
	var testMeshz = new THREE.Mesh(testGeo,testMatz)
	drawPlanets[2].add(testMeshz)
	testMeshz.position.z = .005
	*/
	///TEST EARTH AXES

camera.position.set(drawPlanets[2].position.x,drawPlanets[2].position.y,-drawPlanets[2].position.z-.0001)
controls.target = new THREE.Vector3(drawPlanets[2].position.x,drawPlanets[2].position.y,drawPlanets[2].position.z)

var planetSelector = document.getElementById("planetSelector")
var planetSelected = 3
var speed=0

var makeLabels=true

var ISSPropMat = new THREE.LineBasicMaterial({
	color: 0x00ff00});

var render = function () {

	if(typeof dial != 'undefined'){
		dial._stepsPerRevolution = parseFloat(document.getElementById('timeSelector').value)
	}

	var date = xpl.dateFromJday(xpl.now+t+sumT+(timeZone/24))

	var dmin = date.minute.toString()
	if(dmin.length<2) dmin = "0"+dmin

	var dspHour = date.hour
	dspHour.length < 2 ? dspHour = "0"+dspHour :{}
	var dtz = Math.sign(timeZone)>-1 ? "+" : {}

	var curJday = xpl.jday(date.year,date.month,date.day,date.hour,date.minute,date.sec)

	document.getElementById('curDate').innerHTML = "Date: " + date.month + "/" + date.day + "/" +date.year+
								"<br>Time: "+dspHour+":"+dmin +"(UTC "+timeZone+")";

	earthCenter.position.copy(drawPlanets[2].position)
	earthCenter.rotation.y = moonPosition[3]*(Math.PI/180)
	earthCenter.rotation.x = drawPlanets[2].rotation.x+(moonPosition[4]*(Math.PI/180))

	moonPosition = xpl.MoonPos(xpl.now+t+sumT, obs)
	moonMesh.position.x = xpl.kmtoau(moonPosition[9])
	if(focusedPlanet<9){
		controls.target = new THREE.Vector3(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z)
	}else{
		controls.target = new THREE.Vector3(0,0,0)
	}
    mwMesh.position.set(camera.position.x,camera.position.y,camera.position.z)
    controls.update()
	xpl.updateTime()

	if(typeof tlObj!='undefined'){
		tlObj.update(t+sumT);
		xyz = tlObj.position_ecf;

		var ISSPropGeo = new THREE.Geometry();
		ISSPropGeo.verticesNeedUpdate = true
		var ISSPropLine = new THREE.Line(ISSPropGeo,ISSPropMat );
		ISSPropLine.geometry.verticesNeedUpdate = true
		//var curObj = clone(tlObj)
		var curObj = new xpl.tle(satellites[0].line1,satellites[0].line2)
		//console.log(curObj)
		for(var propT = 0;propT<0.0625;propT+=.0025){
			curObj.update(t+sumT+propT)
			curxyz = curObj.position_ecf
			var curPosition = [xpl.kmtoau(curxyz.x)*solScale,xpl.kmtoau(curxyz.z)*solScale,xpl.kmtoau(-curxyz.y)*solScale]
			ISSPropGeo.vertices.push(
				new THREE.Vector3( curPosition[0], curPosition[1], curPosition[2] )
			);
		}
		drawPlanets[2].add(ISSPropLine)
	}
    
	var ISSPosition = [xpl.kmtoau(xyz.x)*solScale,xpl.kmtoau(xyz.z)*solScale,xpl.kmtoau(-xyz.y)*solScale]
	if(drawPlanets[2].children.length>0){
		drawPlanets[2].children[0].position.set(ISSPosition[0],ISSPosition[1],ISSPosition[2]);
	}


	// var iss_helio = xpl.ecf_to_heliocentric(ISS_ecf.position,xpl.now+t)
	// ISS_eci.position.set(iss_helio.x,iss_helio.z,iss_helio.y)

   /* ECI Conversion is slightly off. Probably has something to do with barycenter vs center 
   	xyz_eci = tlObj.position_eci;
    var ISSeciPos = new THREE.Vector3(xpl.kmtoau(xyz_eci.x)*solScale,xpl.kmtoau(xyz_eci.z)*solScale,xpl.kmtoau(-xyz_eci.y)*solScale)
    ISSeciPos.applyAxisAngle(new THREE.Vector3(0,1,0),(-0.03926991))
    ISSeciPos.applyAxisAngle(new THREE.Vector3(1,0,0),(xpl.curEarthOblique(xpl.now+t)*Math.PI/180)-.045)
    
    ISSeciPos.add(drawPlanets[2].position)
    ISS_eci.position.copy(ISSeciPos)
    */
    
	requestAnimationFrame( render );
	
   	for(var p in drawPlanets){
   		//changeCanvas(drawPlanets[p].name)
		var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+t+sumT);
		//launch of voyager 1
        //var curPosition = xpl.SolarSystem(xpl.planets[p],2443391.500000+t);
		var curRotation = xpl.planets[p].rotationAt(xpl.now+t+sumT)
		var oblique = 0
		drawPlanets[p].rotation.y = curRotation
		drawPlanets[p].position.set(curPosition[0]*solScale,curPosition[2]*solScale,-curPosition[1]*solScale)

		for(var child in scene.children){
			if(scene.children[child].name==drawPlanets[p].name+"_labelLine"){
				scene.children[child].position.copy(drawPlanets[p].position)
				//console.log(scene.children[child].position)
				//scene.children[child].position.z*=-1
			}
			if(scene.children[child].name==drawPlanets[p].name+"_label"){
				scene.children[child].lookAt(camera.position)
				var labelScale = scene.children[child].position.distanceTo(camera.position)*2
				scene.children[child].scale.set(labelScale,labelScale,labelScale)
				scene.children[child].position.copy(drawPlanets[p].position)
				scene.children[child].position.y+=.075
			}
		}
	}

	if(document.getElementById("moveWithPlanet").checked){
		var dist
		focusedPlanet>3 ? dist = .002 : dist = .0001
		document.getElementById("movewcam").style.color = "white"
		if(focusedPlanet!=9){
			if(camera.position.distanceTo(drawPlanets[focusedPlanet].position)>dist){
				document.getElementById("movewcam").style.color = "#ff0000"
				controls.dollyIn(1.1)
			}
		}else{
			dist = .01
			if(camera.position.distanceTo(new THREE.Vector3())>dist){
				document.getElementById("movewcam").style.color = "#ff0000"
				controls.dollyIn(1.1)
			}
		}

		// camera.position.copy(drawPlanets[focusedPlanet].position)

	}
	renderer.render(scene, camera);
	drawPlanets[2].remove(ISSPropLine)
	// for(var p in wireFrameMeshes){
	// 	scene.remove(scene.add(wireFrameMeshes[p]))
	// }
};

var voyager1Positions = []
xpl.probePositions('voyager1',voyager1Positions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in voyager1Positions){
		probeGeometry.vertices.push(
			new THREE.Vector3( voyager1Positions[v].x, voyager1Positions[v].y, -voyager1Positions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0x00ff00});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
},"../../lib/data/probes/")

var voyager2Positions = []
xpl.probePositions('voyager2',voyager2Positions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in voyager2Positions){
		probeGeometry.vertices.push(
			new THREE.Vector3( voyager2Positions[v].x, voyager2Positions[v].y, -voyager2Positions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0xffff00});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
},"../../lib/data/probes/")

var dawnPositions = []
xpl.probePositions('dawn',dawnPositions,function(){
	var probeGeometry = new THREE.Geometry();
		probeGeometry.verticesNeedUpdate = true
	for(var v in dawnPositions){
		probeGeometry.vertices.push(
			new THREE.Vector3( dawnPositions[v].x, dawnPositions[v].y, -dawnPositions[v].z )
		);
	}
	var probeMaterial = new THREE.LineBasicMaterial({
		color: 0xff0000});
	var line = new THREE.Line(probeGeometry,probeMaterial );
	line.geometry.verticesNeedUpdate = true
	scene.add(line)
},"../../lib/data/probes/")

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

document.getElementById("planetSelector").addEventListener("change",function(event){
	planetSelected=parseInt(planetSelector.options[planetSelector.selectedIndex].value)
	focusedPlanet = planetSelected
	// var dist
	// focusedPlanet>3 ? dist = .001 : dist = .0001
	// camera.position.set(drawPlanets[focusedPlanet].position.x,drawPlanets[focusedPlanet].position.y,drawPlanets[focusedPlanet].position.z-dist)
	document.getElementById("moveWithPlanet").checked = true
})

document.getElementById('timeSelector').addEventListener("change", function() {
    sumT+=t
    t = 0
    dial.set('value',0)
});

var logValue = function(e){
        t = (e.newVal/14400)
}

YUI().use('dial', function(Y) {
    	dial = new Y.Dial({
	        min:-100000000000,
	        max:100000000000,
	        stepsPerRevolution:5256000,
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
			t = 0
			dial.set('value',0)
		}, false)
});





render();
