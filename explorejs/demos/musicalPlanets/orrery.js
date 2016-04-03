var planets=[]
var allPlanets = []
var spaceBackground
var zoom
var sun
var centerX, centerY
var initX = 0
var initY = 0
var speed = 0
var tOffset = 0
var date
var trailLength = 300
var selectedPlanets = []
var planetTextures

var tutStage = 0

function preload(){
	var thisYear = xpl.dateFromJday(xpl.now,-5).year
	
	// document.getElementById("speedSlider").min = -5
	// document.getElementById("speedSlider").max = 5
	// document.getElementById("speedSlider").step = .01
	document.getElementById("defaultCanvas0").style.position = 'absolute'

	var mercuryTex = loadImage("img/mercury.png");
	var venusTex = loadImage("img/venus.png");
	var earthTex = loadImage("img/earth.png");
	var marsTex = loadImage("img/mars.png");
	var jupiterTex = loadImage("img/jupiter.png");
	var saturnTex = loadImage("img/saturn.png");
	var uranusTex = loadImage("img/uranus.png");
	var neptuneTex = loadImage("img/neptune.png");

	planetTextures = 	[mercuryTex,venusTex,earthTex,marsTex,
						jupiterTex,saturnTex,uranusTex,neptuneTex]

	spaceBackground = loadImage("img/galaxy.png")
}

function setup(){
	createCanvas(windowWidth, windowHeight)
	imageMode(CENTER)
	zoom = 1
	stroke(255,100)
	noFill()
	centerX = width/2
	centerY = height/2
	for(var p=0;p<xpl.planets.length;p++){
		allPlanets.push(new drawPlanet(xpl.planets[p]))
	}
	manageTutorial()
}

function draw(){
	
	imageMode(CORNER)
	image(spaceBackground,0,0,width,height)
	imageMode(CENTER)
	ellipse(centerX,centerY,10*zoom,10*zoom)
	
	for(var p in allPlanets){
		allPlanets[p].update()
	}

	for(var p in allPlanets){
		for(var c in allPlanets[p].connections){
			allPlanets[p].connections[c].draw()
		}
	}

	for(var p in allPlanets){
		allPlanets[p].drawBody()
	}

	manageSlider()
}
var close
var createDiv = true
function manageTutorial(){
	var tutDiv = document.getElementById("tutorial")

	switch(tutStage){
		case 0:
			tutDiv.innerHTML = "Welcome! To begin, make sure your sound is on.<br><br>Now click on any planet."
		break;

		case 1:
			tutDiv.innerHTML = "Great! Now, click on any other planet to connect the two together."
		break;

		case 2:
			tutDiv.innerHTML = "The pitch of the tone you hear is determined by how far apart the planets are from each other."+
			"<br><br>Click on the <font color='green'>green</font> arrows at the bottom to fast forward time."+
			"<br><br>Click on the <font color='red'>red</font> arrows at the bottom to rewind time."+
			"<br><br>Click on the play button to play real-time."
		break;

		case 3:
		
		if(createDiv){
			tutDiv.innerHTML = "Listen to how the tones change as the planets revolve around the Sun."+
								"<br><br>You can shift-click on a planet to disconnect all of its connections."+
								"<br><br>"

			close = document.createElement('div')
			close.id = 'close'
			close.appendChild(document.createTextNode('close'))

			tutDiv.appendChild(close)

			close.addEventListener("click",closeDiv)
			createDiv = false
		}
			// tutDiv.appendChild(node);
			
		break;
	}
}

function closeDiv(){
	tutStage = 4
	console.log("hide")
	document.getElementById('tutorial').remove()
}

function manageSlider(){
	// speed = parseFloat(document.getElementById("speedSlider").value)
	var dir = speed > 0
	dir *= 2
	dir -= 1
	//min hr day month year decade century
	switch(Math.abs(speed)){
		case 0:
			step = 0
			document.getElementById("timescale").innerHTML = 'Second'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 1:
			step = 0.00001157407 * dir// 1 min/sec
			document.getElementById("timescale").innerHTML = 'Minute'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 2:
			step = 0.00069166666 * dir// 1 hr/sec
			document.getElementById("timescale").innerHTML = 'Hour'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 3:
			step = 0.0166 * dir// 1 day/sec
			document.getElementById("timescale").innerHTML = 'Day'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 4:
		 	step = 0.498 * dir// 1 month/sec
		 	document.getElementById("timescale").innerHTML = 'Month'
		 	speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 5:
			step = 5.976 * dir// 1 yr/sec
			document.getElementById("timescale").innerHTML = 'Year'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
	}
	tOffset+=step
	date = xpl.dateFromJday(xpl.now+tOffset,-5)

	noStroke()
	fill(255)
	textSize(30)
	textAlign(CENTER)
	text(date.month + "/",50,height-50)
	text(date.day + "/",90,height-50)
	text(date.year,150,height-50)
}

