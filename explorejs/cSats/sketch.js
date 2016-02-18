var satellites = []
var visibileSatsLookAngles = []
var img;
function preload() {
  img = loadImage("sprite.png");
  imageMode(CENTER)
}
function setup(){
    createCanvas(600,600)
    navigator.geolocation.getCurrentPosition(function(location){    
        parseTLE(satellites, function(){
            drawSky()
            for(var sat in satellites){
                var satellite = new explore.tle(satellites[sat].line1,satellites[sat].line2)
                satellite.update()
                var lookAngles = satellite.getLookAnglesFrom(location.coords.longitude,location.coords.latitude,1)
                lookAngles.name = satellites[sat].id.replace(/[0-9]/g, '')
                if(lookAngles.elevation>0){
                    visibileSatsLookAngles.push(lookAngles)
                } 
            }
            push()
            translate(width/2,height/2)
                for(var sat=0; sat<visibileSatsLookAngles.length;sat++){
                   var alt = map(visibileSatsLookAngles[sat].elevation,0,90,height/2,0)
//                   var az = map(visibileSatsLookAngles[sat].azimuth,0,360,0,width)
                   var az = visibileSatsLookAngles[sat].azimuth
                   var satScale = map(visibileSatsLookAngles[sat].range_sat,0,40000,7,2)
                   noStroke()
                   push()
                   rotate((az-90)*Math.PI/180)
                   image(img,alt,0,satScale*2,satScale*2)
                   fill(255)
                   ellipse(alt,0,satScale/2,satScale/2)
                   pop()
                   strokeWeight(.5)
                   stroke(0,160,0,100)
                   }
            pop()
/*
    fill(255)
    noStroke()
    textSize(16)
    text("N",width-16,height-5)
    text("N",0,height-5)
    text("E",(width/4)-14,height-5)
    text("S",(width/2)-14,height-5)
    text("W",(width*.75)-14,height-5)
   */
        })
    })
}
function draw(){}

function drawSky(){
    for(var h=0;h<height;h++){
        var gradPart = map(h*h*h*h,0,height*height*height*height,0,80)
        var skyColor = color(10,.2*gradPart,gradPart)
        stroke(skyColor)
        noFill()
        ellipse(width/2,height/2,h,h)
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


