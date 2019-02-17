// ==UserScript==
// @name           Google Docs Download
// @namespace      gdd
// @description    Create a download list of your google documents.
// @include        http://docs.google.com/*
// @include        https://docs.google.com/*
// @exclude        http://docs.google.com/Doc?docid=*
// @exclude        https://docs.google.com/Doc?docid=*
// @exclude        http://docs.google.com/Doc?id=*
// @exclude        https://docs.google.com/Doc?id=*
// ==/UserScript==


var SCRIPT = {
	name: "Google Docs Download",
	namespace: "http://www.1st-soft.net/",
	description: 'Create a download list of your google documents.',
	source: "http://www.1st-soft.net/gdd/googledocdownload.user.js",
	identifier: "http://www.1st-soft.net/gdd/googledocdownload.user.js",
	version: "2.00",					// version
	date: (new Date(2008, 6, 23))		// update date
			.valueOf()
};

/* These are items that can be accessed from the greasemonkey menu. */
function ActivateNotices(){
	var disableNotices = GM_getValue("disableNotices");
	if(disableNotices == 1){
		GM_setValue("disableNotices",0);
		ShowMessage("Notices have been enabled.",5000);
	}else{
		forcing = true;
		ShowMessage("Notices are now disabled.",5000);
		forcing = false;
		GM_setValue("disableNotices",1);	
	}
}
GM_registerMenuCommand("Disable/Enable Notices",ActivateNotices);
function ForceGetVersion(){
	GetVersion(1);
}
GM_registerMenuCommand("Check for updates",ForceGetVersion);
function ClearValues(){
	GM_setValue("lastCheck","0");
	GM_setValue("remoteVersion","0.0");
}
GM_registerMenuCommand("Debug: Clear GDD GM Values",ClearValues);

/* Floating notice script */

var msgTimeout, colorA, colorB, dismiss, floatietitle, floatiediv, docbody, floatie;

function InitiateNotices(){
	var checkPage = xpath_query("//div[@id='doclist']");
	if(checkPage.length > 0){
		msgTimeout;
		colorA = '#67a7e3';
		colorB = 'white';
		dismiss = " <span onMouseOut=\"this.style.backgroundColor='"+colorA+"';this.style.color='"+colorB+"'\" onMouseOver=\"this.style.backgroundColor='"+colorB+"';this.style.color='"+colorA+"'\" onClick=\"document.getElementById('GDDError').style.display='none';\" style=\"cursor:pointer;color:"+colorB+";float:right;font-family:tahoma;font-weight:bold;margin:3px;padding:3px;\">&nbsp;X&nbsp;</span> "
		floatietitle = "<u>Google Docs Download</u>";
		floatiediv = document.createElement("div");
		floatiediv.setAttribute("id","GDDError");
		floatiediv.setAttribute("style","font-family:verdana;font-size:12px;width:200px;position:fixed;right:0px;bottom:0px;background-color:"+colorA+";color:"+colorB+";padding:7px;display:none;opacity:0.0;");
		docbody = document.getElementsByTagName("body")[0];
		docbody.appendChild(floatiediv);
		floatie = document.getElementById("GDDError");
	}
}

function UpdateBox(){
	if(parseFloat(floatie.style.opacity) < 1.0 && floatie.style.display != "none"){
		floatie.style.opacity = parseFloat(floatie.style.opacity) + 0.05;
		if(parseFloat(floatie.style.opacity) < 1.0){
			setTimeout(UpdateBox,50);
		}
	}
}

function UpdateBoxR(){
	if(parseFloat(floatie.style.opacity) > 0.0 && floatie.style.display == "block"){
		floatie.style.opacity = parseFloat(floatie.style.opacity) - 0.05;
		if(parseFloat(floatie.style.opacity) > 0.0){
			setTimeout(UpdateBoxR,50);
		}else{
			floatie.style.display = 'none';
		}
	}
}


function ShowMessage(message,time){
	if(GM_getValue("disableNotices") != 1){
		if(floatie.style.display == "none"){
			floatie.style.opacity = 0.0;
			floatie.style.display = 'block';
		}
		try{
			clearTimeout(msgTimeout);
			if(time > 0){
				msgTimeout = setTimeout(UpdateBoxR,time);
			}
		}catch(e){
			
		}
		var disableThis;
		if(forcing == false){
			disableThis = "<br/><br style=\"font-size:3px;\" /><a href=\"javascript:void(0);\" id=\"GDD_Disable\" style=\"color:white;\">Disable Notices</a>";
		}else{
			disableThis = "";
		}
		floatie.innerHTML = dismiss + "<p style=\"margin:0px;\">" + floatietitle + "<br/><br style=\"font-size:3px;\" />" + message + "" + disableThis + "</p>";
		UpdateBox();	
	}
}

