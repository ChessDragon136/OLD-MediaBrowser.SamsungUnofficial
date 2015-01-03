var GuiMainMenu = {	
		menuItems : [],

		pageSelected : "",
		pageSelectedId : 0,
		pageSelectedClass : "",
		
		testModeCount : 0,
		testModeTimeout : null,
			
		isMusicPlaying : false
}

GuiMainMenu.getSelectedMainMenuItem = function() {
	return this.selectedMainMenuItem;
}

//Entry Point from User Menu - ONLY RUN ONCE PER USER LOGIN
GuiMainMenu.start = function() {
	
	//Function to generate random backdrop
	setTimeout(function(){
		var randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=20");
		var randomImageData = Server.getContent(randomImageURL);
		
		for (var index = 0; index < randomImageData.Items.length; index++) {
			if (randomImageData.Items[index ].BackdropImageTags.length > 0) {
				var imgsrc = Server.getImageURL(randomImageData.Items[index ].Id,"Backdrop",960,540,0,false,0);
				document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
				break;
			}
		}
	}, 1000);
	
	//Generate Menu based on whethere there is any of (Folders, TV, Movies, .....)
	this.menuItems.length = 0;
	
	//Generate main menu items
	this.menuItems = Support.generateMainMenu(); 
	
	//Add Header Types
	var htmlToAdd = "<div id=headerUser style='text-align:center;padding-bottom:20px;'>"+Server.getUserName()+"</div>";	
	for (var index = 0; index < this.menuItems.length;index++) {
		htmlToAdd += "<div id=" + this.menuItems[index] + " style='padding-left:5px;'>" + this.menuItems[index].replace(/-/g, ' ').toUpperCase()+ "</div>";	
	}	
	document.getElementById("headerTypes").innerHTML = htmlToAdd;
	
	//Add settings and logout
	htmlToAdd = "<hr>";
	this.menuItems.push("Settings");
	htmlToAdd += "<div id=Settings style='padding-left:5px;'>SETTINGS</div>";	
	this.menuItems.push("Log-Out");
	htmlToAdd += "<div id=Log-Out style='padding-left:5px;'>LOG OUT</div>";	
	document.getElementById("headerTypes").innerHTML += htmlToAdd;
	
	//Get User Image
	document.getElementById("headerUser").style.visibility = "";
	var userURL = Server.getServerAddr() + "/Users/" + Server.getUserID() + "?format=json&Fields=PrimaryImageTag";
	var UserData = Server.getContent(userURL);
	
	if (UserData.PrimaryImageTag) {
		var imgsrc = Server.getImageURL(UserData.Id,"UsersPrimary",60,60,0,false,0);
		document.getElementById("headerUserImage").style.backgroundImage = "url(" + imgsrc + ")";	
	} else {
		document.getElementById("headerUserImage").style.backgroundImage = "url(images/usernoimage.png)";
	}
	
	//Show submenu dependant on selectedMainMenuItem
	this.selectedMainMenuItem = -1;
	this.updateSelectedItems();
	this.selectedMainMenuItem = 0;
	
	//Load Home Page
	var url1 = File.getUserProperty("View1");
	var title1 = File.getUserProperty("View1Name");
	var url2 = File.getUserProperty("View2");
	var title2 = File.getUserProperty("View2Name");
	
	if (url2 != null) {
		GuiPage_HomeTwoItems.start(title1,url1,title2,url2,0,0,true);
	} else {
		GuiPage_HomeOneItem.start(title1,url1,0,0);
	}
}

//Entry Point when called from any page displaying the menu
GuiMainMenu.requested = function(pageSelected, pageSelectedId, pageSelectedClass) {
	//Reset Menus
	this.selectedMainMenuItem = 0;
	this.selectedSubMenuItem = 0;
	
	//UnSelect Selected Item on whatever page is loaded
	this.pageSelected = pageSelected;
	this.pageSelectedId = pageSelectedId;
	
	//Unhighlights the page's selected content
	if (this.pageSelectedId != null) {
		if (pageSelectedClass === undefined) {
			this.pageSelectedClass = "UNDEFINED";
		} else {
			this.pageSelectedClass = pageSelectedClass;
		}
		document.getElementById(pageSelectedId).className = document.getElementById(pageSelectedId).className.replace("Selected","");
		document.getElementById(pageSelectedId).className = document.getElementById(pageSelectedId).className.replace("EpisodeListSelected","");
	}
		
	//Show Header
	document.getElementById("header").style.visibility = "";

	//Show submenu dependant on selectedMainMenuItem
	this.updateSelectedItems();
	
	//Set Focus
	document.getElementById("GuiMainMenu").focus();
}

