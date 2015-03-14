var GuiDisplay_Series = {
		ItemData : null,
		ItemIndexData : null,
		
		totalRecordCount : null,
		
		selectedItem : 0,
		selectedBannerItem : 0,
		topLeftItem : 0,
		MAXCOLUMNCOUNT : 9,
		MAXROWCOUNT : 2,
		
		bannerItems : [],
		tvBannerItems : ["All","Unwatched","Latest", "Genre"],
		movieBannerItems : ["All","Unwatched","Latest","Genre"],
		musicBannerItems : ["Album","Album Artist", "Artist"],
		
		indexSeekPos : -1,
		isResume : false,
		genreType : "",
		
		isAllorFolder : 0,
		isTvOrMovies : 0,
		
		startParams : [],
		isLatest : false
}

GuiDisplay_Series.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiDisplay_Series.start = function(title,url,selectedItem,topLeftItem) {	
	//Save Start Params	
	Support.pageLoadTimes("GuiDisplay_Series","Start",true);
	this.startParams = [title,url];
	
	//Reset Values
	this.indexSeekPos = -1;
	this.selectedItem = selectedItem;
	this.topLeftItem = topLeftItem;
	this.genreType = null;
	
	//Set Display Size from User settings
	this.MAXCOLUMNCOUNT = (File.getUserProperty("LargerView") == true) ? 7 : 9;
	this.MAXROWCOUNT = 2;
	
	this.ItemData = Server.getContent(url + "&Limit=200");
	if (this.ItemData == null) { return; }
	this.totalRecordCount = this.ItemData.TotalRecordCount;
	Support.pageLoadTimes("GuiDisplay_Series","RetrievedServerData",false);
	
	//Latest Page Fix
	this.isLatest = false;
	if (title == "New TV" || title == "New Movies") {
		this.isLatest = true;
		this.ItemData.Items = this.ItemData;
	}
	
	//Genre Page Fix
	if (title == "TV Genres" || title == "Movie Genres") {
		this.genreType = (title == "TV Genres") ? "Series" : "Movie";
	}
	
	if (this.ItemData.Items.length > 0) {	
		//Update Padding on pageContent
		document.getElementById("pageContent").innerHTML = "<div id=bannerSelection class='guiDisplay_Series-Banner'></div><div id=Center class='SeriesCenter'><div id=Content></div></div>" +
			"<div id=SeriesContent class='SeriesContent'><div id='SeriesTitle' style='position:relative; height:22px; font-size:22px;'></div>" +
			"<div id='SeriesSubData' style='padding-top:2px;color:#2ad;'></div>" +
			"<div id='SeriesOverview' style='margin-top:6px;padding-right:10px;height:85px;overflow-y:hidden;'></div>" +
			"</div>";
		
		//Determine if display is for all tv / movies or just a folder
		if ((url.split("ParentId").length - 1) == 2 || title == "Collections") {
			alert ("Media Folder");
			this.isAllorFolder = 1;
			document.getElementById("bannerSelection").style.paddingTop="15px";
			document.getElementById("bannerSelection").style.paddingBottom="10px";
		} else {
			alert ("All TV or Movies");
			this.isAllorFolder = 0;
			document.getElementById("bannerSelection").style.paddingTop="10px";
			document.getElementById("bannerSelection").style.paddingBottom="5px";
		}
		
		//Determine if extra top padding is needed for items <= MaxRow
		if (this.ItemData.Items.length <= this.MAXCOLUMNCOUNT) {
			document.getElementById("Center").style.top = "110px";
		}
		
		//See if first item is tv or movie and save result
		//Will never display movies and tv in the same view!
		if (this.ItemData.Items[0].Type == "Movie") {
			this.isTvOrMovies = 1;
			this.bannerItems = this.movieBannerItems;
			//Move Title Down if larger icons shown!
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="422px";
				document.getElementById("SeriesOverview").style.height="47px";
			}	
		} else if (this.ItemData.Items[0].Type == "Series"){
			this.isTvOrMovies = 0;
			this.bannerItems = this.tvBannerItems;
			//Move Title Down if larger icons shown!
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="422px";
				document.getElementById("SeriesOverview").style.height="47px";
			}
		} else if (title == "Collections"){
			this.isTvOrMovies = -1; //Set false - else displays incorrectly! @Frostbyte
			//Move Title Down if larger icons shown!
			if (File.getUserProperty("LargerView") == true) {
				document.getElementById("SeriesContent").style.top="422px";
				document.getElementById("SeriesOverview").style.height="47px";
			}
		}else {
			//Fix No of displayed items
			this.MAXCOLUMNCOUNT = 8;
			this.MAXROWCOUNT = 3;
			//Move Title content down
			document.getElementById("SeriesContent").style.top="400px";
			document.getElementById("SeriesOverview").style.height="0px";
			this.isTvOrMovies = 2;
			this.bannerItems = this.musicBannerItems;
		}
		
		//Create banner headers only if all tv or all movies is selected
		if (this.isAllorFolder == 0) {
			for (var index = 0; index < this.bannerItems.length; index++) {
				if (index != this.bannerItems.length-1) {
					document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding'>"+this.bannerItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";			
				} else {
					document.getElementById("bannerSelection").innerHTML += "<div id='bannerItem" + index + "' class='guiDisplay_Series-BannerItem'>"+this.bannerItems[index].replace(/-/g, ' ').toUpperCase()+"</div>";					
				}
			}
		}
	
		//Indexing Algorithm - Disabled v0.570c
		//this.ItemIndexData = Support.processIndexing(this.ItemData.Items); 
	
		//Display first XX series
		this.updateDisplayedItems();
			
		//Update Selected Collection CSS
		this.updateSelectedItems();	
			
		//Set Focus for Key Events
		document.getElementById("GuiDisplay_Series").focus();
		Support.pageLoadTimes("GuiDisplay_Series","UserControl",false);
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

