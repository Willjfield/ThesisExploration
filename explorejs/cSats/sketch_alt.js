$(document).ready(function(){
    if(localStorage.introHide){
        $("#intro").hide()
    }
   $("#close").click(function(){
        $("#intro").hide()
        localStorage.introHide = true
   })
   $("#next").click(function(){
        $("#intro").css("visibility","hidden")
   })
})
var satellites = []
var visibleSats = []
var img;
var latLong = {}

function preload() {
  img = loadImage("sprite.png");
  imageMode(CENTER)
}

function setup(){
    createCanvas(4000,windowHeight)
    document.getElementById("defaultCanvas0").style.position = "absolute"
    document.getElementById("defaultCanvas0").style.bottom = "0px"
    navigator.geolocation.getCurrentPosition(function(location){    
        latLong.longitude =location.coords.longitude
        latLong.latitude = location.coords.latitude
        parseTLE(satellites, function(){
        drawSats()
        document.getElementById("loading").style.visibility="hidden"
        })
    })
}

function draw(){}

function drawSats(){
            drawSky()

            for(var sat in satellites){
                var satellite = new explore.tle(satellites[sat].line1,satellites[sat].line2)
                satellite.update()
                var lookAngles = satellite.getLookAnglesFrom( latLong.longitude, latLong.latitude,1)
                if(lookAngles.elevation>0){
                    visibleSats.push(lookAngles)
                } 
            }

            push()
                translate(0,height)
                for(var sat in visibleSats){
                    push()
                        var satPosition = map(visibleSats[sat].range_sat,0,50000,0,height)
                        if(Math.random()>0){ 
                            rotate(-visibleSats[sat].elevation*(Math.PI/180))
                        }else{
                            rotate(-Math.PI+visibleSats[sat].elevation*(Math.PI/180))
                        }

                        for(var i=0;i<satPosition;i++){
                            stroke(255,0,0,255-map(i,0,satPosition,0,255))
                            point(i,0)
                        }
                        noStroke()
                        fill(255)
                        image(img,satPosition,0)
                        ellipse(satPosition,0,4,4)
                    pop()
                }
            pop()

        textAlign(RIGHT)
        var date = new Date();
        textSize(20)
        fill(255,64)
        strokeWeight(0)
        text(date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear()+" at "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),width-10,height-32)
        text(latLong.longitude.toFixed(4)+","+latLong.latitude.toFixed(4),width-10,height-12)
}
function drawSky(){
    for(var h=0;h<height;h++){
        var gradPart = map(h*h*h,0,height*height*height,0,100)
        var skyColor = color(10,.2*gradPart,gradPart)
        stroke(skyColor)
        strokeWeight(1)
        line(0,h,width,h)
    }
}

function parseTLE(satellites, callback){
    var xmlhttp = new XMLHttpRequest();
    var url = "inttles.txt"
    xmlhttp.open("GET", url, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var tleresponse = xmlhttp.responseText;
            tleresponse = tleresponse.split('\n');
            tleresponse.splice(tleresponse.length-1)
            for(var s = 0; s<tleresponse.length;s+=3){
                    satellites.push({
                        id: tleresponse[s].replace(/\s/g, ''),
                        line1 : tleresponse[s+1],
                        line2 : tleresponse[s+2]
                    })
                }
        }
        callback();
    }
    xmlhttp.send(null);
}

function windowResized() {
    document.getElementById("defaultCanvas0").style.bottom = "0px"
}

