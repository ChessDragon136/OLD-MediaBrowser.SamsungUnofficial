var GuiPage_Settings = {
		AllData : null,
		UserData : null,
		ServerUserData : null,

		selectedItem : 0,
		selectedBannerItem : 0,
		selectedSubItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 10,
		
		bannerItems : ["User Settings","Server Settings","TV Settings"],
		currentView : null,
		currentViewSettings : null,
		currentViewSettingsName : null,
		currentViewSettingsDefaults : null,
		
		CurrentSubSettings : [],
		CurrentSettingValue : null,
		
		//Per Setting Type List of settings, names & defaults
		Settings : ["Default","View1","View2","SkipShow","SeasonLabel","AutoPlay","ScreensaverImages","ScreensaverTimeout"],
		SettingsName : ["Default User: ","Home View 1: ","Home View 2: ","Skip TV Show Page: ","Use Alternate Season Label: ","Auto Play Next Episode: ", "Screensaver Image Source: ", "Screensaver Timeout: "],
		SettingsDefaults : [false,"ddddd","aaaaa",false,false,false,"Media",300000],
		
		TVSettings : ["Bitrate","Dolby","DTS","TranscodeDSeries"],
		TVSettingsName : ["Bitrate: ","Enable Dolby Digital Playback: ","Enable DTS Playback: ","Enable Transcoding on D Series"],
		TVSettingsDefaults : [60,false,false,false],
		
		ServerSettings : ["DisplayMissingEpisodes","DisplayUnairedEpisodes"], //Add back in SubtitleMode when ready
		ServerSettingsName : ["Display Missing Episodes: ", "Display Unaired Episodes: "], //Subtitle Mode:  
		ServerSettingsDefaults : [false,false], //Not actually Used but implemented for clean code!!! Values read from Server so no default needed!
		
		//Per Setting Options & Values
		DefaultOptions : ["True","False"],
		DefaultValues : [true,false], 
		
		View1Options : [], 
		View1Values : [], 
		
		View2Options : [], 
		View2Values : [], 

		TvConnectionOptions : ["120MB/s","100MB/s","80MB/s","60MB/s","40MB/s","30MB/s","20MB/s","15MB/s","10MB/s","8MB/s","6MB/s","5MB/s","4MB/s","3MB/s","2MB/s","1MB/s","0.5MB/s"], 
		TvConnectionValues : [120,100,80,60,40,30,20,15,10,8,6,5,4,3,2,1,0.5], 
		
		ScreensaverImagesOptions : ["Photos from Media Folders","Images from TVs or Movies"],
		ScreensaverImagesValues : ["Media","Metadata"],
		
		ScreensaverTimeoutOptions : ["20 Minutes", "10 Minutes", "5 Minutes", "2 Minutes", "1 Minute"],
		ScreensaverTimeoutValues : [1200000,600000,300000,120000,60000],
		
		SubtitleModeOptions : ["Default","Only Forced Subtitles", "Always Play Subtitles", "None"],
		SubtitleModeValues : ["Default","OnlyForced", "Always", "None"]
}

GuiPage_Settings.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_Settings.initiateViewValues = function() {
	ResumeAllItemsURL = Server.getServerAddr() + "/Users/"+Server.getUserID()+"/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&Filters=IsResumable&Limit=7&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName";
	TVNextUp = Server.getServerAddr() + "/Shows/NextUp?format=json&Limit=7&IncludeItemTypes=Episode&UserId="+Server.getUserID()+"&ExcludeLocationTypes=Virtual&fields=SortName";
	SuggestedMovies = Server.getCustomURL("/Movies/Recommendations?format=json&userId="+Server.getUserID()+"&categoryLimit=6&itemLimit=7&fields=SortName&CollapseBoxSetItems=false");
	MediaFolders = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
	LatestTV = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&Limit=7&isPlayed=false&IsFolder=false&fields=SortName,Overview,Genres,RunTimeTicks");
	LatestMovies = Server.getItemTypeURL("&Limit=7&IncludeItemTypes=Movie&SortBy=DateCreated&SortOrder=Descending&fields=SortName&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual&recursive=true&Filters=IsUnplayed");

	this.View1Options = ["Resume All Items","TV Next Up","Suggested For You","Media Folders","New TV","New Movies"];
	this.View1Values = [ResumeAllItemsURL,TVNextUp,SuggestedMovies,MediaFolders,LatestTV,LatestMovies];
	this.View2Options = ["None","Resume All Items","TV Next Up","Suggested For You","Media Folders","New TV","New Movies"];
	this.View2Values = [null,ResumeAllItemsURL,TVNextUp,SuggestedMovies,MediaFolders,LatestTV,LatestMovies];
	
	this.SettingsDefaults[1] = ResumeAllItemsURL;
	this.SettingsDefaults[2] = TVNextUp;
}

