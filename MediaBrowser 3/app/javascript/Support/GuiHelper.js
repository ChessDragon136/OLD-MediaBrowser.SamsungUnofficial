var GuiHelper = {
		helpPage : null
}

//------------------------------------------------------------------------------------------------
//GUIHelper isn't its own window, it just controls the help contents at the bottom of the screen
//------------------------------------------------------------------------------------------------
GuiHelper.toggleHelp = function(helpPage) {
	this.helpPage = helpPage;
	alert ("Selected page: " + helpPage + "  -  Set page: " + this.helpPage);
	if (document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility == ""){
		document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility = "hidden"
	}
	GuiHelper.setHelpPage(helpPage);
	
	//Unhide help window
	document.getElementById("Help").style.visibility = "";
	
	//Set focus
	document.getElementById("GuiHelper").focus();
}

GuiHelper.keyDown = function() {
	if (document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility == "hidden"){
		document.getElementById("GuiImagePlayer_ScreensaverOverlay").style.visibility = ""
	}
		
	
	//If required for Screensaver call in GuiImagePlayer_Screensaver
	if (document.getElementById("Help").style.visibility == "") {
		//Hide help window
		document.getElementById("Help").style.visibility = "hidden";
		
		//Set focus back to original page
		document.getElementById(this.helpPage).focus();
	}
}

GuiHelper.setHelpPage = function(helpPage) {
	//switch (helpPage) {
		//case "GuiPage_IP":
		//	document.getElementById("Help").innerHTML = "Welcome to a IP";
		//	break;
		//case "GuiUsers":
		//	document.getElementById("Help").innerHTML = "Welcome to a User";
		//	break;
		//case "GuiDisplayOneItem":
		//	document.getElementById("Help").innerHTML = this.generateDisplayOneItemHelp();
		//	break;
		//default:
			//document.getElementById("Help").innerHTML = "Welcome to a page with no help written!";
			document.getElementById("HelpTitle").innerHTML = "Help Page";
			document.getElementById("HelpContent").innerHTML = this.generateDisplayOneItemHelp();
		//	break;
	//}
}

GuiHelper.generateDisplayOneItemHelp = function() {
	if (this.helpPage == "GuiImagePlayer") {
		var htmlToAdd = "Return, Stop - Ends slideshow and returns the user to the previous screen <br> " +
		"Left, Right - Move 1 image backwards or forwards <br>" +
		"Pause - Pause automatic slideshow <br>" +
		"Play - Resume automatic slideshow <br>" +
		//"Red - Toggle Date/Time overlay; None/Date/Date : Time <br>" +
		//"Green - Toggle extended Exif overlay <br>" +
		"Yellow - Mark photo as favourite" 
		return htmlToAdd;
		} else {
		var htmlToAdd = "Return - Returns the user to the previous screen <br> " +
		"Up, Down, Left, Right - Navigation Control <br>" +
		"Enter - Select the highlighted item <br>" +
		"Red - Indexing function that cycles through each letter of the alphabet, allowing quick access to large media collections <br>" +
		"Green - Mark a video item as watched or unwatched <br>" +
		"Blue - Logout the current user and returns to the login page <br>" +
		"Chapter Up, Down - Skips one page's worth of content. ";
		return htmlToAdd;	
	}
	
}

