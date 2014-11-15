var GuiImagePlayer = {	
		ImageViewer : null,
		ItemData : null,
		selectedItem : null,
		
		Timeout : null
}

GuiImagePlayer.kill = function() {
	if (this.ImageViewer != null) {
		this.ImageViewer.destroy();
	}
	
}

GuiImagePlayer.start = function(ItemData,selectedItem) {
	
	document.getElementById("pageBackground").style.visibility = "hidden";
	document.getElementById("pageBackgroundFade").style.visibility = "hidden";
	
	var url = Server.getChildItemsURL(ItemData.Items[selectedItem].ParentId,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Photo&fields=SortName,Overview");
	var result = Server.getContent(url);
	var selectedImage = 0;
	for (var index = 0; index < result.Items.length; index++) {
		if (result.Items[index].Id == ItemData.Items[selectedItem].Id) {
			selectedImage = index;
			break;
		}
	}
	
	this.ItemData = result;
	this.selectedItem = selectedImage;
	
	//Set Focus for Key Events
	document.getElementById("GuiImagePlayer").focus();	
	document.getElementById("page").style.visibility = "hidden";
	document.getElementById("imageView").style.visibility = "";
	
	GuiImagePlayer.displayImage();
}

GuiImagePlayer.displayImage = function() {
	document.getElementById("imageView").innerHTML='<img class="GuiImagePlayerImage" src="'+Server.getImageURL(this.ItemData.Items[this.selectedItem].Id,"Primary",960,540)+'">';
	document.getElementById("imageView_Info").innerHTML=this.ItemData.Items[this.selectedItem].Overview;
	
	this.Timeout = setTimeout(function(){	 
		GuiImagePlayer.selectedItem = GuiImagePlayer.selectedItem+1;
		if (GuiImagePlayer.selectedItem >= GuiImagePlayer.ItemData.Items.length ) {
			GuiImagePlayer.selectedItem = 0;
		}
		GuiImagePlayer.displayImage();
	}, 5000);
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
		case tvKey.KEY_PLAY:
			GuiImagePlayer.displayImage();
			break;
		case tvKey.KEY_PAUSE:
			clearTimeout(this.Timeout);
            break;
		case tvKey.KEY_FF:
		case tvKey.KEY_RIGHT:	
			clearTimeout(this.Timeout);
			this.selectedItem =this.selectedItem+1;
			if (this.selectedItem >= this.ItemData.Items.length ) {
				this.selectedItem = 0;
			}
			this.displayImage();
			clearTimeout(this.Timeout);
            break;     
		case tvKey.KEY_LEFT:    
        case tvKey.KEY_RW:
        	clearTimeout(this.Timeout);
        	this.selectedItem = this.selectedItem-1;
    		if (this.selectedItem < 0 ) {
    			this.selectedItem = this.ItemData.Items.length-1;
    		}
    		this.displayImage();
        	clearTimeout(this.Timeout);
            break; 
        case tvKey.KEY_INFO:
        	if (document.getElementById("imageView_Info").style.visibility == "hidden") {
        		document.getElementById("imageView_Info").style.visibility = "";
        	} else {
        		document.getElementById("imageView_Info").style.visibility = "hidden";
        	}
        	break;
		case tvKey.KEY_STOP:   
		case tvKey.KEY_RETURN:
			alert("RETURN");
			
			document.getElementById("pageBackground").style.visibility = "";
			document.getElementById("pageBackgroundFade").style.visibility = "";
			
			widgetAPI.blockNavigation(event);
			clearTimeout(this.Timeout);
			document.getElementById("imageView_Info").style.visibility = "hidden";
			document.getElementById("imageView").innerHTML='';
			document.getElementById("imageView").style.visibility = "hidden";
			document.getElementById("page").style.visibility = "";
			Support.processReturnURLHistory();
			break;
	}
}