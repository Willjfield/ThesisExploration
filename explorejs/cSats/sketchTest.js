function setup(){
	createCanvas(windowWidth,windowHeight)
	drawLine();
}
function draw(){}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  drawLine()
}

function drawLine(){
	stroke(0,100,255,100)
	for(var i=0;i<200;i++){
		line(0,random(height),width,random(height))
	}
}