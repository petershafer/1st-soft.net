// ==UserScript==
// @name           GDD List Maker
// @namespace      1st-soft
// @include        https://docs.google.com/feeds/documents/private/full
// ==/UserScript==


var files;

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


function findFormat(label){
	for(var i = 0; i < formats.length; i++){
		if(formats[i][0] == label){
			return formats[i];
		}
	}
	return false;
}



function makepage(files){
			//var mywin = window.open('about:blank','_blank','',false);
			//var linklist = mywin.document.open();
			var linklist = window.document;
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










if(document.title=="Authorization required"){

var page = document.getElementsByTagName("body")[0];
page.innerHTML = "<h1>Please Log-in</h1>";
document.title = "First, log-in";

page.innerHTML += "<p>Username: <input id=\"u\" type=\"text\" /></p>"
page.innerHTML += "<p>Password: <input id=\"p\" type=\"password\" /></p>"
page.innerHTML += "<p><input id=\"login\" type=\"button\" value=\"Login\" /></p>"
page.innerHTML += "<p>Your login info WILL NOT be stored by GDD or Greasemonkey.</p>"

}


document.addEventListener('click', function(event) {
	if(event.target.id == "login"){
		
		if(document.getElementById("u").value == "" || document.getElementById("p").value == ""){
			alert("Nothing entered!");
			return false;
		}
		
		//alert("Logging in...");
		var u = document.getElementById("u").value;
		var p = document.getElementById("p").value;
		document.getElementsByTagName("body")[0].innerHTML = "<p>Working...</p>";
		
		GM_xmlhttpRequest({
		method: 'POST',
		url: 'https://www.google.com/accounts/ClientLogin',
		headers: {
			'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
			'Content-type': 'application/x-www-form-urlencoded',
		},
		data: 'accountType=HOSTED_OR_GOOGLE&Email='+u+'&Passwd='+p+'&service=writely&source=GDD-2.00',
		onload: function(responseDetails) {
			//alert("Received response\n"+responseDetails.responseText);
			//document.getElementsByTagName("body")[0].innerHTML += "<p>"+responseDetails.status+"</p>";
			//document.getElementsByTagName("body")[0].innerHTML += "<p>"+responseDetails.statusText+"</p>";
			//document.getElementsByTagName("body")[0].innerHTML += "<p>"+responseDetails.responseText+"</p>";
			
			var index = responseDetails.responseText.indexOf("Auth=");
			var auth = responseDetails.responseText.substr(index+5,responseDetails.responseText.length-(index+5)-1);
			
			//alert("Sending feed request");
			// 
			GM_xmlhttpRequest({
				method: 'GET',
				url: 'https://docs.google.com/feeds/documents/private/full',
				headers: {
					'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml',
					'Authorization': 'GoogleLogin auth='+auth,
				},
				onload: function(responseDetails) {
					//alert(responseDetails.status);
					//document.getElementsByTagName("body")[0].innerHTML += "<p>"+responseDetails.responseText+"</p>";
					
					
					
					
					
				var format = "MSO";
				var responseXML = responseDetails.responseText;
				parser=new DOMParser();
				xmlDoc=parser.parseFromString(responseXML,"text/xml");
				var docs = xmlDoc.getElementsByTagName("entry");
				var item, id, title, idURL, info, type;
				files = new Array();
				
				//alert(docs + ' ' + docs.length);
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
				
				
					
					
					
					
					
					
					
					
				},
				onreadystatechange: function(responseDetails) {
					//alert('status change');
				},
			});
			//alert("Done sending feed request");
			
			//alert(auth);
			
			
			
		}
		});
		//alert("Done sending request");
		
		event.stopPropagation();
		event.preventDefault();
	}
}, true);