var forcing = false;
function ForceMessage(message,time){
	var origValue = GM_getValue("disableNotices");
	if(origValue == 1){
		GM_setValue("disableNotices",0);
		forcing = true;
	}
	ShowMessage(message,time);
	if(origValue == 1){
		GM_setValue("disableNotices",1);
		forcing = false;
	}
}

/* Version Checker */

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


function GetVersion(force){
	GM_xmlhttpRequest({
		method: 'GET',
		url: 'http://www.1st-soft.net/gdd/version.txt',
		headers: {
			'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
			'Accept': 'application/atom+xml,application/xml,text/xml',
		},
		onload: function(responseDetails) {
			var remoteVersion = myParseFloat(responseDetails.responseText);
			GM_setValue("remoteVersion",String(remoteVersion));
			CheckVersion(force);
		}
	});
}

function CheckVersion(force){
	var remoteVersion = myParseFloat(GM_getValue("remoteVersion"));
	var localVersion = myParseFloat(SCRIPT["version"]);
	var updatemsg = "A new version of GDD is available.<br/><br style=\"font-size:3px;\" /><a href=\"http://www.1st-soft.net/gdd/\" style=\"color:white;\">Visit Homepage</a><br/><br style=\"font-size:3px;\" /><a href=\"http://www.1st-soft.net/gdd/googledocdownload.user.js\" style=\"color:white;\">Download Now</a>";
	if(remoteVersion > localVersion){
		if(force == 0){
			ShowMessage(updatemsg,0);
		}else{
			ForceMessage(updatemsg,0);
		}
	}
}


/* Primary GDD Functions */

function HandleError(e,note){
	if(note == ""){
		ForceMessage("Sorry, there has been an error.",5000);
	}else{
		ForceMessage("Sorry, there has been an error.<br/>" + note,5000);
	}
}

function xpath_query(query){
	try{
		var result = document.evaluate(query, document,null,XPathResult.ANY_TYPE,null);
		var item;
		var set = new Array();
		while(item = result.iterateNext()){
			set[set.length] = item;
		}
		return set;
	}catch(e){
		HandleError(e,"XPath Query Failed");
	}
}

function findFormat(label){
	for(var i = 0; i < formats.length; i++){
		if(formats[i][0] == label){
			return formats[i];
		}
	}
	return false;
}

function ExecuteSearch(event){
	if(event.target.id == "GDD_Disable" || event.target.id == "GDD_Enable"){
		document.getElementById("gddList").style.display="none";
		ActivateNotices();
		return "";
	}
	if(event.target.id == "GDD_Update"){
		document.getElementById("gddList").style.display="none";
		GetVersion(1);
		return "";
	}
	if(event.target.id == "GDD_SELECT_SCOPE" || event.target.id == "GDD_SELECT_SCOPE_0" || event.target.id == "GDD_SELECT_SCOPE_1" || event.target.id == "GDD_SELECT_SCOPE_1_LABEL" || event.target.id == "GDD_SELECT_SCOPE_0_LABEL"){
		return "";
	}
	if(!event.target.id){
		document.getElementById("gddList").style.display="none";
		return "";
	}
	try{
		if(event.target.id == "openGDDMenu" || event.target.id == "openGDDMenuArrow"){
			if(document.getElementById("gddList").style.display!="block"){
				document.getElementById("gddList").style.display="block";
			}else{
				document.getElementById("gddList").style.display="none";
			}
			event.stopPropagation();
			event.preventDefault();
		}else if(event.target.id.substr(0,3) == "GDD"){
			document.getElementById("gddList").style.display="none";
			var format = event.target.id.substr(4,3);
			if(format == "HLP"){
				var message = "How to use the download menu.<br/><br/>";
				message += "Step #1: \nSelect the documents you wish to download by clicking their checkbox.";
				message += "<br/><br/>"+"Step #2: \nClick the drop down menu you used to open this help dialog and (a) select whether you wish to download all documents in your account or only the selected documents. (b) Select a format to download your files in.";
				message += "<br/><br/>"+"Step #3: \nA new window will open with a list of your selected documents and download links. ";
				message += "You can use a download manager such as DownThemAll (DownThemAll.net) to download them all at once.";
				message += "<br/><br/>"+"The Google Document Download script was written by Peter Shafer in July of 2007.";
				message += "<br/>"+"http://www.1st-soft.net/gdd/";
				ShowMessage(message,0);
				return "";
			}
			
			
			var query = "//div[@class='doclistview' and not(contains(@style,'display: none;'))]/descendant::input[@type='checkbox'] | //div[@class='doclistview' and not(contains(@style,'display: none;'))]/descendant::*[@class='doclist-name']";
			var items = xpath_query(query);
			var any = false;
			var files = new Array();
			for(var i = 0; i < items.length; i=i+2){
				if(items[i].checked != ""){
					info = items[i].id.split(".");
					title = items[i+1].innerHTML;
					if(info[2] == "spread"){
						thisformat = findFormat(format)[2];
						key = info[4];
						url = "https://spreadsheets.google.com/"+appPath+"fm?key="+key+"&fmcmd="+thisformat;
						files[files.length] = new Array(title,url,info[2]);
					}else if(info[2] == "doc"){
						thisformat = findFormat(format)[1];
						key = info[4];
						url = "https://docs.google.com/"+appPath+"MiscCommands?command=saveasdoc&exportformat="+thisformat+"&docID="+key;
						files[files.length] = new Array(title,url,info[2]);
					}else if(info[2] == "pres"){
						thisformat = findFormat(format)[3];
						key = info[4];
						url = "https://docs.google.com/"+appPath+"MiscCommands?command=saveasdoc&exportFormat="+thisformat+"&docID="+key;
						files[files.length] = new Array(title,url,info[2]);
					}else if(info[2] == "DoclistBlob"){
						key = info[4];
						url = "https://docs.google.com/"+appPath+"gb?export=download&id=F."+key;
						files[files.length] = new Array(title,url,info[2]);
					}
					any = true;
				}
			}
			if(!any){
				ShowMessage("Please select one or more documents first.",5000);
			}else{
				makepage(files);
			}
			event.stopPropagation();
			event.preventDefault();
		}
	}catch(e){
		HandleError(e,"");
	}
}

