var GuiMusicPlayer = {	
		pluginMusic : null,
		pluginAudioMusic : null,
		
		Status : "STOPPED",
		currentTime : 0,
		updateTimeCount : 0,

		videoURL : null,
		
		selectedItem : 1,
		playedFromPage : null,
		
		queuedItems : [],
}

GuiMusicPlayer.init = function() {
	GuiPlayer.stopOnAppExit();

	this.pluginMusic = document.getElementById("pluginPlayer");
	this.pluginAudioMusic = document.getElementById("pluginObjectAudio");
	
	//Set up Player
	this.pluginMusic.OnConnectionFailed = 'GuiMusicPlayer.handleConnectionFailed';
	this.pluginMusic.OnAuthenticationFailed = 'GuiMusicPlayer.handleAuthenticationFailed';
	this.pluginMusic.OnNetworkDisconnected = 'GuiMusicPlayer.handleOnNetworkDisconnected';
	this.pluginMusic.OnRenderError = 'GuiMusicPlayer.handleRenderError';
	this.pluginMusic.OnStreamNotFound = 'GuiMusicPlayer.handleStreamNotFound';
	this.pluginMusic.OnRenderingComplete = 'GuiMusicPlayer.handleOnRenderingComplete';
	this.pluginMusic.OnCurrentPlayTime = 'GuiMusicPlayer.setCurrentTime';
    this.pluginMusic.OnStreamInfoReady = 'GuiMusicPlayer.OnStreamInfoReady'; 
    
    //Set Display Size to 0
    this.pluginMusic.SetDisplayArea(0, 0, 0, 0);
}

GuiMusicPlayer.showMusicPlayer = function(playedFromPage) {
	this.playedFromPage = playedFromPage;
	document.getElementById("guiMusicPlayerDiv").style.visibility = "";
	document.getElementById("GuiMusicPlayer").focus();
}

GuiMusicPlayer.start = function(title, url, playedFromPage,isQueue) { 
	this.selectedItem = 1;
	this.playedFromPage = playedFromPage;
	
	//Initiate Player for Music if required.
	//Set to null on end of playlist or stop.
	if (this.pluginMusic == null) {
		this.init();
	}
	
	//get info from URL
	this.ItemData = Server.getContent(url);
   
	//See if item is to be added to playlist or not - if not reset playlist
	if (isQueue == false) {
		this.queuedItems.length = 0;
		this.handleStopKey();
	}
	
	if (title != "Song") { 	
    	for (var index = 0; index < this.ItemData.Items.length; index++) {
    		this.queuedItems.push(this.ItemData.Items[index]);
    	}
    } else {
    	//Is Individual Song
        this.queuedItems.push(this.ItemData);
    }
	
	alert (this.queuedItems.length);
	
	if (this.Status == "STOPPED") {
	    this.videoURL = Server.getServerAddr() + '/Audio/'+this.queuedItems[0].Id+'/Stream?AudioCodec='+this.queuedItems[0].MediaSources[0].MediaStreams[0].Codec+'&DeviceId='+Server.getDeviceID() + '&Static=true';
	    
	    //Update selected Item
	    this.updateSelectedItem();
	    
		//Show Content
		document.getElementById("guiMusicPlayerDiv").style.visibility = "";
	    
		//set focus
		document.getElementById("GuiMusicPlayer").focus();
		
		//Start Playback
		this.handlePlayKey();
	}
}

GuiMusicPlayer.updateSelectedItem = function() {
	document.getElementById("guiMusicPlayerPause").style.color = "white";
	document.getElementById("guiMusicPlayerPlay").style.color = "white";
	document.getElementById("guiMusicPlayerStop").style.color = "white";
	document.getElementById("guiMusicPlayerPrevious").style.color = "white";
	document.getElementById("guiMusicPlayerNext").style.color = "white";
	document.getElementById("guiMusicPlayerPlaylist").style.color = "white";
	
	switch (this.selectedItem ) {
		case 0:
			document.getElementById("guiMusicPlayerPause").style.color = "red";
			break;
		case 1:
			document.getElementById("guiMusicPlayerPlay").style.color = "red";
			break;
		case 2:
			document.getElementById("guiMusicPlayerStop").style.color = "red";
			break;
		case 3:
			document.getElementById("guiMusicPlayerPrevious").style.color = "red";
			break;
		case 4:
			document.getElementById("guiMusicPlayerNext").style.color = "red";
			break;
		case 5:
			document.getElementById("guiMusicPlayerPlaylist").style.color = "red";
			break;	
		default:
			document.getElementById("guiMusicPlayerPlay").style.color = "red";
			break;
		}
}

//--------------------------------------------------------------------------------------------------

