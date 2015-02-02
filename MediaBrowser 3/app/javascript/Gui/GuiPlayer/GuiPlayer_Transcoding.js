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
	var codec = this.MediaSource.MediaStreams[this.videoIndex].Codec.toLowerCase();
	
	this.isCodec = GuiPlayer_TranscodeParams.getCodec(codec);
	this.isContainer = this.checkContainer(GuiPlayer_TranscodeParams.getContainer(codec));
	this.isResolution = this.checkResolution(GuiPlayer_TranscodeParams.getResolution(codec));
	this.isBitRate = this.checkBitRate(GuiPlayer_TranscodeParams.getBitrate(codec));
	this.isFrameRate = this.checkFrameRate(GuiPlayer_TranscodeParams.getFrameRate(codec));
	this.isLevel = this.checkLevel(GuiPlayer_TranscodeParams.getLevel(codec));
	this.isProfile = this.checkProfile(GuiPlayer_TranscodeParams.getProfile(codec));
	
	//Results
	alert ("-----------------------------------------------------");
	alert ("Video File Analysis Results");
	alert (" Codec Compatibility: " + this.isCodec + " : " + this.MediaSource.MediaStreams[this.videoIndex].Codec);
	alert (" Container Compatibility: " + this.isContainer + " : " + this.MediaSource.Container);
	alert (" Resolution Compatibility: " + this.isResolution + " : " +this.MediaSource.MediaStreams[this.videoIndex].Width + "x" + this.MediaSource.MediaStreams[this.videoIndex].Height);
	alert (" BitRate Compatibility: " + this.isBitRate + " : " + this.MediaSource.MediaStreams[this.videoIndex].BitRate + " : " + this.bitRateToUse);
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
	var audiocodec = this.MediaSource.MediaStreams[this.audioIndex].Codec.toLowerCase();
	
	this.isAudioCodec = GuiPlayer_TranscodeParams.getAudioCodec(audiocodec);
	this.isAudioContainer = this.checkContainer(GuiPlayer_TranscodeParams.getAudioContainer(audiocodec));
	this.isAudioChannel = this.checkAudioChannels(GuiPlayer_TranscodeParams.getAudioChannels(audiocodec));		
	
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

GuiPlayer_Transcoding.checkResolution = function(maxResolution) {
	if (maxResolution == null) {
		return false;
	} else if (this.MediaSource.MediaStreams[this.videoIndex].Width <= maxResolution[0] && this.MediaSource.MediaStreams[this.videoIndex].Height <= maxResolution[1]) {
		return true;
	} else {
		return false;
	}
}

GuiPlayer_Transcoding.checkContainer = function(supportedContainers) {
	if (supportedContainers == null) {
		return false
	} else {
		var isContainer = false;
		for (var index = 0; index < supportedContainers.length; index++) {
			if (this.MediaSource.Container.toLowerCase() == supportedContainers[index]) {
				isContainer =  true;
				break;
			}
		}
		return isContainer;
	}
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
	if (maxFrameRate == null) {
		return false;
	} else if (this.MediaSource.MediaStreams[this.videoIndex].RealFrameRate <= maxFrameRate) {
		return true;
	} else {
		return false;
	}
}

GuiPlayer_Transcoding.checkLevel = function(maxLevel) {
	if (maxLevel == null) {
		return false;
	} if (maxLevel == true) {
		return true;
	} else {
		var level = this.MediaSource.MediaStreams[this.videoIndex].Level;
		level = (level.length == 1) ? level * 10 : level; //If only 1 long, multiply by 10 to make it correct!

		if (level <= maxLevel && level >= 0) {
			return true;
		} else {
			return false;
		}
	}
}

GuiPlayer_Transcoding.checkProfile = function(supportedProfiles) {
	if (supportedProfiles == null) {
		return false;
	} if (supportedProfiles == true) {
		return true;
	} else {
		var profile = false;
		for (var index = 0; index < supportedProfiles.length; index++) {
			if (this.MediaSource.MediaStreams[this.videoIndex].Profile == supportedProfiles[index]) {
				profile = true;
				break;
			}
		}
		return profile;
	}
}