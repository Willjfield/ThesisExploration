var planets=[]
var spaceBackground, spaceMatte
var zoom
var sun
var centerX, centerY
var initX = 0
var initY = 0

function preload(){
	spaceBackground = loadImage("fludd_infinity2.jpg")
	spaceMatte = loadImage("infinity.png")
	sun = loadImage("img/sun.png")
	planets[0] = loadImage("img/mercury.png")
	planets[1] = loadImage("img/venus.png")
	planets[2] = loadImage("img/earth.png")
	planets[3] = loadImage("img/mars.png")
	planets[4] = loadImage("img/jupiter.png")
	planets[5] = loadImage("img/saturn.png")
}
function setup(){
	createCanvas(windowHeight, windowHeight)
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
		image(spaceBackground,0,0,spaceBackground.width,spaceBackground.height,0,0,width,height)	
		pop()
		strokeWeight(1/zoom)
		push()
			scale(.03)
			image(sun,0,0)
		pop()
		for(var p in planets){
			push()
				var curPosition = explore.SolarSystem(explore.planets[p],explore.now)
				var distance = Math.sqrt(((curPosition[0]*25)*(curPosition[0]*25))+((curPosition[1]*25)*(curPosition[1]*25)))
				ellipse(0,0,distance*2,distance*2)
				translate(-curPosition[0]*25,curPosition[1]*25)
				
				push()
					scale(explore.planets[p].radius*.000002)
					image(planets[p],0,0)
				pop()

				if(abs(mouseX-(width/2)+(curPosition[0]*25*zoom))<15){
					if(abs(mouseY-(height/2)-(curPosition[1]*25*zoom))<15){
						fill(255)
						noStroke()
						textSize(16/zoom)
						text(explore.planets[p].name,explore.planets[p].radius*.0005/zoom,explore.planets[p].radius*.0005/zoom)
					}
				}
			pop()
		}
		image(spaceMatte,0,0,spaceMatte.width,spaceMatte.height,0,0,width*3,height*3)	
	pop()
}

function mousePressed(){
	initX = mouseX-centerX
	initY = mouseY-centerY
}
function mouseDragged() {

	centerX = mouseX-initX
	centerY = mouseY-initY

	centerX < 0 ? centerX = 0 : {}
	centerY < 0 ? centerY = 0 : {}
	centerX > width ? centerX = width : {}
	centerY > height ? centerY = height : {}
}