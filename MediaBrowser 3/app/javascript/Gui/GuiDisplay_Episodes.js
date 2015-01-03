var GuiDisplay_Episodes = {
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

GuiDisplay_Episodes.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiDisplay_Episodes.start = function(title,url,selectedItem,topLeftItem) {	
	//Save Start Params	
	this.startParams = [title,url];
	alert (url);
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.genreType = null;
	
	//Load Data
	this.ItemData = Server.getContent(url);
	
	//Latest Page Fix
	this.isLatest = false;
	if (title == "New TV") {
		this.isLatest = true;
		this.ItemData.Items = this.ItemData;
	}
	
	if (this.ItemData.Items.length > 0) {
		
		document.getElementById("pageContent").innerHTML = "<div id=Content class='EpisodesList'></div>" +
		"<div id='EpisodesSeriesInfo' class='EpisodesSeriesInfo'></div>" + 
		"<div id='EpisodesImage' class='EpisodesImage'></div>" + 
		"<div id='EpisodesInfo' class='EpisodesInfo'>" +
		"<div id='SeriesTitle' style='font-size:22px;'></div>" +
		"<div id='SeriesSubData' style='padding-top:2px;color:#0099FF;padding-bottom:5px;'></div>" +
		"<div id='SeriesOverview' class='EpisodesOverview'></div>" +
		"</div>";
		
		//Set backdrop
		if (this.ItemData.Items[0].ParentBackdropImageTags.length > 0){
			var imgsrc = Server.getImageURL(this.ItemData.Items[0].ParentBackdropItemId,"Backdrop",960,540,0,false,0);
			document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
		}
		
		//If cover art use that else use text
		if (this.ItemData.Items[0].ParentLogoItemId) {
			var imgsrc = Server.getImageURL(this.ItemData.Items[0].ParentLogoItemId,"Logo",300,40,0,false,0);
			document.getElementById("EpisodesSeriesInfo").style.backgroundImage="url('"+imgsrc+"')";
			document.getElementById("EpisodesSeriesInfo").className = 'EpisodesSeriesInfoLogo';	
		} else {
			document.getElementById("EpisodesSeriesInfo").innerHTML = this.ItemData.Items[0].SeriesName + " | Season " +  this.ItemData.Items[0].ParentIndexNumber;
			document.getElementById("EpisodesSeriesInfo").className = 'EpisodesSeriesInfo';
		}
		
		//Indexing Algorithm
		this.ItemIndexData = Support.processIndexing(this.ItemData.Items); 
	
		//Display first XX series
		this.updateDisplayedItems();
			
		//Update Selected Collection CSS
		this.updateSelectedItems();	
			
		//Set Focus for Key Events
		document.getElementById("GuiDisplay_Episodes").focus();
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

GuiDisplay_Episodes.updateDisplayedItems = function() {
	var htmlToAdd = "";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length); index++) {		
		var title = "";
		var lineCountCSS = "EpisodeListTextOneLine";
		if (this.ItemData.Items[index].IndexNumber === undefined) {
			title = this.ItemData.Items[index].Name;
		} else {
			title = this.ItemData.Items[index].IndexNumber + " - " + this.ItemData.Items[index].Name;
		}
 
		if (title.length > 40) {
			lineCountCSS = "EpisodeListTextTwoLine";
			//Regex to see if title has any spaces, if so record them in matches array
			var regexp = / /g;
			var match, matches = [];
			while ((match = regexp.exec(title)) != null) {
			  matches.push(match.index);
			}
			
			//if title has space split the title at the nearest space before 40 characters
			if (matches.length > 2) {
				var nearestIndex = -1;
				var gap = 1000;
				for (var index2 = 0; index2 < matches.length; index2++) {
					if (40 - matches[index2] < gap && 40 - matches[index2] > -1) {
						gap = 40 - matches[index2];
						nearestIndex = index2;
					}
				}
				var line2 = title.substring(matches[nearestIndex]+1,title.length)
				if (line2.length >  40) {
					lineCountCSS = "EpisodeListTextThreeLine";
					var gap = 1000;
					var nearestIndex2 = -1;
					for (var index2 = 0; index2 < matches.length; index2++) {
						if (40 - matches[index2] < gap && 40 - matches[index2] > -1) {
							gap = 40 - matches[index2];
							nearestIndex2 = index2;
						}
					}
					line2 = line2.substring(0,matches[nearestIndex2]) + "<br>" + line2.substring(matches[nearestIndex2]+1,line2.length);	
				}
				title = title.substring(0,matches[nearestIndex]) + "<br>" + line2;		
			} else {
				lineCountCSS = "EpisodeListTextThreeLine";
				//No spaces, split on 45
				var line2 = title.substring(40,title.length-1);
				if (line2 > 40) {
					line2 = line2.substring(0,40) + "<br>" + line2.substring(40,line2.length-1);
				}
				title = title.substring(0,40) + "<br>" + line2;	
			}		
		}
		
		
		if (this.ItemData.Items[index].UserData.Played == true) {
			if (this.ItemData.Items[index].ImageTags.Primary) {			
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Primary",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='EpisodeListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='EpisodeListSingleTitleWatched'><div class="+lineCountCSS+">"+ title +"</div></div><div class='ShowListSingleWatched'></div></div>";
			} else {
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='EpisodeListSingleImage'></div><div class='EpisodeListSingleTitleWatched'><div class="+lineCountCSS+">"+ title +"</div></div><div class='ShowListSingleWatched'></div></div>";
			}
		} else {
			if (this.ItemData.Items[index].ImageTags.Primary) {			
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Primary",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='EpisodeListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='EpisodeListSingleTitle'><div class="+lineCountCSS+">"+ title +"</div></div></div>"; // 
			} else {  //
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='EpisodeListSingleImage'></div><div class='EpisodeListSingleTitle'><div class="+lineCountCSS+">"+ title +"</div></div></div>";
			}
		}
	}
	document.getElementById("Content").innerHTML = htmlToAdd;
}

//Function sets CSS Properties so show which user is selected
GuiDisplay_Episodes.updateSelectedItems = function () {
	Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"EpisodeListSingle EpisodeListSelected","EpisodeListSingle","");
	
	//Update Displayed Image
	if (this.ItemData.Items[this.selectedItem].ImageTags.Primary) {			
		var imgsrc = Server.getImageURL(this.ItemData.Items[this.selectedItem].Id,"Primary",470,180,0,false,0);
		document.getElementById("EpisodesImage").style.backgroundImage="url('" + imgsrc + "')";
	}
				
	//Set Metadata
	var htmlForTitle = "";
	if (this.ItemData.Items[this.selectedItem].ProductionYear !== undefined) {
		htmlForTitle += this.ItemData.Items[this.selectedItem].ProductionYear + " | ";
	}
	if (this.ItemData.Items[this.selectedItem].CommunityRating !== undefined) {
		htmlForTitle += "<img src='images/star.png'>" + this.ItemData.Items[this.selectedItem].CommunityRating + " | ";
	}
	if (this.ItemData.Items[this.selectedItem].OfficialRating !== undefined) {
		htmlForTitle += this.ItemData.Items[this.selectedItem].OfficialRating + " | ";
	}
	if (this.ItemData.Items[this.selectedItem].RecursiveItemCount !== undefined) {
		htmlForTitle += this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Episodes";
	}

	if (this.ItemData.Items[this.selectedItem].RunTimeTicks !== undefined) {
			htmlForTitle += Support.convertTicksToMinutes(this.ItemData.Items[this.selectedItem].RunTimeTicks/10000) + " | ";
	}
	htmlForTitle = htmlForTitle.substring(0,htmlForTitle.length-2);
								
	htmlForOverview = "";
	if (this.ItemData.Items[this.selectedItem].Overview !== undefined) {
		htmlForOverview = this.ItemData.Items[this.selectedItem].Overview;
	}
	
	if (this.ItemData.Items[this.selectedItem].ParentIndexNumber !== undefined && this.ItemData.Items[this.selectedItem].IndexNumber !== undefined) {
		var seasonNumber = this.ItemData.Items[this.selectedItem].ParentIndexNumber;
		var seasonString = "";
		if (seasonNumber < 10){
			seasonString = "0" + seasonNumber;
		}
		else{
			seasonString = seasonNumber;
		}
		
		var episodeNumber =this.ItemData.Items[this.selectedItem].IndexNumber;
		var episodeString = "";
		if (episodeNumber < 10){
			episodeString = "0" + episodeNumber;
		}
		else{
			episodeString = episodeNumber;
		}
		
		document.getElementById("SeriesTitle").innerHTML = "S" + seasonString + "E"+ episodeString + " - " +this.ItemData.Items[this.selectedItem].Name;
		
	} else {
		document.getElementById("SeriesTitle").innerHTML = this.ItemData.Items[this.selectedItem].Name;
	}
	
	document.getElementById("SeriesSubData").innerHTML = htmlForTitle;
	document.getElementById("SeriesOverview").innerHTML = htmlForOverview;
				
	Support.scrollingText("SeriesOverview");
		
	//Background Image
	//Blocking code to skip getting data for items where the user has just gone past it
	var currentSelectedItem = this.selectedItem;
	setTimeout(function(){	
		if (GuiDisplay_Episodes.selectedItem == currentSelectedItem) {
			//Set Background
			if (GuiDisplay_Episodes.ItemData.Items[currentSelectedItem].BackdropImageTags.length > 0) {
				var imgsrc = Server.getImageURL(GuiDisplay_Episodes.ItemData.Items[currentSelectedItem].Id,"Backdrop",960,540,0,false,0);
				document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
			}
		}
	}, 500);
}

