var GuiLivePlayer = {	
		plugin : null,
		pluginAudio : null,
		
		Status : "STOPPED",
		
		PlayerData : null
}


GuiLivePlayer.init = function() {
	GuiMusicPlayer.stopOnAppExit();
	
	this.plugin = document.getElementById("pluginPlayer");
	this.pluginAudio = document.getElementById("pluginObjectAudio");
	
	//Set up Player
	this.plugin.OnConnectionFailed = 'GuiLivePlayer.handleConnectionFailed';
	this.plugin.OnAuthenticationFailed = 'GuiLivePlayer.handleAuthenticationFailed';
	this.plugin.OnNetworkDisconnected = 'GuiLivePlayer.handleOnNetworkDisconnected';
	this.plugin.OnRenderError = 'GuiLivePlayer.handleRenderError';
	this.plugin.OnStreamNotFound = 'GuiLivePlayer.handleStreamNotFound';
	this.plugin.OnRenderingComplete = 'GuiLivePlayer.handleOnRenderingComplete';
	this.plugin.OnCurrentPlayTime = 'GuiLivePlayer.setCurrentTime';
    this.plugin.OnBufferingStart = 'GuiLivePlayer.onBufferingStart';
    this.plugin.OnBufferingProgress = 'GuiLivePlayer.onBufferingProgress';
    this.plugin.OnBufferingComplete = 'GuiLivePlayer.onBufferingComplete';  
    this.plugin.OnStreamInfoReady = 'GuiLivePlayer.OnStreamInfoReady'; 
}

GuiLivePlayer.start = function(title,url,startingPlaybackTick,playedFromPage) { 
	//Turn off screensaver
	Support.screensaverOff();
	
    //Get Item Data (Media Streams)
    this.PlayerData = Server.getContent(url);
    alert (url);  
}

GuiLivePlayer.startPlayback = function(url) {
	//Initiate Player for Video
	this.init();

	alert (url);
	
	//Clear down any variables
	this.Status = "STOPPED";
	
    document.getElementById("guiPlayer_Info_Details").innerHTML = "Not Implemented Yet";
    document.getElementById("pageContent").innerHTML = "";
    document.getElementById("page").style.visibility="hidden";
	
    //Set Focus for Key Events is set in OnStreamInfoReady to prevent unauthorised key presses during loading
	
	//Turn off Screensaver, set mute off and set display area in relation to aspectratio
	pluginAPI.setOffScreenSaver();
	this.pluginAudio.SetUserMute(0);   
    this.plugin.Play(url)
}

GuiLivePlayer.stopPlayback = function() {
	if (this.Status == "PLAYING" || this.Status == "PAUSED") {
		alert ("STOPPING PLAYBACK");
		pluginAPI.setOnScreenSaver();
		this.plugin.Stop();
		this.Status = "STOPPED";
	}
}

GuiLivePlayer.restorePreviousMenu = function() {
	//Hide Player GUI Elements
	document.getElementById("GuiLivePlayer_Info").style.visibility="hidden";
    document.getElementById("GuiLivePlayer_Loading").style.visibility = "hidden";
    document.getElementById("page").style.visibility="";
	
    //Reset Volume & Mute Keys
	//Reset NAVI - Works
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_NONE);
    pluginAPI.registKey(tvKey.KEY_VOL_UP);
    pluginAPI.registKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.registKey(tvKey.KEY_MUTE);
    
    //Turn On Screensaver
	Support.screensaver();

	//Return to correct Page
	Support.processReturnURLHistory();
}

//--------------------------------------------------------------------------------------------------

