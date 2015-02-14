var GuiImagePlayer = {	
		ImageViewer : null,
		newItemData : null,
		
		Timeout : null,
		Paused : false,
		
		overlayFormat : 1, // 0 - date, 1 - date:time, 2 - off 
		
		images : [],
		overlayData : [],
        imageIdx : 0,		// Image index
        effectIdx : 0,		// Transition effect index
        effectNames : ['FADE1', 'FADE2', 'BLIND', 'SPIRAL','CHECKER', 'LINEAR', 'STAIRS', 'WIPE', 'RANDOM']
}

GuiImagePlayer.kill = function() {
	if (this.ImageViewer != null) {
		this.ImageViewer.destroy();	
	}
}

GuiImagePlayer.start = function(ItemData,selectedItem,isPhotoCollection) {
	//Turn off screensaver
	Support.screensaverOff();

	var url = "";
	if (isPhotoCollection) {
		url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&Recursive=true&SortBy=Random&SortOrder=Ascending&IncludeItemTypes=Photo&fields=SortName,Overview");	
	} else {
		url = Server.getChildItemsURL(ItemData.Items[selectedItem].ParentId,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Photo&fields=SortName,Overview");	
	}
	
	var result = Server.getContent(url);
	if (result == null) { return; }
	this.newItemData = result; //Misleading I know!
	
	alert (this.newItemData.Items.length);
	
	Support.styleSubtitles("GuiImagePlayer_ScreensaverOverlay")
	
	//Create ARRAY of all URL's!
	//Order from starting selectedItem!
	imageIdx = 0;
	for (var index = 0; index < result.Items.length; index++) {
		var temp = Server.getImageURL(this.newItemData.Items[index].Id,"Primary",1920,1080,0,false,0);
		this.images.push(temp);
		this.overlayData.push(Support.formatDateTime(this.newItemData.Items[index].PremiereDate,1))
		if (result.Items[index].Id == ItemData.Items[selectedItem].Id) {
			this.imageIdx = index;
		}
	}

	//Initialte new instance, set Frame Area & Set Notifications
	this.ImageViewer = new CImageViewer('Common ImageViewer');
	this.ImageViewer.setFrameArea(0, 0, 960, 540); 
	
	this.ImageViewer.setOnNetworkError(function() {
		GuiNotifications.setNotification("Network Error");
	});
	
	this.ImageViewer.setOnRenderError(function() {
		GuiNotifications.setNotification("Render Error");
	});
	
	
	//Set Focus for Key Events
	document.getElementById("GuiImagePlayer").focus();	
	
	//Start Slide Show
	this.ImageViewer.show();
	this.setSlideshowMode();
}

// Set normal mode
// You can play images on the area you set.
GuiImagePlayer.setNormalMode = function() {
	this.ImageViewer.endSlideshow();
    playImage();
}

// Set Slideshow mode
// You can use Transtion effect
GuiImagePlayer.setSlideshowMode = function() {
	this.ImageViewer.startSlideshow();
	this.ImageViewer.setOnBufferingComplete(function(){
		GuiImagePlayer.ImageViewer.showNow();			
    });
	this.ImageViewer.setOnRenderingComplete(function(){
		clearTimeout(GuiImagePlayer.Timeout);
		Support.setImagePlayerOverlay(GuiImagePlayer.overlayData[GuiImagePlayer.imageIdx], GuiImagePlayer.overlayFormat);
		GuiImagePlayer.Timeout = setTimeout(function(){
			if (GuiImagePlayer.Paused == false) {
				GuiImagePlayer.imageIdx = GuiImagePlayer.imageIdx+1;
				if (GuiImagePlayer.imageIdx >= GuiImagePlayer.newItemData.Items.length ) {
					GuiImagePlayer.imageIdx = 0;
				}
				GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			}
		}, File.getUserProperty("ImagePlayerImageTime"));	
    });
	
	this.ImageViewer.stop();
	this.playImage();
}

//Prepare next image
GuiImagePlayer.prepImage = function(imageIdx) {
	this.ImageViewer.prepareNext(GuiImagePlayer.images[imageIdx], this.ImageViewer.Effect.FADE1)
}

// Play image - only called once in slideshow!
//SS calls  play -> BufferComplete, then the showNow will call RendComplete which starts timer for next image
GuiImagePlayer.playImage = function() {	
	var url = GuiImagePlayer.images[GuiImagePlayer.imageIdx];
	GuiImagePlayer.ImageViewer.play(url, 1920, 1080);	
}


GuiImagePlayer.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode){		
		case tvKey.KEY_STOP:   
		case tvKey.KEY_RETURN:
			alert("RETURN");
			clearTimeout(this.Timeout);
			this.Timeout = null;
			this.images = [];
			this.overlayData = [];
			document.getElementById("GuiImagePlayer_ScreensaverOverlay").innerHTML = ""
			this.ImageViewer.endSlideshow();
			this.ImageViewer.hide();
			widgetAPI.blockNavigation(event);
			GuiImagePlayer.kill();
			
			//Turn On Screensaver
			Support.screensaverOn();
			Support.screensaver();
			
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.imageIdx++;
			if (this.imageIdx == this.images.length) {
				this.imageIdx = 0;	
			}
			GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.imageIdx--;
			if (this.imageIdx < 0) {
				this.imageIdx = this.images.length-1;
			}
			GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			break;
		case tvKey.KEY_PAUSE:
			alert("PAUSE")
			this.Paused = true
			break;
		case tvKey.KEY_PLAY:
			alert("PLAY")
			this.Paused = false
			GuiImagePlayer.prepImage(GuiImagePlayer.imageIdx);
			break;
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiImagePlayer");
			break;
		case tvKey.KEY_RED:
			alert ("RED");
			if (this.overlayFormat == 2) {
				this.overlayFormat = 0
			} else {
				this.overlayFormat = this.overlayFormat + 1
			}
			Support.setImagePlayerOverlay(this.overlayData[this.imageIdx], this.overlayFormat);
			break;
		case tvKey.KEY_YELLOW:	
			if (this.newItemData.Items[this.imageIdx].UserData.IsFavorite == true) {
				Server.deleteFavourite(this.newItemData.Items[this.imageIdx].Id);
				this.newItemData.Items[this.imageIdx].UserData.IsFavorite = false;
				GuiNotifications.setNotification ("Item has been removed from<br>favourites","Favourites");
			} else {
				Server.setFavourite(this.newItemData.Items[this.imageIdx].Id);
				this.newItemData.Items[this.imageIdx].UserData.IsFavorite = true;
				GuiNotifications.setNotification ("Item has been added to<br>favourites","Favourites");
			}
			break;
	}
}