var drawPlanet = function(planet){
	this.data = planet
	this.texture = planetTextures[this.data.num]
	this.ssScale = 25
	this.position = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset)
	
	for(var coord in this.position){
		this.position[coord]*=this.ssScale
	}

	this.position[1]*=.5
	this.connections = []
	this.strokeColor = color(255,255,255,100)
	this.isSelected = false
	this.worldPosition=[centerX-(this.position[0]*zoom),centerY+(this.position[1]*zoom)]
}

drawPlanet.prototype.update = function(){
	this.position = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset)
	
	for(var coord in this.position){
		this.position[coord]*=this.ssScale
	}

	this.position[1]*=.5
	this.worldPosition=[centerX-(this.position[0]*zoom),centerY+(this.position[1]*zoom)]
}

drawPlanet.prototype.drawLabel = function(){
	if(abs(mouseX-(width/2)+(this.position[0]*zoom))<15){
		if(abs(mouseY-(height/2)-(this.position[1]*zoom))<15){
			push()
				translate(centerX,centerY)
				scale(zoom)
				translate(-this.position[0],this.position[1])
				translate((1/zoom)*this.data.radius*.001,0)
				fill(255)
				stroke(0)
				textSize(20)
				push()
					scale(1/zoom)
					text(this.data.name,0,0)
				pop()
			pop()
		}
	}
}

drawPlanet.prototype.drawBody = function(){
	push()
		translate(centerX,centerY)
		scale(zoom)
		push()		
			var curPosition = this.position
			var distanceSq = ((curPosition[0])*(curPosition[0]))+((curPosition[1])*(curPosition[1]))
			strokeWeight(1/zoom)
			stroke(255,100)
			var trailStep = (this.data.yearLength/100)

			for(var trail = 0;trail<this.data.yearLength;trail+=trailStep){
				var t1 = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset-trail)
				var t2 = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset-trail-trailStep)
				line(-t1[0]*this.ssScale,(t1[1]*this.ssScale)*.5,-t2[0]*this.ssScale,t2[1]*this.ssScale*.5)
			}

			translate(-curPosition[0],curPosition[1])

			push()
				scale(this.data.radius*.000001)
				fill(255)
				strokeWeight(.5)
				stroke(this.strokeColor)
				ellipseMode(CENTER)

				if(this.isSelected){
					tint(0,255,0)					
					strokeWeight((zoom)*10)
					stroke(255)
					noFill()
					var selectSize = (frameCount*100)%1000
					stroke(((1000-selectSize)/1000)*255)
					ellipse(0,0,selectSize,selectSize)
				}else{
					noTint()
				}

				image(this.texture,0,0)				
			pop()
		pop()
	pop()

	if(this.isSelected){
		stroke(255)
		strokeWeight(2)
		line(this.worldPosition[0],this.worldPosition[1],mouseX,mouseY)
	}
	
	this.drawLabel()
}

var connection = function(drawPlanet,otherDrawPlanet){
	this.planet = drawPlanet
	this.otherPlanet = otherDrawPlanet
	this.distance = dist(this.planet.position[0], this.planet.position[1], this.otherPlanet.position[0], this.otherPlanet.position[1])
	this.osc = new p5.Oscillator()
	this.osc.setType('sine');
	this.osc.freq(900-this.distance);
	this.osc.amp(1,1);
	this.osc.start()
}

connection.prototype.draw = function(){
	push()
		translate(centerX,centerY)
		scale(zoom)
		var sWidth = (frameCount*(100/this.distance)*(Math.abs(speed)+1))%10
		strokeWeight(2/zoom)
		var strokeOpacity = (1-(sWidth/zoom))*255
		stroke(255,64)
		line(-this.planet.position[0], this.planet.position[1], -this.otherPlanet.position[0], this.otherPlanet.position[1])
		sWidth*=.25
		strokeWeight(2/zoom)
		stroke(255,64)
		line(-this.planet.position[0], this.planet.position[1], -this.otherPlanet.position[0], this.otherPlanet.position[1])
	pop()
	this.distance = dist(this.planet.position[0], this.planet.position[1], this.otherPlanet.position[0], this.otherPlanet.position[1])
	this.osc.freq(600-this.distance);
	
	var boundedX = false
	var boundedY = false

	if(this.planet.worldPosition[0]>this.otherPlanet.worldPosition[0]){
		if((mouseX>this.otherPlanet.worldPosition[0]&&mouseX<this.planet.worldPosition[0])){
			boundedX=true
		}
	}
	if(this.planet.worldPosition[0]<this.otherPlanet.worldPosition[0]){
		if((mouseX<this.otherPlanet.worldPosition[0]&&mouseX>this.planet.worldPosition[0])){
			boundedX=true
		}
	}

	if(this.planet.worldPosition[1]>this.otherPlanet.worldPosition[1]){
		if((mouseY>this.otherPlanet.worldPosition[1]&&mouseY<this.planet.worldPosition[1])){
			boundedY=true
		}
	}
	if(this.planet.worldPosition[1]<this.otherPlanet.worldPosition[1]){
		if((mouseY<this.otherPlanet.worldPosition[1]&&mouseY>this.planet.worldPosition[1])){
			boundedY=true
		}
	}
	// var onLineTest=(this.planet.worldPosition[0]-this.otherPlanet.worldPosition[0])*(mouseY-this.otherPlanet.worldPosition[1])-(this.planet.worldPosition[1]-this.otherPlanet.worldPosition[1])*(mouseX-this.otherPlanet.worldPosition[0])
	// var multAmnt = Math.abs((1000/(1000-(onLineTest/zoom))))
	// if(boundedX && boundedY){
	// 	this.osc.amp(multAmnt*.1)
	// }else{
	// 	this.osc.amp(.1)
	// }
}