GuiDisplay_Series.updateDisplayedItems = function() {
	Support.updateDisplayedItems(this.ItemData.Items,this.selectedItem,this.topLeftItem,
			Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Content","",this.isResume,this.genreType);
}

//Function sets CSS Properties so show which user is selected
GuiDisplay_Series.updateSelectedItems = function () {
	if (this.isTvOrMovies == 2) {
		//Music - Use different styles
		Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
				Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Music Selected","Music","",false,this.totalRecordCount);
	} else {
		if (File.getUserProperty("LargerView") == true) {
			Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
					Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortraitLarge Selected","SeriesPortraitLarge","",false,this.totalRecordCount);
		} else {
			Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
					Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortrait Selected","SeriesPortrait","",false,this.totalRecordCount);
		}
		
	}
			
	var htmlForTitle = this.ItemData.Items[this.selectedItem].Name + "<div style='display:inline-block; position:absolute; height:22px; bottom:0px'><table style='font-size:14px;padding-left:10px;'><tr>";
	
	if (this.ItemData.Items[this.selectedItem].Type !== undefined
			&& this.ItemData.Items[this.selectedItem].ProductionYear !== undefined) {
		//"" is required to ensure type string is stored!
		text =  "" + Support.SeriesRun(this.ItemData.Items[this.selectedItem].Type, this.ItemData.Items[this.selectedItem].ProductionYear, this.ItemData.Items[this.selectedItem].Status, this.ItemData.Items[this.selectedItem].EndDate);

		if (text.indexOf("Present") > -1) {
			htmlForTitle += "<td class='MetadataItemSmallLong'>" + text
			+ "</td>";
		} else {
			htmlForTitle += "<td class='MetadataItemSmall'>" + text
			+ "</td>";
		}
		
		
	}
	if (this.ItemData.Items[this.selectedItem].CommunityRating !== undefined) {
		htmlImage = Support.getStarRatingImage(this.ItemData.Items[this.selectedItem].CommunityRating);
		htmlForTitle += "<td class='MetadataItemSmallLong'>" + htmlImage;
			+ "</td>";
	}
	if (this.ItemData.Items[this.selectedItem].OfficialRating !== undefined) {
		htmlForTitle +="<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].OfficialRating 
			+ "</td>";
	}
	if (this.ItemData.Items[this.selectedItem].RecursiveItemCount !== undefined) {
		if (this.isAllorFolder == 1) {
			htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Items" 
			+ "</td>";	
			if (this.ItemData.Items[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Item" 
				+ "</td>";	
			}
		}
		if (this.isTvOrMovies == 2) {
			htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Songs" 
				+ "</td>";	
			if (this.ItemData.Items[this.selectedItem].RecursiveItemCount == 1){
				htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].RecursiveItemCount + " Song" 
				+ "</td>";	
			}
		} else {
			if (this.ItemData.Items[this.selectedItem].SeasonCount !== undefined) {
				if (this.ItemData.Items[this.selectedItem].SeasonCount == 1){
					htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].SeasonCount + " Season" 
					+ "</td>";					
				} else {
					htmlForTitle += "<td class='MetadataItemSmall'>" + this.ItemData.Items[this.selectedItem].SeasonCount + " Seasons" 
					+ "</td>";
				}
			}		
		}	
	}

	htmlForTitle += "</tr></table></div>";
			
	htmlForSubData = "";
	if (this.ItemData.Items[this.selectedItem].Genres !== undefined) {
		htmlForSubData = this.ItemData.Items[this.selectedItem].Genres.join(" / ");
	}
				
	htmlForOverview = "";
	if (this.ItemData.Items[this.selectedItem].Overview !== undefined) {
		htmlForOverview = this.ItemData.Items[this.selectedItem].Overview;
	}
				
	document.getElementById("SeriesTitle").innerHTML = htmlForTitle;
	document.getElementById("SeriesSubData").innerHTML = htmlForSubData;
	document.getElementById("SeriesOverview").innerHTML = htmlForOverview;
				
	Support.scrollingText("SeriesOverview");
		
	//Background Image
	//Blocking code to skip getting data for items where the user has just gone past it
	var currentSelectedItem = this.selectedItem;
	setTimeout(function(){	
		if (GuiDisplay_Series.selectedItem == currentSelectedItem) {
			//Set Background
			if (GuiDisplay_Series.ItemData.Items[currentSelectedItem].BackdropImageTags.length > 0) {
				var imgsrc = Server.getBackgroundImageURL(GuiDisplay_Series.ItemData.Items[currentSelectedItem].Id,"Backdrop",960,540,0,false,0,GuiDisplay_Series.ItemData.Items[currentSelectedItem].BackdropImageTags.length);
				Support.fadeImage(imgsrc);
			}
			else if (GuiDisplay_Series.ItemData.Items[currentSelectedItem].ParentBackdropImageTags) {
				var imgsrc = Server.getBackgroundImageURL(GuiDisplay_Series.ItemData.Items[currentSelectedItem].ParentBackdropItemId,"Backdrop",960,540,0,false,0,GuiDisplay_Series.ItemData.Items[currentSelectedItem].ParentBackdropImageTags.length);
				Support.fadeImage(imgsrc);
			}
		}
	}, 800);
	
	//If Genre update Overview
	if (GuiDisplay_Series.genreType != null) {
		var urlGenre = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes="+GuiDisplay_Series.genreType+"&Recursive=true&CollapseBoxSetItems=false&fields=&Genres=" + GuiDisplay_Series.ItemData.Items[GuiDisplay_Series.selectedItem].Name);
		var GenreData = Server.getContent(urlGenre);
		if (GenreData == null) { return; }
		
		document.getElementById("SeriesOverview").innerHTML = "";
		for (var index = 0; index < GenreData.Items.length; index++) {
			document.getElementById("SeriesOverview").innerHTML += GenreData.Items[index].Name + "<br>";
		}
	}
}

