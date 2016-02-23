var planets=[]
var spaceBackground
var zoom
var sun
var centerX, centerY

function preload(){
	//spaceBackground = loadImage("fludd_infinity2.jpg")
	sun = loadImage("sun.png")
	planets[0] = loadImage("mercury.png")
	planets[1] = loadImage("venus.png")
	planets[2] = loadImage("earth.png")
	planets[3] = loadImage("mars.png")
	planets[4] = loadImage("jupiter.png")
	planets[5] = loadImage("saturn.png")
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
}

function mouseWheel(event) {
	zoom-=(event.delta*.01)
	zoom < .1 ? zoom = .1 : {}
	zoom > 10 ? zoom = 10 : {}
}

function drawPlanets(){
	push()
		translate(centerX,centerY)	
		scale(zoom)
		push()
			scale(.05)
			image(sun,0,0)
		pop()
		for(var p in planets){
			push()
				var curPosition = explore.SolarSystem(explore.planets[p],explore.now)
				var distance = Math.sqrt(((curPosition[0]*25)*(curPosition[0]*25))+((curPosition[1]*25)*(curPosition[1]*25)))
				ellipse(0,0,distance*2,distance*2)
				translate(-curPosition[0]*25,curPosition[1]*25)
				scale(.1)
				image(planets[p],0,0)
			pop()
		}
	pop()
}

function mouseDragged() {
	centerX = mouseX
	centerY = mouseY

}