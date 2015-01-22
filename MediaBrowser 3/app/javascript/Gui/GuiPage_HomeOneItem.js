var GuiPage_HomeOneItem = {
		ItemData : null,
		ItemIndexData : null,
		
		menuItems : [],
		
		selectedItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 3,
		MAXROWCOUNT : 2,
		
		indexSeekPos : -1,
		isResume : false,
		isLatest : false,
		
		startParams : [],
		backdropTimeout : null
}

GuiPage_HomeOneItem.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_HomeOneItem.start = function(title,url,selectedItem,topLeftItem) {	
	//Cheap hack to increase limit count when using this view
	url = url.replace("Limit=7","Limit=16");
	
	//Save Start Params	
	this.startParams = [title,url];
	alert (url);
	
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	
	//Load Data
	this.ItemData = Server.getContent(url);
	if (this.ItemData == null) { return; }
	
	//If all user selected homepages are blank try media items
	if (this.ItemData.Items.length == 0) {
		title = "Media Folders"
		var newURL = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");
		this.ItemData = Server.getContent(newURL);
		if (this.ItemData == null) { return; }
	}
	
	if (this.ItemData.Items.length > 0) {		
		//Latest Page Fix
		this.isLatest = false;
		if (title == "New TV") {
			this.isLatest = true;
			this.ItemData.Items = this.ItemData;
		}
		
		//If array like MoviesRecommended alter 
		if (title == "Suggested For You") {
			if (this.ItemData[0] === undefined){
				this.ItemData[0] = {"Items":[]}; //Create empty Items array and continue
			}
			this.ItemData = this.ItemData[0];
		}
		
		//Set page content
		document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='guiDisplay_Series-Banner'></div><div id=Center class='HomeOneCenter'><p id='title' style='font-size:18px'>"+title+"</p><div id=Content></div></div>";			

		//Set isResume based on title - used in UpdateDisplayedItems
		this.isResume = (title == "Resume" ||  title == "Resume All Items" ) ? true : false;
		
		//Set MaxRow's Columns up
		this.MAXCOLUMNCOUNT = 3;
		if ((this.ItemData.Items[0].Type == "Series" || this.ItemData.Items[0].Type == "Movie") && this.isResume != true) {
			this.MAXCOLUMNCOUNT = 8;
		}
		
		//If to determine positioning of content
		if ((this.ItemData.Items[0].Type == "Series" || this.ItemData.Items[0].Type == "Movie") && this.isResume != true) {
			document.getElementById("Center").style.top = (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) ? "120px" : "70px";
			document.getElementById("Center").style.left = "80px";
			document.getElementById("Center").style.width = "800px";
		} else {
			document.getElementById("Center").style.top = (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) ? "130px" : "90px";
			document.getElementById("Center").style.left = "100px";
			document.getElementById("Center").style.width = "760px";
		}

		//Generate Banner Items
		this.menuItems = GuiMainMenu.menuItems.slice(1); 
		
		//Remove Settings, Logout & Music-Player from the end!
		if (this.menuItems[this.menuItems.length-1] == "Log-Out") {
			this.menuItems.pop();
		}
		if (this.menuItems[this.menuItems.length-1] == "Settings") {
			this.menuItems.pop();
		}
		if (this.menuItems[this.menuItems.length-1] == "Music-Player") {
			this.menuItems.pop();
		}
		
		//Generate Banner display
		for (var index = 0; index < this.menuItems.length; index++) {
			if (index != this.menuItems.length-1) {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding'>"+this.menuItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";			
			} else {
				document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem'>"+this.menuItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";					
			}
		}
	
		//Display first XX series
		this.updateDisplayedItems();
			
		//Update Selected Collection CSS
		this.updateSelectedItems();	
		
		//Function to generate random backdrop
		this.backdropTimeout = setTimeout(function(){
			var randomImageURL = Server.getItemTypeURL("&SortBy=Random&IncludeItemTypes=Series,Movie&Recursive=true&CollapseBoxSetItems=false&Limit=20");
			var randomImageData = Server.getContent(randomImageURL);
			if (randomImageData == null) { return; }
			
			for (var index = 0; index < randomImageData.Items.length; index++) {
				if (randomImageData.Items[index ].BackdropImageTags.length > 0) {
					var imgsrc = Server.getBackgroundImageURL(randomImageData.Items[index ].Id,"Backdrop",960,540,0,false,0,randomImageData.Items[index ].BackdropImageTags.length);
					document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
					break;
				}
			}
		}, 500);
		
		//Set Focus for Key Events
		document.getElementById("GuiPage_HomeOneItem").focus();
	} else {
		//Set message to user
		document.getElementById("pageContent").innerHTML = "<p id='title' class=pageTitle>"+title+"</p><div id=Content></div></div>";
		document.getElementById("Counter").innerHTML = "";
		document.getElementById("title").innerHTML = "Sorry";
		document.getElementById("Content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid";
		
		//As no content focus on menu bar and null null means user can't return off the menu bar
		GuiMainMenu.requested(null,null);
	}	
}

GuiPage_HomeOneItem.updateDisplayedItems = function() {
	Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",this.isResume,null,this.isLatest);
}

//Function sets CSS Properties so show which user is selected
GuiPage_HomeOneItem.updateSelectedItems = function (bypassCounter) {
	if ((this.ItemData.Items[0].Type == "Series" || this.ItemData.Items[0].Type == "Movie") && this.isResume != true) {
		Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortrait Selected","SeriesPortrait","",bypassCounter);
	} else {
		Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Series Collection Selected","Series Collection","",bypassCounter);
	}
}

GuiPage_HomeOneItem.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.menuItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.menuItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding red";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem red";
			}		
		} else {
			if (index != this.menuItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem";
			}
		}
	}
}

