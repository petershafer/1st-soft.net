
function setCookie(c_name,value){
	var exdate=new Date()
	exdate.setTime(exdate.getTime()+(365*24*3600*1000))
	document.cookie=c_name+ "=" +escape(value)+
	((365==null) ? "" : "; expires="+exdate)
	//alert(document.cookie)
}
function getCookie(c_name){
	if (document.cookie.length>0){
		var c_start=document.cookie.indexOf(c_name + "=")
		if (c_start!=-1){ 
    		c_start=c_start + c_name.length+1 
    		var c_end=document.cookie.indexOf(";",c_start)
    		if (c_end==-1) c_end=document.cookie.length
    			return unescape(document.cookie.substring(c_start,c_end))
    		} 
  		}
	return null
}



function GetXmlHttpObject(url){
if (window.XMLHttpRequest){ // if Mozilla, Safari etc
page_request = new XMLHttpRequest()
}else if (window.ActiveXObject){ // if IE
page_request = new ActiveXObject("Microsoft.XMLHTTP")
}else{
return false
}
//page_request.open('GET', url, false) 
//page_request.send(null)
return page_request
}


function _GetXmlHttpObject(handler)
{ 
var objXmlHttp=null

if (navigator.userAgent.indexOf("Opera")>=0)
{
alert("This example doesn't work in Opera") 
return 
}
if (navigator.userAgent.indexOf("MSIE")>=0)
{ 
var strName="Msxml2.XMLHTTP"
if (navigator.appVersion.indexOf("MSIE 5.5")>=0)
{
strName="Microsoft.XMLHTTP"
} 
try
{ 
objXmlHttp=new ActiveXObject(strName)
objXmlHttp.onreadystatechange=handler 
return objXmlHttp
} 
catch(e)
{ 
alert("Error. Scripting for ActiveX might be disabled") 
return 
} 
} 
if (navigator.userAgent.indexOf("Mozilla")>=0)
{
objXmlHttp=new XMLHttpRequest()
objXmlHttp.onload=handler
objXmlHttp.onerror=handler 
return objXmlHttp
}
} 








function trim(s){
    s = s.split("")
	while(s[0]==" " || s[0]=="\n"){
	    s.shift();
	}
	while(s[s.length-1]==" " || s[s.length-1]=="\n"){
	    s.pop();
	}
	s = s.join("")
	return s
}

function getxml(){
    var url="choices.xml"
    var xmlHttp=GetXmlHttpObject()
    xmlHttp.open("GET", url , false)
    xmlHttp.send(null)
	var data = xmlHttp.responseXML
    var xmlobj = data.documentElement.getElementsByTagName("choice");
	var parsed = new Array();
	for(var i=0; i<xmlobj.length; i++){
	    parsed[i] = new Array();
		parsed[i]["name"] = xmlobj[i].getAttribute("name")
		var cleanup = trim(xmlobj[i].firstChild.nodeValue)
		cleanup = cleanup.replace(/, /,",")
		parsed[i]["tags"] = cleanup.split(",")
		for(var j=0; j<parsed[i]["tags"].length; j++){
		    parsed[i]["tags"][j] = trim(parsed[i]["tags"][j])
		}
		parsed[i]["flag"] = true
	}
	return parsed
}

function rendercontrols(){
    var url="controls.xml"
    var xmlHttp=GetXmlHttpObject()
    xmlHttp.open("GET", url , false)
    xmlHttp.send(null)
	//alert(xmlHttp.responseXML)
	var data = xmlHttp.responseXML
    var xmlobj = data.documentElement.getElementsByTagName("section");
	var parsed = new Array();
	var content = "";
	for(var i=0; i<xmlobj.length; i++){
	    ptr = xmlobj[i].firstChild
		content += "<h2>"+xmlobj[i].getAttribute("name")+"</h2>\n<ul>"
		//alert(ptr.nodeName)
		if(ptr != null){
			do{
			    if(ptr.nodeName == "control"){
		    	    if(ptr.getAttribute("switch") == ""){
			    	    content += "<li><button onClick=\"changecrit(this,"+ptr.getAttribute("mode")+",'"+ptr.getAttribute("tag")+"');\">"+ptr.getAttribute("name")+"</button></li>\n";
				    }else{
			    	    content += "<li><button id=\"control"+i+"a\" onClick=\"changecrit(this,"+ptr.getAttribute("mode")+",'"+ptr.getAttribute("tag")+"'); document.getElementById('control"+i+"b').style.backgroundColor=offColor\">"+ptr.getAttribute("name")+"</button></li>\n";
					    if(ptr.getAttribute("mode")==1){var switchmode=0;}else{var switchmode=1;}
					    content += "<li><button id=\"control"+i+"b\" onClick=\"changecrit(this,"+switchmode+",'"+ptr.getAttribute("tag")+"'); document.getElementById('control"+i+"a').style.backgroundColor=offColor\">"+ptr.getAttribute("switch")+"</button></li>\n";
				    }
				}
				ptr = ptr.nextSibling
		    }while(ptr.nextSibling != null)
		}
		content += "</ul>\n";
	}
	document.getElementById('tags').innerHTML = content
}

