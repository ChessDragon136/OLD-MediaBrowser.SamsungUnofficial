var GuiPage_MusicArtist = {
		ItemData : null,
		selectedItem : 0,
		topLeftItem : 0,
		
		ItemData2 : null,
		selectedItem2 : -1,
		topLeftItem2 : 0,
		
		ItemIndexData : null,
		indexSeekPos : -1,
		
		MAXCOLUMNCOUNT : 5,
		MAXROWCOUNT : 1,
		
		title1 : "",
		startParams : []
}

GuiPage_MusicArtist.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiPage_MusicArtist.start = function(title1, url1) {
	//Save Start Vars
	this.startParams = [title1,url1];
	
	alert (url1);
	
	//Reset Vars
	this.selectedItem = 0;
	this.selectedItem2 = -1; //Prevents any item being shown as selected! 
	this.topLeftItem = 0;
	this.topLeftItem2 = 0;
	this.indexSeekPos = -1,

	//Load Data
	this.title1 = title1;
	this.ItemData = Server.getContent(url1);
	
	if (this.ItemData.Items.length > 0) {
		//Proceed as Normal
		//Set PageContent
		document.getElementById("pageContent").innerHTML = "<div class='Columns"+this.MAXCOLUMNCOUNT+" padding40'><p class=pageTitle>"+title1+"</p><div id=Content class='Rows"+this.MAXROWCOUNT+"'></div></div>" +
				"<div class='Columns"+this.MAXCOLUMNCOUNT+"SecondRow padding30'><p id=pageTitle2 class=pageTitle></p><div id=Content2></div></div>";
		
		//Index Data
		this.ItemIndexData = Support.processIndexing(this.ItemData.Items); 
		
		//Display first XX series
		this.updateDisplayedItems();
		
		//Update Selected Collection CSS
		this.updateSelectedItems(false);
	
		//Set Focus for Key Events
		document.getElementById("GuiPage_MusicArtist").focus();	
	} else if (this.ItemData.Items.length > 0 && this.ItemData2.Items.length == 0) {
	} else if (this.ItemData.Items.length == 0 && this.ItemData2.Items.length > 0) {
	} else if (this.ItemData.Items.length == 0 && this.ItemData2.Items.length == 0) {
	}
}

//---------------------------------------------------------------------------------------------------
//      TOP ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
GuiPage_MusicArtist.updateDisplayedItems = function() {
	Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content",this.divprepend1,this.isResume);
}

//Function sets CSS Properties so show which user is selected
GuiPage_MusicArtist.updateSelectedItems = function (bypassCounter) {
	Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Series Collection Selected","Series Collection",this.divprepend1,bypassCounter);
	
	//Prevent execution when selectedItem is set to -1 to hide selected item
	if (this.selectedItem != -1) {	
		//Set Title2
		if (this.title1 != "Albums") {
			document.getElementById("pageTitle2").innerHTML = "Albums by " + this.ItemData.Items[this.selectedItem].Name;
		} else {
			document.getElementById("pageTitle2").innerHTML = "Songs";
		}
		
		//Load Data
		var url2 = "";
		artist = this.ItemData.Items[this.selectedItem].Name.replace(/ /g, '+');	 
		artist = artist.replace(/&/g, '%26');
		switch (this.title1) {
		case "Artists":
			url2 = Server.getItemTypeURL("?SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&StartIndex=0&Artists="+this.ItemData.Items[this.selectedItem].Name.replace(" ","+"));
			break;
		case "Album Artists":
			url2 = Server.getItemTypeURL("?SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&StartIndex=0&Artists="+artist);
			break;
		case "Albums":
			url2 = Server.getChildItemsURL(this.ItemData.Items[this.selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true");
			break;
		default:
			//Default is AlbumArtist
			url2 = Server.getItemTypeURL("?SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=MusicAlbum&Recursive=true&StartIndex=0&Artists="+artist);
			break;
		}
		
		alert (this.ItemData.Items[this.selectedItem].Name + " : " + url2);
		
		//Blocking code to skip getting data for items where the user has just gone past it
		var currentArtistSelected = this.selectedItem;
		setTimeout(function(){	
			if (GuiPage_MusicArtist.selectedItem == currentArtistSelected) {
				GuiPage_MusicArtist.ItemData2 = Server.getContent(url2);

				//Display first XX series
				GuiPage_MusicArtist.updateDisplayedItems2();
					
				//Update Selected Collection CSS 
				GuiPage_MusicArtist.updateSelectedItems2(true);
			}
		}, 500);
		
		/*
		this.ItemData2 = Server.getContent(url2);

		//Display first XX series
		this.updateDisplayedItems2();
			
		//Update Selected Collection CSS 
		this.updateSelectedItems2(true);
		*/
	}
}

GuiPage_MusicArtist.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode){
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem++;
			} else {
				if (this.selectedItem < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					this.updateDisplayedItems();
				}			
			}
			this.updateSelectedItems();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.selectedItem++;
			if (this.selectedItem >= this.ItemData.Items.length) {
				this.selectedItem--;
			} else {
				if (this.selectedItem >= this.topLeftItem+this.getMaxDisplay() ) {
					this.topLeftItem++;
					this.updateDisplayedItems();
				}			
			}
			this.updateSelectedItems();
			break;
		case tvKey.KEY_DOWN:
			alert ("DOWN");
			this.processTopMenuDownKey();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processTopMenuDownKey();
			break;		
		case tvKey.KEY_RED:
			this.processIndexing();
			break;	
		case tvKey.KEY_UP:	
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiPage_MusicArtist",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,true);
			GuiMainMenu.requested("GuiPage_MusicArtist",this.divprepend1 + this.ItemData.Items[this.selectedItem].Id);
			break;
		case tvKey.KEY_RETURN:
			alert("RETURN");
			widgetAPI.blockNavigation(event);
			Support.processReturnURLHistory();
			break;
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
	}
}

