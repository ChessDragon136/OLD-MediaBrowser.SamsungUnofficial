var GuiMainMenu = {	
		menuItems : [],
		subMenuItems : null,
		
		subMenuItemsFilm : ["Suggested", "Latest", "Show All", "Genres"],
		subMenuItemsTV : ["Suggested", "Latest", "Show All", "Genres"],
		subMenuItemsMusic : ["Suggested","Album Artists" , "Albums","Artists"],
		subMenuItemsLiveTV : ["Guide","Channels","Recordings","Scheduled"],
		
		selectedMainMenuItem : 0,
		selectedSubMenuItem : 0,
		
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

GuiMainMenu.showMusicIcon = function() {
	this.isMusicPlaying = true;
	document.getElementById("headerUserMusic").style.display = "";
}

GuiMainMenu.hideMusicIcon = function() {
	this.selectedMainMenuItem = -1;
	this.updateSelectedItems();
	this.selectedMainMenuItem = 0;
	this.isMusicPlaying = false;
	document.getElementById("headerUserMusic").style.display = "none";
}

//Entry Point from User Menu - ONLY RUN ONCE PER USER LOGIN
GuiMainMenu.start = function() {
	
	setTimeout(function(){
		var randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=20");
		var randomImageData = Server.getContent(randomImageURL);
		
		for (var index = 0; index < randomImageData.Items.length; index++) {
			if (randomImageData.Items[index ].BackdropImageTags.length > 0) {
				var imgsrc = Server.getImageURL(randomImageData.Items[index ].Id,"Backdrop",960,540,0,false,0);
				//document.getElementById("page").style.backgroundImage="url(" + imgsrc + ")";
				break;
			}
		}
	}, 1000);
	
	//Generate Menu based on whethere there is any of (Folders, TV, Movies, .....)
	this.menuItems.length = 0;
	
	//Check Media Folders
	var urlMF = Server.getItemTypeURL("&Limit=0");
	var hasMediaFolders = Server.getContent(urlMF);
		
	if (hasMediaFolders.TotalRecordCount > 0) {
		this.menuItems.push("Media-Folders");
	}
		
	//Check TV
	var urlTV = Server.getItemTypeURL("&IncludeItemTypes=Series&Recursive=true&Limit=0");
	var hasTV = Server.getContent(urlTV);
		
	if (hasTV.TotalRecordCount > 0) {
		this.menuItems.push("TV");
	}
		
	//Check Movies
	var urlMovies = Server.getItemTypeURL("&IncludeItemTypes=Movie&Recursive=true&Limit=0");
	var hasMovies = Server.getContent(urlMovies);
	
	alert (urlMovies)
		
	if (hasMovies.TotalRecordCount > 0) {
		this.menuItems.push("Movies");
	}
	//Check Music
	var urlMusic = Server.getItemTypeURL("&IncludeItemTypes=MusicArtist&Recursive=true&Limit=0");
	var hasMusic = Server.getContent(urlMusic);
	
	if (hasMusic.TotalRecordCount == 0) {
		var urlMusic2 = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&Limit=0");
		var hasMusic2 = Server.getContent(urlMusic2);
		
		if (hasMusic2.TotalRecordCount > 0) {
			if (Main.isMusicEnabled() && File.getUserProperty("Experimental")) {
				this.subMenuItemsMusic = ["Suggested","Albums","Artists"],
				this.menuItems.push("Music");
			}	
		}
	} else {
		if (Main.isMusicEnabled() && File.getUserProperty("Experimental")) {
			this.menuItems.push("Music");
		}
	}

	//Check Live TV
	if (Main.isLiveTVEnabled() && hasLiveTV.IsEnabled) {
		var urlLiveTV = Server.getCustomURL("/LiveTV/Info?format=json");
		var hasLiveTV = Server.getContent(urlLiveTV);
		
		for (var index = 0; index < hasLiveTV.EnabledUsers.length; index++) {
			if (Server.getUserID() == hasLiveTV.EnabledUsers[index]) {
				this.menuItems.push("Live-TV");
				break;
			}
		}
	}
	
	//Check Channels
	if (Main.isChannelsEnabled()) {
		var urlChannels = Server.getCustomURL("/Channels?userId="+Server.getUserID()+"&format=json");
		var hasChannels = Server.getContent(urlChannels);
		
		if (hasChannels.Items.length > 0) {
			this.menuItems.push("Channels");
		}
	}
	
	//Check Collection
	var urlCollections = Server.getItemTypeURL("&IncludeItemTypes=BoxSet&Recursive=true&Limit=0");
	var hasCollections = Server.getContent(urlCollections);

	if (hasCollections.TotalRecordCount > 0 && Main.isCollectionsEnabled() == true) {
		this.menuItems.push("Collections");
	}
	
	//Add Header Types
	var htmlToAdd = "";	
	for (var index = 0; index < this.menuItems.length;index++) {
		htmlToAdd += "<div id=" + this.menuItems[index] + ">" + this.menuItems[index].replace(/-/g, ' ').toUpperCase()+ "</div>";	
	}	
	document.getElementById("headerTypes").innerHTML = htmlToAdd;
	
	//Show submenu dependant on selectedMainMenuItem
	this.selectedMainMenuItem = -1;
	this.updateSelectedItems();
	this.selectedMainMenuItem = 0;
	
	//Get User Image
	document.getElementById("headerUser").style.visibility = "";
	var userURL = Server.getServerAddr() + "/Users/" + Server.getUserID() + "?format=json&Fields=PrimaryImageTag";
	var UserData = Server.getContent(userURL);
	
	if (UserData.PrimaryImageTag) {
		var imgsrc = Server.getImageURL(UserData.Id,"UsersPrimary",35,35,0,false,0);
		document.getElementById("headerUserImage").style.backgroundImage = "url(" + imgsrc + ")";	
	} else {
		document.getElementById("headerUserImage").style.backgroundImage = "url(images/usernoimage.png)";
	}
	
	//Load Home Page
	var url1 = File.getUserProperty("View1");
	var title1 = File.getUserProperty("View1Name");
	var url2 = File.getUserProperty("View2");
	var title2 = File.getUserProperty("View2Name");
	
	if (url2 != null) {
		GuiDisplayTwoItems.start(title1,url1,title2,url2,0,0,true);
	} else {
		GuiDisplayOneItem.start(title1,url1,0,0);
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
			document.getElementById(pageSelectedId).className = document.getElementById(pageSelectedId).className.replace("Selected","");
		} else {
			this.pageSelectedClass = pageSelectedClass;
		}
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
			if (index == this.menuItems.length - 1) {
				document.getElementById(this.menuItems[index]).className = "headerTypeLast headerSelected";
			} else {
				document.getElementById(this.menuItems[index]).className = "headerType headerSelected";
			}		
		} else {
			if (index == this.menuItems.length - 1) {
				document.getElementById(this.menuItems[index]).className = "headerTypeLast";
			} else {
				document.getElementById(this.menuItems[index]).className = "headerType";
			}
		}	
    }
	
	//See if Settings or Music button is selected
	if (this.selectedMainMenuItem == this.menuItems.length && this.isMusicPlaying == true){
		document.getElementById("headerUserMusic").style.backgroundImage = "url(images/Note-red.png)";
	} else {
		document.getElementById("headerUserMusic").style.backgroundImage = "url(images/Note.png)";
	}
	
	//See if Settings or Music button is selected
	if ((this.selectedMainMenuItem == this.menuItems.length + 1 && this.isMusicPlaying == true) || (this.selectedMainMenuItem == this.menuItems.length && this.isMusicPlaying == false) ) {
		document.getElementById("headerUserSettings").style.backgroundImage = "url(images/cog-red.png)";
	} else {
		document.getElementById("headerUserSettings").style.backgroundImage = "url(images/cog-white.png)";
	}
	
	//Generate SubMenu Items - Need to list all cases here!!!!!!!!!! 
	this.processSubMenu();
}