GuiDisplay_Series.updateSelectedBannerItems = function() {
	for (var index = 0; index < this.bannerItems.length; index++) {
		if (index == this.selectedBannerItem) {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding red";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem red";
			}		
		} else {
			if (index != this.bannerItems.length-1) {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
			} else {
				document.getElementById("bannerItem"+index).className = "guiDisplay_Series-BannerItem";
			}
		}
	}
}

GuiDisplay_Series.keyDown = function() {
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
			//Disabled v0.570c
			//this.processIndexing();
			break;	
		case tvKey.KEY_GREEN:
			if (this.selectedItem > -1) {
				if (this.ItemData.Items[this.selectedItem].MediaType == "Video") {
					if (this.ItemData.Items[this.selectedItem].UserData.Played == true) {
						Server.deleteWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
						this.ItemData.Items[this.selectedItem].UserData.Played = false;
					} else {
						Server.setWatchedStatus(this.ItemData.Items[this.selectedItem].Id);
						this.ItemData.Items[this.selectedItem].UserData.Played = true;
					}
					this.updateDisplayedItems();
					this.updateSelectedItems();
				}
			}	
			break;
		case tvKey.KEY_YELLOW:	
			if (this.selectedItem > -1) {
				if (this.ItemData.Items[this.selectedItem].UserData.IsFavorite == true) {
					Server.deleteFavourite(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.IsFavorite = false;
					GuiNotifications.setNotification ("Item has been removed from<br>favourites","Favourites");
				} else {
					Server.setFavourite(this.ItemData.Items[this.selectedItem].Id);
					this.ItemData.Items[this.selectedItem].UserData.IsFavorite = true;
					GuiNotifications.setNotification ("Item has been added to<br>favourites","Favourites");
				}
			}
			break;
		case tvKey.KEY_BLUE:	
			GuiMusicPlayer.showMusicPlayer("GuiDisplay_Series");
			break;	
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			if (this.selectedItem == -1) {
				if (this.selectedBannerItem != this.bannerItems.length-1) {
					document.getElementById("bannerItem"+this.selectedBannerItem).className = "guiDisplay_Series-BannerItem guiDisplay_Series-BannerItemPadding";
				} else {
					document.getElementById("bannerItem"+this.selectedBannerItem).className = "guiDisplay_Series-BannerItem";
				}
				this.selectedItem = 0;
				this.topLeftItem = 0;
			}
			Support.updateURLHistory("GuiDisplay_Series",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,null);
			GuiMainMenu.requested("GuiDisplay_Series",this.ItemData.Items[this.selectedItem].Id);
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiDisplay_Series");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent(); 
			break;
	}
}

