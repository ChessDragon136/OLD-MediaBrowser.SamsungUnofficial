var GuiPlayer_Versions = {
		//Holders
		PlayerData : null,
		resumeTicks : 0,
		playedFromPage : "",
		previousCounter : "",
		
		//Display Details
		selectedItem : 0,
		topLeftItem : 0,
		maxDisplay : 5,
		
		//Holds MediaStream Indexes of Primary Video Audio Subs for each MediaOption
		MediaOptions : [],

		//Holds Playback Details in order Name, URL, Transcoding, Subtitles
		MediaPlayback : [],

		//Holds all options to show in GUI if required
		MediaSelections : []
}

GuiPlayer_Versions.start = function(playerData,resumeTicks,playedFromPage) {
	//Reset Vars
	this.MediaOptions.length = 0;
	this.MediaPlayback.length = 0;
	this.MediaSelections.length = 0;
	this.selectedItem = 0,
	this.topLeftItem = 0,
	
	//Set Class Vars
	this.PlayerData = playerData;
	this.resumeTicks = resumeTicks;
	this.playedFromPage = playedFromPage;

	//Loop through all media sources and determine which is best
	for(var index = 0; index < this.PlayerData.MediaSources.length;index++) {
		this.getMainStreamIndex(this.PlayerData.MediaSources[index],index);
	}
	
	//Loop through all options and see if transcode is required, generate URL blah...
	for (var index = 0; index < this.MediaOptions.length; index++) {
		var result = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.PlayerData.MediaSources[this.MediaOptions[index][0]],
			this.MediaOptions[index][1],this.MediaOptions[index][2],this.MediaOptions[index][3]);
		this.MediaPlayback.push(result);
	}
	
	//Setup Gui
	this.previousCounter = document.getElementById("Counter").innerHTML;
	
	alert ("Media Playback Length: " + this.MediaPlayback.length);
	//MediaSource,Url,hasVideo,hasAudio,hasSubtitle,videoIndex,audioIndex,subtitleIndex
	if (this.MediaPlayback.length <= 0) {
		//Error - No media playback options!
		GuiNotifications.setNotification("None of the MediaSources are playable","Unable To Play");
		//Removes URL to fix Navigation
		Support.removeLatestURL();
	} else if (this.MediaPlayback.length == 1) { //Added in check to play only non transcoded stuff
		//Play file 
		GuiPlayer.startPlayback(this.MediaPlayback[0],resumeTicks);
	} else {
		//See how many will direct play
		for (var index = 0; index < this.MediaPlayback.length;index++) {
			if (this.MediaPlayback[index][2] == true && this.MediaPlayback[index][3] == true) {
				this.MediaSelections.push(this.MediaPlayback[index]);
			}
		}
		
		//If more than 1 loop through and generate GUI asking user
		if (this.MediaSelections.length == 1) {
			GuiPlayer.startPlayback(this.MediaSelections[0],resumeTicks);
		} else if (this.MediaSelections.length > 1) {
			document.getElementById("GuiPlayer_Versions").focus();
			this.updateDisplayedItems();
			this.updateSelectedItems();
		} else {
			//None Direct Play
			GuiPlayer.startPlayback(this.MediaSelections[0],resumeTicks);
		}
	}
}

GuiPlayer_Versions.updateDisplayedItems = function() {
	document.getElementById("guiPlayer_Versions_Playables").style.visibility = "";
	document.getElementById("guiPlayer_Versions_Playables").innerHTML = "";
	
	for (var index = this.topLeftItem; index < Math.min(this.MediaSelections.length,this.topLeftItem + this.maxDisplay);index++) {
		document.getElementById("guiPlayer_Versions_Playables").innerHTML += "<div id="+this.MediaSelections[index][0].Id+" class=videoVersionOption>"+this.MediaSelections[index][0].Name
		+ "<div class=videoVersionType>D</div></div>";	
	}
}

