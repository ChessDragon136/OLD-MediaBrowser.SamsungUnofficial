var GuiPlayer = {	
		plugin : null,
		pluginAudio : null,
		pluginScreen : null,
		
		Status : "STOPPED",
		currentTime : 0,
		updateTimeCount : 0,
		setThreeD : false,
		PlayMethod : "",
		
		isBitrateOveride : null,
		
		videoToolsOptions : [],
		videoToolsSelectedItem : 0,
		
		subtitleIndexes : [],
		audioIndexes : [],
		
		topLeftItem : 0,
		videoToolsSelectedItemSub : 0,
		maxDisplay : 5,
		videoToolsSubOptions : [],
		videoToolsaudioOptions : [],
		videoToolsTranscodeOptions : [],
		videoToolsTranscodeAllOptions : ["20971520","10485760","8388608","6291456","4194304","3145728","2097152","1572864","1048576"],
		
		PlayerData : null,
		MediaSource : null
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
    
    var totalBuffer = this.plugin.SetTotalBufferSize(40*1024*1024);
    alert ("Total Buffer Result: " + totalBuffer);
}

GuiPlayer.start = function(title,url,startingPlaybackTick,playedFromPage) { 
    //Get Item Data (Media Streams)
    this.PlayerData = Server.getContent(url);
    alert (url);
    
    //Call Resume Option
    GuiPlayer_Versions.start(this.PlayerData,startingPlaybackTick,playedFromPage);
}

