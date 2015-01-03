var GuiTV_Show = {
		ItemData : null,
		ItemIndexData : null,
		
		selectedItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 8,
		
		indexSeekPos : -1,
		isResume : false,
		genreType : "",
		
		startParams : [],
		isLatest : false
}

GuiTV_Show.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiTV_Show.start = function(title,url,selectedItem,topLeftItem) {	
	//Save Start Params	
	this.startParams = [title,url];
	alert (url);
	
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	
	//Load Data
	this.ShowData = Server.getContent(url);
	
	var url2 = Server.getChildItemsURL(this.ShowData.Id,"&IncludeItemTypes=Season");
	this.ItemData = Server.getContent(url2);
	alert (url2);
	
	if (this.ItemData.Items.length == 1 && File.getUserProperty("SkipShow")) {
		//DO NOT UPDATE URL HISTORY AS SKIPPING THIS PAGE
		var url = Server.getChildItemsURL(this.ItemData.Items[this.selectedItem].Id,"&IncludeItemTypes=Episode&fields=SortName,Overview");
		GuiDisplayOneItem.start(this.ShowData.Name + " " + this.ItemData.Items[this.selectedItem].Name,url,0,0);
	} else {
		if (this.ItemData.Items.length > 0) {
			
			document.getElementById("pageContent").innerHTML = "<div id=Content></div>" + 
			"<div id='ShowSeriesInfo'></div>" + 
			"<div id='ShowImage'></div>" + 
			"<div id='InfoContainer' class='showItemContainer'>" + 
				"<div id='ShowTitle' style='font-size:22px;'></div>" +
				"<div id='ShowMetadata' style='padding-top:2px;color:#0099FF;padding-bottom:5px;'></div>" +
				"<div id='ShowOverview' class='ShowOverview'></div>" + 
			"</div>";
			
			document.getElementById("ShowTitle").innerHTML = this.ShowData.Name;
			
			if (this.ItemData.Items.length < 5) {
				document.getElementById("Content").className = 'ShowListShort';	
				document.getElementById("InfoContainer").className = 'showItemContainerShort';	
				document.getElementById("ShowImage").className = 'ShowImageShort';		
				this.MAXROWCOUNT = 4;
			} else {
				document.getElementById("Content").className = 'ShowList';	
				document.getElementById("InfoContainer").className = 'showItemContainer';
				document.getElementById("ShowImage").className = 'ShowImage';	
				this.MAXROWCOUNT = 8;
			}
			
			//If cover art use that else use text
			if (this.ShowData.ImageTags.Logo) {
				var imgsrc = Server.getImageURL(this.ShowData.Id,"Logo",300,40,0,false,0);
				document.getElementById("ShowSeriesInfo").style.backgroundImage="url('"+imgsrc+"')";
				document.getElementById("ShowSeriesInfo").className = 'EpisodesSeriesInfoLogo';	
			} else {
				document.getElementById("ShowSeriesInfo").innerHTML = this.ShowData.Name;
				document.getElementById("ShowSeriesInfo").className = 'EpisodesSeriesInfo';
			}
			
			//Update Metadata
			var htmlForTitle = "";
			if (this.ShowData.ProductionYear !== undefined) {
				htmlForTitle += this.ShowData.ProductionYear + " | ";
			}
			if (this.ShowData.CommunityRating !== undefined) {
				htmlForTitle += "<img src='images/star.png'>" + this.ShowData.CommunityRating + " | ";
			}
			if (this.ShowData.OfficialRating !== undefined) {
				htmlForTitle += this.ShowData.OfficialRating + " | ";
			}
			if (this.ShowData.RecursiveItemCount !== undefined) {
				htmlForTitle += this.ShowData.RecursiveItemCount + " Episodes" + " | ";
			}

			if (this.ShowData.RunTimeTicks !== undefined) {
					htmlForTitle += Support.convertTicksToMinutes(this.ShowData.RunTimeTicks/10000) + " | ";
			}
			htmlForTitle = htmlForTitle.substring(0,htmlForTitle.length-2);
			document.getElementById("ShowMetadata").innerHTML = htmlForTitle;
			
			//Update Overview
			htmlForOverview = "";
			if (this.ShowData.Overview !== undefined) {
				htmlForOverview = this.ShowData.Overview ;
			}
			document.getElementById("ShowOverview").innerHTML = htmlForOverview;
			Support.scrollingText("ShowOverview");
		
			//Display first XX series
			this.updateDisplayedItems();
				
			//Update Selected Collection CSS
			this.updateSelectedItems();	
				
			//Set Focus for Key Events
			document.getElementById("GuiTV_Show").focus();
		} else {
			//Set message to user
			document.getElementById("pageContent").innerHTML = "<div id='itemContainer' class='Columns"+this.MAXCOLUMNCOUNT+" padding10'><p id='title' class=pageTitle>"+title+"</p><div id=Content></div></div>";
			document.getElementById("Counter").innerHTML = "";
			document.getElementById("title").innerHTML = "Sorry";
			document.getElementById("Content").className = "padding60";
			document.getElementById("Content").innerHTML = "Huh.. Looks like I have no content to show you in this view I'm afraid";
			
			//As no content focus on menu bar and null null means user can't return off the menu bar
			GuiMainMenu.requested(null,null);
		}	
	}
}

