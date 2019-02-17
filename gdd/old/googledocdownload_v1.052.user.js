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
	version: "1.52",					// version
	date: (new Date(2008, 5, 24))		// update date
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
	if(event.target.id == "GDD_SELECT_SCOPE" || event.target.id == "GDD_SELECT_SCOPE_0" || event.target.id == "GDD_SELECT_SCOPE_1" || event.target.id == "GDD_SELECT_SCOPE_1_LABEL" || event.target.id == "GDD_SELECT_SCOPE_0_LABEL"){
		return "";
	}
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
			message += "\n\n"+"Step #2: \nClick the drop down menu you used to open this help dialog and (a) select whether you wish to download all documents in your account or only the selected documents. (b) Select a format to download your files in.";
			message += "\n\n\t"+"Note: Presentations are downloaded in PDF format, except when downloading in text format.";
			message += "\n\n"+"Step #3: \nA new window will open with a list of your selected documents and download links. ";
			message += "You can use a download manager such as DownThemAll (DownThemAll.net) to download them all at once.";
			message += "\n\n\n\n"+"The Google Document Download script was written by Peter Shafer in July of 2007.";
			message += "\n"+"http://www.1st-soft.net/gdd/";
			alert(message);
			return "";
		}
		/*
		// Can't access the document feed with default credentials now.
		if(document.getElementById("GDD_SELECT_SCOPE_1").checked){
			
			oldLabel = document.getElementById("GDD_DL_BUTTON").innerHTML;
			document.getElementById("GDD_DL_BUTTON").innerHTML = "Working...";
			
			GM_xmlhttpRequest({
			method: 'GET',
			url: 'https://docs.google.com/feeds/documents/private/full',
			headers: {
			'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
			'Accept': 'application/atom+xml,application/xml,text/xml',
			},
			onload: function(responseDetails) {
			alert(responseDetails.responseText);
			var responseXML = responseDetails.responseText;
			parser=new DOMParser();
			xmlDoc=parser.parseFromString(responseXML,"text/xml");
			var docs = xmlDoc.getElementsByTagName("entry");
			var item, id, title, idURL, info, type;
			var files = new Array();
			
			for(i = 0; i < docs.length; i++){
				for(var j = 0; j < docs[i].childNodes.length; j++){
					if(docs[i].childNodes[j].nodeName == "id"){
						id = docs[i].childNodes[j].childNodes[0].nodeValue;
					}
					if(docs[i].childNodes[j].nodeName == "title"){
						title = docs[i].childNodes[j].childNodes[0].nodeValue
					}
				}
				item = id;
				idURL = "http://docs.google.com/feeds/documents/private/full/";
				info = id.substr(idURL.length,id.length-idURL.length);
				info = info.replace(/%3A/,":");
				info = info.split(":");
				var thisformat;
				if(info[0] == "document"){
					thisformat = findFormat(format)[1];
					url = "https://docs.google.com/"+appPath+"MiscCommands?command=saveasdoc&exportformat="+thisformat+"&docID="+info[1]+"&hl=en_US";
					files[files.length] = new Array(title,url,info[0]);
				}else if(info[0] == "spreadsheet"){
					thisformat = findFormat(format)[2];
					url = "https://spreadsheets.google.com/"+appPath+"fm?key="+info[1]+"&fmcmd="+thisformat+"&hl=en_US";
					files[files.length] = new Array(title,url,info[0]);
				}else if(info[0] == "presentation"){
					thisformat = findFormat(format)[3];
					url = "https://docs.google.com/"+appPath+"MiscCommands?command=saveasdoc&up=1&bg=1&print=0&exportFormat="+thisformat+"&docID="+info[1]+"&hl=en_US";
					files[files.length] = new Array(title,url,info[0]);
				}
			}
			makepage(files);
			document.getElementById("GDD_DL_BUTTON").innerHTML = oldLabel;
			}});
			
			return "";
		}
		*/
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
				}
				any = true;
			}
		}
		if(!any){
			alert("Please select one or more documents first.");
		}else{
			makepage(files);
		}
		event.stopPropagation();
		event.preventDefault();
	}
}, true);




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
					icon = "<img src=\"/images/doclist/icon_2_spread.gif\" style=\"vertical-align:top;\" />";
				}else if(files[i][2] == "doc" || files[i][2] == "document"){
					icon = "<img src=\"/images/doclist/icon_2_doc.gif\" style=\"vertical-align:top;\" />";
				}else if(files[i][2] == "pres" || files[i][2] == "presentation"){
					icon = "<img src=\"/images/doclist/icon_2_pres.gif\" style=\"vertical-align:top;\" />";
				}
				linklist.write("<li style=\"overflow:hidden; background-color:"+color+"; list-style-type: none; padding:3px; font-size:14px;\"><nobr>"+icon+" <a href=\""+files[i][1]+"\" style=\"font-weight:bold;\" onClick=\"this.style.fontWeight='normal';\">"+files[i][0]+"</a></nobr></li>");
			}
			
			linklist.write('</ul>');
			linklist.write("<p style=\"text-align:center; margin-left: auto; margin-right: auto; width: 480px;\">Script written by Peter Shafer July '07.  Let me know if you find any bugs (gdd at 1st-soft.net) and check for updates at <a href=\"javascript: void(window.open('http://www.1st-soft.net/gdd/'));\">http://www.1st-soft.net/gdd/</a>.</p>");
			linklist.write('</body></html>');
			linklist.close();
}




var checkPage = xpath_query("//div[@id='doclist']");
if(checkPage.length > 0){

var button1 = document.createElement("div");

var top = document.getElementById('doclist').offsetTop+8;

button1.setAttribute("style","font-size:13px; padding-right:10px; color:white; width:200px; height: 16px; position:absolute; top:"+top+"px; right:0px; z-index:10000; text-align:right;");
button1.setAttribute("onMouseDown","this.style.top='"+(top+2)+"px'; this.style.right='-2px'");
button1.setAttribute("id","GDD_DL_BUTTON");
button1.setAttribute("onMouseUp","this.style.top='"+top+"px'; this.style.right='0px'");

var message1 = document.createElement("span");
message1.appendChild(document.createTextNode("Download Your Documents "));
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
	button2.setAttribute("style","font-size:12px; border-style: solid; border-width: 1px; border-color: #CCCCCC #999999 #999999 #CCCCCC; background-color:white; color:#0000CC; display:none; position:absolute; top:"+(top+16)+"px; right:6px; z-index:10000; text-align:right;");
}else{
	button2.setAttribute("style","font-size:12px; border-style: solid; border-width: 1px; border-color: #CCCCCC #999999 #999999 #CCCCCC; background-color:white; color:#0000CC; display:none; position:absolute; top:"+(top+16)+"px; right:6px; z-index:10000; text-align:right;");
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

//var item0 = create_html("<form onSubmit=\"return false;\" id=\"GDD_SCOPE_FIELD\"><label id=\"GDD_SELECT_SCOPE_1_LABEL\" for=\"GDD_SELECT_SCOPE_1\">All Docs</label> <input style=\"vertical-align:middle;position:relative;top:-2;\" type=\"radio\" id=\"GDD_SELECT_SCOPE_1\" name=\"GDD_SCOPE\" value=\"1\" /> <label id=\"GDD_SELECT_SCOPE_0_LABEL\" for=\"GDD_SELECT_SCOPE_0\">Selected Docs</label> <input checked=\"checked\" style=\"vertical-align:middle;position:relative;top:-2;\" type=\"radio\" id=\"GDD_SELECT_SCOPE_0\" name=\"GDD_SCOPE\" value=\"0\" /></form>");
//button2.appendChild(item0);

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