GuiPlayer.startPlayback = function(MediaSource, resumeTicksSamsung) {
	//Initiate Player for Video
	this.init();

	//Reset Vars
	this.videoToolsOptions = [];
	this.videoToolsSelectedItem = 0;
	this.subtitleIndexes = [];
	this.audioIndexes = [];
	this.videoToolsTranscodeOptions = [];
	
	//Clear down any variables + stop video if playing
	this.Status = "STOPPED";
	this.currentTime = 0;
    this.updateTimeCount = 0;
    this.MediaSource = MediaSource;
    this.setThreeD = false;
    
    //If bitrateOvveride
    this.isBitrateOveride = (MediaSource[8] === undefined ? -1 : MediaSource[8]);
    
    //Set PageContent
    var fileInfo = this.PlayerData.Name;
    if (this.PlayerData.Type == "Episode") {
    	
    	var seasonNumber = this.PlayerData.ParentIndexNumber;
		var seasonString = "";
		if (seasonNumber < 10){
			seasonString = "0" + seasonNumber;
		}
		else{
			seasonString = seasonNumber;
		}
		
		var episodeNumber = this.PlayerData.IndexNumber;
		var episodeString = "";
		if (episodeNumber < 10){
			episodeString = "0" + episodeNumber;
		}
		else{
			episodeString = episodeNumber;
		}
			
    	fileInfo =  this.PlayerData.SeriesName + " S" + seasonString + "E" + episodeString + " - " + this.PlayerData.Name;
    }

    if (MediaSource[0].Protocol != "Http") {
    	var videoName = MediaSource[0].Name;
    	document.getElementById("guiPlayer_Info_Details").innerHTML = "<div class='videoInfo_Details_Item'>" + fileInfo + "</div><div class='videoInfo_Details_Item'>" + videoName + "</div>";

    	//Add Transcoding notice
    	if (this.MediaSource[2] && this.MediaSource[3]) {
    		this.PlayMethod = "DirectStream";
    		document.getElementById("guiPlayer_Info_Details").innerHTML += "<div class='videoInfo_Details_Item'>Direct Play</div>"; 
    	} else {
    		this.PlayMethod = "Transcode";
    		document.getElementById("guiPlayer_Info_Details").innerHTML += "<div class='videoInfo_Details_Item'>Transcoding</div>"; 
    	}
    } else {
    	this.PlayMethod = "Transcode";
    	document.getElementById("guiPlayer_Info_Details").innerHTML = "<div class='videoInfo_Details_Item'>" + fileInfo + "</div>";
    }
    
    //Create Tools Menu Subtitle
    //Must reset tools menu here on each playback!
    document.getElementById("guiPlayer_Tools").innerHTML = "";
    this.videoToolsOptions = [];
    if (MediaSource[0].Protocol != "Http") {
	    var subtitleStreamCount = 0;
	    var audioStreamCount = 0;
	    this.subtitleIndexes.push(-1) //No Subtitles Option
	    for (var index = 0;index < MediaSource[0].MediaStreams.length;index++) {
			var Stream = MediaSource[0].MediaStreams[index];
			if (Stream.Type == "Audio") {
				this.audioIndexes.push(index)
				audioStreamCount++;
			} 
			if (Stream.Type == "Subtitle") {
				this.subtitleIndexes.push(index)
				subtitleStreamCount++;
			} 
	    }
	    //Create Tools Menu Transcode
	    if (this.isBitrateOveride > -1) {this.videoToolsTranscodeOptions.push(-1);}
	    for (var index = 0; index < this.videoToolsTranscodeAllOptions.length; index++) {
	    	if (this.videoToolsTranscodeAllOptions[index] < this.MediaSource[0].MediaStreams[this.MediaSource[5]].BitRate) {
	    		this.videoToolsTranscodeOptions.push(this.videoToolsTranscodeAllOptions[index]);
	    	}
	    }
	    
	    if (subtitleStreamCount > 0) {
	    	this.videoToolsOptions.push("videoOptionSubtitles");
	    	document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionSubtitles" style="display:inline-block;">Subtitles</div>';
	    }
	    
	    //Hide if only 1 audio stream
	    if (audioStreamCount > 1) {
	    	this.videoToolsOptions.push("videoOptionAudio");
	    	document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionAudio" style="display:inline-block;">Audio</div>';
	    }
	
	    this.videoToolsOptions.push("videoOptionTranscoding");
	    document.getElementById("guiPlayer_Tools").innerHTML += '<div id="videoOptionTranscoding" style="display:inline-block;">Transcode</div>';
	}
    
    document.getElementById("pageContent").innerHTML = "";
    document.getElementById("page").style.visibility="hidden";
    document.getElementById("pageBackgroundFade").style.visibility="hidden";
    document.getElementById("pageBackground").style.visibility="hidden";
    
	//Update Server content is playing * update time
	Server.videoStarted(this.PlayerData.Id,this.MediaSource[0].Id,this.PlayMethod);
	
	//Turn off Screensaver, set mute off and set display area in relation to aspectratio
	pluginAPI.setOffScreenSaver();
	this.pluginAudio.SetUserMute(0);   
	this.setDisplaySize(MediaSource[0],MediaSource[5]);
	
	//Update URL with resumeticks
	MediaSource[1] = MediaSource[1] + '&StartTimeTicks=' + (resumeTicksSamsung*10000);
	
	//Calculate position in seconds
	var position = Math.round(resumeTicksSamsung / 1000);
    this.plugin.ResumePlay(MediaSource[1],position); 
}

GuiPlayer.stopPlayback = function() {
	alert ("STOPPING PLAYBACK");
	pluginAPI.setOnScreenSaver();
	this.plugin.Stop();
	this.Status = "STOPPED";
	Server.videoStopped(this.PlayerData.Id,this.MediaSource[0].Id,this.currentTime,this.PlayMethod);
}

GuiPlayer.restorePreviousMenu = function() {
	//Hide Player GUI Elements
	document.getElementById("guiPlayer_Info").style.visibility="hidden";
    document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
    document.getElementById("guiPlayer_Tools").style.visibility = "hidden";
    
    document.getElementById("pageBackgroundFade").style.visibility="";
    document.getElementById("pageBackground").style.visibility="";
    document.getElementById("page").style.visibility="";
    
    //Reset Volume & Mute Keys
	//Reset NAVI - Works
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(tvKey.KEY_VOL_UP);
    pluginAPI.registKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.registKey(tvKey.KEY_MUTE);

	//Return to correct Page
	Support.processReturnURLHistory();
}

