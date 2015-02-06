var GuiPlayer = {	
		plugin : null,
		pluginAudio : null,
		pluginScreen : null,
		
		Status : "STOPPED",
		currentTime : 0,
		updateTimeCount : 0,
		setThreeD : false,
		PlayMethod : "",
		videoStartTime : null,
		
		playingMediaSource : null,
		playingURL : null,
		playingTranscodeStatus : null,
		playingVideoIndex : null,
		playingAudioIndex : null,
		playingSubtitleIndex : null,
		
		videoToolsOptions : [],
		videoToolsSelectedItem : 0,
		subtitleIndexes : [], //Only used in menus
		audioIndexes : [], //Only used in menus
		
		topLeftItem : 0,
		videoToolsSelectedItemSub : 0,
		maxDisplay : 5,
		videoToolsSubOptions : [],
		videoToolsaudioOptions : [],
		
		VideoData : null,
		PlayerData : null,
		PlayerDataSubtitle : null,
		PlayerIndex : null,
		
		subtitleInterval : null,
		subtitleShowingIndex : 0,
		subtitleSeeking : false,
		startParams : []
}


GuiPlayer.init = function() {
	GuiMusicPlayer.stopOnAppExit();
	
	this.plugin = document.getElementById("pluginPlayer");
	this.pluginAudio = document.getElementById("pluginObjectAudio");
	this.pluginScreen = document.getElementById("pluginScreen");
	
	//Set up Player
	this.plugin.OnConnectionFailed = 'GuiPlayer.handleConnectionFailed';
	this.plugin.OnAuthenticationFailed = 'GuiPlayer.handleAuthenticationFailed';
	this.plugin.OnNetworkDisconnected = 'GuiPlayer.handleOnNetworkDisconnected';
	this.plugin.OnRenderError = 'GuiPlayer.handleRenderError';
	this.plugin.OnStreamNotFound = 'GuiPlayer.handleStreamNotFound';
	this.plugin.OnRenderingComplete = 'GuiPlayer.handleOnRenderingComplete';
	this.plugin.OnCurrentPlayTime = 'GuiPlayer.setCurrentTime';
    this.plugin.OnBufferingStart = 'GuiPlayer.onBufferingStart';
    this.plugin.OnBufferingProgress = 'GuiPlayer.onBufferingProgress';
    this.plugin.OnBufferingComplete = 'GuiPlayer.onBufferingComplete';  
    this.plugin.OnStreamInfoReady = 'GuiPlayer.OnStreamInfoReady'; 
    this.plugin.SetTotalBufferSize(40*1024*1024);
}

GuiPlayer.start = function(title,url,startingPlaybackTick,playedFromPage) { 
	//Run only once in loading initial request - subsequent vids should go thru the startPlayback
	this.startParams = [title,url,startingPlaybackTick,playedFromPage];
	
	//Display Loading 
	document.getElementById("guiPlayer_Loading").style.visibility = "";

    //Get Item Data (Media Streams)
    this.VideoData = Server.getContent(url);
    if (this.VideoData == null) { return; }
    
    this.PlayerIndex = 0; // Play All  - Default
    if (title == "PlayAll") {
    	if (this.VideoData.TotalRecordCount == 0) {
    		return;
    	}
    	alert ("Number of Videos: "+this.VideoData.Items.length);
    	this.PlayerData = this.VideoData.Items[this.PlayerIndex];
    } else {
    	if (this.VideoData.LocationType == "Virtual") {
    		return
    	}
    	this.PlayerData = this.VideoData;
    }
    
    //Turn off screensaver
	Support.screensaverOff();
    
    //Take focus to no input
	document.getElementById("NoKeyInput").focus();
    
    GuiPlayer_Versions.start(this.PlayerData,startingPlaybackTick,playedFromPage);
}

