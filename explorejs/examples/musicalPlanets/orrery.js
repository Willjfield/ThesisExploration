var planets=[]
var allPlanets = []
var spaceBackground, spaceMatte
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

function preload(){
	var thisYear = xpl.dateFromJday(xpl.now,-5).year
	
	document.getElementById("speedSlider").min = -5
	document.getElementById("speedSlider").max = 5
	document.getElementById("speedSlider").step = .01
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
}

function draw(){
	background(0, 25, 50)
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

function manageSlider(){
	speed = parseFloat(document.getElementById("speedSlider").value)
	if(speed>0){
		tOffset+=speed*speed*speed
	}else{
		tOffset+=speed*speed*speed
	}
	date = xpl.dateFromJday(xpl.now+tOffset,-5)

	noStroke()
	fill(255)
	textSize(30)
	textAlign(CENTER)
	text(date.month + "/",50,70)
	text(date.day + "/",90,70)
	text(date.year,150,70)
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
	var onLineTest=(this.planet.worldPosition[0]-this.otherPlanet.worldPosition[0])*(mouseY-this.otherPlanet.worldPosition[1])-(this.planet.worldPosition[1]-this.otherPlanet.worldPosition[1])*(mouseX-this.otherPlanet.worldPosition[0])
	var multAmnt = Math.abs((1000/(1000-(onLineTest/zoom))))
	if(boundedX && boundedY){
		this.osc.amp(multAmnt)
	}else{
		this.osc.amp(.05)
	}
}

function mouseWheel(event) {
	zoom-=(event.delta*.01)
	zoom < .3 ? zoom = .3 : {}
	zoom > 20 ? zoom = 20 : {}
}

function mousePressed(){
	if(mouseX<0||mouseX>width||mouseY<0||mouseY>height){return 0}
		for(var p in allPlanets){		
			if(abs(mouseX-(width/2)+(allPlanets[p].position[0]*zoom))<15){
				if(abs(mouseY-(height/2)-(allPlanets[p].position[1]*zoom))<15){
					if (keyIsPressed === true) {
						if(keyCode==SHIFT){
							for(c in allPlanets[p].connections){
								allPlanets[p].connections[c].osc.stop()
							}
							allPlanets[p].connections = []
							break;
						}
					}
				selectedPlanets.push(allPlanets[p])
				selectedPlanets[0].isSelected = true
				if(selectedPlanets.length>1){
					selectedPlanets[0].connections.push(new connection(selectedPlanets[0],selectedPlanets[1]))					
					selectedPlanets[0].isSelected = false
					selectedPlanets = []
				}
			}
		}
	}
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = windowWidth/2
  centerY = windowHeight/2
}

function mouseReleased(){}