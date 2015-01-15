var GuiImagePlayer_Screensaver = {	
		ImageViewer : null,
		newItemData : null,
		
		Timeout : null,
		
		images : [],
        imageIdx : 0,		// Image index
        effectIdx : 0,		// Transition effect index
        effectNames : ['FADE1', 'FADE2', 'BLIND', 'SPIRAL','CHECKER', 'LINEAR', 'STAIRS', 'WIPE', 'RANDOM'],
}

GuiImagePlayer_Screensaver.kill = function() {
	this.ImageViewer.destroy();	
}


//WAITING FOR SERVER TO BE RELEASE AS STABLE FOR IMAGE ENHANCEMENTS

GuiImagePlayer_Screensaver.start = function() {
	//Update Main.js isScreensaverRunning - Sets to True
	Main.setIsScreensaverRunning();
	
	var randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=200");
	var randomImageData = Server.getContent(randomImageURL);
		
	for (var index = 0; index < randomImageData.Items.length; index++) {
		if (randomImageData.Items[index].BackdropImageTags.length > 0) {
			var imgsrc = Server.getBackgroundImageURL(randomImageData.Items[index ].Id,"Backdrop",1920,1080,0,false,0,randomImageData.Items[index ].BackdropImageTags.length);
			this.images.push(imgsrc);
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
	
	//Start Slide Show
	this.ImageViewer.show();
	this.setSlideshowMode();
}

// Set Slideshow mode
// You can use Transtion effect
GuiImagePlayer_Screensaver.setSlideshowMode = function() {
	this.ImageViewer.startSlideshow();
	this.ImageViewer.setOnBufferingComplete(function(){
		GuiImagePlayer_Screensaver.ImageViewer.showNow();			
    });
	this.ImageViewer.setOnRenderingComplete(function(){
		clearTimeout(GuiImagePlayer_Screensaver.Timeout);
		GuiImagePlayer_Screensaver.Timeout = setTimeout(function(){
			GuiImagePlayer_Screensaver.imageIdx = GuiImagePlayer_Screensaver.imageIdx+1;
			if (GuiImagePlayer_Screensaver.imageIdx >= GuiImagePlayer_Screensaver.images.length ) {
				GuiImagePlayer_Screensaver.imageIdx = 0;
			}		
			GuiImagePlayer_Screensaver.ImageViewer.prepareNext(GuiImagePlayer_Screensaver.images[GuiImagePlayer_Screensaver.imageIdx], GuiImagePlayer_Screensaver.ImageViewer.Effect.FADE1);
		}, 5000);	
    });
	
	this.ImageViewer.stop();
	this.playImage();
}

// Play image - only called once in slideshow!
//SS calls  play -> BufferComplete, then the showNow will call RendComplete which starts timer for next image
GuiImagePlayer_Screensaver.playImage = function() {	
	var url = GuiImagePlayer_Screensaver.images[GuiImagePlayer_Screensaver.imageIdx];
	GuiImagePlayer_Screensaver.ImageViewer.play(url, 1920, 1080);	
}

GuiImagePlayer_Screensaver.stopScreensaver = function() {	
	clearTimeout(this.Timeout);
	this.Timeout = null;
	this.images = [];
	this.ImageViewer.endSlideshow();
	this.ImageViewer.hide();
	widgetAPI.blockNavigation(event);
	GuiImagePlayer_Screensaver.kill()
}