GuiPage_HomeOneItem.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);
	
	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	//Update Screensaver Timer
	Support.screensaver();
	
	//If screensaver is running 
	if (Main.getIsScreensaverRunning()) {
		//Update Main.js isScreensaverRunning - Sets to True
		Main.setIsScreensaverRunning();
		
		//End Screensaver
		GuiImagePlayer_Screensaver.stopScreensaver();
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		//Need Logout Key
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.processRightKey();
			break;		
		case tvKey.KEY_UP:
			alert("UP");
			this.processUpKey();
			break;	
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;	
		case tvKey.KEY_PANEL_CH_UP: 
		case tvKey.KEY_CH_UP: 
			this.processChannelUpKey();
			break;			
		case tvKey.KEY_PANEL_CH_DOWN: 
		case tvKey.KEY_CH_DOWN: 
			this.processChannelDownKey();
			break;	
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem();
			break;
		case tvKey.KEY_PLAY:
			this.playSelectedItem();
			break;
		case tvKey.KEY_RED:
			this.processIndexing();
			break;	
		case tvKey.KEY_GREEN:
			if (this.ItemData.Items[this.selectedItem].MediaType == "Video") {
				if (this.ItemData.Items[this.selectedItem].UserData.Played == true) {
					Server.deleteWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.Played = false
				} else {
					Server.setWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.Played = true
				}
				this.updateDisplayedItems();
				this.updateSelectedItems();
			}
			break;
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_YELLOW:	
			GuiMusicPlayer.showMusicPlayer("GuiPage_HomeOneItem");
			break;
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			if (this.selectedItem == -1) {
				if (this.selectedBannerItem != this.menuItems.length-1) {
					document.getElementById("bannerItem"+this.selectedBannerItem).class = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
				} else {
					document.getElementById("bannerItem"+this.selectedBannerItem).class = "guiDisplay_Series-BannerItem";		
				}
				this.selectedItem = 0;
				this.topLeftItem = 0;
			}
			Support.updateURLHistory("GuiPage_HomeOneItem",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
			GuiMainMenu.requested("GuiPage_HomeOneItem",this.ItemData.Items[this.selectedItem].Id);
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_HomeOneItem");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiPage_HomeOneItem.processSelectedItem = function() {
	clearTimeout(this.backdropTimeout);
	if (this.selectedItem == -1) {
		Support.updateURLHistory("GuiPage_HomeOneItem",this.startParams[0],this.startParams[1],this.startParams[2],this.startParams[3],0,0,true);
		Support.processHomePageMenu(this.menuItems[this.selectedBannerItem]);
	} else {
		Support.processSelectedItem("GuiPage_HomeOneItem",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,null,this.isLatest); 
	}
}

GuiPage_HomeOneItem.playSelectedItem = function () {
	if (this.ItemData.Items[this.selectedItem].MediaType == "Video") {
		Support.updateURLHistory("GuiPage_HomeOneItem",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
		var url = Server.getItemInfoURL(this.ItemData.Items[this.selectedItem].Id);
		GuiPlayer.start("PLAY",url,this.ItemData.Items[this.selectedItem].UserData.PlaybackPositionTicks / 10000);	
	}
}

GuiPage_HomeOneItem.processLeftKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem--;
		if (this.selectedBannerItem < 0) {
			this.selectedBannerItem = 0;
		}
		this.updateSelectedBannerItems();	
	} else {
		this.selectedItem--;
		if (this.selectedItem < 0) {
			this.selectedItem = 0;
		} else {
			if (this.selectedItem < this.topLeftItem) {
				this.topLeftItem = this.selectedItem - (this.getMaxDisplay() - 1);
				if (this.topLeftItem < 0) {
					this.topLeftItem = 0;
				}
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiPage_HomeOneItem.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.menuItems.length) {
			this.selectedBannerItem--;
		}
		this.updateSelectedBannerItems();	
	} else {
		this.selectedItem++;
		if (this.selectedItem >= this.ItemData.Items.length) {
			this.selectedItem--;
		} else {
			if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
				this.topLeftItem = this.selectedItem;
				this.updateDisplayedItems();
			}
		}
		this.updateSelectedItems();
	}
}