function mouseWheel(event) {
	zoom-=(event.delta*.01)
	zoom < .3 ? zoom = .3 : {}
	zoom > 20 ? zoom = 20 : {}
}

function mousePressed(){
	var hitTarget = false
	if(mouseX<0||mouseX>width||mouseY<0||mouseY>height){return 0}
		for(var p in allPlanets){		
			if(abs(mouseX-(width/2)+(allPlanets[p].position[0]*zoom))<15){
				if(abs(mouseY-(height/2)-(allPlanets[p].position[1]*zoom))<15){
					hitTarget = true
					tutStage == 0 ? tutStage++ : {}
					if (keyIsPressed === true) {
						if(keyCode==SHIFT){
							for(var op in allPlanets){
								for( var cop in allPlanets[op].connections){
									if(allPlanets[p].data.name==allPlanets[op].connections[cop].otherPlanet.data.name){
										console.log(allPlanets[p].data.name)
										allPlanets[op].connections[cop].osc.stop()
										allPlanets[op].connections.splice(cop,1)
									}
								}
							}
							for(var c in allPlanets[p].connections){
								allPlanets[p].connections[c].osc.stop()
							}
							allPlanets[p].connections = []
							break;
						}
					}
				selectedPlanets.push(allPlanets[p])
				selectedPlanets[0].isSelected = true
				if(selectedPlanets.length>1){
					tutStage == 1 ? tutStage++ : {}
					selectedPlanets[0].connections.push(new connection(selectedPlanets[0],selectedPlanets[1]))					
					selectedPlanets[0].isSelected = false
					selectedPlanets = []
				}
			}		
		}
	}
	if(!hitTarget && selectedPlanets.length>0){
		selectedPlanets[0].isSelected = false
		selectedPlanets = []
	}
	manageTutorial()

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = windowWidth/2
  centerY = windowHeight/2
}



document.getElementById("fastForward").addEventListener('click',function(){
	document.getElementById("rewind").innerHTML = "<div id='speed-1' class='speedRW'></div><div id='speed-2' class='speedRW'></div>"
	tutStage == 2 ? tutStage++ : {}
	manageTutorial()
	console.log("set speed "+speed)
	speed++
	speed < 0 ? speed = 0 : {}
	if(speed<6){
		for(var s=0; s<speed; s++){
			var name = "speed"+speed+1
			document.getElementById("fastForward").innerHTML+="<div id="+name+" class='speedFF'></div>"
			document.getElementById(name).style.borderColor = "transparent transparent transparent #0f0"
			document.getElementById(name).style.left = (speed*20)+'px'
		}
	}
})

document.getElementById("rewind").addEventListener('click',function(){
	document.getElementById("fastForward").innerHTML = "<div id='speed1' class='speedFF'></div><div id='speed2' class='speedFF'></div>"
	tutStage == 2 ? tutStage++ : {}
	manageTutorial()
	console.log("set speed "+speed)
	speed--
	speed > 0 ? speed = 0 : {}
	if(speed>-6){
		for(var s=0; s>speed; s--){
			var name = "speed-"+speed
			document.getElementById("rewind").innerHTML+="<div id="+name+" class='speedRW'></div>"
			document.getElementById(name).style.borderColor = "transparent transparent transparent #f00"
			document.getElementById(name).style.left = (speed*20)+'px'
		}
	}
})

document.getElementById("play").addEventListener('click',function(){
	console.log("play")
	speed=0
	document.getElementById("fastForward").innerHTML = "<div id='speed1' class='speedFF'></div><div id='speed2' class='speedFF'></div>"
	document.getElementById("rewind").innerHTML = "<div id='speed-1' class='speedRW'></div><div id='speed-2' class='speedRW'></div>"
})

document.getElementById("resetTime").addEventListener("click",function(event){
	console.log("reset")
	tOffset = 0
})