GuiPlayer.startPlayback = function(TranscodeAlg, resumeTicksSamsung) {
	//Initiate Player for Video
	this.init();

	//Reset Vars
	this.videoToolsOptions = [];
	this.videoToolsSelectedItem = 0;
	this.subtitleIndexes = [];
	this.audioIndexes = [];
	this.PlayerDataSubtitle = null;
	this.subtitleShowingIndex = 0;
	this.subtitleSeeking = false;
	this.videoStartTime = resumeTicksSamsung;
	
	//Expand TranscodeAlg to useful variables!!!
	this.playingMediaSourceIndex = TranscodeAlg[0];
	this.playingMediaSource = this.PlayerData.MediaSources[TranscodeAlg[0]];
	this.playingURL = TranscodeAlg[1];
	this.playingTranscodeStatus = TranscodeAlg[2];
	this.playingVideoIndex = TranscodeAlg[3];
	this.playingAudioIndex = TranscodeAlg[4];
	this.playingSubtitleIndex = null;
	
	
	//Clear down any variables + stop video if playing
	this.Status = "STOPPED";
	this.currentTime = 0;
    this.updateTimeCount = 0;
    this.setThreeD = false;
    
    //Hide page!
    document.getElementById("pageContent").innerHTML = "";
    document.getElementById("page").style.visibility="hidden";
    document.getElementById("pageBackgroundFade").style.visibility="hidden";
    document.getElementById("pageBackgroundHolder").style.visibility="hidden";
    document.getElementById("pageBackground").style.visibility="hidden";
    document.getElementById("guiPlayer_Loading").style.visibility = "";    
    
    //Set PageContent
    var fileInfo = "";
    if (this.PlayerData.Type == "Episode") {
    	fileInfo = Support.getNameFormat(this.PlayerData.SeriesName, this.PlayerData.ParentIndexNumber, this.PlayerData.Name, this.PlayerData.IndexNumber);
    	fileInfo = fileInfo.replace("<br>", " ");
    } else {
    	fileInfo = this.PlayerData.Name;
    }

    var videoName = this.playingMediaSource.Name;
    document.getElementById("guiPlayer_Info_Details").innerHTML = "<div class='videoInfo_Details_Item'>" + fileInfo + "</div><div class='videoInfo_Details_Item'>" + videoName + "</div>";

    //Add Transcoding notice
    if (this.playingTranscodeStatus == "Direct Stream") {
    	this.PlayMethod = "DirectStream";
    	this.playingTranscodeStatus = "Direct Play" // Nicer fur people to think its not transcoding!
    } else {
    	this.PlayMethod = "Transcode";
    }
    document.getElementById("guiPlayer_Info_Details").innerHTML += "<div class='videoInfo_Details_Item'>"+this.playingTranscodeStatus+"</div>"; 

	//Turn off Screensaver and set display area in relation to aspect ratio
	pluginAPI.setOffScreenSaver();  
	this.setDisplaySize();
	
	//Subtitles
	
	if (Main.isSubtitlesEnabled()) {
		this.getSubtitles(-1);
		//If resuming find the correct index to start from!
		this.updateSubtitleTime(resumeTicksSamsung,"NewSubs");
	}

	//Create Tools Menu
	this.createToolsMenu();
	
	//Update Server content is playing * update time
	Server.videoStarted(this.PlayerData.Id,this.playingMediaSource.Id,this.PlayMethod);
    
	//Update URL with resumeticks
	if (Main.getModelYear() == "D" && this.playingTranscodeStatus != "Direct Play") {
		this.playingURL = this.playingURL + '&StartTimeTicks=' + (resumeTicksSamsung*10000) + '|COMPONENT=HLS';
	} else {
		this.playingURL = this.playingURL + '&StartTimeTicks=' + (resumeTicksSamsung*10000);
	}
	alert ("Video Playback URL: " + this.playingURL);
	
	//Calculate position in seconds
	var position = Math.round(resumeTicksSamsung / 1000);
    this.plugin.ResumePlay(this.playingURL,position);    
}

GuiPlayer.stopPlayback = function() {
	alert ("STOPPING PLAYBACK");
	
	//Hide Subtitles Here
	document.getElementById("guiPlayer_Subtitles").innerHTML = "";
	document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
	
	this.plugin.Stop();
	this.Status = "STOPPED";
	Server.videoStopped(this.PlayerData.Id,this.playingMediaSource.Id,this.currentTime,this.PlayMethod);
	
	//If D series need to stop HLS Encoding
	if (Main.getModelYear() == "D") {
		Server.stopHLSTranscode();
	}	
}

GuiPlayer.restorePreviousMenu = function() {
	//Hide Player GUI Elements
	document.getElementById("guiPlayer_Info").style.visibility="hidden";
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    document.getElementById("guiPlayer_Tools").style.visibility = "hidden";
    
    document.getElementById("pageBackgroundFade").style.visibility="";
    document.getElementById("pageBackgroundHolder").style.visibility="";
    document.getElementById("pageBackground").style.visibility="";
    document.getElementById("page").style.visibility="";
    
    //Reset Volume & Mute Keys
	//Reset NAVI - Works
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(tvKey.KEY_VOL_UP);
    pluginAPI.registKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.registKey(tvKey.KEY_MUTE);

    //Turn On Screensaver
    Support.screensaverOn();
	Support.screensaver();

	//Return to correct Page
	Support.processReturnURLHistory();
}

