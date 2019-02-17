// ==UserScript==
// @name           Custom Google Notebook to CSV Converter
// @namespace      1st-soft
// @include        https://www.google.com/notebook/html?nbid=*
// @include        http://www.google.com/notebook/html?nbid=*
// @include        https://google.com/notebook/html?nbid=*
// @include        http://google.com/notebook/html?nbid=*
// ==/UserScript==

function xpath_query(query){
	var set;
	var result = document.evaluate(query, document,null,XPathResult.ANY_TYPE,null);
	var item;
	set = new Array();
	while(item = result.iterateNext()){
		set[set.length] = item;
	}
	return set;
}

var query = "//div[@class='PubSectionHeader' or @class='PubNoteContentArea']";
var items = xpath_query(query);
var section = "";
var item;
var sectionTicker = 0;
var notebook = document.title;


wzone = document.getElementsByTagName("body")[0];


content = "<textarea style=\"height:90%; width:90%;\">";
content += "Notebook\tSection\tNote\n";

for(var i = 0; i < items.length; i++){
	item = items[i];
	if(item.className == "PubSectionHeader"){
		if(sectionTicker==0&&section!=""){
			content += notebook+"\t"+section+"\t\n";
		}
		section = item.firstChild.textContent;
		sectionTicker = 0;
		if(i == items.length - 1){
			content += notebook+"\t"+section+"\t\n";
		}
	}
	if(item.className == "PubNoteContentArea"){
		content += notebook+"\t"+section+"\t"+item.innerHTML.replace(/<br>/g, "    ").replace(/<\/?[^>]+(>|$)/g, "")+"\n";
		sectionTicker++;
	}
}
content += "</textarea>";

wzone.innerHTML = content
