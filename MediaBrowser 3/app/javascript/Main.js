var widgetAPI = new Common.API.Widget();
var pluginAPI = new Common.API.Plugin();
var tvKey = new Common.API.TVKeyValue();

var Main =
{
		version : "v0.572",
		requiredServerVersion : "3.0.5211",
		requiredDevServerVersion : "3.0.5507.2131",
		
		//TV Series Version
		modelYear : null,
		
		forceDeleteSettings : false,
		
		enableMusic : true,
		enableLiveTV : false,
		enablePhoto : true,
		enableCollections : true,
		enableChannels : false,
		
		enableScreensaver : true,
		isScreensaverRunning : false,
};

Main.getModelYear = function() {
	return this.modelYear;
}

Main.isMusicEnabled = function() {
	return this.enableMusic;
}

Main.isLiveTVEnabled = function() {
	return this.enableLiveTV;
}

Main.isPhotoEnabled = function() {
	return this.enablePhoto;
}

Main.isCollectionsEnabled = function() {
	return this.enableCollections;
}

Main.isChannelsEnabled = function() {
	return this.enableChannels;
}

Main.isScreensaverEnabled = function() {
	return this.enableScreensaver;
}

Main.getRequiredServerVersion = function() {
	return this.requiredServerVersion;
}

Main.getVersion = function() {
	return this.version;
}

Main.getIsScreensaverRunning = function() {
	return this.isScreensaverRunning;
}

Main.setIsScreensaverRunning = function() {
	if (this.isScreensaverRunning == false) {
		this.isScreensaverRunning = true;
	} else {
		this.isScreensaverRunning = false;
	}
}



Main.onLoad = function()
{	
	//Setup Logging
	FileLog.loadFile(false); // doesnt return contents, done to ensure file exists
	FileLog.write("---------------------------------------------------------------------")
	FileLog.write("MB3 Application Started")
	
	//Delete Old style Settings File
	File.deleteOldSettingsFile();
	
	//Turn ON screensaver
	pluginAPI.setOnScreenSaver();
	
	//Register Tools Key
	pluginAPI.registKey(tvKey.KEY_TOOLS);
	pluginAPI.registKey(tvKey.KEY_3D); 
	
	//Set Version Number & initialte clock
	document.getElementById("headerVersion").innerHTML = this.version;
	Support.clock();
	
	//Set DeviceID & Device Name
	var NNaviPlugin = document.getElementById("pluginObjectNNavi");
	var pluginNetwork = document.getElementById("pluginObjectNetwork");
	var pluginTV = document.getElementById("pluginObjectTV");
	
	var ProductType = pluginNetwork.GetActiveType();
	var phyConnection = pluginNetwork.CheckPhysicalConnection(ProductType); //returns -1
	var http = pluginNetwork.CheckHTTP(ProductType); //returns -1
	var gateway = pluginNetwork.CheckGateway(ProductType); //returns -1
	
	//Get the model year - Used for transcoding
	this.modelYear = pluginTV.GetProductCode(0).substring(4,5);
	alert ("Model Year: " + this.modelYear);
	
	if (phyConnection && http && gateway) {
		var MAC = pluginNetwork.GetMAC(1);
		if (MAC == false || MAC == null) { //Set mac to fake	
			MAC = "0123456789ab" ;
		}
		
		Server.setDevice ("Samsung " + pluginTV.GetProductCode(0));
		Server.setDeviceID(NNaviPlugin.GetDUID(MAC));
		
	    //Load Settings File - Check if file needs to be deleted due to development
	    var fileJson = JSON.parse(File.loadFile()); 
	    var version = File.checkVersion(fileJson);
	    if (version == "Undefined" ) {
	    	//Delete Settings file and reload
	    	File.deleteSettingsFile();
	    	fileJson = JSON.parse(File.loadFile());
	    } else if (version != this.version) {
	    	if (this.forceDeleteSettings == true) {
	    		//Delete Settings file and reload
	    		File.deleteSettingsFile();
		    	fileJson = JSON.parse(File.loadFile());
	    	} else {
	    		//Update version in settings file to current version
	    		fileJson.Version = this.version;
	    	} 	File.writeAll(fileJson);
	    }
	    
	    //Check if Server exists
	    if (fileJson.Servers.length > 1) {
	    	//If no default show user Servers page (Can set default on that page)
	    	var foundDefault = false;
	    	for (var index = 0; index < fileJson.Servers.length; index++) {
	    		if (fileJson.Servers[index].Default == true) {
	    			foundDefault = true;
	    			File.setServerEntry(index);
	    			Server.testConnectionSettings(fileJson.Servers[index].Path,true);    				
	    			break;
	    		}
	    	}
	    	if (foundDefault == false) {
	    		GuiPage_Servers.start();
	    	}
	    } else if (fileJson.Servers.length == 1) {
	    	//If 1 server auto login with that
	    	File.setServerEntry(0);
	    	Server.testConnectionSettings(fileJson.Servers[0].Path,true); 
	    } else {
	    	//No Server Defined - Load GuiPage_IP
	    	GuiPage_NewServer.start();
	    }
	} else {
		document.getElementById("pageContent").innerHTML = "You have no network connectivity to the TV - Please check the settings on the TV";
	}
	widgetAPI.sendReadyEvent();
};

Main.onUnload = function()
{
	Support.screensaverOff();
	GuiImagePlayer.kill();
	GuiMusicPlayer.stopOnAppExit();
	GuiPlayer.stopOnAppExit();
	pluginAPI.unregistKey(tvKey.KEY_TOOLS);
};