var GuiPage_Settings = {
		AllData : null,
		UserData : null,
		
		Settings : ["Default","View1","View2","SkipShow","SeasonLabel","AutoPlay"],
		SettingsName : ["Default User: ","Home View 1: ","Home View 2: ","Skip TV Show Page","Use Alternate Season Label","Auto Play Next Episode"],
		SettingsDefaults : [false,"ddddd","aaaaa",false,false,false],
		
		TVSettings : ["TvConnection","Dolby","DTS"],
		TVSettingsName : ["Network Connection Type: ","Enable Dolby Digital Playback: ","Enable DTS Playback : "],
		TVSettingsDefaults : ["Wired",false,false],
		
		CurrentSubSettings : [],
		CurrentSettingValue : null,
		
		DefaultOptions : ["True","False"], //Also used by the two tv settings and experimental
		DefaultValues : [true,false], //Also used by the two tv settings and experimental
		
		View1Options : [], 
		View1Values : [], 
		
		View2Options : [], 
		View2Values : [], 

		TvConnectionOptions : ["Wired","Wireless","Mobile"], 
		TvConnectionValues : ["Wired","Wireless","Mobile"], 
		
		selectedItem : 0,
		selectedSubItem : 0
}

GuiPage_Settings.initiateViewValues = function() {
	alert ("Server value: " + Server.getServerAddr());
	ResumeAllItemsURL = Server.getServerAddr() + "/Users/"+Server.getUserID()+"/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&Filters=IsResumable&Limit=7&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName";
	TVNextUp = Server.getServerAddr() + "/Shows/NextUp?format=json&Limit=7&IncludeItemTypes=Episode&UserId="+Server.getUserID()+"&ExcludeLocationTypes=Virtual&fields=SortName";
	SuggestedMovies = Server.getCustomURL("/Movies/Recommendations?format=json&userId="+Server.getUserID()+"&categoryLimit=6&itemLimit=7&fields=SortName&CollapseBoxSetItems=false");
	MediaFolders = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
	LatestTV = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&Limit=7&isPlayed=false&IsFolder=false&fields=SortName,Overview,Genres,RunTimeTicks");
	LatestMovies = Server.getItemTypeURL("&Limit=7&IncludeItemTypes=Movie&SortBy=DateCreated&SortOrder=Descending&fields=SortName&CollapseBoxSetItems=false&ExcludeLocationTypes=Virtual&recursive=true&Filters=IsUnplayed");

	
	this.View1Options = ["Resume All Items","TV Next Up","Suggested For You","Media Folders","New TV","New Movies"];
	this.View1Values = [ResumeAllItemsURL,TVNextUp,SuggestedMovies,MediaFolders,LatestTV,LatestMovies]
	this.View2Options = ["None","Resume All Items","TV Next Up","Suggested For You","Media Folders","New TV","New Movies"];
	this.View2Values = [null,ResumeAllItemsURL,TVNextUp,SuggestedMovies,MediaFolders,LatestTV,LatestMovies]
}

GuiPage_Settings.start = function() {	
	//Reset Vars
	this.selectedItem = 0;
	this.selectedSubItem = 0;
	
	this.initiateViewValues();
	
	//Load Data
	var fileJson = JSON.parse(File.loadFile());  
	this.AllData = fileJson;
	this.UserData = fileJson.Servers[File.getServerEntry()].Users[File.getUserEntry()];
	
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id='guiTV_Show_Title' class='EpisodesSeriesInfo'>Settings for "+this.UserData.UserName +" </div>\ \
		<div id='guiPage_Settings_Settings' class='guiPage_Settings_Settings'></div>" +
		"<div id='guiPage_Settings_Overview' class='guiPage_Settings_Overview'>" +
			"<div id=guiPage_Settings_Overview_Title></div>" +
			"<div id=guiPage_Settings_Overview_Content></div>" +
		"</div>";

	this.generateSettings();
	this.updateSelectedItems();
	
	document.getElementById("GuiPage_Settings").focus();
}