GuiPlayer_Versions.updateSelectedItems = function() {
	for (var index = this.topLeftItem; index < Math.min(this.MediaSelections.length,this.topLeftItem + this.maxDisplay); index++){	
		if (index == this.selectedItem) {
			document.getElementById(this.MediaSelections[index][0].Id).style.color = "red";	
		} else {	
			document.getElementById(this.MediaSelections[index][0].Id).style.color = "white";		
		}		
	} 
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.MediaSelections.length;
}



//Gets Primary Streams - Ones that would be used on first playback)
GuiPlayer_Versions.getMainStreamIndex = function(MediaSource,MediaSourceIndex) {
	var videoStreamCount = 0, audioStreamCount = 0
	var videoIndex = -1, audioIndex = -1; subtitleIndex = -1;
	
	var MediaStreams = MediaSource.MediaStreams;
	for (var index = 0;index < MediaStreams.length;index++) {
		var Stream = MediaStreams[index];
		if (Stream.Type == "Video") {
			videoStreamCount++;
			if (Stream.IsDefault == true) {
				videoIndex = index;
			}
		} 
		if (Stream.Type == "Audio") {
			audioStreamCount++;
			if (Stream.IsDefault == true) {
				audioIndex = index;
			}
		}
	}
	
	//If there was no default video track use first one
	if (videoIndex == -1) {
		for (var index = 0;index < MediaStreams.length;index++) {
			var Stream = MediaStreams[index];
			if (Stream.Type == "Video") {
				videoIndex = index;
				break;
			}
		}
	}
	
	//If there was no default audio track use first one
	if (audioIndex == -1) {
		for (var index = 0;index < MediaStreams.length;index++) {
			var Stream = MediaStreams[index];
			if (Stream.Type == "Audio") {
				audioIndex = index;
				break;
			}
		}
	}
	
	if (MediaSource.Protocol == "Http") {
		this.MediaOptions.push([0,null,null,null]);
	} else {
		if (videoIndex == -1 || audioIndex == -1) {
			alert ("Error");
			//Error - There is no video or audio track - option not selected
		} else {
			//Check if item is 3D and if tv cannot support it don't add it to the list!
			if (MediaSource.Video3DFormat !== undefined) {
				//Id TV Supports 3d
				alert ("Defined")
				var pluginScreen = document.getElementById("pluginScreen");
				if (pluginScreen.Flag3DEffectSupport()) {
					alert ("3D Supported");
					this.MediaOptions.push([MediaSourceIndex,videoIndex,audioIndex,subtitleIndex]);
				}
			} else {
				//Not 3D
				alert ("UnDefined")
				this.MediaOptions.push([MediaSourceIndex,videoIndex,audioIndex,subtitleIndex]);
			}				
		}
	}	
}


GuiPlayer_Versions.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		case tvKey.KEY_UP:
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem++;
			}
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem--;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
		break;
		case tvKey.KEY_DOWN:
			this.selectedItem++;
			if (this.selectedItem > this.MediaSelections.length-1) {
				this.selectedItem--;
			}
			if (this.selectedItem >= this.topLeftItem + this.maxDisplay) {
				this.topLeftItem++;
				this.updateDisplayedItems();
			}
			this.updateSelectedItems();
			break;
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			//Hide Menu
			document.getElementById("guiPlayer_Versions_Playables").style.visibility = "hidden";
			document.getElementById("guiPlayer_Versions_Playables").innerHTML = "";
			
			//Remove Last URL History - as we didn't navigate away from the page!
			Support.removeLatestURL();
			
			//Reset counter to existing value
			document.getElementById("Counter").innerHTML = this.previousCounter;
			
			//Set focus back to existing page
			document.getElementById(this.playedFromPage).focus();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			document.getElementById("guiPlayer_Versions_Playables").style.visibility = "hidden";
			document.getElementById("guiPlayer_Versions_Playables").innerHTML = "";
			document.getElementById("Counter").innerHTML = this.previousCounter;
			document.getElementById(this.playedFromPage).focus();
			GuiPlayer.startPlayback(this.MediaSelections[this.selectedItem],this.resumeTicks);
			break;	
		case tvKey.KEY_BLUE:
			alert("BLUE");
			File.deleteFile();
			widgetAPI.sendExitEvent()
			break;	
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
		default:
			alert("Unhandled key");
			break;
	}
};