GuiMainMenu.processSubMenu = function() {
	switch (this.menuItems[this.selectedMainMenuItem]) {
	case "TV":
		this.subMenuItems = this.subMenuItemsTV;
		this.generateSubMenu();
		break;
	case "Movies":
		this.subMenuItems = this.subMenuItemsFilm;
		this.generateSubMenu();
		break;
	case "Music":
		this.subMenuItems = this.subMenuItemsMusic;
		this.generateSubMenu();
		break;	
	case "Live-TV":
		this.subMenuItems = this.subMenuItemsLiveTV;
		this.generateSubMenu();
		break;
	default:
		document.getElementById("subHeader").innerHTML = "";
		break;
	}
}

//-------------------------------------------------------------
//      Sub Menu Generation Methods
//-------------------------------------------------------------
GuiMainMenu.generateSubMenu = function() {
	var htmlToAdd = "";
	for (var index = 0;index < this.subMenuItems.length;index++) {
		htmlToAdd += "<div id=" + this.subMenuItems[index].replace(/ /g, '') + ">" + this.subMenuItems[index].toUpperCase() + "</div>";	
	}
	document.getElementById("subHeader").innerHTML = htmlToAdd;
	this.selectedSubMenuItem = -1;
	this.updateSelectedSubItems();
	this.selectedSubMenuItem = 0;
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
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.processRightKey();
			break;			
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey(true);
			break;		
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processDownKey(false);
			break;	
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
		
		document.getElementById("subHeader").innerHTML = "";
		
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

GuiMainMenu.processDownKey = function(isDownKey) {
	//Check It isn't setting page or Music page
	if (this.selectedMainMenuItem >= this.menuItems.length) {
		
		if (this.selectedMainMenuItem == this.menuItems.length && this.isMusicPlaying == true){
			if (isDownKey != true) {
				document.getElementById("headerUserMusic").style.backgroundImage = "url(images/Note.png)";
				GuiMusicPlayer.showMusicPlayer(this.pageSelected);
			} else {
				this.processReturnKey();
			}
		}
		
		//See if Settings or Music button is selected
		if ((this.selectedMainMenuItem == this.menuItems.length + 1 && this.isMusicPlaying == true) || (this.selectedMainMenuItem == this.menuItems.length && this.isMusicPlaying == false) ) {
			if (isDownKey != true) {
				document.getElementById("headerUserSettings").style.backgroundImage = "url(images/cog-white.png)";
				GuiPage_Settings.start();
			} else {
				this.processReturnKey();
			}
		}
	} else {
		//Must be in If else this may crash it!
		switch (this.menuItems[this.selectedMainMenuItem]) {
		case "Media-Folders":
			if (isDownKey != true) {
				document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = GuiMainMenu.checkIfLastMenuEntry(this.menuItems[this.selectedMainMenuItem]);
				var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");	
				GuiDisplayOneItem.start("Media Folders", url,0,0);
				
				//Hide Header
				document.getElementById("header").style.visibility = "hidden";
			} else {
				this.processReturnKey();
			}
			break;
		case "Channels":
			if (isDownKey != true) {
				document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = GuiMainMenu.checkIfLastMenuEntry(this.menuItems[this.selectedMainMenuItem]);
				var url = Server.getCustomURL("/Channels?userId="+Server.getUserID()+"&format=json");	
				GuiDisplayOneItem.start("Channels", url,0,0);
				
				//Hide Header
				document.getElementById("header").style.visibility = "hidden";
			} else {
				this.processReturnKey();
			}
			break;	
		case "Collections":
			if (isDownKey != true) {
				document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = GuiMainMenu.checkIfLastMenuEntry(this.menuItems[this.selectedMainMenuItem]); //As Collections is last in list!!
				var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=BoxSet&Recursive=true&fields=SortName");
				GuiDisplayOneItem.start("Collections", url,0,0);
				
				//Hide Header
				document.getElementById("header").style.visibility = "hidden";
			} else {
				this.processReturnKey();
			}
			break;
		case "TV":
		case "Movies":
		case "Music":
		case "Live-TV":	
			this.updateSelectedSubItems();
			document.getElementById("GuiMainMenuSubMenu").focus();
			break;	
		}	
	}
}

GuiMainMenu.checkIfLastMenuEntry = function(selection) {
	if (selection == this.menuItems[this.menuItems.length - 1]) {
		return "headerTypeLast";
	} else {
		return "headerType";
	}
}

GuiMainMenu.processLeftKey = function() {
	this.selectedMainMenuItem--;
	if (this.selectedMainMenuItem < 0) {
		if (this.isMusicPlaying == true) {
			this.selectedMainMenuItem = this.menuItems.length + 1;
		} else {
			this.selectedMainMenuItem = this.menuItems.length;
		}
		
	}
	this.updateSelectedItems();
}

GuiMainMenu.processRightKey = function() {
	this.selectedMainMenuItem++;
	
	//As Settings Button not in array  is > length NOT length - 1
	if (this.isMusicPlaying == true) {
		if (this.selectedMainMenuItem > (this.menuItems.length+1)) {
			this.selectedMainMenuItem = 0;
		}
	} else {
		if (this.selectedMainMenuItem > (this.menuItems.length)) {
			this.selectedMainMenuItem = 0;
		}
	}
	
	this.updateSelectedItems();
}

//-----------------------------------------------------------------------------------------------------------------------------

GuiMainMenu.updateSelectedSubItems = function () {		
	for (var index = 0; index < this.subMenuItems.length; index++){	
		if (index == this.selectedSubMenuItem) {
			if (index == this.subMenuItems.length -1) {
				document.getElementById(this.subMenuItems[index].replace(/ /g, '')).className = "headerTypeLast headerSelected";
			} else {
				document.getElementById(this.subMenuItems[index].replace(/ /g, '')).className = "headerType headerSelected";
			}	
		} else {
			if (index == this.subMenuItems.length -1) {
				document.getElementById(this.subMenuItems[index].replace(/ /g, '')).className = "headerTypeLast";
			} else {
				document.getElementById(this.subMenuItems[index].replace(/ /g, '')).className = "headerType";
			}
		}	
    }
}

GuiMainMenu.keyDownSubMenu = function()
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
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.processSubLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.processSubRightKey();
			break;			
		case tvKey.KEY_UP:
			this.processSubUpKey();
			break;
		case tvKey.KEY_DOWN:
			this.processReturnKey();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedSubItems();
			break;	
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			this.processSubUpKey();
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

GuiMainMenu.processSubUpKey = function() {
	
	this.updateSelectedItems(); //Refresh menu items
	this.selectedSubMenuItem = 0;
	document.getElementById("GuiMainMenu").focus();
}

GuiMainMenu.processSubLeftKey = function() {
	this.selectedSubMenuItem--;
	if (this.selectedSubMenuItem < 0) {
		this.selectedSubMenuItem++;
	}
	this.updateSelectedSubItems();
}

GuiMainMenu.processSubRightKey = function() {
	this.selectedSubMenuItem++;

	if (this.selectedSubMenuItem > (this.subMenuItems.length-1)) {
		this.selectedSubMenuItem--;
	}
	this.updateSelectedSubItems();
}

GuiMainMenu.processSelectedSubItems = function() {
	switch (this.subMenuItems[this.selectedSubMenuItem]) {
	case "Suggested":
		if (this.menuItems[this.selectedMainMenuItem] == "TV") {	
			var url1 = Server.getItemTypeURL("&SortBy=DatePlayed&SortOrder=Descending&IncludeItemTypes=Episode&Filters=IsResumable&Limit=16&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName&CollapseBoxSetItems=false");
			var url2 = Server.getCustomURL("/Shows/NextUp?format=json&Limit=16&IncludeItemTypes=Episode&UserId="+Server.getUserID()+"&ExcludeLocationTypes=Virtual&fields=SortName&CollapseBoxSetItems=false");	
			GuiDisplayTwoItems.start("Resume",url1,"Up Next",url2,0,0,true);
		}
		if (this.menuItems[this.selectedMainMenuItem] == "Movies") {
			var url = Server.getCustomURL("/Movies/Recommendations?format=json&userId="+Server.getUserID()+"&categoryLimit=6&itemLimit=16&fields=SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false");
			GuiDisplayOneItem.start("Suggested For You",url,0,0);
		}
		if (this.menuItems[this.selectedMainMenuItem] == "Music") {
			var url1 = Server.getItemTypeURL("&SortBy=DateCreated&SortOrder=Descending&IncludeItemTypes=MusicAlbum&Limit=10&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName&CollapseBoxSetItems=false");
			var url2 = Server.getItemTypeURL("&SortBy=PlayCount&SortOrder=Descending&IncludeItemTypes=Audio&Limit=10&Recursive=true&Filters=IsPlayed&ExcludeLocationTypes=Virtual&fields=SortName&CollapseBoxSetItems=false");
			GuiDisplayTwoItems.start("Latest Albums",url1,"Frequently Played",url2,0,0,true);
		}
		break;
	case "Genres":

	case "Artists":
		var url = Server.getCustomURL("/Artists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&Fields=SortName&CollapseBoxSetItems=false&StartIndex=0&userId=" + Server.getUserID());	
		//GuiPage_MusicArtist.start("Artists",url); //Shows 5 albums and 5 songs - useless for large collections
		alert (url);
		GuiDisplayOneItem.start("Artists",url,0,0);
		break;
	case "Album Artists":
		var url = Server.getItemTypeURL("&IncludeItemTypes=MusicArtist&SortBy=SortName&SortOrder=Ascending&fields=SortName&CollapseBoxSetItems=false&recursive=true");	
		GuiPage_MusicArtist.start("Album Artists",url);
		break;	
	case "Albums":
		var url1 = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&CollapseBoxSetItems=false&fields=SortName");
		//GuiPage_MusicArtist.start("Albums",url1); //Shows 5 albums and 5 songs - useless for large collections
		GuiDisplayOneItem.start("Albums",url1,0,0);
		break;
	case "Channels":
		var url1 = Server.getCustomURL("/LiveTv/Channels?format=json");
		GuiPage_TvChannel.start("Channels",url1,0,0);
		break;
	case "Guide":
		var url1 = Server.getCustomURL("/LiveTv/Channels?format=json&limit=5");
		GuiPage_TvGuide.start("Guide",url1,0,0);
		break;	
		
	}
	//Hide Header
	document.getElementById("header").style.visibility = "hidden";
	
	document.getElementById(this.menuItems[this.selectedMainMenuItem]).className = document.getElementById(this.menuItems[this.selectedMainMenuItem]).className.replace("headerSelected","");
	document.getElementById("subHeader").innerHTML = "";
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