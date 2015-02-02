var GuiPlayer_TranscodeParams = {} // Is required!

GuiPlayer_TranscodeParams.getCodec = function(codec) {
	switch (Main.getModelYear()) {
        case "H":
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "h264":
	        case "h265":
	        case "mvc":	
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return true;
			break;
		default:
			return false;
			break;
		}
		break;
		
	case "D":
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "h264":	
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return true;
			break;
		default:
			return false;
			break;
		}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "h264":	
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return true;
			break;
		default:
			return false;
			break;
		}
		break;
	}
}


GuiPlayer_TranscodeParams.getContainer = function(codec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (codec) {
			case "mpeg2video":
				return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
				break;
			case "mpeg4":
				return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
				break;
			case "h264":	
				return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
				break;
                        case "h265":	
				return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
				break;
			case "mvc":	
				return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
				break;	
			case "wmv2":
			case "wmv3":
				return ["asf"];
				break;
			case "vc1":	
				return "asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
				break;
			default:
				return null;
				break;
			}
		break;
	case "D":
		switch (codec) {
			case "mpeg2video":
				return ["mpg","mkv","mpeg","vro","vob","ts"];
				break;
			case "mpeg4":
				return ["asf","avi","mkv","mp4","3gpp"];
				break;
			case "h264":	
				return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v"];
				break;
			case "wmv2":
			case "wmv3":
				return ["asf"];
				break;
			case "vc1":	
				return ["ts"];
				break;
			default:
				return null;
				break;
			}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
			return ["mpg","mkv","mpeg","vro","vob","ts"];
			break;
		case "mpeg4":
			return ["asf","avi","mkv","mp4","3gpp"];
			break;
		case "h264":	
			return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v"];
			break;
		case "wmv2":
		case "wmv3":
			return ["asf"];
			break;
		case "vc1":	
			return ["ts"];
			break;
		default:
			return null;
			break;
		}
	break;
	}
}

GuiPlayer_TranscodeParams.getResolution = function(codec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "h264":
                        case "h265":
                        case "mvc":	
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return [1920,1080]
			default:
				return null;
				break;
			}
		break;
	case "D":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "h264":	
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return [1920,1080]
			default:
				return null;
				break;
			}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "h264":	
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return [1920,1080];
		default:
			return null;
			break;
		}
		break;
	}
}

GuiPlayer_TranscodeParams.getBitrate = function(codec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (codec) {
			case "mpeg2video":
				return 30720000;
				break;
			case "mpeg4":
				return 30720000;
				break;
			case "h264":	
				return 50720000;
				break;
                        case "h265":	
				return 50720000;
				break;
			case "mvc":	
				return 60720000;
				break;	
			case "wmv2":
			case "wmv3":
				return 25600000;
				break;
			case "vc1":	
				return 30720000;
				break;
			default:
				return 37500000;
				break;
			}
		break;
	case "D":
		switch (codec) {
			case "mpeg2video":
				return 30720000;
				break;
			case "mpeg4":
				return 8192000;
				break;
			case "h264":	
				return 37500000;
				break;
			case "wmv2":
			case "wmv3":
				return 25600000;
				break;
			case "vc1":	
				return 25600000;
				break;
			default:
				return 37500000;
				break;
			}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
			return 30720000;
			break;
		case "mpeg4":
			return 8192000;
			break;
		case "h264":	
			return 37500000;
			break;
		case "wmv2":
		case "wmv3":
			return 25600000;
			break;
		case "vc1":	
			return 25600000;
			break;
		default:
			return 37500000;
			break;
		}
		break;
	}
}


GuiPlayer_TranscodeParams.getFrameRate = function(codec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "h264":
			case "h265":
			case "mvc":	
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return 30
			default:
				return null;
				break;
			}
		break;	
	case "D":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "h264":	
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return 30
			default:
				return null;
				break;
			}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "h264":	
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return 30;
		default:
			return null;
			break;
		}
		break;
	}
}



GuiPlayer_TranscodeParams.getLevel = function(codec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return true;
				break;
			case "h264":
				return 51;
				break;
			case "h265":
				return 51;
				break;
			case "mvc":
				return 51;
				break;	
			default:
				return null;
				break;	
			}
		break;	
	case "D":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return true;
				break;
			case "h264":
				return 51;
				break;
			default:
				return null;
				break;	
			}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return true;
			break;
		case "h264":
			return 51;
			break;
		default:
			return null;
			break;	
		}
	}
}


