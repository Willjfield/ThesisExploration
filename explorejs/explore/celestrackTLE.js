var corsURL = "http://cors.io/?u="
var celestrakTypeURL = "http://www.celestrak.com/NORAD/elements/"
var celestrakNORAD = "http://celestrak.com/cgi-bin/TLE.pl?CATNR="

var categories = {
	 newTLE : "tle-new.txt",
	 stations : "stations.txt",
	 visible : "visual.txt",
	 FENGYUNDebris : "1999-025.txt",
	 iridiumDebris : "iridium-33-debris.txt",
	 cosmos2251Debris : "cosmos-2251-debris.txt",
	 BREEZEMDebris : "2012-044.txt",
	 weather : "weather.txt",
	 noaa : "noaa.txt",
	 goes : "goes.txt",
	 earthResources : "resource.txt",
	 searchRescue : "sarsat.txt",
	 disasterMonitor : "dmc.txt",
	 TDRSS : "tdrss.txt",
	 ARGOS : "argos.txt",
	 geostationary : "geo.txt",
	 intelsat : "intelsat.txt",
	 gorizont : "gorizont.txt",
	 raduga : "raduga.txt",
	 molniya : "molniya.txt",
	 iridium : "iridium.txt",
	 orbcomm : "orbcomm.txt",
	 globalstar : "globalstar.txt",
	 amateur : "amateur.txt",
	 experimental : "x-comm.txt",
	 other : "other-comm.txt",
	 GPSOps : "gps-ops.txt",
	 glonassOps : "glo-ops.txt",
	 galileo : "galileo.txt",
	 beidou : "beidou.txt",
	 sbas : "sbas.txt",
	 nnss : "nnss.txt",
	 RussianLEONav : "musson.txt",
	 science : "science.txt",
	 geodetic : "geodetic.txt",
	 engineering : "engineering.txt",
	 education : "education.txt",
	 military : "military.txt",
	 radar : "radar.txt",
	 cubesats : "cubesat.txt",
	 other : "other.txt"
}
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
	if(category in categories){
		console.log("found: "+categories[category]);
	}else{
		console.log("you probably meant an ID")
		return 0;
	}
	/*
	if(category == classified){
		var url = corsURL + classified;
	}else{
		var url = corsURL + celestrakURL + category;
	}
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
	*/
}

getTLE("newTLE")
