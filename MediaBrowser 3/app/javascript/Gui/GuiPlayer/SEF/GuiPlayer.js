var GuiPlayer = {	
		plugin : null,
		pluginAudio : null,
		
		Status : "STOPPED",
		PlayMethod : "",
		videoStartTime : null,
		
		playingMediaSource : null,
		playingURL : null,
		playingTranscodeStatus : null,
		playingVideoIndex : null,
		playingAudioIndex : null,
		playingSubtitleIndex : null,
			
		VideoData : null,
		PlayerData : null,
		PlayerIndex : null,

		startParams : []
}


GuiPlayer.init = function() {
	//GuiMusicPlayer.stopOnAppExit();
	
	this.plugin = document.getElementById("pluginSEFPlayer");
	this.pluginAudio = document.getElementById("pluginSEFAudio");
	
	this.plugin.OnEvent = onEvent;
	this.plugin.Open("Player", "0001", "InitPlayer");
	
	this.pluginAudio = document.getElementById("pluginAudio");
	this.pluginAudio.Open("Audio", "1.000", "GetVolume");
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
	this.chapterIndexes = [];
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
    
    //Hide page!
    document.getElementById("pageContent").innerHTML = "";
    document.getElementById("page").style.visibility="hidden";
    document.getElementById("pageBackgroundFade").style.visibility="hidden";
    document.getElementById("pageBackgroundHolder").style.visibility="hidden";
    document.getElementById("pageBackground").style.visibility="hidden";
    document.getElementById("guiPlayer_Loading").style.visibility = "";    

	//Turn off Screensaver and set display area in relation to aspect ratio
	pluginAPI.setOffScreenSaver();  
	this.setDisplaySize();
	
	//Update Server content is playing * update time
	Server.videoStarted(this.PlayerData.Id,this.playingMediaSource.Id,this.PlayMethod);
    
	//Update URL with resumeticks
	if (Main.getModelYear() == "D" && this.playingTranscodeStatus != "Direct Play") {
		var url = this.playingURL + '&StartTimeTicks=' + (resumeTicksSamsung*10000) + '|COMPONENT=HLS';
		var position = Math.round(resumeTicksSamsung / 1000);
		this.plugin.Execute("Play", url);
	} else {
		var url = this.playingURL + '&StartTimeTicks=' + (resumeTicksSamsung*10000);
		var position = Math.round(resumeTicksSamsung / 1000);
		this.plugin.Execute("Play", url);
	}
	
	this.pluginAudio.Execute('SetSystemMute',0);
	
}

GuiPlayer.setDisplaySize = function() {
	if (this.playingMediaSource.MediaStreams[this.playingVideoIndex].AspectRatio == "16:9") {
		this.plugin.Execute('SetDisplayArea', 0, 0, 960, 540);
	} else {
		//Scale Video	
		var ratioToShrinkX = 960 / this.playingMediaSource.MediaStreams[this.playingVideoIndex].Width;
		var ratioToShrinkY = 540 / this.playingMediaSource.MediaStreams[this.playingVideoIndex].Height;
			
		if (ratioToShrinkX < ratioToShrinkY) {
			var newResolutionX = 960;
			var newResolutionY = Math.round(this.playingMediaSource.MediaStreams[this.playingVideoIndex].Height * ratioToShrinkX);
			var centering = Math.round((540-newResolutionY)/2);
				
			this.plugin.Execute('SetDisplayArea', parseInt(0), parseInt(centering), parseInt(newResolutionX), parseInt(newResolutionY));
		} else {
			var newResolutionX = Math.round(this.playingMediaSource.MediaStreams[this.playingVideoIndex].Width * ratioToShrinkY);
			var newResolutionY = 540;
			var centering = Math.round((960-newResolutionX)/2);
				
			this.plugin.Execute('SetDisplayArea', parseInt(centering), parseInt(0), parseInt(newResolutionX), parseInt(newResolutionY));
		}			
	}	
}