function hastag(obj,tag){
    if(testpt < testlim){
	    alert(obj["name"]+" "+tag)
		testpt++
	}
    for(var i=0; i<obj["tags"].length; i++){
	    if(obj["tags"][i]==tag){
		    return true
		}
	}
	return false
}

function changecrit(ptr,mode,tag){
    if(ptr.style.backgroundColor==""){
	    ptr.style.backgroundColor=offColor
	}

    if(ptr.style.backgroundColor==offColor){
	    ptr.style.backgroundColor=onColor
		for(var i=0; i<criteria.length; i++){
		    if(criteria[i]["tag"] == tag){
			    criteria[i]["mode"] = mode;
				displaycrit();
		        applycrit();
				return true;
			}
		}
		var newptr = criteria.length;
		criteria[newptr] = new Array();
		criteria[newptr]["tag"] = tag;
		criteria[newptr]["mode"] = mode;
		displaycrit();
		applycrit();
		return true;
	}else{
	    ptr.style.backgroundColor=offColor
		for(var i=0; i<criteria.length; i++){
		    if(criteria[i]["tag"] == tag){
			    var temp = criteria[i];
				criteria[i] = criteria[criteria.length-1];
				criteria[criteria.length-1] = temp;
				criteria.pop();
				displaycrit();
		        applycrit();
				return true;
			}
		}
		return true;
	}
	return true;
}

function displaycrit(){
    var pad = document.getElementById('debug')
	pad.innerHTML = "<h2>Criteria Info</h2>\n"
	var choicetxt = ""
    for(var i=0; i<criteria.length; i++){
		choicetxt += "<li id=\"criteria"+i+"\">"+criteria[i]["tag"]+" "+criteria[i]["mode"]+"</li>\n"
	}
	pad.innerHTML += "<ul>"+choicetxt+"</ul>";
}

function renderchoices(){
    var pad = document.getElementById('results')
	pad.innerHTML = "<h2>Your Choices</h2>\n"
	var choicetxt = ""
    for(var i=0; i<choices.length; i++){
		choicetxt += "<li id=\"choice"+i+"\">"+choices[i]["name"]+"</li>\n"
	}
	pad.innerHTML += "<ul>"+choicetxt+"</ul>";
}

function applycrit(){
    var check;
	var found;
	var pass = true;
    for(var i=0; i<choices.length; i++){
	    pass = true;
	    for(var j=0; j<criteria.length; j++){
	        check = hastag(choices[i],criteria[j]["tag"]);
			if((criteria[j]["mode"]==0 && check == true) || (criteria[j]["mode"]==1 && check == false)){
			    //document.getElementById("choice"+i).style.display="none"
				if(choices[i]["flag"]==true){
				    //Effect.BlindUp('choice'+i,{duration:0.5});
					makedisappear(i)
					//Effect.Fade('choice'+i,{duration:0.4});
				}
				choices[i]["flag"] = false;
				pass = false;
			}
		}
		if(pass == true){
		    //document.getElementById("choice"+i).style.display="block"
			if(choices[i]["flag"]==false){
				//Effect.BlindDown('choice'+i,{duration:0.5});
				makeappear(i)
				//Effect.Appear('choice'+i,{duration:0.4});
				//Effect.Pulsate("choice"+i,{duration:2.0})
			}
			choices[i]["flag"] = true;
		}
	}
}

function makeappear(i){
    if(otherscript){
	    Effect.BlindDown('choice'+i,{duration:0.5});
	}else{
	    document.getElementById("choice"+i).style.display="block"
	}
}

function makedisappear(i){
    if(otherscript){
	    Effect.BlindUp('choice'+i,{duration:0.5});
	}else{
	    document.getElementById("choice"+i).style.display="none"
	}
}




var choices = getxml();
var criteria = new Array();
var testlim = 0;
var testpt = 0;
var onColor = 'rgb(255, 0, 0)';
var offColor = 'rgb(29, 162, 255)';
var otherscript = true;