function InitiateGDD(){
	document.addEventListener('click', function(event) {
		try{
			ExecuteSearch(event);
		}catch(e){
			
		}
	}, true);
}

function makepage(files){
	var mywin = window.open('about:blank','_blank','',false);
	var linklist = mywin.document.open();
	linklist.write('<html><head><title>Your Downloads</title></head><body>');
	linklist.write("<h2 style=\"margin-top:5px; text-align:center;\">Google Docs & Spreadsheets Downloads</h2><p style=\"text-align:center; margin-left: auto; margin-right: auto; width: 480px;\">Tip: Have a lot of documents?  Use <a href=\"javascript: void(window.open('http://www.downthemall.net/'));\">DownThemAll</a> to download them quickly and easily.</p>");
	linklist.write("<ul style=\"list-style-position:inside; margin-left: auto; margin-right: auto; width: 320px; padding-top:5px;\">");
	
	for(var i = 0; i < files.length; i++){
		var color;
		if(i%2 == 0){
			color = "#E0EDFE";
		}else{
			color = "#ffffff";
		}
		var icon = "";
		if(files[i][2] == "spread" || files[i][2] == "spreadsheet"){
			icon = "<img src=\"/images/doclist/icon_3_spread.gif\" style=\"vertical-align:top;\" />";
		}else if(files[i][2] == "doc" || files[i][2] == "document"){
			icon = "<img src=\"/images/doclist/icon_3_doc.gif\" style=\"vertical-align:top;\" />";
		}else if(files[i][2] == "pres" || files[i][2] == "presentation"){
			icon = "<img src=\"/images/doclist/icon_3_pres.gif\" style=\"vertical-align:top;\" />";
		}
		else if(files[i][2] == "DoclistBlob"){
			icon = "<img src=\"/images/doclist/icon_3_pdf.gif\" style=\"vertical-align:top;\" />";
		}
		linklist.write("<li style=\"overflow:hidden; background-color:"+color+"; list-style-type: none; padding:3px; font-size:14px;\"><nobr>"+icon+" <a href=\""+files[i][1]+"\" style=\"font-weight:bold;\" onClick=\"this.style.fontWeight='normal';\">"+files[i][0]+"</a></nobr></li>");
	}
	
	linklist.write('</ul>');
	linklist.write("<p style=\"text-align:center; margin-left: auto; margin-right: auto; width: 480px;\">Script written by Peter Shafer July '07.  Let me know if you find any bugs (gdd at 1st-soft.net) and check for updates at <a href=\"javascript: void(window.open('http://www.1st-soft.net/gdd/'));\">http://www.1st-soft.net/gdd/</a>.</p>");
	linklist.write('</body></html>');
	linklist.close();
}

function create_item(label,id){
	var item = document.createElement("p");
	item.appendChild(document.createTextNode(label));
	item.setAttribute("onMouseOver","this.style.backgroundColor='#E0EDFE';");
	item.setAttribute("onMouseOut","this.style.backgroundColor='#FFFFFF'");
	item.setAttribute("style","margin:0px;padding:5px;cursor:pointer;text-align:left;");
	item.setAttribute("id",id);
	return item;
}