GuiPlayer.stopPlayback = function() {
	alert ("STOPPING PLAYBACK");
	
	//Hide Subtitles Here
	document.getElementById("guiPlayer_Subtitles").innerHTML = "";
	document.getElementById("guiPlayer_Subtitles").style.visibility = "hidden";
	
	this.plugin.Execute('Stop');
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
    document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "hidden";
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


//--------------------------------------------------------------------------------------------------

function onEvent(event, param) {
	switch (event) {
		case 14:
			GuiPlayer.setCurrentTime(param);
			break;
	
		case 1:	
			GuiPlayer.handleConnectionFailed();			
			break;
			
		case 2:		
			GuiPlayer.handleAuthenticationFailed();		
			break;
			
		case 3:	
			GuiPlayer.handleStreamNotFound();			
			break;
			
		case 4:
			GuiPlayer.handleOnNetworkDisconnected();		
			break;
			
		case 6:	
			GuiPlayer.handleRenderError(param);		
			break;
			
		case 8:
			GuiPlayer.handleOnRenderingComplete();	
			break;
			
		case 9:
			GuiPlayer.OnStreamInfoReady();
			//alert(" " +Player.plugin.Execute("StartSubtitle", Player.surl));
			//alert(" " +Player.plugin.Execute("SetStreamID", 5, 0));
			break;	
			
		case 11:	// OnBufferingStart
			GuiPlayer.onBufferingStart();
			break;
			
		case 12:
			GuiPlayer.onBufferingComplete();
			break;
			
		case 13:
			GuiPlayer.onBufferingProgress()
			break;
			
		case 19:	// OnSubtitle, param = subtitle string for current playing time
			alert("Subtitle");
			break;
	}
}


GuiPlayer.handleOnRenderingComplete = function() {
	GuiPlayer.stopPlayback();
	alert ("RENDERING COMPLETE");
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleOnNetworkDisconnected = function() {
	//Transcoded files throw this error at end of playback!
	alert ("Network Disconnected")
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
}

GuiPlayer.onBufferingStart = function() {
	this.Status = "PLAYING";
	alert("Buffering....");
	
	//Show Loading Screen
    document.getElementById("guiPlayer_Loading").style.visibility = "";
}

GuiPlayer.onBufferingProgress = function(percent) {
    alert("Buffering:" + percent + "%");
}

GuiPlayer.onBufferingComplete = function() {
    alert("Buffering Complete");

    //Hide Loading Screen
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    
	//Set Focus for Key Events - Must be done on successful load of video
	document.getElementById("GuiPlayer").focus();
}

GuiPlayer.OnStreamInfoReady = function() {
	
	//Audio
	alert (this.plugin.Execute('GetTotalNumOfStreamID',1));
	alert (this.plugin.Execute('GetCurrentStreamID',1));
	
	//Subtitle
	alert (this.plugin.Execute('GetTotalNumOfStreamID',5));

	//document.getElementById("guiPlayer_Info_Time").innerHTML = Support.convertTicksToTime(this.currentTime, (this.PlayerData.RunTimeTicks / 10000));
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
		case tvKey.KEY_PLAY:
			this.handlePlayKey();
			break;
		case tvKey.KEY_RED:
			this.plugin.Execute("SetStreamID", 1, 1);
			this.plugin.Execute("SetStreamID", 5, 1);
			break;
		case tvKey.KEY_BLUE:
			this.plugin.Execute("SetStreamID", 1, 2);
			this.plugin.Execute("SetStreamID", 5, 2);
			break;	
		case tvKey.KEY_YELLOW:
			this.plugin.Execute("SetStreamID", 1, 0);
			this.plugin.Execute("SetStreamID", 5, 0);
			break;		
		case tvKey.KEY_STOP:
			this.handleStopKey();
            break;
		case tvKey.KEY_FF:
			this.plugin.Execute("JumpForward", 30);
            break; 
        case tvKey.KEY_EXIT:
            alert("EXIT");
            widgetAPI.blockNavigation(event);
            this.stopPlayback();
            GuiPlayer.restorePreviousMenu();
            break;	
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

//-----------------------------------------------------------------------------------------------------------------------------------------
//       GUIPLAYER STOP HANDLER ON APP EXIT
//-----------------------------------------------------------------------------------------------------------------------------------------

GuiPlayer.stopOnAppExit = function() {
	if (this.plugin != null) {
		this.plugin.Stop();
		this.plugin = null;
	}
}

