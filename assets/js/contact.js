$(document).ready(function(e) { 
	$("#contact").hide();

	var contactcontent = $("#contact .contactform")[0].outerHTML.replace("<br>", " ");
	$(".contactpagewrapper").html(contactcontent);
	$(".contactpagewrapper .contactform").show();
	$(".contactpagewrapper .contactform .cclose").hide();

	generateEquation(".contactpagewrapper");
});