GuiPage_Settings.generateSettings = function() {
	var htmlToAdd = "<table class=guiSettingsTable>";
	var changed = false;
	for (var index = 0; index < this.Settings.length;index++) {
		//Catches new settings created and will write them to file
		//Also sets the default value
		if (this.UserData[this.Settings[index]] === undefined) {
			this.UserData[this.Settings[index]] = this.SettingsDefaults[index];
			changed = true; 
		}

		//Finds the setting in the file and generates the correct current set value
		//Only needs new entries here if they have differing settings (true false is top so works for many settings)
		var Setting = "";
		switch (this.Settings[index]) {
		case "Default":
		case "SkipShow":
		case "SeasonLabel":
		case "AutoPlay":	
			for (var index2 = 0; index2 < this.DefaultValues.length; index2++) {
				if (this.DefaultValues[index2] == this.UserData[this.Settings[index]]) {
					Setting = this.DefaultOptions[index2];
					break;
				}
			}
			break;
		case "View1":
			for (var index2 = 0; index2 < this.View1Values.length; index2++) {
				if (this.View1Values[index2] == this.UserData[this.Settings[index]]) {
					Setting = this.View1Options[index2];
					break;
				}
			}
			break;
		case "View2":
			for (var index2 = 0; index2 < this.View2Values.length; index2++) {
				if (this.View2Values[index2] == this.UserData[this.Settings[index]]) {
					Setting = this.View2Options[index2];
					break;
				}
			}
			break;	
		}
		htmlToAdd += "<tr class=guiSettingsRow><td id="+index+">" + this.SettingsName[index] + "</td><td id=Value"+index+" class=guiSettingsTD>"+Setting+"</td></tr>";
	}
	
	if (changed == true) {
		//Write to file
		File.updateUserSettings(this.UserData);
		changed = false;
	}
	document.getElementById("guiPage_Settings_Settings").innerHTML = htmlToAdd + "</table>";
	
	
	//TV Settings - Same as above again!
	htmlToAdd = "<div class=guiSettingsTVSettings>TV Settings</div><table class=guiSettingsTable>"; //
	if (this.AllData.TV === undefined) {
		this.AllData.TV = {};
		File.writeAll (this.AllData);
	}
	for (var index = 0; index < this.TVSettings.length;index++) {
		if (this.AllData.TV[this.TVSettings[index]] === undefined) {
			this.AllData.TV[this.TVSettings[index]] = this.TVSettingsDefaults[index];
			changed = true; 
		}
		
		var Setting = "";
		switch (this.TVSettings[index]) {
		case "Dolby":
		case "DTS":
			for (var index2 = 0; index2 < this.DefaultValues.length; index2++) {
				if (this.DefaultValues[index2] == this.AllData.TV[this.TVSettings[index]]) {
					Setting = this.DefaultOptions[index2];
					break;
				}
			}
			break;		
		case "TvConnection":
			for (var index2 = 0; index2 < this.TvConnectionValues.length; index2++) {
				if (this.TvConnectionValues[index2] == this.AllData.TV[this.TVSettings[index]]) {
					Setting = this.TvConnectionOptions[index2];
					break;
				}
			}
			break;
		}
		//For ease of use id's just count on from the Settings array
		htmlToAdd += "<tr class=guiSettingsRow><td id="+(this.Settings.length +index)+">" + this.TVSettingsName[index] + "</td><td id=Value"+(this.Settings.length +index)+" class=guiSettingsTD>"+Setting+"</td></tr>";
	}

	if (changed == true) {
		//Write to file
		File.writeAll(this.AllData);
		changed = false;
	}
	
	document.getElementById("guiPage_Settings_Settings").innerHTML += htmlToAdd + "</table>";
}

GuiPage_Settings.updateSelectedItems = function() {
	for (var index = 0; index < this.SettingsName.length; index++) {
		if (index == this.selectedItem) {
			document.getElementById(index).className = "guiSettingsTD GuiPage_Setting_Selected";
		} else {
			document.getElementById(index).className = "guiSettingsTD GuiPage_Setting_UnSelected";
		}
	}
	
	for (var index = 0; index < this.TVSettingsName.length; index++) {
		if ((index+this.Settings.length) == this.selectedItem) {
			document.getElementById(index+this.Settings.length).className = "guiSettingsTD GuiPage_Setting_Selected";
		} else {
			document.getElementById(index+this.Settings.length).className = "guiSettingsTD GuiPage_Setting_UnSelected";
		}
	}
	
	this.setOverview();
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + (this.Settings.length + this.TVSettings.length);	
}