GuiPage_HomeOneItem.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		this.selectedBannerItem = 0;
		this.selectedItem = -1;
		//Hide red
		this.updateSelectedItems(true)
		//update selected banner item
		this.updateSelectedBannerItems();
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}	
}

GuiPage_HomeOneItem.processDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.ItemData.Items.length) {
			this.selectedItem = (this.ItemData.Items.length-1);
			if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
				this.updateDisplayedItems();
			}
		} else {
			if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
				this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
				this.updateDisplayedItems();
			}
		}	
	}
	this.updateSelectedItems();
}

GuiPage_HomeOneItem.processChannelUpKey = function() {
	this.selectedItem = this.selectedItem - this.getMaxDisplay();
	if (this.selectedItem < 0) {
		this.selectedItem = 0;
		this.topLeftItem = 0;
		this.updateDisplayedItems();
	} else {
		if (this.topLeftItem - this.getMaxDisplay() < 0) {
			this.topLeftItem = 0;
		} else {
			this.topLeftItem = this.topLeftItem - this.getMaxDisplay();
		}
		this.updateDisplayedItems();
	}
	this.updateSelectedItems();
}

GuiPage_HomeOneItem.processChannelDownKey = function() {
	this.selectedItem = this.selectedItem + this.getMaxDisplay();
	if (this.selectedItem >= this.ItemData.Items.length) {		
		this.selectedItem = (this.ItemData.Items.length-1);
		if (this.selectedItem >= this.topLeftItem + this.getMaxDisplay()) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
		}
		this.updateDisplayedItems();
	} else {
		this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
		this.updateDisplayedItems();
	}
	this.updateSelectedItems();
}

GuiPage_HomeOneItem.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}