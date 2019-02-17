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
	version: "1.04",					// version
	date: (new Date(2007, 12, 12))		// update date
			.valueOf()
};

function xpath_query(query){
	var result = document.evaluate(query, document,null,XPathResult.ANY_TYPE,null);
	var item;
	var set = new Array();
	while(item = result.iterateNext()){
		set[set.length] = item;
	}
	return set;
}

var formats = new Array();	// A list of download format labels and their document/spreadsheet identifier.
formats[formats.length] = new Array("MSO","doc","4");
formats[formats.length] = new Array("CSV","rtf","5&gid=0");
formats[formats.length] = new Array("OOF","oo","13");
formats[formats.length] = new Array("PDF","pdf","12");
formats[formats.length] = new Array("TXT","rtf","23&gid=0");

// Find out if user is using google apps
var appPath = "";
if(document.location.href.indexOf("/a/") != -1){
	var urlPieces = document.location.href.split("/");
	appPath = "a/"+urlPieces[4]+"/";
}

var linkHeader;
if(document.getElementById("guser")){
	linkHeader = true;
}else{
	linkHeader = false;
}

function findFormat(label){
	for(var i = 0; i < formats.length; i++){
		if(formats[i][0] == label){
			return formats[i];
		}
	}
	return false;
}

document.addEventListener('click', function(event) {
	if(!event.target.id){
		document.getElementById("gddList").style.display="none";
		return "";
	}
	if(event.target.id == "openGDDMenu"){
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
			var message = "How to use the download menu.\n\n";
			message += "Step #1: \nSelect the documents you wish to download by clicking their checkbox.";
			message += "\n\n"+"Step #2: \nClick the drop down menu you used to open this help dialog and select a file format.";
			message += "\n\n"+"Step #3: \nA new window will open with a list of your selected documents and download links. ";
			message += "You can use a download manager such as DownThemAll (DownThemAll.net) to download them all at once.";
			message += "\n\n\n\n"+"The Google Document Download script was written by Peter Shafer in July of 2007.";
			message += "\n"+"http://www.1st-soft.net/gdd/";
			alert(message);
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
					key = info[3];
					url = "https://spreadsheets.google.com/"+appPath+"fm?key="+key+"&fmcmd="+thisformat+"&hl=en_US";
					files[files.length] = new Array(title,url,info[2]);
				}else if(info[2] == "doc"){
					thisformat = findFormat(format)[1];
					key = info[3];
					url = "https://docs.google.com/"+appPath+"MiscCommands?command=saveasdoc&exportformat="+thisformat+"&docID="+key+"&hl=en_US";
					files[files.length] = new Array(title,url,info[2]);
				}else if(info[2] == "pres"){
					key = info[3];
					url = "https://docs.google.com/"+appPath+"UserMiscCommands?command=saveaszip&docID="+key+"&hl=en_US";
					files[files.length] = new Array(title,url,info[2]);
				}
				any = true;
			}
		}
		if(!any){
			alert("Please select one or more documents first.");
		}else{
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
				if(files[i][2] == "spread"){
					icon = "<img src=\"/images/doclist/icon_2_spread.gif\" style=\"vertical-align:top;\" />";
				}else if(files[i][2] == "doc"){
					icon = "<img src=\"/images/doclist/icon_2_doc.gif\" style=\"vertical-align:top;\" />";
				}else if(files[i][2] == "pres"){
					icon = "<img src=\"/images/doclist/icon_2_pres.gif\" style=\"vertical-align:top;\" />";
				}
				linklist.write("<li style=\"overflow:hidden; background-color:"+color+"; list-style-type: none; padding:3px; font-size:14px;\"><nobr>"+icon+" <a href=\""+files[i][1]+"\" style=\"font-weight:bold;\" onClick=\"this.style.fontWeight='normal';\">"+files[i][0]+"</a></nobr></li>");
			}
			
			linklist.write('</ul>');
			linklist.write("<p style=\"text-align:center; margin-left: auto; margin-right: auto; width: 480px;\">Script written by Peter Shafer July '07.  Let me know if you find any bugs (gdd at 1st-soft.net) and check for updates at <a href=\"javascript: void(window.open('http://www.1st-soft.net/gdd/'));\">http://www.1st-soft.net/gdd/</a>.</p>");
			linklist.write('</body></html>');
			linklist.close();
		}
		event.stopPropagation();
		event.preventDefault();
	}
}, true);


var checkPage = xpath_query("//div[@class='doclistview']");
if(checkPage.length > 0){


var button1 = document.createElement("div");

var top = 112;
if(!linkHeader){
	top = top - 4;
}
if(appPath != ""){
	top = top - 6;
}

button1.setAttribute("style","font-size:13px; padding-right:10px; color:white; width:200px; height: 16px; position:absolute; top:"+top+"px; right:0px; z-index:10000; text-align:right;");
button1.setAttribute("onMouseDown","this.style.top='"+(top+2)+"px'; this.style.right='-2px'");
button1.setAttribute("onMouseUp","this.style.top='"+top+"px'; this.style.right='0px'");

var message1 = document.createElement("span");
message1.appendChild(document.createTextNode("Download Selected Documents "));
message1.setAttribute("style","margin:0px;cursor:pointer;");
message1.setAttribute("id","openGDDMenu");
button1.appendChild(message1);
var arrow = document.createElement("img");
arrow.setAttribute("style","vertical-align: middle;");
arrow.setAttribute("src","images/doclist/tool_arrow_dark.gif");
message1.appendChild(arrow);
var button2 = document.createElement("div");
button2.setAttribute("id","gddList");
if(appPath == ""){
	button2.setAttribute("style","font-size:12px; border-style: solid; border-width: 1px; border-color: #CCCCCC #999999 #999999 #CCCCCC; background-color:white; color:#0000CC; display:none; position:absolute; top:128px; right:12px; z-index:10000; text-align:right;");
}else{
	button2.setAttribute("style","font-size:12px; border-style: solid; border-width: 1px; border-color: #CCCCCC #999999 #999999 #CCCCCC; background-color:white; color:#0000CC; display:none; position:absolute; top:118px; right:12px; z-index:10000; text-align:right;");
}

function create_item(label,id){
	var item = document.createElement("p");
	item.appendChild(document.createTextNode(label));
	item.setAttribute("onMouseOver","this.style.backgroundColor='#E0EDFE'");
	item.setAttribute("onMouseOut","this.style.backgroundColor='#FFFFFF'");
	item.setAttribute("style","margin:0px;padding:5px;cursor:pointer;text-align:left;");
	item.setAttribute("id",id);
	return item;
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
var item6 = create_item("Help / About","GDD_HLP");
button2.appendChild(item6);

var result = document.getElementsByTagName("body")[0];

result.appendChild(button1);
result.appendChild(button2);


}

// This software is licensed under the CC-GNU GPL.
// http://creativecommons.org/licenses/GPL/2.0/
// Google Doc Download was written by Peter Shafer, student developer, in June 2007.