GuiPage_MusicArtist.processTopMenuDownKey = function() {
	if (this.ItemData2.Items.length > 0) {
		//Set to 0 and reset display, then set to -1 and update selected so none are selected, then reset to 0
		var rememberSelectedItem = this.selectedItem;
		
		this.selectedItem = -1;
		this.updateSelectedItems(true);		
		this.selectedItem = rememberSelectedItem;
		
		//Set Focus
		document.getElementById("GuiPage_MusicArtistBottom").focus();
		//Update Selected 
		this.selectedItem2 = 0;
		this.updateSelectedItems2(false);
	}
}

//---------------------------------------------------------------------------------------------------
//      BOTTOM ITEMS HANDLERS
//---------------------------------------------------------------------------------------------------
GuiPage_MusicArtist.updateDisplayedItems2 = function() {
	Support.updateDisplayedItems(this.ItemData2.Items,this.selectedItem2,this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplay(),this.ItemData2.Items.length),"Content2",this.divprepend2,this.isResume2);
}

//Function sets CSS Properties so show which user is selected
GuiPage_MusicArtist.updateSelectedItems2 = function (bypassCounter) {
	Support.updateSelectedNEW(this.ItemData2.Items,this.selectedItem2,this.topLeftItem2,
			Math.min(this.topLeftItem2 + this.getMaxDisplay(),this.ItemData2.Items.length),"Series Collection Selected","Series Collection",this.divprepend2,bypassCounter);
}

GuiPage_MusicArtist.bottomKeyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {
		case tvKey.KEY_LEFT:
			alert("LEFT BOTTOM");	
			this.selectedItem2--;
			if (this.selectedItem2 < 0) {
				this.selectedItem2++;
			} else {
				if (this.selectedItem2 < this.topLeftItem2) {
					this.topLeftItem2--;
					if (this.topLeftItem2 < 0) {
						this.topLeftItem2 = 0;
					}
					this.updateDisplayedItems2();
				}			
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT BOTTOM");	
			this.selectedItem2++;
			if (this.selectedItem2 >= this.ItemData2.Items.length) {
				this.selectedItem2--;
			} else {
				if (this.selectedItem2 >= this.topLeftItem2+this.getMaxDisplay() ) {
					this.topLeftItem2++;
					this.updateDisplayedItems2();
				}			
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_UP:
			alert("UP BOTTOM");
			this.selectedItem2 = -1;
			this.updateSelectedItems2(true);	
			this.topLeftItem2 = 0;
			
			//Set Focus
			document.getElementById("GuiPage_MusicArtist").focus();
			this.updateSelectedItems(false);
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER BOTTOM");
			this.processSelectedItem(this.ItemData2,this.selectedItem2,this.topLeftItem2,true);
			break;	
		case tvKey.KEY_PLAY:
			this.playSelectedItem(this.ItemData2.Items,this.selectedItem2);
			break;	
		case tvKey.KEY_YELLOW:
			GuiMusicPlayer.showPlayer();
			break;
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY BOTTOM");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiPage_MusicArtist",this.startParams[0],this.startParams[1],null,null,this.selectedItem2,this.topLeftItem2,false);
			GuiMainMenu.requested("GuiPage_MusicArtistBottom",this.divprepend2 + this.ItemData2.Items[this.selectedItem2].Id);
			break;
		case tvKey.KEY_RETURN:
			//In this instance handle return to go up to the top menu
			alert("RETURN BOTTOM");
			widgetAPI.blockNavigation(event);
			this.selectedItem2 = 0;
			this.topLeftItem2 = 0;

			this.selectedItem2 = -1;
			this.updateSelectedItems2(true);		

			//Set Focus
			document.getElementById("GuiPage_MusicArtist").focus();
			this.updateSelectedItems(false);
			break;
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY BOTTOM");
			widgetAPI.sendExitEvent();
			break;
	}
}

//--------------------------------------------------------------------------------------------------------

GuiPage_MusicArtist.processSelectedItem = function (array,selected,topLeftItem,isBottom) {
	Support.processSelectedItem("GuiPage_MusicArtist",array,this.startParams,selected,topLeftItem,true,null);
}

GuiPage_MusicArtist.playSelectedItem = function (array,selected) {
}

GuiPage_MusicArtist.processIndexing = function() {
	var indexLetter = this.ItemIndexData[0];
	var indexPos = this.ItemIndexData[1];
	
	this.indexSeekPos++;
	if (this.indexSeekPos >= indexPos.length) {
		this.indexSeekPos = 0;
		this.topLeftItem = 0;
	}
	
	this.selectedItem = indexPos[this.indexSeekPos];
	this.topLeftItem = this.selectedItem;
	
	this.updateDisplayedItems();
	this.updateSelectedItems();
}

GuiPage_MusicArtist.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}