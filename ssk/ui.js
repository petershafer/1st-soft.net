// document this

var terms = [];
var urls = [];

function hasurl(url){
	for(var i = 0; i < urls.length; i++){
		if(urls[i] == url){
			return true;
		}
	}
	return false;
}

function removeurl(url){
	for(var i = 0; i < urls.length; i++){
		if(urls[i] == url){
			urls[i] = "";
		}
	}
}

function geturl(key){
	switch(key){
		case"msha":
			return "www.msha.gov";
			break;
		case"osha":
			return "www.osha.gov";
			break;
		case"niosh":
			return "www.cdc.gov/niosh";
			break;
	}
	return "";
}

function stillwaiting(){
	$("#tabs div span").html("<div class=\"waiting\"><img src=\"clock.png\" style=\"vertical-align:middle;\" /> Sorry, this is taking longer than usual.</div>");
}

function pingterm(term){
	
}

function saveterm(term){
	var f = false;
	for(var i = 0; i < terms.length; i++){
		if(terms[i] == term){
			f = true;
		}
	}
	if(!f){
		terms[terms.length] = term;
		$("#hist").append("<p><img src=\"delete.png\" class=\"deleteterm\" /> <a href=\"#\" class=\"dosearch\">"+term+"</a></p>");
	}
	$("#savehist").val($("#hist").html());
}

function gettermid(term){
	for(var i = 0; i < terms.length; i++){
		if(terms[i] == term){
			return i;
		}
	}
	return 0;
}

function deliver(context,data,status,diag){
	context = context.split("_");
	dest = context[0];
	term = terms[context[1]];
	start = parseInt(context[2]) + 1;
	var items = data.results;
	var item;
	var pages = data.cursor.pages;
	var page;
	$("#"+dest+"content").html("");
	var moreresults = "";
	var startfrag = "&lt; Prev ";
	var endfrag = "Next &gt;";
	for(var i = 0; i < pages.length; i++){
		page = pages[i];
		if(data.cursor.currentPageIndex+1 != page.label){
			content = "<a class=\"moreresults\" href=\"#\" id=\""+gettermid(term)+","+dest+","+page.start+"\">"+page.label+"</a> ";
		}else{
			content = page.label+" ";
		}
		if(data.cursor.currentPageIndex == page.label){
			startfrag = "<a class=\"moreresults\" href=\"#\" id=\""+gettermid(term)+","+dest+","+page.start+"\">&lt; Prev</a> "
		}
		if(data.cursor.currentPageIndex+2 == page.label){
			endfrag = "<a class=\"moreresults\" href=\"#\" id=\""+gettermid(term)+","+dest+","+page.start+"\">Next &gt;</a>"
		}
		moreresults += content;
	}
	moreresults = "<p class=\"resultnav\">" + startfrag + moreresults + endfrag + "</p>";
	content = "";
	var folder;
	for(var i = 0; i < items.length; i++){
		item = items[i];
		folder = "folder_add.png";
		if(hasurl(item.url)){
			folder = "folder_delete.png";
		}
		content += "<li><p class=\"resulttitle\"><img src=\""+folder+"\" class=\"clipit\" style=\"vertical-align:middle;\" /> <a href=\""+item.url+"\">"+item.title+"</a></p><p class=\"resultdesc\">"+item.content+"</p></li>";
	}
	$("#"+dest+"content").append(moreresults + "<ol start=\""+start+"\">" + content + "</ol>" + moreresults);
	$("#"+dest+"content").append("<p class=\"resultnav\"><a href=\""+data.cursor.moreResultsUrl+"\">More results at Google</a></p>");
}

function fetchresults(term,dest,start){
	site = geturl(dest);
	sitetext = "";
	if(site != ""){
		sitetext = "site:"+site+" ";
	}
	$.getScript("http://ajax.googleapis.com/ajax/services/search/web?q="+escape(sitetext)+escape(" ")+escape(term)+"&rsz=large&v=1.0&context="+dest+"_"+gettermid(term)+"_"+start+"&callback=deliver&start="+parseInt(start),
		function(){}
	);
	$("#"+dest+"content").html("<div class=\"waiting\"><img src=\"lightbulb.png\" style=\"vertical-align:middle;\" /> Working...</div>");
	$("#"+dest+"content span").effect("pulsate",{times:10},1000,stillwaiting);
}

function bindajaxlinks(){
	$(".moreresults").live("click",
		function () {
			var params = this.id.split(",");
			fetchresults(terms[params[0]],params[1],params[2]);
			return false;
		}
	);
	$(".clipit").live("click",
		function () {
			var link = $(this).parent().children("a");
			if(this.src.indexOf("folder_add.png")!=-1){
				this.src="folder_delete.png";
				if(!hasurl(link.attr("href"))){
					$("#clipboard ul").append("<li>"+$(this).parent().parent().html()+"</li>");
				}
				urls[urls.length] = link.attr("href");
			}else{
				$("#results a[href='"+link.attr("href")+"']").parent().children("img").attr("src","folder_add.png");
				$("#clipboard a[href='"+link.attr("href")+"']").parent().parent().remove();
				removeurl(link.attr("href"));
			}
			$("#saveclip").val($("#clipboard ul").html());
			return false;
		}
	);
	$(".dosearch").live("click",
		function () {
			$("#termprompt").val($(this).text());
			$("#searchprompt").submit();
			return false;
		}
	);
	
	$(".deleteterm").live("click",
		function () {
			var term = $(this).parent().children("a").text();
			for(var i = 0; i < terms.length; i++){
				if(terms[i] == term){
					terms[i] = "";
				}
			}
			$(this).parent().remove();
			$("#savehist").val($("#hist").html());
			return false;
		}
	);
	
	
}

$(document).ready(function(){


	$(".exit").hover(
		function () {
			$(this).addClass("ui-state-hover");
			$(this).removeClass("user-ui-icon");
		}, 
		function () {
			$(this).removeClass("ui-state-hover");
			$(this).addClass("user-ui-icon");
		}
	);
	
	
	$("#exitresults").click(
		function () {
			$("#results").hide();
			$("#tagcloud").show();
		}
	);
	
	$("#searchprompt").submit(
		function () {
			
			var term = $("#termprompt").val();
			saveterm(term);
			$("#termdisplay").html(term);
			$("#results").show();
			$("#tagcloud").hide();
			
			fetchresults(term,"www",0);
			fetchresults(term,"msha",0);
			fetchresults(term,"osha",0);
			fetchresults(term,"niosh",0);
			
			return false;
		}
	);
	
	$("#clipboard ul").html($("#saveclip").val());
	$("#clipboard ul li a").each(function (i) {
		urls[urls.length] = this.href;
	});
	$("#hist").html($("#savehist").val());
	$("#hist p a").each(function (i) {
		terms[terms.length] = $(this).text();
	});
	
	if($("#termprompt").val() != ""){
		$("#searchprompt").submit();
	}
	
	bindajaxlinks();
	
	
});




$(function() {
	$("#tabs").tabs();
});
