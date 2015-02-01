/*
Render Error 1 :  Unsupported container
Render Error 2 :  Unsupported video codec
Render Error 3 :  Unsupported audio codec
Render Error 4 :  Unsupported video resolution
Render Error 6 :  Corrupt Stream
*/

var GuiPlayer_Transcoding = {		
		//File Information
		MediaSource : null,
		videoIndex : 0,
		audioIndex : 0,
	
		//Bitrate check
		bitRateToUse : null,
		
		//Boolean that conclude if all Video or All Audio elements will play without transcode
		isVideo : true,
		isAudio : true,
		
		//All Video Elements
		isCodec : null,
		isResolution : null,
		isContainer : null,
		isBitRate : null,
		isLevel : null,	
		isFrameRate : null,
		isProfile : null,
		
		//All Audio elements
		isAudioCodec : null,
		isAudioContainer : null,
		isAudioChannel : null
}

//--------------------------------------------------------------------------------------
GuiPlayer_Transcoding.start = function(showId, MediaSource,MediaSourceIndex, videoIndex, audioIndex) {	
	//Set Class Vars
	this.MediaSource = MediaSource;
	this.videoIndex = videoIndex;
	this.audioIndex = audioIndex;
	
	alert (this.MediaSource.Id);
	
	//Check Video & Audio Compatibility
	this.checkCodec(videoIndex);
	this.checkAudioCodec(audioIndex);

	var streamparams = "";
	var transcodeStatus = "";
	if (this.isVideo && this.isAudio) {
		transcodeStatus = "Direct Stream";
		streamparams = '/Stream.'+this.MediaSource.Container+'?static=true&VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&MediaSourceId='+this.MediaSource.Id;
	} else if (this.isVideo == false) {
		transcodeStatus = "Transcoding Audio & Video";	
		if (Main.getModelYear() == "D") {
			streamparams = '/Master.m3u8?VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&VideoCodec=h264&MaxWidth=1280&VideoBitrate='+this.bitRateToUse+'&AudioCodec=AAC&audioBitrate=360000&audiochannels=2&MediaSourceId='+this.MediaSource.Id;
			
		} else {
			streamparams = '/Stream.ts?VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&VideoCodec=h264&MaxWidth=1280&VideoBitrate='+this.bitRateToUse+'&AudioCodec=AAC&audioBitrate=360000&audiochannels=2&MediaSourceId='+this.MediaSource.Id;	
		}
	} else if (this.isVideo == true && this.isAudio == false) {
		transcodeStatus = "Transcoding Audio";	
		if (Main.getModelYear() == "D") {
			streamparams = '/Master.m3u8?VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&VideoCodec=copy&AudioCodec=AAC&audioBitrate=360000&audiochannels=2&MediaSourceId='+this.MediaSource.Id;
		} else {
			streamparams = '/Stream.ts?VideoStreamIndex='+this.videoIndex+'&AudioStreamIndex='+this.audioIndex+'&VideoCodec=copy&AudioCodec=AAC&audioBitrate=360000&audiochannels=2&MediaSourceId='+this.MediaSource.Id;
		}
	}
	var url = Server.getServerAddr() + '/Videos/' + showId + streamparams + '&DeviceId='+Server.getDeviceID();
	//Return results to Versions
	//MediaSourceId,Url,transcodeStatus,videoIndex,audioIndex
	return [MediaSourceIndex,url,transcodeStatus,videoIndex,audioIndex];	
}

