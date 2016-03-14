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
	manageSlider()
	for(var p in allPlanets){
		allPlanets[p].update()
	}
	for(var p in allPlanets){
		allPlanets[p].drawBody()
	}
	
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
}

drawPlanet.prototype.update = function(){
	this.position = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset)
	for(var coord in this.position){
		this.position[coord]*=this.ssScale
	}
	this.position[1]*=.5
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
		for(var c in this.connections){
		this.connections[c].draw()
	}
	push()
		translate(centerX,centerY)
		scale(zoom)
		push()		
			var curPosition = this.position
			var distanceSq = ((curPosition[0])*(curPosition[0]))+((curPosition[1])*(curPosition[1]))
			strokeWeight(1/zoom)
			stroke(255,100)

			for(var trail = 0;trail<this.data.yearLength;trail+=20){
				var t1 = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset-trail)
				var t2 = xpl.SolarSystem(xpl.planets[this.data.num],xpl.now+tOffset-trail-10)
				line(-t1[0]*this.ssScale,(t1[1]*this.ssScale)*.5,-t2[0]*this.ssScale,t2[1]*this.ssScale*.5)
			}

			translate(-curPosition[0],curPosition[1])

			push()
				scale(this.data.radius*.000002)
				fill(255)
				strokeWeight(.5)
				stroke(this.strokeColor)
				ellipseMode(CENTER)
				if(this.isSelected){
					tint(0,255,0)					
					strokeWeight((zoom)*10)
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
	this.drawLabel()
}

var connection = function(drawPlanet,otherDrawPlanet){
	this.planet = drawPlanet
	this.otherPlanet = otherDrawPlanet
	this.distance = dist(this.planet.position[0], this.planet.position[1], this.otherPlanet.position[0], this.otherPlanet.position[1])
}

connection.prototype.draw = function(){
	push()
		translate(centerX,centerY)
		scale(zoom)
		var sWidth = (frameCount*(100/this.distance)*(Math.abs(speed)+1))%10
		strokeWeight(sWidth/zoom)
		stroke(255,64)
		line(-this.planet.position[0], this.planet.position[1], -this.otherPlanet.position[0], this.otherPlanet.position[1])
		sWidth*=.25
		strokeWeight(sWidth/zoom)
		stroke(255,64)
		line(-this.planet.position[0], this.planet.position[1], -this.otherPlanet.position[0], this.otherPlanet.position[1])
	pop()
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
				selectedPlanets.push(allPlanets[p])
				//selectedPlanets[0].strokeColor = color(0,255,0,100)stroke(0,255,0)
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

function mouseReleased(){

}

// function drawPlanets(){
// 	push()
// 		translate(centerX,centerY)
// 		scale(zoom)
// 		push()
// 		scale(1+(zoom*.1))
// 		pop()
// 		ellipse(0,0,10,10)
// 		for(var p in xpl.planets){
// 			push()
// 				var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset)
// 				var distanceSq = ((curPosition[0]*25)*(curPosition[0]*25))+((curPosition[1]*25)*(curPosition[1]*25))
// 				strokeWeight(1/zoom)
// 				for(var trail = 0;trail<xpl.planets[p].yearLength;trail+=20){
// 					var t1 = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset-trail)
// 					var t2 = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset-trail-10)
// 					line(-t1[0]*25,(t1[1]*25),-t2[0]*25,t2[1]*25)
// 				}

// 				translate(-curPosition[0]*25,curPosition[1]*25)

// 				push()
// 					scale(xpl.planets[p].radius*.0005)
// 					fill(255)
// 					strokeWeight(.5)
// 					stroke(255,100)
// 					ellipseMode(CENTER)
// 					ellipse(0,0,1,1)
// 				pop()

// 				if(abs(mouseX-(width/2)+(curPosition[0]*25*zoom))<15){
// 					if(abs(mouseY-(height/2)-(curPosition[1]*25*zoom))<15){
// 						fill(255)
// 						noStroke()
// 						textSize(16/zoom)
// 						text(xpl.planets[p].name,xpl.planets[p].radius*.0005/zoom,xpl.planets[p].radius*.0005/zoom)
// 					}
// 				}
// 			pop()
// 		}
// 	pop()
// }