GuiPlayer.setDisplaySize = function() {
	if (this.playingMediaSource.MediaStreams[this.playingVideoIndex].AspectRatio == "16:9") {
		this.plugin.SetDisplayArea(0, 0, 960, 540);
	} else {
		//Scale Video	
		var ratioToShrinkX = 960 / this.playingMediaSource.MediaStreams[this.playingVideoIndex].Width;
		var ratioToShrinkY = 540 / this.playingMediaSource.MediaStreams[this.playingVideoIndex].Height;
			
		if (ratioToShrinkX < ratioToShrinkY) {
			var newResolutionX = 960;
			var newResolutionY = Math.round(this.playingMediaSource.MediaStreams[this.playingVideoIndex].Height * ratioToShrinkX);
			var centering = Math.round((540-newResolutionY)/2);
				
			this.plugin.SetDisplayArea(parseInt(0), parseInt(centering), parseInt(newResolutionX), parseInt(newResolutionY));
		} else {
			var newResolutionX = Math.round(this.playingMediaSource.MediaStreams[this.playingVideoIndex].Width * ratioToShrinkY);
			var newResolutionY = 540;
			var centering = Math.round((960-newResolutionX)/2);
				
			this.plugin.SetDisplayArea(parseInt(centering), parseInt(0), parseInt(newResolutionX), parseInt(newResolutionY));
		}			
	}	
}


GuiPlayer.getSubtitles = function(selectedSubtitleIndex) {
	//Used for user change in Tools!
	if (selectedSubtitleIndex > -1) {
		var Stream = this.playingMediaSource.MediaStreams[selectedSubtitleIndex];
		if (Stream.IsTextSubtitleStream) {
			//Set Colour & Size from User Settings
			document.getElementById("guiPlayer_Subtitles").style.color = File.getUserProperty("SubtitleColour");
			document.getElementById("guiPlayer_Subtitles").style.fontSize = File.getUserProperty("SubtitleSize");
			
		    var url = Server.getCustomURL("/Videos/"+ this.PlayerData.Id+"/"+this.playingMediaSource.Id+"/Subtitles/"+selectedSubtitleIndex+"/Stream.srt");
		    var PlayerDataSubtitles = Server.getSubtitles(url);
		    if (PlayerDataSubtitles == null) { return; }
		    
		    this.PlayerDataSubtitle = parser.fromSrt(PlayerDataSubtitles, true);
		}
	} else {
		var userURL = Server.getServerAddr() + "/Users/" + Server.getUserID() + "?format=json";
		var UserData = Server.getContent(userURL);
		if (UserData == null) { return; }
		
		var SubtitlePreference = (UserData.Configuration.SubtitleMode !== undefined) ? UserData.Configuration.SubtitleMode : "Default";
		var SubtitleLanguage = (UserData.Configuration.SubtitleLanguagePreference !== undefined) ? UserData.Configuration.SubtitleLanguagePreference : "eng";
		
		//If user setting not none, look for forced subtitles
		if (SubtitlePreference != "None") {
			for (var index = 0;index < this.playingMediaSource.MediaStreams.length;index++) {
				var Stream = this.playingMediaSource.MediaStreams[index];
				if (Stream.Type == "Subtitle" && Stream.IsTextSubtitleStream) {			
					if (Stream.IsForced == true) {
						this.playingSubtitleIndex = index;
						break;
					}	
				} 
			}
		}
		
		//If no forced subs and user setting not none or forced only, look for subs in native language
		if (this.playingSubtitleIndex == null) {
			if (SubtitlePreference != "None" && SubtitlePreference != "OnlyForced") {
				for (var index = 0;index < this.playingMediaSource.MediaStreams.length;index++) {
					var Stream = this.playingMediaSource.MediaStreams[index];
					if (Stream.Type == "Subtitle" && Stream.IsTextSubtitleStream) {			
						if (Stream.Language == SubtitleLanguage) {
							this.playingSubtitleIndex = index;
							break;
						}	
					} 
				}
			}
		}
		
		//If user always wants subs, play 1st one.
		if (this.playingSubtitleIndex == null) {
			if (SubtitlePreference == "Always") {	
				for (var index = 0;index < this.playingMediaSource.MediaStreams.length;index++) {
					var Stream = this.playingMediaSource.MediaStreams[index];
					if (Stream.Type == "Subtitle" && Stream.IsTextSubtitleStream) {			
						this.playingSubtitleIndex = index;
					} 
				}
			}	
		}	

		if (this.playingSubtitleIndex != null) {
			//Set Colour & Size from User Settings
			document.getElementById("guiPlayer_Subtitles").style.color = File.getUserProperty("SubtitleColour");
			document.getElementById("guiPlayer_Subtitles").style.fontSize = File.getUserProperty("SubtitleSize");
			
		    var url = Server.getCustomURL("/Videos/"+ this.PlayerData.Id+"/"+this.playingMediaSource.Id+"/Subtitles/"+this.playingSubtitleIndex+"/Stream.srt");
		    var PlayerDataSubtitles = Server.getSubtitles(url);
		    if (PlayerDataSubtitles == null) { return; }
		    
		    this.PlayerDataSubtitle = parser.fromSrt(PlayerDataSubtitles, true);
		}
		alert ("Subtitle Index: " + this.playingSubtitleIndex)
	}
}