GuiDisplay_Series.processSelectedItem = function() {
	if (this.selectedItem == -1) {
		switch (this.bannerItems[this.selectedBannerItem]) {
		case "All":		
			if (this.isTvOrMovies == 1) {	
				var url = Server.getItemTypeURL("&IncludeItemTypes=Movie&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true");
				GuiDisplay_Series.start("All Movies",url,0,0);
			} else {
				var url = Server.getItemTypeURL("&IncludeItemTypes=Series&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true");
				GuiDisplay_Series.start("All TV",url,0,0);
			}
		break;
		case "Unwatched":
			if (this.isTvOrMovies == 1) {	
				var url = Server.getItemTypeURL("&IncludeItemTypes=Movie&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true&Filters=IsUnPlayed");
				GuiDisplay_Series.start("All Movies",url,0,0);
			}	else {
				var url = Server.getItemTypeURL("&IncludeItemTypes=Series&SortBy=SortName&SortOrder=Ascending&isPlayed=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&recursive=true");
				GuiDisplay_Series.start("All TV",url,0,0);
			}
		break;
		case "Latest":		
			if (this.isTvOrMovies == 1) {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Movie&isPlayed=false&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				GuiDisplay_Series.start("New Movies",url,0,0);
			} else {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&IncludeItemTypes=Episode&isPlayed=false&IsFolder=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
				GuiDisplay_Series.start("New TV",url,0,0);
			}			
		break;
		case "Genre":
			if (this.isTvOrMovies == 1) {	
				var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName&userId=" + Server.getUserID());
				GuiDisplay_Series.start("Movie Genres",url1,0,0);
			} else {
				var url1 = Server.getCustomURL("/Genres?format=json&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName&userId=" + Server.getUserID());
				GuiDisplay_Series.start("TV Genres",url1,0,0);
			}		
		break;
		case "Album":
			if (this.isTvOrMovies == 2) {	
				var url1 = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName");
				GuiDisplay_Series.start("Album",url1,0,0);
			}		
		break;
		case "Album Artist":
			if (this.isTvOrMovies == 2) {	
				var url1 = Server.getCustomURL("/Artists/AlbumArtists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName&userId=" + Server.getUserID());
				GuiPage_MusicArtist.start("Album Artist",url1);
			}		
		break;
		case "Artist":
			if (this.isTvOrMovies == 2) {	
				var url1 = Server.getCustomURL("/Artists?format=json&SortBy=SortName&SortOrder=Ascending&Recursive=true&ExcludeLocationTypes=Virtual&Fields=ParentId,SortName&userId=" + Server.getUserID());
				GuiDisplay_Series.start("Artist",url1,0,0);
			}		
		break;
		}
	} else {
		Support.processSelectedItem("GuiDisplay_Series",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null,this.genreType,this.isLatest); 	
	}
}