function create_html(seg){
	var item = document.createElement("p");
	item.innerHTML = seg;
	item.setAttribute("style","margin:0px;padding:5px;cursor:default;text-align:left;background-color:#E1E7F2;");
	item.setAttribute("id","GDD_SELECT_SCOPE");
	return item;
}

function InsertGDDMenu(){
	var checkPage = xpath_query("//div[@id='doclist']");
	if(checkPage.length > 0){

		var button1 = document.createElement("div");
		var topOfPage = document.getElementById('doclist').offsetTop+8;

		button1.setAttribute("style","font-size:13px; padding-right:10px; color:white; width:200px; height: 16px; position:absolute; top:"+topOfPage+"px; right:0px; z-index:10000; text-align:right;");
		button1.setAttribute("onMouseDown","this.style.top='"+(topOfPage+2)+"px'; this.style.right='-2px'");
		button1.setAttribute("id","GDD_DL_BUTTON");
		button1.setAttribute("onMouseUp","this.style.top='"+topOfPage+"px'; this.style.right='0px'");

		var message1 = document.createElement("span");
		message1.appendChild(document.createTextNode("Download Your Documents "));
		message1.setAttribute("style","margin:0px;cursor:pointer;");
		message1.setAttribute("id","openGDDMenu");
		button1.appendChild(message1);
		var arrow = document.createElement("img");
		arrow.setAttribute("style","vertical-align: middle;");
		arrow.setAttribute("src","images/doclist/tool_arrow_dark.gif");
		arrow.setAttribute("id","openGDDMenuArrow");
		message1.appendChild(arrow);
		var button2 = document.createElement("div");
		button2.setAttribute("id","gddList");
		if(appPath == ""){
			button2.setAttribute("style","font-size:12px; border-style: solid; border-width: 1px; border-color: #CCCCCC #999999 #999999 #CCCCCC; background-color:white; color:#0000CC; display:none; position:absolute; top:"+(topOfPage+16)+"px; right:6px; z-index:10000; text-align:right;");
		}else{
			button2.setAttribute("style","font-size:12px; border-style: solid; border-width: 1px; border-color: #CCCCCC #999999 #999999 #CCCCCC; background-color:white; color:#0000CC; display:none; position:absolute; top:"+(topOfPage+16)+"px; right:6px; z-index:10000; text-align:right;");
		}

		var item1 = create_item("as Microsoft Office files (.doc / .xls)","GDD_MSO");
		button2.appendChild(item1);
		var item2 = create_item("as Open Office files (.odt / .ods)","GDD_OOF");
		button2.appendChild(item2);
		var item3 = create_item("as PDF files","GDD_PDF");
		button2.appendChild(item3);
		var item4 = create_item("as Text files (.rtf / .txt)","GDD_TXT");
		button2.appendChild(item4);
		var item5 = create_item("as CSV files (.rtf / .txt)","GDD_CSV");
		button2.appendChild(item5);
		var item7 = create_item("Enable / Disable Notices","GDD_Enable");
		button2.appendChild(item7);
		var item8 = create_item("Check for updates","GDD_Update");
		button2.appendChild(item8);
		var item6 = create_item("Help / About","GDD_HLP");
		button2.appendChild(item6);

		var result = document.getElementsByTagName("body")[0];

		result.appendChild(button1);
		result.appendChild(button2);

	}
}

/* Code to run GDD */

// A list of download format labels and their document/spreadsheet identifier.
var formats = new Array();
formats[formats.length] = new Array("MSO","doc","4","ppt");
formats[formats.length] = new Array("CSV","rtf","5&gid=0","txt");
formats[formats.length] = new Array("OOF","oo","13","ppt");
formats[formats.length] = new Array("PDF","pdf","12","pdf");
formats[formats.length] = new Array("TXT","rtf","23&gid=0","txt");

// Find out if user is using google apps
var appPath = "";
if(document.location.href.indexOf("/a/") != -1){
	var urlPieces = document.location.href.split("/");
	appPath = "a/"+urlPieces[4]+"/";
}

try{
	InitiateNotices();
}catch(e){
	
}

try{
	InitiateGDD();
}catch(e){
	HandleError(e,"GDD failed to initialize.");
}

try{
	InsertGDDMenu();
}catch(e){
	HandleError(e,"GDD failed to create interface.");
}

var lastCheck = myParseInt(GM_getValue("lastCheck"));

if(Date.now() - lastCheck >= 86400000){
	GM_setValue("lastCheck",String(Date.now()));
	GetVersion(0);
}else{
	CheckVersion(0);
}



// This software is licensed under the CC-GNU GPL.
// http://creativecommons.org/licenses/GPL/2.0/
// Google Doc Download was written by Peter Shafer, student developer, in June 2007.