GuiPage_Settings.start = function() {	
	//Reset Vars
	this.selectedItem = 0;
	this.selectedBannerItem = 0;
	this.selectedSubItem = 0;
	
	//Get View Vaules - Specific per user due to Id!
	this.initiateViewValues();
	
	//Load Data
	var fileJson = JSON.parse(File.loadFile());  
	this.AllData = fileJson;
	this.UserData = fileJson.Servers[File.getServerEntry()].Users[File.getUserEntry()];
	
	//Check settings in file - If not write defaults
	this.checkSettingsInFile();
	
	//Load Server Data for User
	var userURL = Server.getServerAddr() + "/Users/" + Server.getUserID() + "?format=json";
	this.ServerUserData = Server.getContent(userURL);
	if (this.ServerUserData == null) { return; }
	
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='guiDisplay_Series-Banner'></div><div id='guiTV_Show_Title' class='guiPage_Settings_Title'>Client Settings for "+this.UserData.UserName +" </div>\ \
		<div id='guiPage_Settings_Settings' class='guiPage_Settings_Settings'></div>" +
		"<div id='guiPage_Settings_Overview' class='guiPage_Settings_Overview'>" +
			"<div id=guiPage_Settings_Overview_Title></div>" +
			"<div id=guiPage_Settings_Overview_Content></div>" +
		"</div>";
	
	//Create Banner Items
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index != this.bannerItems.length-1) {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding'>"+this.bannerItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";			
		} else {
			document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem'>"+this.bannerItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";					
		}
	}

	//Set default view as the User Settings Page
	this.currentView = "User Settings";
	this.currentViewSettings = this.Settings;
	this.currentViewSettingsName = this.SettingsName;
	this.currentViewSettingsDefaults = this.SettingsDefaults;
	
	//Update Displayed & Updates Settings
	this.updateDisplayedItems();
	this.updateSelectedItems();
	
	document.getElementById("GuiPage_Settings").focus();
}

GuiPage_Settings.checkSettingsInFile = function() {
	var changed = false;
	
	for (var index = 0; index < this.Settings.length;index++) {
		if (this.UserData[this.Settings[index]] === undefined) {
			this.UserData[this.Settings[index]] = this.SettingsDefaults[index];
			changed = true; 
		}
	}
	
	if (changed == true) {
		File.updateUserSettings(this.UserData);
		changed = false;
	}
	
	//Check TV Settings
	changed = false;
	if (this.AllData.TV === undefined) {
		this.AllData.TV = {};
		File.writeAll (this.AllData);
	}
	
	for (var index = 0; index < this.TVSettings.length;index++) {
		if (this.AllData.TV[this.TVSettings[index]] === undefined) {
			this.AllData.TV[this.TVSettings[index]] = this.TVSettingsDefaults[index];
			changed = true; 
		}
	}
	
	if (changed == true) {
		File.writeAll(this.AllData);
		changed = false;
	}
};