GuiLivePlayer.handleOnRenderingComplete = function() {
	//May alter to load the next file in series
	GuiLivePlayer.stopPlayback();
	GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.handleOnNetworkDisconnected = function() {
	//Transcoded files throw this error at end of playback!
	GuiLivePlayer.stopPlayback();
	GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.handleConnectionFailed = function() {
	GuiNotifications.setNotification("CONNECTION ERROR");
	alert ("CONNECTION ERROR");
	GuiLivePlayer.stopPlayback();
	GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.handleAuthenticationFailed = function() {
	GuiNotifications.setNotification("AUTHENTICATION ERROR");
	alert ("AUTHENTICATION ERROR");
	GuiLivePlayer.stopPlayback();
	GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.handleRenderError = function(RenderErrorType) {
    alert ("Rendor Error Type : " + RenderErrorType);
    GuiNotifications.setNotification("Rendor Error Type : " + RenderErrorType);
    GuiLivePlayer.stopPlayback();
    GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.handleStreamNotFound = function() {
	GuiNotifications.setNotification("STREAM NOT FOUND");
	alert ("STREAM NOT FOUND");
	GuiLivePlayer.stopPlayback();
	GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.onBufferingStart = function() {
	this.Status = "PLAYING";
	alert("Buffering....");
	//Show Loading Screen (Maybe show if only transcoding?)
	if (document.getElementById("GuiPlayer_Loading").style.visibility == "hidden")
		document.getElementById("GuiPlayer_Loading").style.visibility = "";
}

GuiLivePlayer.onBufferingProgress = function(percent) {
    alert("Buffering:" + percent + "%");
}

GuiLivePlayer.onBufferingComplete = function() {
    alert("Buffering Complete");
    //Hide Loading Screen
    document.getElementById("GuiPlayer_Loading").style.visibility = "hidden";
}

GuiLivePlayer.OnStreamInfoReady = function() {
	document.getElementById("GuiPlayer_Info_Time").innerHTML = Support.convertTicksToTime(this.currentTime, (this.PlayerData.RunTimeTicks / 10000));

	//Setup Volume & Mute Keys
	//Volume & Mute Control - Works!
	NNaviPlugin = document.getElementById("pluginObjectNNavi");
    NNaviPlugin.SetBannerState(PL_NNAVI_STATE_BANNER_VOL);
    pluginAPI.unregistKey(tvKey.KEY_VOL_UP);
    pluginAPI.unregistKey(tvKey.KEY_VOL_DOWN);
    pluginAPI.unregistKey(tvKey.KEY_MUTE);

	//Set Focus for Key Events - Must be done on successful load of video
	document.getElementById("GuiLivePlayer").focus();
}

//--------------------------------------------------------------------------------------------------------------

GuiLivePlayer.keyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	switch(keyCode)
	{
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			this.stopPlayback();
            GuiLivePlayer.restorePreviousMenu();
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
        case tvKey.KEY_INFO:	
			//GuiLivePlayer.handleInfoKey();
			break;
        case tvKey.KEY_TOOLS:
        	break;
        case tvKey.KEY_EXIT:
            alert("EXIT");
            widgetAPI.blockNavigation(event);
            this.stopPlayback();
            GuiLivePlayer.restorePreviousMenu();
            break;	
	}
}

//-------------------------------------------------------------------------------------------------------------

GuiLivePlayer.handlePlayKey = function() {
	if (this.Status == "PAUSED") {
		this.Status = "PLAYING";
		this.plugin.Resume();
	}
}

GuiLivePlayer.handleStopKey = function() {
    alert("STOP");
    this.stopPlayback();
    GuiLivePlayer.restorePreviousMenu();
}

GuiLivePlayer.handlePauseKey = function() {
	alert("PAUSE");
	if(this.Status == "PLAYING") {
		this.plugin.Pause();
		this.Status = "PAUSED";
		Server.videoPaused(this.PlayerData.Id,this.MediaSource[0].Id,this.currentTime);           	
	} 
}

GuiLivePlayer.handleInfoKey = function () {
	alert ("INFO KEY");
	if (document.getElementById("GuiLivePlayer_Info").style.visibility=="hidden"){
		document.getElementById("GuiLivePlayer_Info").style.height="60px";
	
		document.getElementById("GuiLivePlayer_Info").style.visibility="";
		setTimeout(function(){
			document.getElementById("GuiLivePlayer_Info").style.visibility="hidden";	
		}, 5000);
	} else {
		document.getElementById("GuiLivePlayer_Info").style.visibility="hidden";
	}
}


GuiLivePlayer.stopOnAppExit = function() {
	if (this.plugin != null) {
		pluginAPI.setOnScreenSaver();
		this.plugin.Stop();
		this.plugin = null;
	}
}