GuiPlayer_TranscodeParams.getProfile = function(codec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return true;
				break;
			case "h264":
				return ["Base","Constrained Baseline","Baseline","Main","High"];
				break;
			case "h265":
				return ["Base","Constrained Baseline","Baseline","Main","High"];
				break;
			case "mvc":
				return ["Base","Constrained Baseline","Baseline","Main","High"];
				break;	
			default:
				return null;
				break;	
			}
		break;	
	case "D":
		switch (codec) {
			case "mpeg2video":
			case "mpeg4":
			case "wmv2":
			case "wmv3":
			case "vc1":	
				return true;
				break;
			case "h264":
				return ["Base","Constrained Baseline","Baseline","Main","High"];
				break;
			default:
				return null;
				break;	
			}
		break;
	default:
		switch (codec) {
		case "mpeg2video":
		case "mpeg4":
		case "wmv2":
		case "wmv3":
		case "vc1":	
			return true;
			break;
		case "h264":
			return ["Base","Constrained Baseline","Baseline","Main","High"];
			break;
		default:
			return null;
			break;	
		}
	}
}

GuiPlayer_TranscodeParams.getAudioCodec = function(audiocodec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (audiocodec) {
		case "aac":
		case "mp3":
		case "mp2":	
		case "ac3":
		case "wmav2":
		case "wmapro":
		case "wmavoice":
		case "dca":
		case "eac3":	
			return true;
			break;
		default:
			return false;
			break;
		}
		break;	
	case "D":
		switch (audiocodec) {
		case "aac":
		case "mp3":
		case "mp2":	
		case "ac3":
		case "wmav2":
		case "wmapro":
		case "wmavoice":
		case "dca":
		case "eac3":	
			return true;
			break;
		default:
			return false;
			break;
		}
		break;
	default:
		switch (audiocodec) {
		case "aac":
		case "mp3":
		case "mp2":	
		case "ac3":
		case "wmav2":
		case "wmapro":
		case "wmavoice":
		case "dca":
		case "eac3":	
			return true;
			break;
		default:
			return false;
			break;
		}
		break;
	}
}

GuiPlayer_TranscodeParams.getAudioContainer = function(audiocodec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (audiocodec) {
		case "aac":
			return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "mp3":
                        return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "mp2":	
			return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "ac3":
			return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "wmav2":			
                        return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "wmapro":
                        return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "wmavoice":
                        return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "dca":
			return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		case "eac3":	
			return ["asf","avi","mkv","mp4","3gpp","mpg","mpeg","ts","m4v","m2ts","mov","vro","tp","trp","flv","vob","svi","mts",divx"];
			break;
		default:
			return null;
			break;
		}
		break;	
	case "D":
		switch (audiocodec) {
		case "aac":
			return ["mkv","mp4","3gpp","mpg","mpeg","ts"];
			break;
		case "mp3":
		case "mp2":	
			return ["asf","avi","mkv","mp4","mpg","mpeg","vro","vob","ts"];
			break;
		case "ac3":
			return ["asf","avi","mkv","mpg","mpeg","vro","vob","ts"];
			break;
		case "wmav2":
		case "wmapro":
		case "wmavoice":
			return ["asf"];
			break;
		case "dca":
			return ["avi","mkv"];
			break;
		case "eac3":	
			return ["ts"];
			break;
		default:
			return null;
			break;
		}
		break;
	default:
		switch (audiocodec) {
		case "aac":
			return ["mkv","mp4","3gpp","mpg","mpeg","ts"];
			break;
		case "mp3":
		case "mp2":	
			return ["asf","avi","mkv","mp4","mpg","mpeg","vro","vob","ts"];
			break;
		case "ac3":
			return ["asf","avi","mkv","mpg","mpeg","vro","vob","ts"];
			break;
		case "wmav2":
		case "wmapro":
		case "wmavoice":
			return ["asf"];
			break;
		case "dca":
			return ["avi","mkv"];
			break;
		case "eac3":	
			return ["ts"];
			break;
		default:
			return null;
			break;
		}
		break;
	}
}

GuiPlayer_TranscodeParams.getAudioChannels = function(audiocodec) {
	switch (Main.getModelYear()) {
	case "H":
		switch (audiocodec) {
		case "aac":
		case "mp3":
		case "mp2":	
		case "ac3":
		case "wmav2":
		case "wmapro":
		case "wmavoice":
		case "dca":
		case "eac3":	
			return 6;
			break;
		default:
			return null;
			break;
		}
		break;	
	case "D":
		switch (audiocodec) {
		case "aac":
		case "mp3":
		case "mp2":	
		case "ac3":
		case "wmav2":
		case "wmapro":
		case "wmavoice":
		case "dca":
		case "eac3":	
			return 6;
			break;
		default:
			return null;
			break;
		}
		break;
	default:
		switch (audiocodec) {
		case "aac":
		case "mp3":
		case "mp2":	
		case "ac3":
		case "wmav2":
		case "wmapro":
		case "wmavoice":
		case "dca":
		case "eac3":	
			return 6;
			break;
		default:
			return null;
			break;
		}
		break;
	}
}