GuiDisplay_Episodes.keyDown = function() {
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
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiDisplay_Episodes",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
			GuiMainMenu.requested("GuiDisplay_Episodes",this.ItemData.Items[this.selectedItem].Id,"EpisodeListSingle EpisodeListSelected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiDisplay_Episodes");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiDisplay_Episodes.processSelectedItem = function() {
	Support.processSelectedItem("GuiDisplay_Episodes",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,this.genreType,this.isLatest); 
}

GuiDisplay_Episodes.playSelectedItem = function () {
	if (this.ItemData.Items[this.selectedItem].MediaType == "Video") {
		Support.updateURLHistory("GuiDisplay_Episodes",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
		var url = Server.getItemInfoURL(this.ItemData.Items[this.selectedItem].Id);
		GuiPlayer.start("PLAY",url,this.ItemData.Items[this.selectedItem].UserData.PlaybackPositionTicks / 10000);	
	}
}

GuiDisplay_Episodes.processUpKey = function() {
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

GuiDisplay_Episodes.processDownKey = function() {
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

GuiDisplay_Episodes.processChannelUpKey = function() {
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

GuiDisplay_Episodes.processChannelDownKey = function() {
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

GuiDisplay_Episodes.processIndexing = function() {
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

GuiDisplay_Episodes.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}