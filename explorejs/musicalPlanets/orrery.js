var planets=[]
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


function preload(){
	var thisYear = xpl.dateFromJday(xpl.now,-5).year
	document.getElementById("speedSlider").min = -5
	document.getElementById("speedSlider").max = 5
	document.getElementById("speedSlider").step = .01
	spaceBackground = loadImage("fludd_infinity2.jpg")
	spaceMatte = loadImage("infinity.png")
	sun = loadImage("img/sun.png")
}

function loadPlanetTex(pYears, curYear, planetNum){
					for(var y = pYears.length; y>=0; y--){
						for(var i = curYear;i>1700;i--){
							if(pYears[y]==i){
								var loadString = "img"+"/"+planetNum+"/"+i+".png"
								planets[planetNum] = loadImage(loadString)
								//console.log(curYear)
								//console.log(loadString)
								return 0
						}
				}
		}
}

function setup(){
	createCanvas(windowWidth, windowHeight)
	imageMode(CENTER)
	drawPlanets()
	zoom = 1
	stroke(255,100)
	noFill()
	centerX = width/2
	centerY = height/2
}

function draw(){
	background(0)
	drawPlanets()
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

function mouseWheel(event) {
	zoom-=(event.delta*.01)
	zoom < .5 ? zoom = .5 : {}
	zoom > 20 ? zoom = 20 : {}
}

function drawPlanets(){
	push()
		translate(centerX,centerY)
		scale(zoom)
		push()
		scale(1+(zoom*.1))
		pop()
		strokeWeight(1/zoom)
		for(var p in xpl.planets){
			push()
				var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset)
				var distanceSq = ((curPosition[0]*25)*(curPosition[0]*25))+((curPosition[1]*25)*(curPosition[1]*25))
				for(var trail = 0;trail<(distanceSq/100)+(xpl.planets[p].radius*.001);trail+=10){
					var t1 = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset-trail)
					var t2 = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset-trail-10)
					line(-t1[0]*25,t1[1]*25,-t2[0]*25,t2[1]*25)
				}

				translate(-curPosition[0]*25,curPosition[1]*25)

				push()
					scale(xpl.planets[p].radius*.0005)
					fill(255)
					strokeWeight(.5)
					stroke(255,100)
					ellipse(0,0,1,1)
				pop()

				if(abs(mouseX-(width/2)+(curPosition[0]*25*zoom))<15){
					if(abs(mouseY-(height/2)-(curPosition[1]*25*zoom))<15){
						fill(255)
						noStroke()
						textSize(16/zoom)
						text(xpl.planets[p].name,xpl.planets[p].radius*.0005/zoom,xpl.planets[p].radius*.0005/zoom)
					}
				}
			pop()
		}
	pop()
}

function mousePressed(){
	if(mouseX<0||mouseX>width||mouseY<0||mouseY>height){return 0}
	initX = mouseX-centerX
	initY = mouseY-centerY
}

function mouseReleased(){
	document.getElementById("speedSlider").value = 0
	for(var p in planetYears){
		loadPlanetTex(planetYears[p], date.year, p)
	}
}

function mouseDragged() {
	if(mouseX<0||mouseX>width||mouseY<0||mouseY>height){return 0}

	centerX = mouseX-initX
	centerY = mouseY-initY

	centerX < 0 ? centerX = 0 : {}
	centerY < 0 ? centerY = 0 : {}
	centerX > width ? centerX = width : {}
	centerY > height ? centerY = height : {}
}
