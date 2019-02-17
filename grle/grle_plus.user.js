// ==UserScript==
// @name           GRLE Plus
// @namespace      GRLE
// @include        https://www.google.com/reader/*
// @include        http://www.google.com/reader/*
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js
// ==/UserScript==

$(document).ready(function() {
	
	
	
	if($("#main").size() > 0){
		
		var button = document.createElement("button");
		button.innerHTML = "Export Links";
		button.id = "GRLEButton";
		button.style.position = "absolute";
		button.style.right = "10px";
		button.style.top = "37px";
		button.style.cursor = "pointer";
		document.body.appendChild(button);
		
		
		
		var entries = [];
		
		$("#GRLEButton").click(function() {
			entries = new Array()
			var result = $(".entry-main").each(
				function (i) {
					entries[i] = {
						"url": $(this).find(".entry-title-link").first().attr("href"),
						"title": $(this).find(".entry-title").first().text(),
						"note": $(this).find(".entry-annotation-body").first().text()
					};
				}
			);
			
			
			var content = "<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=UTF-8\">\n<!-- This is an\nautomatically generated file.\nIt will be read and overwritten.\nDo Not Edit! -->\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL>\n<p>\n"; 			
			
			for(var i = 0; i < entries.length; i++){
				content += "<DT><A HREF=\""+entries[i].url+"\" TAGS=\"GoogleReader\">"+entries[i].title+"</A>\n"; 
				if(entries[i].note != ""){
					content+="<DD>"+entries[i].note+"\n"; 
				}
			} 
			content += "</DL><p>"; 
			var newwin = window.open("about:blank","_blank"); 
			newwin.document.write(content); 
			newwin.document.close();

			
		});
	}
});
