var GuiDisplay_Episodes = {
		ItemData : null,
		ItemIndexData : null,
		
		selectedItem : 0,
		selectedBannerItem : 0,
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
	this.selectedBannerItem = 0;
	this.topLeftItem = topLeftItem;
	this.genreType = null;
	
	//Load Data
	this.ItemData = Server.getContent(url);
	if (this.ItemData == null) { return; }
	
	//Latest Page Fix
	this.isLatest = false;
	if (title == "New TV") {
		this.isLatest = true;
		this.ItemData.Items = this.ItemData;
	}
	
	if (this.ItemData.Items.length > 0) {
		
		document.getElementById("pageContent").innerHTML = "<div id=allOptions class='EpisodesAllOptions'><span id='playAll' style='padding-right:35px'>Play All</span><span id='shuffleAll'>Shuffle All</span></div><div id=Content class='EpisodesList'></div>" +
		"<div id='EpisodesSeriesInfo' class='EpisodesSeriesInfo'></div>" + 
		"<div id='EpisodesImage' class='EpisodesImage'></div>" + 
		"<div id='EpisodesInfo' class='EpisodesInfo'>" +
		"<div id='SeasonName'></div>"+
		"<div id='SeriesTitle' style='font-size:22px; margin:3px 0px' ></div>" +
		"<div><hr /></div>"+
		"<div id='SeriesOverview' class='EpisodesOverview'></div>" +
		"<div id='SeriesSubData' style='margin-left:-5px;' class='MetaDataSeasonTable'></div>" +
		"</div>";
		
		//Set backdrop
		if (this.ItemData.Items[0].ParentBackdropImageTags.length > 0){
			var imgsrc = Server.getBackgroundImageURL(this.ItemData.Items[0].ParentBackdropItemId,"Backdrop",960,540,0,false,0,this.ItemData.Items[0].ParentBackdropImageTags.length);
			Support.fadeImage(imgsrc);
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
		
		//Load theme music if any
		GuiMusicPlayer.start("Theme", null, "GuiDisplay_Episodes",null,this.ItemData.Items[0].SeriesId,this.ItemData.Items[0].SeasonId);
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
		title = "";
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
		}else if (this.ItemData.Items[index].LocationType == "Virtual"){
			var status = ""
			if (Support.FutureDate(this.ItemData.Items[index].PremiereDate) == true) {
				status = "UNAIRED"
			} else {
				status = "MISSING"
			}
				
			if (this.ItemData.Items[index].ImageTags.Primary) {			
				var imgsrc = Server.getImageURL(this.ItemData.Items[index].Id,"Primary",100,46,0,false,0);	
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='EpisodeListSingleImage' style=background-image:url(" +imgsrc+ ")></div><div class='EpisodeListSingleTitleWatched'><div class="+lineCountCSS+">"+ title +"</div></div><div class='ShowListSingleMissing'>"+status+"</div></div>";
			} else {
				htmlToAdd += "<div id=" + this.ItemData.Items[index].Id + " class='EpisodeListSingle'><div class='EpisodeListSingleImage'></div><div class='EpisodeListSingleTitleWatched'><div class="+lineCountCSS+">"+ title +"</div></div><div class='ShowListSingleMissing'>"+status+"</div></div>";
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
	
	if (this.selectedItem > -1) {
		//Update Displayed Image
		if (this.ItemData.Items[this.selectedItem].ImageTags.Primary) {			
			var imgsrc = Server.getImageURL(this.ItemData.Items[this.selectedItem].Id,"Primary",470,180,0,false,0);
			document.getElementById("EpisodesImage").style.backgroundImage="url('" + imgsrc + "')";
		}
					
		//Set Metadata
		var htmlSubData = "";
		if (this.ItemData.Items[this.selectedItem].CommunityRating !== undefined) {
			htmlSubData += "<div id='Rating' class='MetaDataCell'>"
				+ "<div class='MetaDataCellContent'>"
				+ "<img src='images/star.png'>" + this.ItemData.Items[this.selectedItem].CommunityRating 
				+ "</div></div>";
		}
		if (this.ItemData.Items[this.selectedItem].PremiereDate !== undefined) {
			htmlSubData += "<div id='AirDate' class='MetaDataCell'>"
				+ "<div class='MetaDataCellContent'>"
				+ Support.AirDate(this.ItemData.Items[this.selectedItem].PremiereDate, this.ItemData.Items[this.selectedItem].Type) 
				+ "</div></div>";
		}

//		if (this.ItemData.Items[this.selectedItem].OfficialRating !== undefined && this.ItemData.Items[this.selectedItem].OfficialRating != "") {
//			htmlSubData += this.ItemData.Items[this.selectedItem].OfficialRating + " | ";
//		}
//		if (this.ItemData.Items[this.selectedItem].RecursiveItemCount !== undefined) {
//			htmlSubData += this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Episodes";
//		}

		if (this.ItemData.Items[this.selectedItem].RunTimeTicks !== undefined) {
			htmlSubData += "<div id='RunTime' class='MetaDataCell'>"
				+ "<div class='MetaDataCellContent'>"
				+ Support.convertTicksToMinutes(this.ItemData.Items[this.selectedItem].RunTimeTicks/10000) 
				+ "</div></div>";
		}
//		htmlSubData = htmlSubData.substring(0,htmlSubData.length-2);
									
		htmlForOverview = "";
		if (this.ItemData.Items[this.selectedItem].Overview !== undefined) {
			htmlForOverview = this.ItemData.Items[this.selectedItem].Overview;
		}
		
		//var currentEpTitle = Support.getNameFormat("", this.ItemData.Items[this.selectedItem].ParentIndexNumber, this.ItemData.Items[this.selectedItem].Name, this.ItemData.Items[this.selectedItem].IndexNumber);
		var currentEpTitle = this.ItemData.Items[this.selectedItem].IndexNumber + " - " + this.ItemData.Items[this.selectedItem].Name;
		var currentSeries = "Season " + this.ItemData.Items[this.selectedItem].ParentIndexNumber;
		
		document.getElementById("SeasonName").innerHTML = currentSeries;
		document.getElementById("SeriesTitle").innerHTML = currentEpTitle;
		document.getElementById("SeriesSubData").innerHTML = htmlSubData;
		document.getElementById("SeriesOverview").innerHTML = htmlForOverview;
					
		Support.scrollingText("SeriesOverview");
			
		//Background Image
		//Blocking code to skip getting data for items where the user has just gone past it
		var currentSelectedItem = this.selectedItem;
		setTimeout(function(){	
			if (GuiDisplay_Episodes.selectedItem == currentSelectedItem) {
				//Set Background
				if (GuiDisplay_Episodes.ItemData.Items[currentSelectedItem].BackdropImageTags.length > 0) {
					var imgsrc = Server.getBackgroundImageURL(GuiDisplay_Episodes.ItemData.Items[currentSelectedItem].Id,"Backdrop",960,540,0,false,0,GuiDisplay_Episodes.ItemData.Items[currentSelectedItem].BackdropImageTags.length);
					Support.fadeImage(imgsrc);
				}
			}
		}, 500);
	}	
}


GuiDisplay_Episodes.updateSelectedBannerItems = function() {
	if (this.selectedItem == -1) {
		if (this.selectedBannerItem == 0) {
			document.getElementById("playAll").style.color = "red";
			document.getElementById("shuffleAll").style.color = "#f9f9f9";
		} else {
			document.getElementById("playAll").style.color = "#f9f9f9";
			document.getElementById("shuffleAll").style.color = "red";
		}
	} else {
		document.getElementById("playAll").style.color = "#f9f9f9";
		document.getElementById("shuffleAll").style.color = "#f9f9f9";
	}
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
		case tvKey.KEY_UP:
			alert("UP");
			this.processUpKey();
			break;	
		case tvKey.KEY_DOWN:
			alert("DOWN");
			this.processDownKey();
			break;	
		case tvKey.KEY_LEFT:
			alert("LEFT");
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");
			this.processRightKey();
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
			GuiMusicPlayer.showMusicPlayer("GuiDisplay_Episodes");
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
	if (this.selectedItem == -1) {
		//Fix for return!
		Support.updateURLHistory("GuiDisplay_Episodes",this.startParams[0],this.startParams[1],null,null,0,this.topLeftItem,null);
	} else {
		Support.updateURLHistory("GuiDisplay_Episodes",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
	}
	
	if (this.selectedItem == -1) {
		if (this.selectedBannerItem == 0) {
			//Play All Episodes in Show
			var urlToPlay= Server.getChildItemsURL(this.ItemData.Items[0].SeasonId,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=SortName&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
			GuiPlayer.start("PlayAll",urlToPlay,0,"GuiDisplay_Episodes");	
		} else if (this.selectedBannerItem == 1) {
			//Shuffle All Episodes in Show
			var urlToPlay= Server.getChildItemsURL(this.ItemData.Items[0].SeasonId,"&ExcludeLocationTypes=Virtual&IncludeItemTypes=Episode&Recursive=true&SortBy=Random&SortOrder=Ascending&Fields=ParentId,SortName,MediaSources")
			GuiPlayer.start("PlayAll",urlToPlay,0,"GuiDisplay_Episodes");	
		}
	} else {
		var url = Server.getItemInfoURL(this.ItemData.Items[this.selectedItem].Id,null);
		GuiPage_ItemDetails.start(this.ItemData.Items[this.selectedItem].Name,url,0);
	}	
}

GuiDisplay_Episodes.playSelectedItem = function () {
	Support.playSelectedItem("GuiDisplay_Episodes",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null);
}

GuiDisplay_Episodes.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < -1) {
		this.selectedItem = -1;
	} if (this.selectedItem == -1) {
		this.updateSelectedBannerItems();
		this.updateSelectedItems();
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

GuiDisplay_Episodes.processDownKey = function() {
	this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		
	//If now 0, was -1, update banner selection
	if (this.selectedItem == 0) { this.selectedBannerItem = 0; this.updateSelectedBannerItems(); }

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
	if (this.selectedItem > -1) {
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
}

GuiDisplay_Episodes.processLeftKey = function() {
	if (this.selectedItem == -1) {
		if (this.selectedBannerItem == 1) {
			this.selectedBannerItem = 0;
			this.updateSelectedBannerItems();
		}
	}	
}

GuiDisplay_Episodes.processRightKey = function() {
	if (this.selectedItem == -1) {
		if (this.selectedBannerItem == 0) {
			this.selectedBannerItem = 1;
			this.updateSelectedBannerItems();
		}
	}
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