GuiPlayer.updateSubtitleTime = function(newTime,direction) {
	if (this.playingSubtitleIndex != null) {
		//Clear Down Subtitles
		this.subtitleSeeking = true;
		document.getElementById("guiPlayer_Subtitles").innerHTML = "";
		document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
		
		if (direction == "FF") {
			for (var index = this.subtitleShowingIndex; index < this.PlayerDataSubtitle.length; index++) {
				if (newTime >= this.PlayerDataSubtitle[index].startTime) {
					this.subtitleShowingIndex = index;
					break;
				}
			}
		} else if (direction == "RW") {
			if (newTime < this.PlayerDataSubtitle[0].startTime) {
				this.subtitleShowingIndex = 0;
			} else {
				for (var index = 0; index <= this.subtitleShowingIndex; index++) {
					if (newTime >= this.PlayerDataSubtitle[index].startTime) {
						this.subtitleShowingIndex = index;
						break;
					}
				}
			}	
		} else if (direction == "NewSubs") {
			this.subtitleShowingIndex = 0;
			for (var index = 0; index < this.PlayerDataSubtitle.length; index++) {				
				if (newTime < this.PlayerDataSubtitle[index].startTime) {
					this.subtitleShowingIndex = index;
					alert (this.subtitleShowingIndex)
					break;
				}
			}	
		}
		this.subtitleSeeking = false;
	}
}


//--------------------------------------------------------------------------------------------------

GuiPlayer.handleOnRenderingComplete = function() {
	GuiPlayer.stopPlayback();
	
	////Call Resume Option - Check playlist first, then AutoPlay property, then return
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex++;
		if (this.VideoData.Items.length < this.PlayerIndex) {	
			//Take focus to no input
			document.getElementById("NoKeyInput").focus();
			
			this.PlayerData = this.VideoData.Items[this.PlayerIndex];
			GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
		} else {
			this.PlayerIndex = 0;
			GuiPlayer.restorePreviousMenu();
		}
	} else if (File.getUserProperty("AutoPlay")){
		if (this.PlayerData.Type == "Episode") {
			this.AdjacentData = Server.getContent(Server.getAdjacentEpisodesURL(this.PlayerData.SeriesId,this.PlayerData.SeasonId,this.PlayerData.Id));
			if (this.AdjacentData == null) { return; }
			
			if (this.AdjacentData.Items.length == 2 && (this.AdjacentData.Items[1].IndexNumber > this.ItemData.IndexNumber)) {
				var url = Server.getItemInfoURL(this.AdjacentData.Items[1].Id);
				//Take focus to no input
				document.getElementById("NoKeyInput").focus();
				this.PlayerData = Server.getContent(url);
				if (this.PlayerData == null) { return; }
				GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
			} else if (this.AdjacentData.Items.length > 2) {
				//Take focus to no input
				document.getElementById("NoKeyInput").focus();
				var url = Server.getItemInfoURL(this.AdjacentData.Items[2].Id);
				this.PlayerData = Server.getContent(url);
				if (this.PlayerData == null) { return; }
				GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
			}
		}
	} else {
		GuiPlayer.restorePreviousMenu();
	}
}

