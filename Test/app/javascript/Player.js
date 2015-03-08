var Player = {
	plugin : null,
	state : -1,
	skipState : -1,
	originalSource : null,

	STOPPED : 0,
	PLAYING : 1,
	PAUSED : 2,
	FORWARD : 3,
	REWIND : 4
}

Player.init = function() {
	var success = true;
	this.state = this.STOPPED;
	
	this.plugin = document.getElementById("pluginPlayer");
	this.plugin.OnEvent = onEvent;
	this.plugin.Open("Player", "0001", "InitPlayer");

	if(!this.plugin) {
		success = false;
	}
	return success;
}

Player.deinit = function() {
	alert("Player deinit !!! ");

	if(this.plugin) {
		this.plugin.Execute("Stop");
		this.plugin.Close();
	}
}

Player.setWindow = function() {
	this.plugin.Execute('SetDisplayArea', 0, 0, 960, 540);
}

Player.playVideo = function() {
		this.url ="http://192.168.1.108/test.mp4";
		this.state = this.PLAYING;
		this.setWindow();
		this.plugin.Execute("Play", this.url);
		Audio.plugin.Execute('SetSystemMute',0);
}

Player.pauseVideo = function() {
	this.state = this.PAUSED;
	this.plugin.Execute("Pause");
}

Player.stopVideo = function() {
	if(this.state != this.STOPPED) {
		this.state = this.STOPPED;
		this.plugin.Execute("Stop");
	} else {
		alert("Ignoring stop request, not in correct state");
	}
}

Player.resumeVideo = function() {
	this.state = this.PLAYING;
	this.plugin.Execute("Resume");
}

Player.skipForwardVideo = function() {
	this.skipState = this.FORWARD;
	this.plugin.Execute("JumpForward", 5);
}

Player.skipBackwardVideo = function() {
	this.skipState = this.REWIND;
	this.plugin.Execute("JumpBackward", 5);
}

Player.getState = function() {
	return this.state;
}
// Global functions called directly by the player

Player.onBufferingStart = function() {
}

Player.onBufferingProgress = function(percent) {
}

Player.onBufferingComplete = function() {
}

Player.setCurTime = function(time) {
}

Player.setTotalTime = function() {
}
onServerError = function() {
}
OnNetworkDisconnected = function() {
}
getBandwidth = function(bandwidth) {
}
onDecoderReady = function() {
	alert("onDecoderReady");
}
onRenderError = function() {
	alert("onRenderError");
}
stopPlayer = function() {
	Player.stopVideo();
}
setTottalBuffer = function(buffer) {
	alert("setTottalBuffer " + buffer);
}
setCurBuffer = function(buffer) {
	alert("setCurBuffer " + buffer);
}

function onEvent(event, param) {
	switch (event) {
		case 14:// OnCurrentPlayBackTime, param = playback time in ms
			alert("updateStatus " + param);
			Player.setCurTime(param);
			break;
	
		case 1:		// OnConnectionFailed
			alert("Error: Connection failed");			
			break;
			
		case 2:		// OnAuthenticationFailed
			alert("Error: Authentication failed");			
			break;
			
		case 3:		// OnStreamNotFound
			alert("Error: Stream not found");			
			break;
			
		case 4:		// OnNetworkDisconnected
			alert("Error: Network disconnected");			
			break;
			
		case 6:		// OnRenderError
			var error;
			switch (param) {
				case 1:
					error = "Unsupported container";
					break;
				case 2:
					error = "Unsupported video codec";
					break;
				case 3:
					error = "Unsupported audio codec";
					break;
				case 6:
					error = "Corrupted stream";
					break;
				default:
					error = "Unknown";
			}
			alert("Error: " + error);			
			break;
			
		case 8:		// OnRenderingComplete
			alert("End of streaming");			
			break;
			
		case 9:		// OnStreamInfoReady
			alert("updateStatus");
			//Player.setTotalTime(param);
			//Audio
			alert (Player.plugin.Execute('GetTotalNumOfStreamID',1));
			alert (Player.plugin.Execute('GetCurrentStreamID',1));
			
			//Subtitle
			alert (Player.plugin.Execute('GetTotalNumOfStreamID',5));
			break;	
			
		case 11:	// OnBufferingStart
			alert("Buffering started");
			Player.onBufferingStart(param);
			break;
			
		case 12:	// OnBufferingComplete
			alert("Buffering complete");
			Player.onBufferingComplete(param);
			break;
			
		case 13:	// OnBufferingProgress, param = progress in % 
			alert("Buffering: ");
			Player.onBufferingProgress(param);
			break;
			
		case 19:	// OnSubtitle, param = subtitle string for current playing time
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			alert("Subtitle");
			break;
	}
}