GuiPage_Settings.updateDisplayedItems = function() {
	var htmlToAdd = "<table class=guiSettingsTable>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.currentViewSettings.length); index++) {
		//Finds the setting in the file and generates the correct current set value
		//Only needs new entries here if they have differing settings (true false is top so works for many settings)
		var Setting = "";
		switch (this.currentViewSettings[index]) {
		case "Default":
		case "SkipShow":
		case "SeasonLabel":
		case "AutoPlay":	
			for (var index2 = 0; index2 < this.DefaultValues.length; index2++) {
				if (this.DefaultValues[index2] == this.UserData[this.currentViewSettings[index]]) {
					Setting = this.DefaultOptions[index2];
					break;
				}
			}
			break;
		case "View1":
			for (var index2 = 0; index2 < this.View1Values.length; index2++) {
				if (this.View1Values[index2] == this.UserData[this.currentViewSettings[index]]) {
					Setting = this.View1Options[index2];
					break;
				}
			}
			break;
		case "View2":
			for (var index2 = 0; index2 < this.View2Values.length; index2++) {
				if (this.View2Values[index2] == this.UserData[this.currentViewSettings[index]]) {
					Setting = this.View2Options[index2];
					break;
				}
			}
			break;
		case "ScreensaverImages":
			for (var index2 = 0; index2 < this.View2Values.length; index2++) {
				if (this.ScreensaverImagesValues[index2] == this.UserData[this.currentViewSettings[index]]) {
					Setting = this.ScreensaverImagesOptions[index2];
					break;
				}
			}
			break;
		case "ScreensaverTimeout":
			for (var index2 = 0; index2 < this.View2Values.length; index2++) {
				if (this.ScreensaverTimeoutValues[index2] == this.UserData[this.currentViewSettings[index]]) {
					Setting = this.ScreensaverTimeoutOptions[index2];
					break;
				}
			}
			break;	
		case "Dolby":
		case "DTS":	
		case "TranscodeDSeries":
			for (var index2 = 0; index2 < this.DefaultValues.length; index2++) {
				if (this.DefaultValues[index2] == this.AllData.TV[this.currentViewSettings[index]]) {
					Setting = this.DefaultOptions[index2];
					break;
				}
			}
			break;	
		case "Bitrate":
			for (var index2 = 0; index2 < this.TvConnectionValues.length; index2++) {
				if (this.TvConnectionValues[index2] == this.AllData.TV[this.currentViewSettings[index]]) {
					Setting = this.TvConnectionOptions[index2];
					break;
				}
			}
			break;	
		case "SubtitleMode":
			for (var index2 = 0; index2 < this.TvConnectionValues.length; index2++) {
				if (this.SubtitleModeValues[index2] == this.ServerUserData.Configuration.SubtitleMode) {
					Setting = this.SubtitleModeOptions[index2];
					break;
				}
			}
			break;
		case "DisplayMissingEpisodes":
			for (var index2 = 0; index2 < this.TvConnectionValues.length; index2++) {
				if (this.DefaultValues[index2] == this.ServerUserData.Configuration.DisplayMissingEpisodes) {
					Setting = this.DefaultOptions[index2];
					break;
				}
			}
			break;
		case "DisplayUnairedEpisodes":
			for (var index2 = 0; index2 < this.TvConnectionValues.length; index2++) {
				if (this.DefaultValues[index2] == this.ServerUserData.Configuration.DisplayUnairedEpisodes) {
					Setting = this.DefaultOptions[index2];
					break;
				}
			}
			break;	
		}
		htmlToAdd += "<tr class=guiSettingsRow><td id="+index+">" + this.currentViewSettingsName[index] + "</td><td id=Value"+index+" class=guiSettingsTD>"+Setting+"</td></tr>";
	}
	document.getElementById("guiPage_Settings_Settings").innerHTML = htmlToAdd + "</table>";
}

GuiPage_Settings.updateSelectedItems = function() {
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.currentViewSettings.length); index++) {
		if (index == this.selectedItem) {
			document.getElementById(index).className = "guiSettingsTD GuiPage_Setting_Selected";
		} else {
			document.getElementById(index).className = "guiSettingsTD GuiPage_Setting_UnSelected";
		}
	}
	
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem + 1) + "/" + (this.bannerItems.length);
	} else {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + (this.currentViewSettingsName.length);
		this.setOverview();
	}		
}

GuiPage_Settings.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding red";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem red";
			}		
		} else {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem";
			}
		}
	}
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedBannerItem + 1) + "/" + (this.bannerItems.length);
	} else {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + (this.currentViewSettingsName.length);
		this.setOverview();
	}
}

