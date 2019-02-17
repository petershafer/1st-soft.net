// ==UserScript==
// @name           Google Notebook: Download
// @namespace      1st-soft
// @include        http://www.google.com/notebook/*
// @include        http://google.com/notebook/*
// ==/UserScript==


var SCRIPT = {
	name: "Google Notebook: Download",
	namespace: "http://www.1st-soft.net/",
	description: 'Create a download list of your google notebooks.',
	source: "http://www.1st-soft.net/gnd/google_notebook_download.user.js",
	identifier: "http://www.1st-soft.net/gnd/google_notebook_download.user.js",
	version: "1.00",					// version
	date: (new Date(2008, 8, 20))		// update date
			.valueOf()
};

var message = "";

/* Redirect user to list of all notebooks */
if(window.location.href=="http://www.google.com/notebook/m"){
	window.location.href="http://www.google.com/notebook/m?listall=1";
}

function buildPage(){


	/* Find the user's email address in order to construct atom feed download links. */
	var email = document.getElementById("login").innerHTML;
	email = email.split("<b>")[1];
	email = email.split("</b>")[0];
	if(document.location.href.indexOf("email=") != -1){
		email = document.location.href.split("email=")[1].split("&")[0];
	}
	var atom = true;

	/* Check and see if the user wants to download notebooks in html. */
	/* HTML is more readable, and is more suited for archiving on your hard drive. */
	if(window.location.href.indexOf("gnd=html") != -1){
		atom = false;
	}	

	/* Grab some DOM info from the page. */
	var divs = document.getElementsByTagName("div");
	var header, navigation;
	for(var i = 0; i < divs.length; i++){
		if(divs[i].className=="header"){
			header = divs[i];
		}
		if(divs[i].className=="navigation"){
			navigation = divs[i];
		}
	}

	/* Adjust the page to be better suited for the download list. */
	header.innerHTML = "Your Downloads";
	navigation.innerHTML += "<p><b><a href=\"javascript:var newemail=prompt('Your email address','"+email+"'); if(newemail != null){document.location.href='http://www.google.com/notebook/m?listall=1&email='+newemail;}\">Click here</a> if your email address isn't <u>"+email+"</u>.</b></p>"
	navigation.innerHTML += "Download Format: <a href=\"http://www.google.com/notebook/m?listall=1&gnd=html\">HTML</a>, <a href=\"http://www.google.com/notebook/m?listall=1\">Atom</a>";
	navigation.innerHTML += message;
	navigation.innerHTML += "<br/><br/><a href=\"http://www.1st-soft.net/gnd/\">Google Notebook: Download Homepage</a>";
	navigation.innerHTML += "<br/><br/>GND was written by Peter Shafer, student developer, in August 2008.";
	document.forms[0].style.display="none";
	document.forms[1].style.display="none";
	document.getElementById("login").style.display="none";

	/* Now convert all of the links into download links. */
	var id;
	for(var i = 0; i < document.links.length; i++){
		if(document.links[i].href.indexOf("google.com/notebook/m/notebook?nbid=") != -1){
			id = document.links[i].href.split("=")[1];
			if(atom){
				document.links[i].href = "http://google.com/notebook/feeds/"+email+"/archive/"+id;
			}else{
				document.links[i].href = "http://google.com/notebook/html?nbid="+id;
			}
		}
	}

	/* Now DownThemAll can be used to backup your google notebooks. */

}




function addButton(){

	var anchor = document.getElementById("gn_ph");
	var button = document.createElement("a");
	button.setAttribute("href","http://www.google.com/notebook/m");
	button.setAttribute("target","_blank");
	button.appendChild(document.createTextNode("Export Notebooks"));
	document.getElementsByTagName("body")[0].appendChild(button);
	button.setAttribute("style","position:absolute;right:20px;top:"+(anchor.offsetTop+(button.offsetHeight/2))+"px;");
	
}


/* Check for updates */




function myParseFloat(value){
	value = parseFloat(value);
	if(isNaN(value)){
		return 0.0;
	}else{
		return value;
	}
}

function myParseInt(value){
	value = parseInt(value);
	if(isNaN(value)){
		return 0;
	}else{
		return value;
	}
}

function GetVersion(){
	GM_xmlhttpRequest({
		method: 'GET',
		url: 'http://www.1st-soft.net/gnd/version.txt',
		headers: {
			'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
			'Accept': 'application/atom+xml,application/xml,text/xml',
		},
		onload: function(responseDetails) {
			var remoteVersion = myParseFloat(responseDetails.responseText);
			GM_setValue("remoteVersion",String(remoteVersion));
			message = CheckVersion();
		}
	});
}

function CheckVersion(){
	var remoteVersion = myParseFloat(GM_getValue("remoteVersion"));
	var localVersion = myParseFloat(SCRIPT["version"]);
	if(remoteVersion > localVersion){
		return "<br/><br/><b>A new version of GND is available!  Please update.</b>";
	}else{
		return "";
	}
}



var lastCheck = myParseInt(GM_getValue("lastCheck"));

if(Date.now() - lastCheck >= 86400000){
	GM_setValue("lastCheck",String(Date.now()));
	GetVersion();
}else{
	message = CheckVersion();
}






if(document.getElementsByTagName("body")[0].innerHTML.indexOf("/notebook/m/addnote") != -1){
	buildPage();
}

if(document.getElementsByTagName("body")[0].innerHTML.indexOf("_GN_init()") != -1){
	addButton();
}
	
	




// This software is licensed under the CC-GNU GPL.
// http://creativecommons.org/licenses/GPL/2.0/
// Google Notebook: Download was written by Peter Shafer, student developer, in August 2008.
