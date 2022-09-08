$(document).ready(function(e) { 
	setMinecraftModCount();

	$("#contact").hide();
});

// Scroll gradient
$(document).on('scroll', function(e) {
	var y = $(window).scrollTop();

	decrease = 1 - (y / 300);
	increase = 0 + (y / 300);
	if (decrease < 0) {
		decrease = 0;
	}
	if (increase > 1) {
		increase = 1;
	}

	// decrease
	if (decrease > 0) {
		if (!$(".arrowwrapper").is(":visible")) {
			$(".arrowwrapper").show();
		}
		$(".arrowwrapper").css("opacity", decrease);
	}
	else {
		$(".arrowwrapper").hide();
	}

	// increase
	if (!$(".contactwrapper").hasClass("radius")) {
		increase = 1;
	}

	if (getPath() != "") {
		return;
	}

	if (increase > 0) {
		if (!$(".menuwrapper").is(":visible")) {
			if (!hoveringmenu) {
				$(".menuwrapper").show();
			}
			if (!hoveringcontact) {
				//$("#contact").show();
			}
		}

		if (!hoveringmenu) {
			$(".menuwrapper").css("opacity", increase); 
		}
		if (!hoveringcontact) {
			//$("#contact").css("opacity", increase);
		}
	}
	else {
		if (!hoveringmenu) {
			$(".menuwrapper").hide();
		}
		if (!hoveringcontact) {
			//$("#contact").hide();
		}
	}
});

// Hover
var hoveringmenu = false;
$(".menuwrapper").hover(function(e) {
	hoveringmenu = true;
	$(".menuwrapper").css("opacity", 1.0);
}, function(e) {
	hoveringmenu = false;
	if (getPath() == "") {
		if (increase > 0) {
			$(".menuwrapper").css("opacity", increase);
		}
		else {
			$(".menuwrapper").hide();
		}
	}
});

var hoveringcontact = false;
$("#contact").hover(function(e) {
	hoveringcontact = true;
	//$("#contact").css("opacity", 1.0);
}, function(e) {
	hoveringcontact = false;
	if (getPath() == "") {
		if (increase > 0) {
			//$("#contact").css("opacity", increase);
		}
		else {
			$("#contact").hide();
		}
	}
});

$("#rickitem").hover(function(e) { 
	$(this).children("img").attr('src', '/assets/images/rick_front.png');
}, function(e) {
	$(this).children("img").attr('src', '/assets/images/rick_back.png');
});

// Resize
$(window).on('resize', function(e) {
	if(!$(".itemwrapper").is(":visible")) {
		$(".itemwrapper").fadeIn(100);
	}
});

// Click functions
$(".arrow").on('click', function(e) {
	var sheight = $(".outer").outerHeight(true);
	$("html, body").animate({scrollTop:sheight}, 1500);
});

// Set variable functions
function setMinecraftModCount() {
	$.ajax({
		url: "https://raw.githubusercontent.com/ricksouth/serilum-mc-mods/master/README.md",
		success: function(data){
			var modcount = 0;

			var dataspl = data.split("\n");
			for (var i = 0; i < dataspl.length; i++) {
				var line = dataspl[i];
				if (line.includes("/mc-mods/")) {
					modcount += 1;
				}

				if (line.includes("Discontinued")) {
					break;
				}
			}

			$("#modcount").html(modcount);
		}
	});
}