GuiPage_Settings.processSelectedItem = function() {
	document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_SubSelected";
	document.getElementById("Value"+this.selectedItem).className = "guiSettingsTD GuiPage_Setting_Selected";
	
	switch (this.Settings[this.selectedItem]) {
	case "Default":
	case "SkipShow":	
	case "SeasonLabel":	
	case "AutoPlay":	
		this.CurrentSubSettings = this.DefaultOptions;
		break;
	case "View1":
		this.CurrentSubSettings = this.View1Options;
		break;
	case "View2":
		this.CurrentSubSettings = this.View2Options;
		break;
	}
	
	if (this.selectedItem >= this.Settings.length){
		switch (this.TVSettings[this.selectedItem - this.Settings.length]) {
		case "Dolby":
		case "DTS":
			this.CurrentSubSettings = this.DefaultOptions;
			break;
		case "TvConnection":
			this.CurrentSubSettings = this.TvConnectionOptions;
			break;
		}
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
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = 0;
				document.getElementById(this.selectedItem).className = "guiSettingsTD GuiPage_Setting_UnSelected";
				GuiMainMenu.requested("GuiPage_Settings",this.selectedItem,"guiSettingsTD GuiPage_Setting_Selected");
			} else {
				this.updateSelectedItems();
			}
			break;
		case tvKey.KEY_DOWN:
			alert("DOWN");	
			this.selectedItem++;
			if (this.selectedItem >= this.SettingsName.length + this.TVSettingsName.length) {
				this.selectedItem--;
			}
			this.updateSelectedItems();
			break;				
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;	
		case tvKey.KEY_RIGHT:
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

//------------------------------------------------------------------------------------------------------------------------

GuiPage_Settings.processSelectedSubItem = function() {
	if (this.selectedItem < this.Settings.length){
		switch (this.Settings[this.selectedItem]) {
		case "Default":	
			this.UserData[this.Settings[this.selectedItem]] = this.DefaultValues[this.selectedSubItem];
			this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
		
			//Default User ONLY - Check All Other Users and set to false
			if (this.Settings[this.selectedItem] == "Default") {
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
			this.UserData[this.Settings[this.selectedItem]] = this.DefaultValues[this.selectedSubItem];
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
		}
		File.updateUserSettings(this.UserData);
	}
	
	if (this.selectedItem >= this.Settings.length){
		switch (this.TVSettings[this.selectedItem - this.Settings.length]) {
		case "Dolby":
		case "DTS":
			this.AllData.TV[this.TVSettings[this.selectedItem - this.Settings.length]] = this.DefaultValues[this.selectedSubItem];
			this.CurrentSettingValue = this.DefaultOptions[this.selectedSubItem];
			break;
		case "TvConnection":
			this.AllData.TV[this.TVSettings[this.selectedItem - this.Settings.length]] = this.TvConnectionValues[this.selectedSubItem];
			this.CurrentSettingValue = this.TvConnectionOptions[this.selectedSubItem];
			break;
		}
		File.writeAll(this.AllData);
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
	if (this.selectedItem < this.Settings.length) {
		switch (this.Settings[this.selectedItem]) {
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
		}
	}
	
	if (this.selectedItem >= this.Settings.length) {
		switch (this.TVSettings[this.selectedItem - this.Settings.length]) {
		case "TvConnection":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Network Connection Type";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Select how your TV is connected to the network" +
			"<br><br>Available Choices<ul style='padding-left:22px'><li>Wired</li><li>Wireless</li><li>Mobile</li></ul>" +
			"<br><br>The selected option will determine any transcoding bitrates used. I would highly suggest against using mobile, it is only there for people who connect to Servers accross the internet.";
			break;
		case "Dolby":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Enable Dolby Digital Playback";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Select this option if your receiver is capable of decoding AC3 streams";
			break;
		case "DTS":
			document.getElementById("guiPage_Settings_Overview_Title").innerHTML = "Enable DTS Playback";
			document.getElementById("guiPage_Settings_Overview_Content").innerHTML = "Select this option if your receiver is capable of decoding DTS streams";
			break;	
		}
	}
}

GuiPage_Settings.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}