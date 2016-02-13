var corsURL = "http://cors.io/?u="
var celestrakURL = "http://www.celestrak.com/NORAD/elements/"

var newTLE = "tle-new.txt"
var stations = "stations.txt"
var visible = "visual.txt"
var FENGYUNDebris = "1999-025.txt"
var iridiumDebris = "iridium-33-debris.txt"
var cosmos2251Debris = "cosmos-2251-debris.txt"
var BREEZEMDebris = "2012-044.txt"
var weather = "weather.txt"
var noaa = "noaa.txt"
var goes = "goes.txt"
var earthResources = "resource.txt"
var searchRescue = "sarsat.txt"
var disasterMonitor = "dmc.txt"
var TDRSS = "tdrss.txt"
var ARGOS = "argos.txt"
var geostationary = "geo.txt"
var intelsat = "intelsat.txt"
var gorizont = "gorizont.txt"
var raduga = "raduga.txt"
var molniya = "molniya.txt"
var iridium = "iridium.txt"
var orbcomm = "orbcomm.txt"
var globalstar = "globalstar.txt"
var amateur = "amateur.txt"
var experimental = "x-comm.txt"
var other = "other-comm.txt"
var GPSOps = "gps-ops.txt"
var glonassOps = "glo-ops.txt"
var galileo = "galileo.txt"
var beidou = "beidou.txt"
var sbas = "sbas.txt"
var nnss = "nnss.txt"
var RussianLEONav = "musson.txt"
var science = "science.txt"
var geodetic = "geodetic.txt"
var engineering = "engineering.txt"
var education = "education.txt"
var military = "military.txt"
var radar = "radar.txt"
var cubesats = "cubesat.txt"
var other = "other.txt"

//classified
//http://blog.another-d-mention.ro/programming/read-load-files-from-zip-in-javascript/
var classified = "https://www.prismnet.com/~mmccants/tles/classfd.zip"

var xmlhttp = new XMLHttpRequest();

xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        var tleresponse = xmlhttp.responseText;
        tleresponse = tleresponse.split('\n');
        tleresponse.splice(tleresponse.length-1)

        var ids = [];
        var lines1 = [];
        var lines2 = [];

        for(var s in tleresponse){
        	switch(s%3){
        		case 0:
        			var id = tleresponse[s].replace(/\s/g, '');
        			ids.push(id);
        			break;
        		case 1:
        			lines1.push(tleresponse[s]);
    			case 2:
    			lines2.push(tleresponse[s]);
        	}
        }
        
        console.log(ids)
    }
};

function getTLE(category){
	if(category == classified){
		var url = corsURL + classified;
	}else{
		var url = corsURL + celestrakURL + category;
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

getTLE(newTLE)
