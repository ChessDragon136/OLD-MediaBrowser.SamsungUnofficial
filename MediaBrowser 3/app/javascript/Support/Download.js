//COULD NOT MAKE THIS WORK AT ALL
//Doesn't work on emulator, test on device
//Couldn't make it call onComplete no matter how I coded it!

var Download = {
		pluginDownload : null
}

Download.init = function() {
	this.pluginDownload = document.getElementById('pluginDownload');
	this.pluginDownload.OnComplete = 'Download.onComplete';
}

Download.checkFileExists = function(id,size) {
	var fileSystemObj = new FileSystem();
	var path = curWidget.id + '/imageCache/'+id+'_'+size +'.jpg';
	
	var exists = fileSystemObj.openCommonFile(path,'r');
	if (!exists) {
		return null;
	} else {
		fileSystemObj.closeCommonFile(exists);	
		return path;
	}
}

Download.downloadImage = function (id,serverPath,size) {
	FileLog.write("ImageCache : Image Download Started");
	
	if (this.pluginDownload == null) {
		this.init();
	}
	
	var path = curWidget.id + '/imageCache/'+id+'_'+size +'.jpg';
	this.pluginDownload.StartDownFile(serverPath, path, 10000, 10);
}


Download.onComplete = function(msg) {
	FileLog.write("ImageCache : OnComplete");
	try {
		var tArrResult = msg.split('?');
	    if (tArrResult[0] == 1000) {
	    	// DownResult: If res=1 success, otherwise ERROR (see end of this file)
	    	if (tArrResult[1] == 1) {
	    		FileLog.write("ImageCache : Image Download Successful!");
	    	} else {
	    		FileLog.write("ImageCache : Image Download Failed : Error code [" + tArrResult[1] + "]");
	    	}
	    } else if (tArrResult[0] == 1001) {
	    	// Download Progress
	    	FileLog.write("ImageCache : Downloading " + tArrResult[1] + "%");
	    }
	} catch (err) {
		FileLog.write("ImageCache : Error " + err);
	}
}