GuiMusicPlayer.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	switch(keyCode) {
		case tvKey.KEY_LEFT:
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem = 5;
			}
			this.updateSelectedItem();
			break;
		case tvKey.KEY_RIGHT:
			this.selectedItem++;
			if (this.selectedItem > 5) {
				this.selectedItem = 0;
			}
			this.updateSelectedItem();
			break;
		case tvKey.KEY_ENTER:	
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			switch (this.selectedItem) {
				case 0:
					this.handlePauseKey();
					break;
				case 1:
					this.handlePlayKey();
					break;
				case 2:
					this.handleStopKey();
					break;
				case 3:
					this.handlePreviousKey();
					break;
				case 4:
					this.handleNextKey();
					break;
				case 5:
					this.handlePlaylistKey();
					break;	
			}
			break;	
		case tvKey.KEY_PLAY:
			this.handlePlayKey();
			break;	
		case tvKey.KEY_PAUSE:	
			this.handlePauseKey();
			break;
		case tvKey.KEY_STOP:
			this.handleStopKey();
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			if (this.status == "PAUSED") {
				this.handleStopKey();
			} else {
				document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
				document.getElementById(this.playedFromPage).focus();	
			}
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiMusicPlayer.handlePlayKey = function() {
	//Update Server content is playing * update time
	//Server.videoStarted(this.showId);
	//Server.videoTime(this.showId,resumeTicksSamsung*10000);

	if (this.Status != "PLAYING") {	
		this.pluginAudioMusic.SetUserMute(0);   
		
		if (this.Status == "PAUSED") {
			this.pluginMusic.Resume();
		} else {
			//Clear down any variables
			this.currentTime = 0;
		    this.updateTimeCount = 0;
			
		    //Update Menu to show Music Icon
		    GuiMainMenu.showMusicIcon();
		    
			//Calculate position in seconds
		    this.pluginMusic.Play(this.videoURL);   
		}	
		this.Status = "PLAYING";
	}
}

GuiMusicPlayer.handlePauseKey = function() {
	this.pluginMusic.Pause();
	this.Status = "PAUSED";
}

GuiMusicPlayer.handleStopKey = function() {
	alert ("STOPPING PLAYBACK");

	//Update Menu to hide Music Icon
    GuiMainMenu.hideMusicIcon();
	
	this.pluginMusic.Stop();
	this.Status = "STOPPED";
	
	//Reset NAVI - Works
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(tvKey.KEY_VOL_UP);
    pluginAPI.registKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.registKey(tvKey.KEY_MUTE);
	
	//Server.videoStopped(this.showId,this.currentTime);
	
    if (document.getElementById("guiMusicPlayerDiv").style.visibility == "") {
    	document.getElementById("guiMusicPlayerDiv").style.visibility = "hidden";
    	document.getElementById(this.playedFromPage).focus();	
    }	
}

GuiMusicPlayer.handleNextKey = function() {
	//Stop Any Playback
	this.pluginMusic.Stop();
	this.Status = "STOPPED";
	
	//Removed just played item
	this.queuedItems.shift();
	
	if (this.queuedItems.length == 0) {	
		this.handleStopKey();
	} else {
		//Play Next Item
		this.videoURL = Server.getServerAddr() + '/Audio/'+this.queuedItems[0].Id+'/Stream.'+this.queuedItems[0].MediaSources[0].MediaStreams[0].Codec+'?DeviceId='+Server.getDeviceID();
		alert ("Next " + this.videoURL);
		//Start Playback
		this.handlePlayKey();
	}
}

GuiMusicPlayer.handlePlaylistKey = function() {
	if (document.getElementById("guiMusicPlayerShowPlaylist").style.visibility == "hidden") {
		document.getElementById("guiMusicPlayerShowPlaylist").style.visibility = "";
	} else {
		document.getElementById("guiMusicPlayerShowPlaylist").style.visibility = "hidden";
	}
	
	document.getElementById("guiMusicPlayerShowPlaylistContent").innerHTML = "";
	for (var index = 0; index < this.queuedItems.length; index++) {
		document.getElementById("guiMusicPlayerShowPlaylistContent").innerHTML += this.queuedItems[index].Name;
	}
}

//--------------------------------------------------------------------------------------------------

GuiMusicPlayer.handleOnRenderingComplete = function() {
	alert ("File complete")
	this.handleNextKey();
}

GuiMusicPlayer.handleOnNetworkDisconnected = function() {
	alert ("Network Disconnect")
}

GuiMusicPlayer.handleConnectionFailed = function() {
	alert ("Connection Failed")
}

GuiMusicPlayer.handleAuthenticationFailed = function() {
	alert ("Authentication Failed")
}

GuiMusicPlayer.handleRenderError = function(RenderErrorType) {
	alert ("Render Error")
}

GuiMusicPlayer.handleStreamNotFound = function() {
	alert ("Stream not found")
}

GuiMusicPlayer.setCurrentTime = function(time){
	this.currentTime = time;
	this.updateTimeCount++;
	document.getElementById("guiMusicPlayerTime").innerHTML = Support.convertTicksToTime(this.currentTime, (this.queuedItems[0].RunTimeTicks / 10000));
}

GuiMusicPlayer.OnStreamInfoReady = function() {
	if (this.queuedItems[0].AlbumPrimaryImageTag) {
		var imgsrc = Server.getImageURL(this.queuedItems[0].AlbumId,"Primary",60,60,0,false,0);
		document.getElementById("guiMusicPlayerImage").style.backgroundImage = "url("+imgsrc+")";
	} else {
		document.getElementById("guiMusicPlayerImage").style.backgroundImage = "";
	}
	
	var playingTitle = "";
	if (this.queuedItems[0].IndexNumber < 10) {
		playingTitle = "0"+this.queuedItems[0].IndexNumber+" - ";
	} else {
		playingTitle = this.queuedItems[0].IndexNumber+" - ";
	}
	document.getElementById("guiMusicPlayerTitle").innerHTML = this.queuedItems[0].Artists + "<br>" + playingTitle + this.queuedItems[0].Name;
	document.getElementById("guiMusicPlayerTime").innerHTML = Support.convertTicksToTime(this.currentTime, (this.queuedItems[0].RunTimeTicks / 10000));
	
    //Volume & Mute Control - Works!
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
    pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.unregistKey(tvKey.KEY_MUTE);
}

GuiMusicPlayer.stopOnAppExit = function() {
	if (this.pluginMusic != null) {
		this.pluginMusic.Stop();
		this.pluginMusic = null;
		this.pluginAudioMusic = null;
	}		
}