GuiPlayer.setDisplaySize = function(MediaSource,videoIndex) {
	if (MediaSource.Protocol != "Http") {
		if (MediaSource.MediaStreams[videoIndex].AspectRatio == "16:9") {
			this.plugin.SetDisplayArea(0, 0, 960, 540);
		} else {
			//Scale Video	
			var ratioToShrinkX = 960 / MediaSource.MediaStreams[videoIndex].Width;
			var ratioToShrinkY = 540 / MediaSource.MediaStreams[videoIndex].Height;
				
			if (ratioToShrinkX < ratioToShrinkY) {
				var newResolutionX = 960;
				var newResolutionY = Math.round(MediaSource.MediaStreams[videoIndex].Height * ratioToShrinkX);
				var centering = Math.round((540-newResolutionY)/2);
				
				this.plugin.SetDisplayArea(parseInt(0), parseInt(centering), parseInt(newResolutionX), parseInt(newResolutionY));
			} else {
				var newResolutionX = Math.round(MediaSource.MediaStreams[videoIndex].Width * ratioToShrinkY);
				var newResolutionY = 540;
				var centering = Math.round((960-newResolutionX)/2);
				
				this.plugin.SetDisplayArea(parseInt(centering), parseInt(0), parseInt(newResolutionX), parseInt(newResolutionY));
			}			
		}	
	} else {
		this.plugin.SetDisplayArea(0, 0, 960, 540);
	}
}

//--------------------------------------------------------------------------------------------------

