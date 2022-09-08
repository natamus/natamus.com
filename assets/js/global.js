// Scroll gradient
var increase = 0;
var decrease = 0;

$(document).ready(function(e) {
	$(document).trigger(jQuery.Event("scroll"));
	$(window).trigger(jQuery.Event("resize"));

	var pathname = getPath();
	if (pathname != "") {
		$(".menuwrapper").css("opacity", 1.0).show();
		//$("#contact").css("opacity", 1.0).show();
		$(".pageswrapper").show();
	}

	$("#contact").hide();
});

$(document).on('scroll', function(e) {
	var y = $(window).scrollTop();
	scrollColour(y);
});

$(window).on('resize', function(e) {
	var width = $(window).width();

	var logowrapper = $(".menuwrapper .logowrapper");
	if (width < 540) {
		if (logowrapper.is(":visible")) {
			logowrapper.hide();
		}
	}
	else {
		if (!logowrapper.is(":visible")) {
			logowrapper.show();
		}
	}
});

function getPath() {
	return window.location.pathname.replace('/', '').trim().toLowerCase().split("?")[0];
}

function scrollColour(y) {
	var rgb = "rgb(238, 248, 255)";

	var change = y/8;

	if (change > 220) {
		change = 220;
	}

	var r = 238 - change/2;
	var g = 248 - change/3;
	var b = 255 - change/4;

	rgb = "rgb(" + r + ", " + g + ", " + b + ")";

	$("body,html").css("background-color", rgb);
	$("#contact").css("background-color", rgb);
}

// Pages Selector
$(document).on('click','.pageswrapper span', function() {
	var topage = $(this).html().toLowerCase();
	window.location.href = '/' + topage;
}); 

// Contact Natamus
$(".contactwrapper .contactme").on('click', function(e) {
	generateEquation(".contactwrapper");

	$(this).fadeOut(200);
	window.to = setTimeout(function(){
		$(".contactwrapper").removeClass("radius");
		$(document).trigger(jQuery.Event("scroll"));

		$(".contactwrapper .contactform").fadeIn(200);
	}, 200);
});

var texttonum = { "zero" : 0, "one" : 1, "two" : 2, "three" : 3, "four" : 4, "five" : 5, "six" : 6, "seven" : 7, "eight" : 8, "nine" : 9 };
$(document).on('click','.contactform .sendmessage', function(e) {
	e.preventDefault(true);

	var mainclass = ".contactwrapper";
	var contactformdiv = $(this).parents(".contactform");
	if (contactformdiv.hasClass("contactpagewrapper")) {
		mainclass = ".contactpagewrapper";
	}

	var name = $(mainclass + " .contactform #name").val();
	var email = $(mainclass + " .contactform #email").val();
	var subject = $(mainclass + " .contactform #subject").val();
	var message = $(mainclass + " .contactform #message").val();
	if (!name || !email || !subject || !message) {
		confirm("Please make sure you have filled out all the input fields.");
		return;
	}

	if (!validateEmail(email)) {
		confirm("Please enter a valid email address.");
		return;
	}

	var entered = parseInt($(mainclass + " .answer").val());
	if (isNaN(entered)) {
		confirm("Please make sure you have answered the mathematical equation in the bottom right.");
		return;
	}

	var pre = texttonum[$(mainclass + " .pre").html()];
	var post = texttonum[$(mainclass + " .post").html()];
	if ((pre+post) != entered) {
		confirm("You answered the mathematical equation incorrectly, please try again.");
		generateEquation(mainclass);
		return;
	}

	sendEmail(email, name, subject, message, mainclass);
});
$(".contactwrapper .cclose").on('click', function(e) {
	$(".contactwrapper .contactform").fadeOut(200);
	window.to = setTimeout(function(){
		$(".contactwrapper").addClass("radius");
		$(document).trigger(jQuery.Event("scroll"));

		$(".contactwrapper .contactme").fadeIn(200);
	}, 200);
});
$(document).on('click','.contactform .confirmmessage a', function(e) {
	var mainclass = ".contactwrapper";
	var contactformdiv = $(this).parents(".contactform");
	if (contactformdiv.hasClass("contactpagewrapper")) {
		mainclass = ".contactpagewrapper";
	}

	generateEquation(mainclass);
	$(mainclass + " .confirmmessage").fadeOut(200);
	window.to = setTimeout(function(){
		$(mainclass + " .maincontent").fadeIn(200);
	}, 200);
});

var numtotext = { 0 : "zero", 1 : "one", 2 : "two", 3 : "three", 4 : "four", 5 : "five", 6 : "six", 7 : "seven", 8 : "eight", 9 : "nine" };
function generateEquation(mainclass) {
	var pre = Math.floor(Math.random() * 10);
	var post = Math.floor(Math.random() * 10);
	$(mainclass + " .pre").html(numtotext[pre]);
	$(mainclass + " .post").html(numtotext[post]);
	$(mainclass + " .answer").val("");
}

function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function sendEmail(to, name="", subject="", message="", mainclass=".contactwrapper") {
	$.ajax({
		type: "POST",
		url: "/assets/server/natamail.php",
		data: { 
			to : to,
			name : name,
			subject : subject,
			message : message
		},
		success: function(data) {
			$(mainclass + " .maincontent").fadeOut(200);
			window.to = setTimeout(function(){
				$(mainclass + " .confirmmessage").fadeIn(200);
			}, 200);
		},
		error: function(data) {
			alert("Something went wrong while sending the message.");
		}
	});
}