GuiPlayer_Transcoding.checkCodec = function() {
	alert ("Checking Video Codec");
	this.isCodec = true;
	switch (this.MediaSource.MediaStreams[this.videoIndex].Codec.toLowerCase()) {
		case "mpeg2video":
			this.isContainer = this.checkContainer(["mpg","mkv","mpeg","vro","vob","ts"]);
			this.isResolution = this.checkResolution(1920,1080);
			this.isBitRate = this.checkBitRate(30720000);
			this.isFrameRate = this.checkFrameRate(30);
			this.isLevel = true;
			this.isProfile = true;
			break;
		case "mpeg4":
			this.isContainer = this.checkContainer(["asf","avi","mkv","mp4","3gpp"]);
			this.isResolution = this.checkResolution(1920,1080);
			this.isBitRate = this.checkBitRate(8192000);
			this.isFrameRate = this.checkFrameRate(30);
			this.isLevel = true;
			this.isProfile = true;
			break;
		case "h264":
			this.isContainer = this.checkContainer(["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v"]);
			this.isResolution = this.checkResolution(1920,1080);
			this.isBitRate = this.checkBitRate(37500000);
			this.isFrameRate = this.checkFrameRate(30);
			this.isLevel = this.checkLevel(51); //DLNA uses 41
			this.isProfile = this.checkProfile(["Base","Constrained Baseline","Baseline","Main","High"]);
			break;
		case "wmv2":
		case "wmv3":
			this.isContainer = this.checkContainer(["asf"]);
			this.isResolution = this.checkResolution(1920,1080);
			this.isBitRate = this.checkBitRate(25600000);
			this.isFrameRate = this.checkFrameRate(30);
			this.isLevel = true;
			this.isProfile = true;
			break;
		case "vc1":
			this.isContainer = this.checkContainer(["ts"]);
			this.isResolution = this.checkResolution(1920,1080);
			this.isBitRate = this.checkBitRate(25600000);
			this.isFrameRate = this.checkFrameRate(30);
			this.isLevel = true;
			this.isProfile = true;
			break;	
		default:
			//Will Transcode
			this.isCodec = false;
			this.isContainer = null;
			this.isResolution = null;
			this.isBitRate = this.checkBitRate(37500000); //As transcode to H264 check against h264
			this.isFrameRate = null;
			this.isLevel = null;
			this.isProfile = null;
			break;
	}
	
	//Results
	alert ("-----------------------------------------------------");
	alert ("Video File Analysis Results");
	alert (" Codec Compatibility: " + this.isCodec + " : " + this.MediaSource.MediaStreams[this.videoIndex].Codec);
	alert (" Container Compatibility: " + this.isContainer + " : " + this.MediaSource.Container);
	alert (" Resolution Compatibility: " + this.isResolution + " : " +this.MediaSource.MediaStreams[this.videoIndex].Width + "x" + this.MediaSource.MediaStreams[this.videoIndex].Height);
	alert (" BitRate Compatibility: " + this.isBitRate + " : " + this.MediaSource.MediaStreams[this.videoIndex].BitRate);
	alert (" BitRate Compatibility Transcode: " + this.isBitRate + " : " + this.bitRateToUse);
	alert (" FrameRate Compatibility: " + this.isFrameRate + " : " + this.MediaSource.MediaStreams[this.videoIndex].RealFrameRate);
	alert (" Level Compatibility: " + this.isLevel + " : " + this.MediaSource.MediaStreams[this.videoIndex].Level);
	alert (" Profile Compatibility: " + this.isProfile + " : " + this.MediaSource.MediaStreams[this.videoIndex].Profile);
	alert ("-----------------------------------------------------");
	
	//Put it all together
	if (this.isCodec && this.isContainer && this.isResolution && this.isBitRate && this.isFrameRate && this.isLevel && this.isProfile) { // 
		this.isVideo = true;
	} else {
		this.isVideo = false;
	}
}