GuiPage_Settings.processSelectedItem = function() {	
	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "User Settings":
			//Set default view as the User Settings Page
			this.currentViewSettings = this.Settings;
			this.currentViewSettingsName = this.SettingsName;
			this.currentViewSettingsDefaults = this.SettingsDefaults;
			document.getElementById("guiTV_Show_Title").innerHTML = "Client Settings for "+this.UserData.UserName;
			break;
		case "TV Settings":
			//Set default view as the User Settings Page
			this.currentViewSettings = this.TVSettings;
			this.currentViewSettingsName = this.TVSettingsName;
			this.currentViewSettingsDefaults = this.TVSettingsDefaults;
			document.getElementById("guiTV_Show_Title").innerHTML = "TV Settings";
			break;
		case "Server Settings":
			//Set default view as the User Settings Page
			this.currentViewSettings = this.ServerSettings;
			this.currentViewSettingsName = this.ServerSettingsName;
			this.currentViewSettingsDefaults = this.ServerSettingsDefaults;
			document.getElementById("guiTV_Show_Title").innerHTML = "Server Settings for "+this.UserData.UserName;
			break;	
		}
		//Set Current View - needed to write to file
		this.currentView = this.bannerItems[this.selectedBannerItem];
		
		//Update Displayed & Updates Settings
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateDisplayedItems();
		this.updateSelectedItems();
		this.updateSelectedBannerItems();
	} else {
		document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_SubSelected";
		document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD GuiPage_Setting_Selected";
		
		switch (this.currentViewSettings[this.selectedItem]) {
		case "Default":
		case "SkipShow":	
		case "SeasonLabel":	
		case "AutoPlay":
		case "Dolby":
		case "DTS":	
		case "DisplayMissingEpisodes":
		case "DisplayUnairedEpisodes":	
		case "TranscodeDSeries":	
			this.CurrentSubSettings = this.DefaultOptions;
			break;
		case "View1":
			this.CurrentSubSettings = this.View1Options;
			break;
		case "View2":
			this.CurrentSubSettings = this.View2Options;
			break;
		case "ScreensaverImages":
			this.CurrentSubSettings = this.ScreensaverImagesOptions;
			break;
		case "ScreensaverTimeout":
			this.CurrentSubSettings = this.ScreensaverTimeoutOptions;
			break;	
		case "Bitrate":
			this.CurrentSubSettings = this.TvConnectionOptions;
			break;
		case "SubtitleMode":
			this.CurrentSubSettings = this.SubtitleModeOptions;
			break;	
		}
		
		//Set the selectedSubItem to the existing setting
		this.selectedSubItem = 0;
		this.CurrentSettingValue = document.getElementById("Value"+this.selectedItem).innerHTML;
		
		for (var index = 0; index < this.CurrentSubSettings.length; index++) {
			if (this.CurrentSubSettings[index] == this.CurrentSettingValue) {
				this.selectedSubItem = index;
				break;
			}
		}		
		document.getElementById("GuiPage_SettingsBottom").focus();
	}
};
 

GuiPage_Settings.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		//Need Logout Key
		case tvKey.KEY_UP:
			alert("UP");	
			this.processUpKey();
			break;
		case tvKey.KEY_DOWN:
			alert("DOWN");	
			this.processDownKey();
			break;	
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.processRightKey();
			break;	
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem();
			break;
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_UnSelected";
			GuiMainMenu.requested("GuiPage_Settings",this.selectedItem,"guiSettingsTD GuiPage_Setting_Selected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_Settings");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiPage_Settings.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem == -2) {
		this.selectedItem = -1;
	} else if (this.selectedItem == -1) {
		this.selectedBannerItem = 0;
		this.updateSelectedItems();
		this.updateSelectedBannerItems();
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}	
}

GuiPage_Settings.processDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.currentViewSettings.length) {
			this.selectedItem = (this.currentViewSettings.length-1);
			if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
				this.updateDisplayedItems();
			}
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}
	}
	this.updateSelectedItems();
}