GuiPlayer.handleOnNetworkDisconnected = function() {
	//Transcoded files throw this error at end of playback!
	GuiPlayer.stopPlayback();
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleConnectionFailed = function() {
	GuiNotifications.setNotification(this.playingURL,"CONNECTION ERROR");
	alert ("CONNECTION ERROR");
	GuiPlayer.stopPlayback();
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleAuthenticationFailed = function() {
	GuiNotifications.setNotification("AUTHENTICATION ERROR");
	alert ("AUTHENTICATION ERROR");
	GuiPlayer.stopPlayback();
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleRenderError = function(RenderErrorType) {
    alert ("Rendor Error Type : " + RenderErrorType);
    GuiNotifications.setNotification("Rendor Error Type : " + RenderErrorType);
    GuiPlayer.stopPlayback();
    GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleStreamNotFound = function() {
	GuiNotifications.setNotification("STREAM NOT FOUND");
	alert ("STREAM NOT FOUND");
	GuiPlayer.stopPlayback();
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.setCurrentTime = function(time) {
	if (this.Status == "PLAYING") {
		this.currentTime = parseInt(time);

		//Subtitle Update
		if (this.playingSubtitleIndex != null && this.PlayerDataSubtitle != null && this.subtitleSeeking == false) {
			alert ("Subtitle Update");
			if (this.currentTime >= this.PlayerDataSubtitle[this.subtitleShowingIndex].endTime) {
				document.getElementById("guiPlayer_Subtitles").innerHTML = "";
				document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
				this.subtitleShowingIndex++;
			}
			if (this.currentTime >= this.PlayerDataSubtitle[this.subtitleShowingIndex].startTime && this.currentTime < this.PlayerDataSubtitle[this.subtitleShowingIndex].endTime && document.getElementById("guiPlayer_Subtitles").innerHTML != this.PlayerDataSubtitle.text) {
				document.getElementById("guiPlayer_Subtitles").innerHTML = this.PlayerDataSubtitle[this.subtitleShowingIndex].text; 
				document.getElementById("guiPlayer_Subtitles").style.visibility = "";
			}
		}
		
		this.updateTimeCount++;
		if (time > 0 && this.setThreeD == false) {
			//Check 3D & Audio
		    //Set Samsung Audio Output between DTS or PCM
		    this.setupAudioConfiguration();
		    this.setupThreeDConfiguration();			
		    this.setThreeD = true;
		}
		
		//Update GUIs
			percentage = (100 * this.currentTime / (this.PlayerData.RunTimeTicks / 10000));

	document.getElementById("guiPlayer_Info_ProgressBar_Current").style.width = percentage + "%";	
	document.getElementById("guiPlayer_Info_Time").innerHTML = Support.convertTicksToTime(this.currentTime, (this.PlayerData.RunTimeTicks / 10000));
	
		//Update Server every 8 ticks (Don't want to spam!
		if (this.updateTimeCount == 8) {
			this.updateTimeCount = 0;

			//Update Server
			Server.videoTime(this.PlayerData.Id,this.playingMediaSource.Id,this.currentTime,this.PlayMethod);
		}
	}
}

GuiPlayer.onBufferingStart = function() {
	this.Status = "PLAYING";
	alert("Buffering....");
	
	//Show Loading Screen
    document.getElementById("guiPlayer_Loading").style.visibility = "";
	
	//Stop Subtitle Display - Mainly for Transcode pauses
	if (this.playingSubtitleIndex != null) {
		this.subtitleSeeking = true;
	}
}

GuiPlayer.onBufferingProgress = function(percent) {
    alert("Buffering:" + percent + "%");
}

GuiPlayer.onBufferingComplete = function() {
    alert("Buffering Complete");
    
  //Sart Subtitle Display - Mainly for Transcode pauses
	if (this.playingSubtitleIndex != null) {
		this.subtitleSeeking = false;
	}
    
    //Hide Loading Screen
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    
	//Setup Volume & Mute Keys
	//Volume & Mute Control - Works!
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
    pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.unregistKey(tvKey.KEY_MUTE);
       
	//Set Focus for Key Events - Must be done on successful load of video
	document.getElementById("GuiPlayer").focus();
}

GuiPlayer.OnStreamInfoReady = function() {
	document.getElementById("guiPlayer_Info_Time").innerHTML = Support.convertTicksToTime(this.currentTime, (this.PlayerData.RunTimeTicks / 10000));
}

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER PLAYBACK KEY HANDLERS
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	switch(keyCode) {
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			this.stopPlayback();
            GuiPlayer.restorePreviousMenu();
			break;	
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.handleRightKey();
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.handleLeftKey();
			break;		
		case tvKey.KEY_PLAY:
			this.handlePlayKey();
			break;
		case tvKey.KEY_STOP:
			this.handleStopKey();
            break;
		case tvKey.KEY_PAUSE:
			this.handlePauseKey();
            break;   
        case tvKey.KEY_FF:
            this.handleFFKey();      
            break;       
        case tvKey.KEY_RW:
            this.handleRWKey();
            break;
        case tvKey.KEY_INFO:	
			GuiPlayer.handleInfoKey();
			break;
        case tvKey.KEY_3D:	
        	GuiPlayer.setupThreeDConfiguration();
			break;	
        case tvKey.KEY_TOOLS:
        	if (document.getElementById("guiPlayer_Tools").style.visibility == "hidden" && (this.subtitleIndexes.length > 0 || this.audioIndexes.length > 1)) {
        		GuiPlayer.updateSelectedItems();
        		document.getElementById("guiPlayer_Tools").style.visibility = "";
        		document.getElementById("GuiPlayer_Tools").focus();
        	}
        	break;
        case tvKey.KEY_EXIT:
            alert("EXIT");
            widgetAPI.blockNavigation(event);
            this.stopPlayback();
            GuiPlayer.restorePreviousMenu();
            break;	
	}
}

GuiPlayer.handleRightKey = function() {
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex++;
		if (this.VideoData.Items.length > this.PlayerIndex) {	
			this.stopPlayback();
			this.PlayerData = this.VideoData.Items[this.PlayerIndex];
			GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
		} else {
			//Reset PlayerData to correct index!!
			this.PlayerIndex--;
			this.PlayerData = this.VideoData.Items[this.PlayerIndex];
		}
	}
}

GuiPlayer.handleLeftKey = function() {
	if (this.startParams[0] == "PlayAll") {
		this.PlayerIndex--;
		if (this.PlayerIndex >= 0) {	
			this.stopPlayback();
			this.PlayerData = this.VideoData.Items[this.PlayerIndex];
			GuiPlayer_Versions.start(this.PlayerData,0,this.startParams[3]);
		} else {
			//Reset PlayerData to correct index!!
			this.PlayerIndex++;
			this.PlayerData = this.VideoData.Items[this.PlayerIndex];
		}
	}
}

GuiPlayer.handlePlayKey = function() {
	if (this.Status == "PAUSED") {
		this.Status = "PLAYING";
		this.plugin.Resume();
	}
}

GuiPlayer.handleStopKey = function() {
    alert("STOP");
    this.stopPlayback();
    GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handlePauseKey = function() {
	alert("PAUSE");
	if(this.Status == "PLAYING") {
		this.plugin.Pause();
		this.Status = "PAUSED";
		Server.videoPaused(this.PlayerData.Id,this.playingMediaSource.Id,this.currentTime,this.PlayMethod);           	
	} 
}

GuiPlayer.handleFFKey = function() {
	alert("FF");
    if(this.Status == "PLAYING") {
    	GuiPlayer.updateSubtitleTime(this.currentTime + 29000,"FF"); //Add 29 seconds on, let code find correct sub!
    	this.plugin.JumpForward(30); 
    }  
}

GuiPlayer.handleRWKey = function() {
	alert("RW");
    if(this.Status == "PLAYING") {
    	GuiPlayer.updateSubtitleTime(this.currentTime - 33000,"RW"); //Subtract 33 seconds on, let code find correct sub!
    	this.plugin.JumpBackward(30); 
    }  
}

GuiPlayer.handleInfoKey = function () {
	alert ("INFO KEY");
	if (document.getElementById("guiPlayer_Info").style.visibility=="hidden"){
		document.getElementById("guiPlayer_Info").style.visibility="";
		setTimeout(function(){
			document.getElementById("guiPlayer_Info").style.visibility="hidden";	
		}, 5000);
	} else {
		document.getElementById("guiPlayer_Info").style.visibility="hidden";
	}
}

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER 3D & AUDIO OUTPUT SETTERS
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.setupThreeDConfiguration = function() {
	if (this.playingMediaSource.Video3DFormat !== undefined) {
		if (this.pluginScreen.Flag3DEffectSupport()) {
			switch (this.playingMediaSource.Video3DFormat) {
			case "FullSideBySide":
			case "HalfSideBySide":
				result = GuiPlayer.pluginScreen.Set3DEffectMode(2);
			break;
			default:
				this.pluginScreen.Set3DEffectMode(0);
				break;
			}
		} else {
			this.pluginScreen.Set3DEffectMode(0);
		}
	} else {
		this.pluginScreen.Set3DEffectMode(0);
	}
}

GuiPlayer.setupAudioConfiguration = function() {

	var audioInfoStream = this.playingMediaSource.MediaStreams[this.playingAudioIndex];
	var codec = ((File.getTVProperty("Dolby") && File.getTVProperty("AACtoDolby")) && audioInfoStream.Codec.toLowerCase() == "aac") ? "ac3" : "aac";

	switch (codec) {
	case "dca":
		if (File.getTVProperty("DTS")){
			var checkAudioOutModeDTS = this.pluginAudio.CheckExternalOutMode(2);
			if (checkAudioOutModeDTS > 0) {
				this.pluginAudio.SetExternalOutMode(2);
			} else {
				this.pluginAudio.SetExternalOutMode(0);
			}
			
		} else {
			this.pluginAudio.SetExternalOutMode(0);
		}
		break;	
	case "ac3":
		if (File.getTVProperty("Dolby")) {
			var checkAudioOutModeDolby = this.pluginAudio.CheckExternalOutMode(1);
			if (checkAudioOutModeDolby > 0) {
				this.pluginAudio.SetExternalOutMode(1);
			} else {
				this.pluginAudio.SetExternalOutMode(0);
			}	
		}else {
			this.pluginAudio.SetExternalOutMode(0);
		}
		break;
	default:
		this.pluginAudio.SetExternalOutMode(0);
		break;
	}
};

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER TOOLS MENU FUNCTIONS
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.createToolsMenu = function() {
    //Create Tools Menu Subtitle
    //Must reset tools menu here on each playback!
    document.getElementById("guiPlayer_Tools").innerHTML = "";
    this.videoToolsOptions = [];
	for (var index = 0;index < this.playingMediaSource.MediaStreams.length;index++) {
		var Stream = this.playingMediaSource.MediaStreams[index];
		if (Stream.Type == "Audio") {
			this.audioIndexes.push(index);
		} 
		
		if (Stream.Type == "Subtitle" && Stream.IsTextSubtitleStream) {
			this.subtitleIndexes.push(index); //
		} 
	}
	    
	if (this.subtitleIndexes.length > 0) {
		this.subtitleIndexes.unshift(-1);
	    this.videoToolsOptions.push("videoOptionSubtitles");
	    document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionSubtitles" style="display:inline-block;">Subtitles</div>';
	}
	    
	//Hide if only 1 audio stream given thats the one playing!
	if (this.audioIndexes.length > 1) {
	    this.videoToolsOptions.push("videoOptionAudio");
	   	document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionAudio" style="display:inline-block;">Audio</div>';
	}
}

GuiPlayer.keyDownTools = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	this.videoToolsSelectedItemSub = 0;
	document.getElementById("guiPlayer_Tools_SubOptions").innerHTML = "";

	switch(keyCode) {
		case tvKey.KEY_TOOLS:
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			this.videoToolsSelectedItem = 0;
			document.getElementById("guiPlayer_Tools").style.visibility = "hidden";
			document.getElementById("GuiPlayer").focus();
			break;	
		case tvKey.KEY_LEFT:
			if (this.videoToolsSelectedItem > 0) {
				this.videoToolsSelectedItem--;
				this.updateSelectedItems();
			}
			break;
		case tvKey.KEY_RIGHT:
			if (this.videoToolsSelectedItem < this.videoToolsOptions.length-1) {
				this.videoToolsSelectedItem++;
				this.updateSelectedItems();
			}
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");	
			alert (this.videoToolsOptions[this.videoToolsSelectedItem]);
			switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
			case "videoOptionSubtitles":
				this.videoToolsSubOptions = this.subtitleIndexes;
				this.updateDisplayedItemsSub();
				this.updateSelectedItemsSub();
				document.getElementById("GuiPlayer_ToolsSub").focus();
				break;
			case "videoOptionAudio":
				this.videoToolsSubOptions = this.audioIndexes;
				this.updateDisplayedItemsSub();
				this.updateSelectedItemsSub();
				document.getElementById("GuiPlayer_ToolsSub").focus();
				break;	
			}
			break;		
        case tvKey.KEY_EXIT:
            alert("EXIT");
            widgetAPI.blockNavigation(event);
            this.stopPlayback();
            GuiPlayer.restorePreviousMenu();
            break;	
	}
}

GuiPlayer.updateSelectedItems = function() {
	for (var index = 0; index < this.videoToolsOptions.length; index++){	
		if (index == this.videoToolsSelectedItem) {
			document.getElementById(this.videoToolsOptions[index]).style.color = "red";	
		} else {	
			document.getElementById(this.videoToolsOptions[index]).style.color = "white";		
		}		
	} 
}

GuiPlayer.keyDownToolsSub = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	switch(keyCode) {
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			document.getElementById("GuiPlayer_Tools").focus();
			break;	
		case tvKey.KEY_UP:
			this.videoToolsSelectedItemSub--;
			if (this.videoToolsSelectedItemSub < 0) {
				this.videoToolsSelectedItemSub++;
			}
			if (this.videoToolsSelectedItemSub < this.topLeftItem) {
				this.topLeftItem--;
				this.updateDisplayedItemsSub();
			}
			this.updateSelectedItemsSub();
		break;
		case tvKey.KEY_DOWN:
			this.videoToolsSelectedItemSub++;
			if (this.videoToolsSelectedItemSub > this.videoToolsSubOptions.length-1) {
				this.videoToolsSelectedItemSub--;
			}
			if (this.videoToolsSelectedItemSub >= this.topLeftItem + this.maxDisplay) {
				this.topLeftItem++;
				this.updateDisplayedItemsSub();
			}
			this.updateSelectedItemsSub();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");	
			document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
			document.getElementById("guiPlayer_Tools").style.visibility = "hidden";
			switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
			case "videoOptionSubtitles":
				if (this.videoToolsSubOptions[this.videoToolsSelectedItemSub] == -1 && this.playingSubtitleIndex != null) {
					//Turn Off Subtitles
					this.PlayerDataSubtitle = null;
					this.playingSubtitleIndex = null;
					this.subtitleShowingIndex = 0;
					this.subtitleSeeking = false;
					document.getElementById("guiPlayer_Subtitles").innerHTML = "";
					document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
					document.getElementById("GuiPlayer").focus();	
				} else {
					//Check its not already selected 
					if (this.videoToolsSubOptions[this.videoToolsSelectedItemSub] != this.playingSubtitleIndex) {
						//Prevent displaying Subs while loading
						this.subtitleSeeking = true; 
						document.getElementById("guiPlayer_Subtitles").innerHTML = "";
						document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
						
						//Update SubtitleIndex and reset index
						this.playingSubtitleIndex = this.videoToolsSubOptions[this.videoToolsSelectedItemSub];
						this.subtitleShowingIndex = 0;
						
						//Load New Subtitle File
						this.getSubtitles(this.playingSubtitleIndex);
					    
					    //Update subs index
					    this.updateSubtitleTime(this.currentTime,"NewSubs");
					    
					    //Load Back to main page GUI
					    document.getElementById("GuiPlayer").focus();
					} else {
						//Do Nothing!
						document.getElementById("GuiPlayer").focus();
					}		
				}
				break;
			case "videoOptionAudio":
				if (this.videoToolsSubOptions[this.videoToolsSelectedItemSub] != this.playingAudioIndex) {
					this.stopPlayback();
					document.getElementById("GuiPlayer").focus();
					var transcodeResult = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.playingMediaSource,this.playingMediaSourceIndex, this.playingVideoIndex, this.videoToolsSubOptions[this.videoToolsSelectedItemSub]);
					var newTime = ((this.currentTime - 2000) < 0) ? 0 : this.currentTime - 2000; // Rewind a few seconds to ensure no gap loss
					GuiPlayer.startPlayback(transcodeResult, newTime);
				} else {
					//Do Nothing!
					document.getElementById("GuiPlayer").focus();
				}
				break;	
			}	
			break;	
			
        case tvKey.KEY_EXIT:
            alert("EXIT");
            widgetAPI.blockNavigation(event);
            this.stopPlayback();
            GuiPlayer.restorePreviousMenu();
            break;	
	}
}

