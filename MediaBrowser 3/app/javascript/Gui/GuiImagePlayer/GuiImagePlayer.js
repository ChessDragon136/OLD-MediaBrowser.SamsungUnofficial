var GuiImagePlayer = {	
		ImageViewer : null,
		newItemData : null,
		
		Timeout : null,
		
		images : [],
        imageIdx : 0,		// Image index
        effectIdx : 0,		// Transition effect index
        effectNames : ['FADE1', 'FADE2', 'BLIND', 'SPIRAL','CHECKER', 'LINEAR', 'STAIRS', 'WIPE', 'RANDOM']
}

GuiImagePlayer.kill = function() {
	this.ImageViewer.destroy();	
}


//WAITING FOR SERVER TO BE RELEASE AS STABLE FOR IMAGE ENHANCEMENTS

GuiImagePlayer.start = function(ItemData,selectedItem) {
	var url = Server.getChildItemsURL(ItemData.Items[selectedItem].ParentId,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Photo&fields=SortName,Overview");
	var result = Server.getContent(url);
	this.newItemData = result; //Misleading I know!
	
	//Create ARRAY of all URL's!
	//Order from starting selectedItem!
	imageIdx = 0;
	for (var index = 0; index < result.Items.length; index++) {
		var temp = Server.getImageURL(this.newItemData.Items[index].Id,"Primary",1920,1080,0,false,0);
		this.images.push(temp);
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
		GuiImagePlayer.Timeout = setTimeout(function(){
			GuiImagePlayer.imageIdx = GuiImagePlayer.imageIdx+1;
			if (GuiImagePlayer.imageIdx >= GuiImagePlayer.newItemData.Items.length ) {
				GuiImagePlayer.imageIdx = 0;
			}		
			GuiImagePlayer.ImageViewer.prepareNext(GuiImagePlayer.images[GuiImagePlayer.imageIdx], GuiImagePlayer.ImageViewer.Effect.FADE1);
		}, 10000);	
    });
	
	this.ImageViewer.stop();
	this.playImage();
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
			this.ImageViewer.endSlideshow();
			this.ImageViewer.hide();
			widgetAPI.blockNavigation(event);
			GuiImagePlayer.kill();
			Support.processReturnURLHistory();
			break;
	}
}