GuiPage_Settings.processLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem < 0) {
			this.selectedBannerItem = 0;
		} else {
			this.updateSelectedBannerItems();	
		}	
	}
}

GuiPage_Settings.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
			this.selectedBannerItem--;
		} else {
			this.updateSelectedBannerItems();	
		}
	} else {
		this.processSelectedItem();
	}
}

//------------------------------------------------------------------------------------------------------------------------

GuiPage_Settings.processSelectedSubItem = function() {
	switch (this.currentViewSettings[this.selectedItem]) {
	case "Default":	
		this.UserData.Default = this.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
		
		//Default User ONLY - Check All Other Users and set to false
		if (this.currentViewSettings[this.selectedItem] == "Default") {
			var fileJson = JSON.parse(File.loadFile());  
			for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
				fileJson.Servers[File.getServerEntry()].Users[index].Default = false;
			}
			File.updateServerSettings(fileJson.Servers[File.getServerEntry()]);
		}
		break;
	case "SkipShow":	
	case "SeasonLabel":	
	case "AutoPlay":	
		this.UserData[this.currentViewSettings[this.selectedItem]] = this.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
		break;
	case "View1":
		this.UserData.View1Name = this.View1Options[this.selectedSubItem];
		this.UserData.View1 = this.View1Values[this.selectedSubItem];
		this.CurrentSettingValue = this.View1Options[this.selectedSubItem];
	
		Support.updateHomePageURLs(this.UserData.View1Name ,this.UserData.View1,this.UserData.View2Name,true);
		break;
	case "View2":
		this.UserData.View2Name = this.View2Options[this.selectedSubItem];
		this.UserData.View2 = this.View2Values[this.selectedSubItem];
		this.CurrentSettingValue = this.View2Options[this.selectedSubItem];
	
		Support.updateHomePageURLs(this.UserData.View2Name ,this.UserData.View2,this.UserData.View2Name,false);
		break;
	case "ScreensaverImages":
		this.UserData.ScreensaverImages = this.ScreensaverImagesValues[this.selectedSubItem];
		this.CurrentSettingValue = this.ScreensaverImagesOptions[this.selectedSubItem];
		break;	
	case "ScreensaverTimeout":
		this.UserData.ScreensaverTimeout = this.ScreensaverTimeoutValues[this.selectedSubItem];
		this.CurrentSettingValue = this.ScreensaverTimeoutOptions[this.selectedSubItem];
		break;			
	case "Dolby":
	case "DTS":
	case "TranscodeDSeries":	
		this.AllData.TV[this.currentViewSettings[this.selectedItem]] = this.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
		break;
	case "Bitrate":
		this.AllData.TV.Bitrate = this.TvConnectionValues[this.selectedSubItem];
		this.CurrentSettingValue = this.TvConnectionOptions[this.selectedSubItem];
		break;
	case "SubtitleMode":
		this.ServerUserData.Configuration.SubtitleMode = this.SubtitleModeValues[this.selectedSubItem];
		this.CurrentSettingValue = this.SubtitleModeOptions[this.selectedSubItem];
		
		//Update Server	
		Server.updateUserConfiguration(JSON.stringify(this.ServerUserData.Configuration));
		break;	
	case "DisplayMissingEpisodes":
		this.ServerUserData.Configuration.DisplayMissingEpisodes = this.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
			
		//Update Server	
		Server.updateUserConfiguration(JSON.stringify(this.ServerUserData.Configuration));
		break;	
	case "DisplayUnairedEpisodes":
		this.ServerUserData.Configuration.DisplayUnairedEpisodes = this.DefaultValues[this.selectedSubItem];
		this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
				
		//Update Server	
		Server.updateUserConfiguration(JSON.stringify(this.ServerUserData.Configuration));
		break;	
	}
		
	switch (this.currentView) {
		case "User Settings":
			File.updateUserSettings(this.UserData);
		break;
		case "TV Settings":
			File.writeAll(this.AllData);
		break;
	}
		
	document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSettingValue;
	document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD GuiPage_Setting_UnSelected";
	document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_Selected";
	document.getElementById("GuiPage_Settings").focus();
}