GuiPlayer.handleOnRenderingComplete = function() {
	//May alter to load the next file in series
	GuiPlayer.stopPlayback();
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleOnNetworkDisconnected = function() {
	//Transcoded files throw this error at end of playback!
	GuiPlayer.stopPlayback();
	GuiPlayer.restorePreviousMenu();
}

GuiPlayer.handleConnectionFailed = function() {
	GuiNotifications.setNotification(this.MediaSource[1],"CONNECTION ERROR");
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
	this.currentTime = time;
	this.updateTimeCount++;
	
	if (time > 0 && this.setThreeD == false) {
		//Check 3D & Audio
	    //Set Samsung Audio Output between DTS or PCM
	    if (this.MediaSource[0].Protocol != "Http") {
	    	this.setupAudioConfiguration();
	    	this.setupThreeDConfiguration();			
	    }
	    this.setThreeD = true;
	}
	
	//Update GUIs
	percentage = (this.currentTime / (this.PlayerData.RunTimeTicks / 10000));	
	var pixelWidth = Math.round(400 * percentage);
	if (pixelWidth > 400) {
		pixelWidth = 400;
	}
	document.getElementById("guiPlayer_Info_ProgressBar_Current").style.width = pixelWidth;	
	document.getElementById("guiPlayer_Info_Time").innerHTML = Support.convertTicksToTime(this.currentTime, (this.PlayerData.RunTimeTicks / 10000));
	
	//Update Server every 8 ticks (Don't want to spam!
	if (this.updateTimeCount == 8) {
		this.updateTimeCount = 0;

		//Update Server
		Server.videoTime(this.PlayerData.Id,this.MediaSource[0].Id,this.currentTime,this.PlayMethod);
	}
}

GuiPlayer.onBufferingStart = function() {
	this.Status = "PLAYING";
	alert("Buffering....");
	//Show Loading Screen (Maybe show if only transcoding?)
	if (document.getElementById("guiPlayer_Loading").style.visibility == "hidden")
		document.getElementById("guiPlayer_Loading").style.visibility = "";
}

GuiPlayer.onBufferingProgress = function(percent) {
    alert("Buffering:" + percent + "%");
}

GuiPlayer.onBufferingComplete = function() {
    alert("Buffering Complete");
    
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

//--------------------------------------------------------------------------------------------------------------

GuiPlayer.keyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	switch(keyCode)
	{
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			this.stopPlayback();
            GuiPlayer.restorePreviousMenu();
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
        	if (document.getElementById("guiPlayer_Tools").style.visibility == "hidden") {
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

//-------------------------------------------------------------------------------------------------------------

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
		Server.videoPaused(this.PlayerData.Id,this.MediaSource[0].Id,this.currentTime,this.PlayMethod);           	
	} 
}

GuiPlayer.handleFFKey = function() {
	alert("FF");
    if(this.Status == "PLAYING") {
    	this.plugin.JumpForward(30); 
    }  
}

GuiPlayer.handleRWKey = function() {
	alert("RW");
    if(this.Status == "PLAYING") {
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


GuiPlayer.stopOnAppExit = function() {
	if (this.plugin != null) {
		pluginAPI.setOnScreenSaver();
		this.plugin.Stop();
		this.plugin = null;
	}
}

GuiPlayer.setupThreeDConfiguration = function() { //Video3DFormat
	if (this.MediaSource[0].Video3DFormat !== undefined) {
		if (this.pluginScreen.Flag3DEffectSupport()) {
			switch (this.MediaSource[0].Video3DFormat) {
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

	var audioInfoStream = this.MediaSource[0].MediaStreams[this.MediaSource[6]];
	var codec = audioInfoStream.Codec.toLowerCase();

	switch (codec) {
	case "dca":
		if (File.getTVProperty("DTS")){
			var checkAudioOutModeDTS = this.pluginAudio.CheckExternalOutMode(2);
			if (checkAudioOutModeDTS > 0) {
				//GuiNotifications.setNotification("DTS Detected<br>DTS Enabled in Settings<br>DTS Set","Audio Troubleshooting");
				this.pluginAudio.SetExternalOutMode(2);
			} else {
				//GuiNotifications.setNotification("DTS Detected<br>DTS Enabled in Settings<br>DTS NOT Set<br>PCM Set","Audio Troubleshooting");
				this.pluginAudio.SetExternalOutMode(0);
			}
			
		} else {
			//GuiNotifications.setNotification("DTS Detected<br>DTS NOT Enabled in Settings<br>PCM Set","Audio Troubleshooting");
			this.pluginAudio.SetExternalOutMode(0);
		}
		break;	
	case "ac3":
		if (File.getTVProperty("Dolby")) {
			var checkAudioOutModeDolby = this.pluginAudio.CheckExternalOutMode(1);
			if (checkAudioOutModeDolby > 0) {
				//GuiNotifications.setNotification("Dolby Detected<br>Dolby Enabled in Settings<br>Dolby Set","Audio Troubleshooting");
				this.pluginAudio.SetExternalOutMode(1);
			} else {
				//GuiNotifications.setNotification("Dolby Detected<br>Dolby Enabled in Settings<br>Dolby NOT Set<br>PCM Set","Audio Troubleshooting");
				this.pluginAudio.SetExternalOutMode(0);
			}	
		}else {
			//GuiNotifications.setNotification("Dolby Detected<br>Dolby NOT Enabled in Settings<br>PCM Set","Audio Troubleshooting");
			this.pluginAudio.SetExternalOutMode(0);
		}
		break;
	default:
		//GuiNotifications.setNotification("PCM Set","Audio Troubleshooting");
		this.pluginAudio.SetExternalOutMode(0);
		break;
	}
}


GuiPlayer.keyDownTools = function()
{
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
			switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
			case "videoOptionSubtitles":
				this.videoToolsSubOptions = this.subtitleIndexes;
				this.updateDisplayedItemsSub();
				this.updateSelectedItemsSub();
				document.getElementById("GuiPlayer_ToolsSub").focus();
				break;
			case "videoOptionTranscoding":
				this.videoToolsSubOptions = this.videoToolsTranscodeOptions;
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


GuiPlayer.keyDownToolsSub = function()
{
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
				//Only stop if there is a change in selection!
				if (this.MediaSource[7] != this.subtitleIndexes[this.videoToolsSelectedItemSub]) {
					document.getElementById("NoKeyInput").focus(); //Prevents key input during video loading
					GuiPlayer.stopPlayback();
					document.getElementById("guiPlayer_Loading").style.visibility = "";
					var result = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.MediaSource[0], this.MediaSource[5], this.MediaSource[6], this.subtitleIndexes[this.videoToolsSelectedItemSub]);	
					GuiPlayer.startPlayback(result,this.currentTime); 
				} else {
					//Reset Key back to Main Menu
					document.getElementById("GuiPlayer").focus();
				}
				break;
			case "videoOptionAudio":
				//Only stop if there is a change in selection!
				if (this.MediaSource[6] != this.audioIndexes[this.videoToolsSelectedItemSub]) {
					document.getElementById("NoKeyInput").focus(); //Prevents key input during video loading
					GuiPlayer.stopPlayback();
					document.getElementById("guiPlayer_Loading").style.visibility = "";
					var result = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.MediaSource[0], this.MediaSource[5], this.audioIndexes[this.videoToolsSelectedItemSub],this.MediaSource[7]);	
					GuiPlayer.startPlayback(result,this.currentTime); 
				} else {
					//Reset Key back to Main Menu
					document.getElementById("GuiPlayer").focus();
				}
				break;	
			case "videoOptionTranscoding":
				document.getElementById("NoKeyInput").focus(); //Prevents key input during video loading
				GuiPlayer.stopPlayback();
				document.getElementById("guiPlayer_Loading").style.visibility = "";
				if (this.videoToolsTranscodeOptions[this.videoToolsSelectedItemSub] == -1) {
					//No bitrate change
					var result = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.MediaSource[0], this.MediaSource[5], this.MediaSource[6], this.MediaSource[7]);	
					GuiPlayer.startPlayback(result,this.currentTime); 
				} else {
					var result = GuiPlayer_Transcoding.start(this.PlayerData.Id, this.MediaSource[0], this.MediaSource[5], this.MediaSource[6], this.MediaSource[7],this.videoToolsTranscodeOptions[this.videoToolsSelectedItemSub]);	
					GuiPlayer.startPlayback(result,this.currentTime); 
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
	for (var index = this.topLeftItem; index < Math.min(this.videoToolsSubOptions.length,this.topLeftItem + this.maxDisplay);index++) {
		
		switch (this.videoToolsOptions[this.videoToolsSelectedItem]) {
		case "videoOptionSubtitles":
			if (this.videoToolsSubOptions[index] == -1) {
				document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>None</div>";	
			} else {
				var Name = "";
				if (this.MediaSource[0].MediaStreams[this.videoToolsSubOptions[index]].Language !== undefined) {
					Name = this.MediaSource[0].MediaStreams[this.videoToolsSubOptions[index]].Language;
				} else {
					Name = "Unknown Language";
				}
				if (this.MediaSource[7] == this.videoToolsSubOptions[index]) {
					Name += "<br>Currently Showing";
				}
				document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";	
			}	
			break;
		case "videoOptionTranscoding":
			var Name = this.getBitRateName(this.videoToolsSubOptions[index]);	
			if (this.MediaSource[7] == this.videoToolsSubOptions[index] || (this.isBitrateOveride == -1 && this.videoToolsSubOptions[index] == -1)) {
				Name += "<br>Currently Selected";
			}
			document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";
			break;
		case "videoOptionAudio":
			var Name = this.MediaSource[0].MediaStreams[this.videoToolsSubOptions[index]].Codec + " - ";
			if (this.MediaSource[0].MediaStreams[this.videoToolsSubOptions[index]].Language !== undefined) {
				Name += this.MediaSource[0].MediaStreams[this.videoToolsSubOptions[index]].Language;
			} else {
				Name += "Unknown Language";
			}
			if (this.MediaSource[6] == this.videoToolsSubOptions[index]) {
				Name += "<br>Currently Selected";
			}
			document.getElementById("guiPlayer_Tools_SubOptions").innerHTML += "<div id=videoToolsSubOptions"+index+" class=videoToolsOption>"+Name+"</div>";
			break;	
		}	
	}
	document.getElementById("guiPlayer_Tools_SubOptions").style.visibility = "";
	this.updateSelectedItemsSub();
}

GuiPlayer.getBitRateName = function(bitRate) {
	if (bitRate == -1) {
		return "No manual bitrate"
	} else {
		return (bitRate / (1024*1024) + "MB/s");
	}
}