GuiDisplay_Series.playSelectedItem = function () {
	Support.playSelectedItem("GuiDisplay_Series",this.ItemData,this.startParams,this.selectedItem,this.topLeftItem,null);
}

GuiDisplay_Series.processLeftKey = function() {
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

GuiDisplay_Series.processRightKey = function() {
	if (this.selectedItem == -1) {
		this.selectedBannerItem++;
		if (this.selectedBannerItem >= this.bannerItems.length) {
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

GuiDisplay_Series.processUpKey = function() {
	this.selectedItem = this.selectedItem - this.MAXCOLUMNCOUNT;
	if (this.selectedItem < 0) {
		if (this.isAllorFolder == 0 ) {
			this.selectedBannerItem = 0;
			this.selectedItem = -1;
			//Hide red - If Music use different styles
			if (this.isTvOrMovies == 2) {
				//Music - Use different styles
				Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
						Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"Music Selected","Music","");
			} else {
				if (File.getUserProperty("LargerView") == true) {
					Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
							Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortraitLarge Selected","SeriesPortraitLarge","");
				} else {
					Support.updateSelectedNEW(this.ItemData.Items,this.selectedItem,this.topLeftItem,
							Math.min(this.topLeftItem + this.getMaxDisplay(),this.ItemData.Items.length),"SeriesPortrait Selected","SeriesPortrait","");
				}
				
			}
			//update selected banner item
			this.updateSelectedBannerItems();
		} else {
			this.selectedItem = 0;
			//update selected item
			this.updateSelectedItems();
		}	
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

GuiDisplay_Series.processDownKey = function() {
	if (this.selectedItem == -1) {
		this.selectedItem = 0;
		this.selectedBannerItem = -1;
		this.updateSelectedBannerItems();
	} else {
		this.selectedItem = this.selectedItem + this.MAXCOLUMNCOUNT;
		if (this.selectedItem >= this.ItemData.Items.length) {
			if (this.totalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();
				
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}
				
			} else {
				this.selectedItem = (this.ItemData.Items.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
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

GuiDisplay_Series.processChannelUpKey = function() {
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

GuiDisplay_Series.processChannelDownKey = function() {
	if (this.selectedItem > -1) {
		this.selectedItem = this.selectedItem + this.getMaxDisplay();
		if (this.selectedItem >= this.ItemData.Items.length) {	
			
			if (this.totalRecordCount > this.ItemData.Items.length) {
				this.loadMoreItems();
				
				if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.MAXCOLUMNCOUNT;
					this.updateDisplayedItems();
				}		
			} else {
				this.selectedItem = (this.ItemData.Items.length-1);
				if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
					this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
					this.updateDisplayedItems();
				}
			}	
		} else {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
		this.updateSelectedItems();
	}
}

GuiDisplay_Series.processIndexing = function() {
	if (this.selectedItem > -1) {
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
}

GuiDisplay_Series.loadMoreItems = function() {
	if (this.totalRecordCount > this.ItemData.Items.length) {
		Support.pageLoadTimes("GuiDisplay_Series","GetRemainingItems",true);
		
		//Show Loading Div
		document.getElementById("guiPlayer_Loading").style.visibility = "";
		
		//Remove User Control
		document.getElementById("NoKeyInput").focus();
		
		//Load Data
		var originalLength = this.ItemData.Items.length
		var ItemDataRemaining = Server.getContent(this.startParams[1] + "&Limit=200&StartIndex=" + originalLength);
		if (ItemDataRemaining == null) { return; }
		Support.pageLoadTimes("GuiDisplay_Series","GotRemainingItems",false);
		
		for (var index = 0; index < ItemDataRemaining.Items.length; index++) {
			this.ItemData.Items[index+originalLength] = ItemDataRemaining.Items[index];
		}
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.ItemData.Items.length;
		
		//Reprocess Indexing Algorithm
		
		//Hide Loading Div
		document.getElementById("guiPlayer_Loading").style.visibility = "hidden";
		
		//Pass back Control
		document.getElementById("GuiDisplay_Series").focus();
		
		Support.pageLoadTimes("GuiDisplay_Series","AddedRemainingItems",false);
	}
}

GuiDisplay_Series.returnFromMusicPlayer = function() {
	this.selectedItem = 0;
	this.updateDisplayedItems();
	this.updateSelectedItems();
}