GuiMainMenu.updateSelectedItems = function () {		
	for (var index = 0; index < this.menuItems.length; index++){	
		if (index == this.selectedMainMenuItem) {
			document.getElementById(this.menuItems[index]).className = "headerSelected";		
		} else {
			document.getElementById(this.menuItems[index]).className = "";
		}	
    }
}

//-------------------------------------------------------------
//      Main Menu Key Handling
//-------------------------------------------------------------
GuiMainMenu.keyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode)
	{	
		case tvKey.KEY_UP:
			alert("Up");
			this.processUpKey();
			break;	
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;		
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItems();
			break;	
		case tvKey.KEY_TOOLS:	
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			//Allows blocking of return from menu if page has no selectable items
			this.processReturnKey();
			break;
		case tvKey.KEY_RED:
			this.toggleTestMode();
			break;
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiMainMenu.processSelectedItems = function() {
	switch (this.menuItems[this.selectedMainMenuItem]) {
	case "Home":
		Support.removeAllURLs();
		
		//Load Home Page
		var url1 = File.getUserProperty("View1");
		var title1 = File.getUserProperty("View1Name");
		var url2 = File.getUserProperty("View2");
		var title2 = File.getUserProperty("View2Name");
		
		if (url2 != null) {
			GuiPage_HomeTwoItems.start(title1,url1,title2,url2,0,0,true);
		} else {
			GuiPage_HomeOneItem.start(title1,url1,0,0);
		}
		
		break;
	case "Media-Folders":
		document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
		var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");	
		GuiDisplayOneItem.start("Media Folders", url,0,0);
		break;
	case "Channels":
		document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
		var url = Server.getCustomURL("/Channels?userId="+Server.getUserID()+"&format=json");	
		GuiDisplayOneItem.start("Channels", url,0,0);
		break;
	case "Collections":	
		document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
		var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=BoxSet&Recursive=true&fields=SortName");
		GuiDisplayOneItem.start("Collections", url,0,0);
		break;		
	case "TV":
		document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
		var url = Server.getItemTypeURL("&IncludeItemTypes=Series&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true");
		GuiDisplay_Series.start("All Series",url,0,0);
		break;	
	case "Movies":
		document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
		var url = Server.getItemTypeURL("&IncludeItemTypes=Movie&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true");
		GuiDisplay_Series.start("All Movies",url,0,0);
		break;
	case "Settings":
		document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
		GuiPage_Settings.start();
		break;	
	case "Log-Out":
		Support.logout();
		break;		
	}
	
	document.getElementById("header").style.visibility = "hidden";
}

GuiMainMenu.processReturnKey = function() {
	if (this.pageSelected != null) {
		
		//As I don't want the settings page in the URL History I need to prevent popping it here (as its not added on leaving the settings page
		if (this.pageSelected != "GuiPage_Settings") {
			Support.removeLatestURL();
		}
		
		//Cheap way to unhighlight all items!
		this.selectedMainMenuItem = -1;
		this.updateSelectedItems();
		this.selectedMainMenuItem = 0;
		
		//Hide Header
		document.getElementById("header").style.visibility = "hidden";
		
		//Set Page GUI elements Correct & Set Focus
		if (this.pageSelectedId != null) {
			if (this.pageSelectedClass == "UNDEFINED") {
				document.getElementById(this.pageSelectedId).className = document.getElementById(this.pageSelectedId).className + " Selected";		
			} else {
				document.getElementById(this.pageSelectedId).className = this.pageSelectedClass;
			}
		}
		document.getElementById(this.pageSelected).focus();	
	}
}

GuiMainMenu.processUpKey = function() {
	this.selectedMainMenuItem--;
	if (this.selectedMainMenuItem < 0) {
		this.selectedMainMenuItem = 0;
	}
	this.updateSelectedItems();
}

GuiMainMenu.processDownKey = function() {
	this.selectedMainMenuItem++;
	if (this.selectedMainMenuItem >= this.menuItems.length) {
		this.selectedMainMenuItem = this.menuItems.length-1;
	}	
	this.updateSelectedItems();
}

GuiMainMenu.toggleTestMode = function() {
	if (this.testModeCount < 2) {
		this.testModeCount++;
		clearTimeout (this.testModeTimeout);
		this.testModeTimeout = setTimeout(function() {
			GuiMainMenu.testModeCount = 0;
		},3000)
	} else {
		clearTimeout (this.testModeTimeout);
		Main.setTestMode();
		GuiNotifications.setNotification("Test mode is now: " + Main.getTestMode(),"Test Mode");
		this.testModeCount = 0;
	}
}