GuiPlayer.updateSelectedItemsSub = function() {
	for (var index = this.topLeftItem; index < Math.min(this.videoToolsSubOptions.length,this.topLeftItem + this.maxDisplay);index++){	
		if (index == this.videoToolsSelectedItemSub) {
			document.getElementById("videoToolsSubOptions"+index).style.color = "red";	
		} else {	
			document.getElementById("videoToolsSubOptions"+index).style.color = "white";		
		}		
	} 
}

GuiPlayer.updateDisplayedItemsSub = function() {
	document.getElementById("guiPlayer_Tools_SubOptions").innerHTML = "";
	alert ("VideoToolsSubOptions Length: " + this.videoToolsSubOptions.length);
	for (var index = this.topLeftItem; index < Math.min(this.videoToolsSubOptions.length,this.topLeftItem + this.maxDisplay);index++) {
		
		switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
		case "videoOptionSubtitles":
			alert ("Subtitle Option Index in DisplayItems: " + this.videoToolsSubOptions[index]);
			if (this.videoToolsSubOptions[index] == -1) {
				document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>None</div>";	
			} else {
				var Name = "";
				if (this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Language !== undefined) {
					Name = this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Language;
				} else {
					Name = "Unknown Language";
				}
				if (this.playingSubtitleIndex == this.videoToolsSubOptions[index]) {
					Name += "<br>Currently Showing";
				}
				document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";	
			}	
			break;
		case "videoOptionAudio":
			//Run option through transcoding algorithm - see if it plays natively
			var transcodeResult = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.playingMediaSource,this.playingMediaSourceIndex, this.playingVideoIndex, this.videoToolsSubOptions[index]);
					
			var Name = this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Codec + " - ";
			if (this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Language !== undefined) {
				Name += this.playingMediaSource.MediaStreams[this.videoToolsSubOptions[index]].Language;
			} else {
				Name += "Unknown Language";
			}
			
			var requireTranscode = (transcodeResult[2] == "Direct Stream") ? "Direct Play" : "Transcode";
			Name += "<br>" + requireTranscode;
			if (this.playingAudioIndex == this.videoToolsSubOptions[index]) {
				Name += " - Currently Playing";
			}
			
			document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";
			break;	
		}	
	}
	document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "";
}

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER STOP HANDLER ON APP EXIT
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.stopOnAppExit = function() {
	if (this.plugin != null) {
		this.plugin.Stop();
		this.plugin = null;
	}
}