GuiPage_Settings.bottomKeyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		case tvKey.KEY_UP:
			alert("UP");	
			this.selectedSubItem--;
			if (this.selectedSubItem < 0) {
				this.selectedSubItem = this.CurrentSubSettings.length-1;
			} 
			document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSubSettings[this.selectedSubItem];
			break;
		case tvKey.KEY_DOWN:
			alert("DOWN");	
			this.selectedSubItem++;
			if (this.selectedSubItem > this.CurrentSubSettings.length-1) {
				this.selectedSubItem = 0;;
			}
			document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSubSettings[this.selectedSubItem];
			break;
		case tvKey.KEY_LEFT:	
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			document.getElementById("Value"+this.selectedItem).innerHTML = this.CurrentSettingValue;		
			document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD GuiPage_Setting_UnSelected";
			document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_Selected";

			document.getElementById("GuiPage_Settings").focus();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedSubItem();
			break;
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD GuiPage_Setting_UnSelected";
			document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_UnSelected";
			document.getElementById("GuiPage_Settings").focus();
			GuiMainMenu.requested("GuiPage_Settings",this.selectedItem,"guiSettingsTD GuiPage_Setting_Selected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_Settings");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiPage_Settings.setOverview = function() {
	switch (this.currentViewSettings[this.selectedItem]) {
		case "Default":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Default User";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Setting the default user to True allows for the app to sign in the user automatically." +
					"<br><br>Changing this setting to True will change all other users to False";
			break;
		case "View1":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Home View 1";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Sets the content of the first view of the Home page" +
					"<br><br>Available Choices<ul style='padding-left:22px'><li>Resume All Items</li><li>TV Next Up</li><li>Suggested For You</li><li>Media Folders</li><li>New TV</li><li>New Movies</li></ul>" +
					"<br><br>Setting Home View 2 to None will show more content of this view";
			break;
		case "View2":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Home View 2";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Sets the content of the first view of the Home page" +
					"<br><br>Available Choices<ul style='padding-left:22px'><li>None</li><li>Resume All Items</li><li>TV Next Up</li><li>Suggested For You</li><li>Media Folders</li><li>New TV</li><li>New Movies</li></ul>" +
					"<br><br>Setting this to None will show more content from Home View 1";
			break;		
		case "SkipShow":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Skip TV Show Page";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "This option allows for the TV Show page to be skipped if there is only one season, taking you directly to the episodes page.";
			break;
		case "SeasonLabel":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Use Alternate Season Label";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Use an alternative format for the season and episode label formats.";
			break;
		case "AutoPlay":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Auto Play Next Episode";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "If enabled, when a playing episode has finished, the next episode will automatically load.";
			break;	
		case "ScreensaverImages":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Screensaver Image Source";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "The screensaver can use images wither from photo's you have added to your library or tv & movie images.";
			break;
		case "ScreensaverTimeout":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Screensaver Timeout";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "The amount of inactivity until the screensaver kicks in.";
			break;	
		case "Bitrate":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Bitrate";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Enter a maximum bitrate that your network can manage";
			break;
		case "Dolby":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Enable Dolby Digital Playback";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Select this option if your receiver is capable of decoding AC3 streams";
			break;
		case "DTS":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Enable DTS Playback";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Select this option if your receiver is capable of decoding DTS streams";
			break;
		case "TranscodeDSeries":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Enable Transcoding on D Series TV's";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Enable this if you want to transcode videos to your D Series TV<br><br>This is off by default as it is not reliable and may cause issues, and as such is unsupported.";
			break;
		case "SubtitleMode":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Subtitle Mode";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Select the default behaviour of when subtitles are loaded<br><br>This is a server option and will affect your MediaBrowser experience on all clients";
			break;	
		case "DisplayMissingEpisodes":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Display Missing Episodes within Seasons";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Display missing episodes within TV seasons<br><br>This is a server option and will affect your MediaBrowser experience on all clients";
			break;	
		case "DisplayUnairedEpisodes":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Display Unaired Episodes within Seasons";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Display unaired episodes within TV seasons<br><br>This is a server option and will affect your MediaBrowser experience on all clients";
			break;		
	}
}

GuiPage_Settings.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}