GuiTV_Show.updateDisplayedItems = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length); index++) {			
		if (this.ItemData.Items[index].UserData.Played == true) {	
			if (this.ItemData.Items[index].ImageTags.Thumb) {
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Thumb",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div><div class='ShowListSingleWatched'></div></div>";
			} else if (this.ItemData.Items[index].BackdropImageTags.length > 0) {			
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Backdrop",100,46,0,false,0);
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div><div class='ShowListSingleWatched'></div></div>";
			} else if (this.ShowData.ImageTags.Thumb) {			
				var imgsrc = Server.getImageURL(this.ShowData.Id,"Thumb",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div><div class='ShowListSingleWatched'></div></div>";
			} else if (this.ShowData.BackdropImageTags.length > 0) {			
				var imgsrc = Server.getImageURL(this.ShowData.Id,"Backdrop",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div><div class='ShowListSingleWatched'></div></div>";
			} else {
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(images/ShowNoImage.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div><div class='ShowListSingleWatched'></div></div>";
			}
		} else {
			if (this.ItemData.Items[index].ImageTags.Thumb) {
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Thumb",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div></div>";
			} else if (this.ItemData.Items[index].BackdropImageTags.length > 0) {			
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Backdrop",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div></div>";
			} else if (this.ShowData.ImageTags.Thumb) {			
				var imgsrc = Server.getImageURL(this.ShowData.Id,"Thumb",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div></div>";
			} else if (this.ShowData.BackdropImageTags.length > 0) {			
				var imgsrc = Server.getImageURL(this.ShowData.Id,"Backdrop",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div></div>";
			} else {
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='ShowListSingleImage' style=background-image:url(images/ShowNoImage.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLine'>"+ this.ItemData.Items[index].Name + "</div></div></div>";
			}
		}
	}
	document.getElementById("Content").innerHTML = htmlToAdd;
}

//Function sets CSS Properties so show which user is selected
GuiTV_Show.updateSelectedItems = function () {
	Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"ShowListSingle EpisodeListSelected","ShowListSingle","");
	
	//Update Displayed Image
	if (this.ItemData.Items[this.selectedItem].ImageTags.Primary) {			
		var imgsrc = Server.getImageURL(this.ItemData.Items[this.selectedItem].Id,"Primary",140,200,0,false,0);
		document.getElementById("ShowImage").style.backgroundImage="url('" + imgsrc + "')";
	}
}

GuiTV_Show.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode) {	
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
		case tvKey.KEY_BLUE:	
			Support.logout();
			break;		
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiTV_Show",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
			GuiMainMenu.requested("GuiTV_Show",this.ItemData.Items[this.selectedItem].Id,"ShowListSingle EpisodeListSelected","ShowListSingle");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiTV_Show");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiTV_Show.processSelectedItem = function() {
	Support.updateURLHistory("GuiTV_Show",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
	var url = Server.getChildItemsURL(this.ItemData.Items[this.selectedItem].Id,"&IncludeItemTypes=Episode&fields=SortName,Overview");
	GuiDisplay_Episodes.start(this.ShowData.Name + " " + this.ItemData.Items[this.selectedItem].Name,url,0,0);
}

GuiTV_Show.playSelectedItem = function () {
	if (this.ItemData.Items[this.selectedItem].MediaType == "Video") {
		Support.updateURLHistory("GuiTV_Show",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
		var url = Server.getItemInfoURL(this.ItemData.Items[this.selectedItem].Id);
		GuiPlayer.start("PLAY",url,this.ItemData.Items[this.selectedItem].UserData.PlaybackPositionTicks / 10000);	
	}
}

GuiTV_Show.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		this.selectedItem = 0;
	} else {
		if (this.selectedItem < this.topLeftItem) {
			if (this.topLeftItem - this.MAXCOLUMNCOUNT < 0) {
				this.topLeftItem = 0;
			} else {
				this.topLeftItem = this.topLeftItem - this.MAXCOLUMNCOUNT;
			}
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
}

GuiTV_Show.processDownKey = function() {
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
	this.updateSelectedItems();
}

GuiTV_Show.processChannelUpKey = function() {
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

GuiTV_Show.processChannelDownKey = function() {
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


GuiTV_Show.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}