GuiPlayer_Transcoding.checkAudioCodec = function() {
	alert ("Checking Audio Codec");
	this.isAudioCodec = true;
	switch (this.MediaSource.MediaStreams[this.audioIndex].Codec.toLowerCase()) { //Obviously need to read in Audio Codec!!
		case "aac":
			this.isAudioContainer = this.checkContainer(["mkv","mp4","3gpp","mpg","mpeg","ts"]);
			this.isAudioChannel = this.checkAudioChannels(6);		
			break;
		case "mp3":
		case "mp2":	
			this.isAudioContainer = this.checkContainer(["asf","avi","mkv","mp4","mpg","mpeg","vro","vob","ts"]);
			this.isAudioChannel = this.checkAudioChannels(6);		
			break;
		case "ac3":
			this.isAudioContainer = this.checkContainer(["asf","avi","mkv","mpg","mpeg","vro","vob","ts"]);
			this.isAudioChannel = this.checkAudioChannels(6);		
			break;
		case "wmav2":
		case "wmapro":
		case "wmavoice":
			this.isAudioContainer = this.checkContainer(["asf"]);
			this.isAudioChannel = this.checkAudioChannels(6);		
			break;
		case "dca":
			this.isAudioContainer = this.checkContainer(["avi","mkv"]);
			this.isAudioChannel = this.checkAudioChannels(6);		
			break;
		case "eac3":	
			this.isAudioContainer = this.checkContainer(["ts"]);
			this.isAudioChannel = this.checkAudioChannels(6);		
			break;
		default:
			this.isAudioCodec = false;
			this.isAudioContainer = null;
			this.isAudioChannel = null;
			break;
	}
	
	//Results
	alert ("-----------------------------------------------------");
	alert ("Audio File Analysis Results");
	alert (" Codec Compatibility: " + this.isAudioCodec + " : " + this.MediaSource.MediaStreams[this.audioIndex].Codec);
	alert (" Container Compatibility: " + this.isAudioContainer + " : " + this.MediaSource.Container);
	alert (" Channel Compatibility: " + this.isAudioChannel + " : " + this.MediaSource.MediaStreams[this.audioIndex].Channels);
	alert ("-----------------------------------------------------");
	
	//Put it all together
	if (this.isAudioCodec && this.isAudioChannel) {
		this.isAudio = true;
	} else {
		this.isAudio = false;
	}		
}

GuiPlayer_Transcoding.checkAudioChannels = function(maxChannels) {
	if (this.MediaSource.MediaStreams[this.audioIndex].Channels <= maxChannels) {
		return true;
	} else {
		return false;
	}
}

GuiPlayer_Transcoding.checkResolution = function(maxSupportedWidth, maxSupportedHeight) {
	if (this.MediaSource.MediaStreams[this.videoIndex].Width <= maxSupportedWidth && this.MediaSource.MediaStreams[this.videoIndex].Height <= maxSupportedHeight) {
		return true;
	} else {
		return false;
	}
}

GuiPlayer_Transcoding.checkContainer = function(supportedContainers) {
	var isContainer = false;
	for (var index = 0; index < supportedContainers.length; index++) {
		if (this.MediaSource.Container.toLowerCase() == supportedContainers[index]) {
			isContainer =  true;
			break;
		}
	}
	return isContainer;
}

GuiPlayer_Transcoding.checkBitRate = function(maxBitRate) {
	//Get Bitrate from Settings File
	var maxBitRateSetting = File.getTVProperty("Bitrate")*1024*1024;
	if (this.MediaSource.MediaStreams[this.videoIndex].BitRate > maxBitRateSetting) {
		this.bitRateToUse = maxBitRateSetting;
		return false;
	} else {
		this.bitRateToUse = this.MediaSource.MediaStreams[this.videoIndex].BitRate;
		return true;
	}
}

GuiPlayer_Transcoding.checkFrameRate = function(maxFrameRate) {
	if (this.MediaSource.MediaStreams[this.videoIndex].RealFrameRate <= maxFrameRate) {
		return true;
	} else {
		return false;
	}
}

GuiPlayer_Transcoding.checkLevel = function(maxLevel) {
	var level = this.MediaSource.MediaStreams[this.videoIndex].Level;
	level = (level.length == 1) ? level * 10 : level; //If only 1 long, multiply by 10 to make it correct!

	if (level <= maxLevel && level >= 0) {
		return true;
	} else {
		return false;
	}
}

GuiPlayer_Transcoding.checkProfile = function(supportedProfiles) {
	var profile = false;
	for (var index = 0; index < supportedProfiles.length; index++) {
		if (this.MediaSource.MediaStreams[this.videoIndex].Profile == supportedProfiles[index]) {
			profile = true;
			break;
		}
	}
	return profile;
}