var widgetAPI = new Common.API.Widget();
var tvKey = new Common.API.TVKeyValue();

var Main =
{
    mode : 0,
    mute : 0,
    
    NMUTE : 0,
    YMUTE : 1
}

Main.onLoad = function()
{
    if ( Player.init() && Audio.init() ) {
        // Enable key event processing
        this.enableKeys();
        widgetAPI.sendReadyEvent();   
        
        this.handlePlayKey();
    } else {
       alert("Failed to initialise");
    }
}

Main.onUnload = function() {
    Player.deinit();
    Audio.deinit();
}

Main.enableKeys = function()
{
    document.getElementById("anchor").focus();
}

Main.keyDown = function()
{
    var keyCode = event.keyCode;
    alert("Key pressed: " + keyCode);
    
    switch(keyCode)
    {
        case tvKey.KEY_RETURN:
        case tvKey.KEY_PANEL_RETURN:
            alert("RETURN");
            Player.stopVideo();
            widgetAPI.sendReturnEvent(); 
            break;    
            break;
    
        case tvKey.KEY_PLAY:
            alert("PLAY");
            
            this.handlePlayKey();
            break;
            
        case tvKey.KEY_STOP:
            alert("STOP");
            Player.stopVideo();
            break;
            
        case tvKey.KEY_PAUSE:
            alert("PAUSE");
            this.handlePauseKey();
            break;
            
        case tvKey.KEY_FF:
            alert("FF");
            if(Player.getState() != Player.PAUSED)
                Player.skipForwardVideo();
            break;
        
        case tvKey.KEY_RW:
            alert("RW");
            if(Player.getState() != Player.PAUSED)
                Player.skipBackwardVideo();
            break;

        case tvKey.KEY_VOL_UP:
        case tvKey.KEY_PANEL_VOL_UP:
            alert("VOL_UP");
            if(this.mute == 0)
                Audio.setRelativeVolume(0);
            break;
            
        case tvKey.KEY_VOL_DOWN:
        case tvKey.KEY_PANEL_VOL_DOWN:
            alert("VOL_DOWN");
            if(this.mute == 0)
                Audio.setRelativeVolume(1);
            break;                
        case tvKey.KEY_ENTER:
        case tvKey.KEY_PANEL_ENTER:
            alert("ENTER");
            this.toggleMode();
            break;
        
        case tvKey.KEY_MUTE:
            alert("MUTE");
            this.muteMode();
            break;
            
        default:
            alert("Unhandled key");
            break;
    }
}

Main.handlePlayKey = function() {
    switch ( Player.getState() ) {
        case Player.STOPPED:
            Player.playVideo();
            break;
            
        case Player.PAUSED:
            Player.resumeVideo();
            break;
            
        default:
            alert("Ignoring play key, not in correct state");
            break;
    }
}

Main.handlePauseKey = function()
{
    switch ( Player.getState() )
    {
        case Player.PLAYING:
            Player.pauseVideo();
            break;
        
        default:
            alert("Ignoring pause key, not in correct state");
            break;
    }
}

Main.setMuteMode = function() {
    if (this.mute != this.YMUTE) {
		Audio.plugin.Execute('SetUserMute', 1);
        this.mute = this.YMUTE;
    }
}

Main.noMuteMode = function() {
    if (this.mute != this.NMUTE) {
        Audio.plugin.Execute('SetUserMute', 0);
        this.mute = this.NMUTE;
    }
}

Main.muteMode = function()
{
    switch (this.mute)
    {
        case this.NMUTE:
            this.setMuteMode();
            break;
            
        case this.YMUTE:
            this.noMuteMode();
            break;
            
        default:
            alert("ERROR: unexpected mode in muteMode");
            break;
    }
}
