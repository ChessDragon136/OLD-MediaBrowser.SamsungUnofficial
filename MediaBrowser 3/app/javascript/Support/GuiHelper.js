var GuiHelper = {
		helpPage : null
}

//------------------------------------------------------------------------------------------------
//GUIHelper isn't its own window, it just controls the help contents at the bottom of the screen
//------------------------------------------------------------------------------------------------
GuiHelper.toggleHelp = function(helpPage) {
	
	alert ("Selected page: " + helpPage + "  -  Set page: " + this.helpPage);
	
	if (helpPage != this.helpPage) {
		this.helpPage = helpPage;
		GuiHelper.setHelpPage(helpPage);
	}
	if (document.getElementById("Help").style.visibility == "hidden") {
		document.getElementById("Help").style.visibility = "";
	} else {
		document.getElementById("Help").style.visibility = "hidden";
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
			document.getElementById("Help").innerHTML = this.generateDisplayOneItemHelp();
		//	break;
	//}
}

GuiHelper.generateDisplayOneItemHelp = function() {
	var htmlToAdd = "Return - Returns the user to the previous screen <br> " +
			"Up, Down, Left, Right - Navigation Control <br>" +
			"Enter - Select the highlighted item <br>" +
			"Red - Indexing function that cycles through each letter of the alphabet, allowing quick access to large media collections <br>" +
			"Green - Mark a video item as watched or unwatched <br>" +
			"Blue - Logout the current user and returns to the login page <br>" +
			"Chapter Up, Down - Skips one page's worth of content. ";
	return htmlToAdd;
}

