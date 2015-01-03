var GuiPage_ItemDetails = {	
		ItemData : null,
		SimilarFilms : null,
		AdjacentData : null,
		
		menuItems : [],
		selectedItem : 0,
		
		trailerItems : [],
		
		selectedItem2 : 0,
		topLeftItem2 : 0,
		MAXCOLUMNCOUNT2 : 1,
		MAXROWCOUNT2 : 5
}

GuiPage_ItemDetails.getMaxDisplay2 = function() {
	return this.MAXCOLUMNCOUNT2 * this.MAXROWCOUNT2;
}
//------------------------------------------------------------
//      Episode Functions
//------------------------------------------------------------

GuiPage_ItemDetails.start = function(title,url,selectedItem) {
	//Save Start Params
	this.startParams = [title,url];
	alert (url);
	
	//Reset Vars
	this.trailerItems.length = 0;
	this.menuItems.length = 0;
	this.selectedItem = selectedItem;
	
	//Get Server Data
	this.ItemData = Server.getContent(url);
	
	//Set PageContent
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id='Title'></div> \
			<div id='guiTV_Episode_Options' class='guiTV_Episode_Options'></div> \
			<div id='guiTV_Episode_SubOptions' class='guiTV_Episode_SubOptions'></div> \
			<div id='guiTV_Show_MediaAlternative' class='guiTV_Show_MediaAlternative'></div> \
			<div id='InfoContainer' class='infoContainer'> \
					<div id='guiTV_Show_Title' style='font-size:22px;'></div> \
					<div id='guiTV_Show_Metadata' style='padding-top:2px;color:#0099FF;padding-bottom:5px;'></div> \
					<div id='guiTV_Show_Overview' class='guiFilm_Overview'></div> \
			</div> \
			<div id='guiTV_Show_Poster' class='guiFilm_Poster'></div>";
	
	//Get Page Items
	if (this.ItemData.UserData.PlaybackPositionTicks > 0) {
		this.menuItems.push("guiTV_Episode_Resume");
		this.resumeTicksSamsung = this.ItemData.UserData.PlaybackPositionTicks / 10000;     					
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Resume' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/play.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>RESUME - "+Support.convertTicksToTimeSingle(this.resumeTicksSamsung)+"</div></div></div>";
	}
	
	this.menuItems.push("guiTV_Episode_Play");
	document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Play' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/play.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>PLAY</div></div></div>";
	
	if (this.ItemData.Chapters.length > 0) {
		this.menuItems.push("guiTV_Episode_Chapters");
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Chapters' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/chapter.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>CHAPTERS</div></div></div>";
	}
	
	//Options based on item type
	if (this.ItemData.Type == "Episode") {
		//Add Remaining Menu Options
		if (this.ItemData.People.length > 0) {
			this.menuItems.push("guiTV_Episode_Cast");                     
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Cast' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/person.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>CAST</div></div></div>";
		}
		
		//Get Adjacent Data 
		this.AdjacentData = Server.getContent(Server.getAdjacentEpisodesURL(this.ItemData.SeriesId,this.ItemData.SeasonId,this.ItemData.Id));
		
		//Change gui layout 
		//document.getElementById("InfoContainer").style.width = "680px";
		//document.getElementById("guiTV_Show_Overview").className = "guiTV_Episode_Overview";
		//document.getElementById("guiTV_Show_Poster").className = "guiTV_Episode_Poster";
		
		//Set Poster
		//if (this.ItemData.ImageTags.Primary) {
		//	var imgsrc = Server.getImageURL(this.ItemData.Id,"Primary",210,125);
		//	document.getElementById("guiTV_Show_Poster").style.backgroundImage="url('" + imgsrc + "')";
		//}
		
		//Set Title
		if (this.ItemData.ParentIndexNumber === undefined || this.ItemData.IndexNumber === undefined) {
			document.getElementById("guiTV_Show_Title").innerHTML = this.ItemData.Name;
		} else {
			var seasonNumber = this.ItemData.ParentIndexNumber;
			var seasonString = "";
			if (seasonNumber < 10){
				seasonString = "0" + seasonNumber;
			}
			else{
				seasonString = seasonNumber;
			}
			
			var episodeNumber = this.ItemData.IndexNumber;
			var episodeString = "";
			if (episodeNumber < 10){
				episodeString = "0" + episodeNumber;
			}
			else{
				episodeString = episodeNumber;
			}
			document.getElementById("guiTV_Show_Title").innerHTML = "S" +  seasonString + "E" +  episodeString + " - " + this.ItemData.Name;		
		}
		
		//If cover art use that else use text
		if (this.ItemData.ParentLogoImageTag) {
			var imgsrc = Server.getImageURL(this.ItemData.SeriesId,"Logo",500,100,0,false,0);
			document.getElementById("Title").style.backgroundImage="url('"+imgsrc+"')";
			document.getElementById("Title").className = 'FilmInfoLogo';			
		} else {
			if (this.ItemData.IndexNumber === undefined) {
				document.getElementById("Title").innerHTML = this.ItemData.SeriesName + " | Season " +  this.ItemData.ParentIndexNumber + " |  Episode Unknown - " + this.ItemData.Name;
			} else {
				document.getElementById("Title").innerHTML = this.ItemData.SeriesName + " | Season " +  this.ItemData.ParentIndexNumber + " |  Episode " +  this.ItemData.IndexNumber + " - " + this.ItemData.Name;		
			}			
			document.getElementById("Title").className = 'EpisodesSeriesInfo';
		}
		
		
		//Set Poster
		if (this.ItemData.SeriesPrimaryImageTag != "") {
			var imgsrc = Server.getImageURL(this.ItemData.SeriesId,"Primary",136,200,0,false,0);
			document.getElementById("guiTV_Show_Poster").style.backgroundImage="url('" + imgsrc + "')";
		}
		
		//Set Backdrop
		if (this.ItemData.ParentBackdropImageTags) {
			var imgsrc = Server.getImageURL(this.ItemData.ParentBackdropItemId,"Backdrop",960,540,0,false,0);
			document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
		}
		
		
	} else {
		//Add Remaining Menu Options
		var url2 = Server.getCustomURL("/Movies/"+this.ItemData.Id+"/Similar?format=json&IncludeTrailers=false&Limit=5&UserId=" + Server.getUserID());
		this.SimilarFilms = Server.getContent(url2);
			
		//Add Remaining Menu Options
		if (this.ItemData.LocalTrailerCount > 0) {
			//Get trailerItems
			var url3 = Server.getCustomURL("/Users/"+Server.getUserID()+"/Items/"+this.ItemData.Id+"/LocalTrailers?format=json");
			alert (url3);
			this.trailerItems = Server.getContent(url3);
			
			//Add Menu Elements
			this.menuItems.push("guiTV_Episode_Trailer"); 
			if (this.ItemData.LocalTrailerCount > 1) {
				document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Trailer' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/play.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>TRAILERS</div></div></div>";
			} else {
				document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Trailer' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/play.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>TRAILER</div></div></div>";
			}
		} else {
			if (this.ItemData.People.length > 0 && this.SimilarFilms.Items.length > 0) {
				document.getElementById("guiTV_Episode_Options").innerHTML += "<div class='FilmListSingle'></div>";
			}
		}
	
		if (this.ItemData.People.length > 0) {
			this.menuItems.push("guiTV_Episode_Cast");                     
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Cast' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/person.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>CAST</div></div></div>";
		}
		
		if (this.SimilarFilms.Items.length > 0) {
			this.menuItems.push("guiTV_Episode_Suggested");
			document.getElementById("guiTV_Episode_Options").innerHTML += "<div id='guiTV_Episode_Suggested' class='FilmListSingle'><div class='FilmListSingleImage' style=background-image:url(images/MBS/person.png)></div><div class='ShowListSingleTitle'><div class='ShowListTextOneLineFilm'>SUGGESTED</div></div></div>";
		}
		//Set Title 
		document.getElementById("guiTV_Show_Title").innerHTML = this.ItemData.Name;
		
		//Set Film Poster
		if (this.ItemData.ImageTags.Primary) {
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Primary",136,200,0,false,0);
			document.getElementById("guiTV_Show_Poster").style.backgroundImage="url('" + imgsrc + "')";
		}
		
		//Set Film Backdrop
		if (this.ItemData.BackdropImageTags.length > 0) {
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Backdrop",960,540,0,false,0); 
			document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
		}
		
		//If cover art use that else use text
		if (this.ItemData.ImageTags.Logo) {
			var imgsrc = Server.getImageURL(this.ItemData.Id,"Logo",500,100,0,false,0);
			document.getElementById("Title").style.backgroundImage="url('"+imgsrc+"')";
			document.getElementById("Title").className = 'FilmInfoLogo';	
		} else {
			document.getElementById("Title").innerHTML = this.ItemData.Name;
			document.getElementById("Title").className = 'EpisodesSeriesInfo';
			document.getElementById("Title").style.fontSize = '22px';
		}
	}
	
	if (this.ItemData.UserData.Played) {
		document.getElementById("guiTV_Show_Title").innerHTML += "<span class='itemPageWatched' style='padding-left:20px;'></span>";
	}
	
	//Update Overview
	if (this.ItemData.Overview != null) {
   		document.getElementById("guiTV_Show_Overview").innerHTML = this.ItemData.Overview;
   	}
	
	//Update MetaData
	var htmlForMetaData = "";
	if (this.ItemData.ProductionYear !== undefined) {
		htmlForMetaData += this.ItemData.ProductionYear + " | ";
	}
	if (this.ItemData.CommunityRating !== undefined) {
		htmlForMetaData += "<img src='images/star.png'>" + " " + this.ItemData.CommunityRating + " | ";
	}
	if (this.ItemData.OfficialRating !== undefined) {
		htmlForMetaData += this.ItemData.OfficialRating + " | ";
	}

	if (this.ItemData.RunTimeTicks !== undefined) {
		htmlForMetaData += Support.convertTicksToMinutes(this.ItemData.RunTimeTicks/10000) + " | ";
	}
	
	htmlForMetaData = htmlForMetaData.substring(0,htmlForMetaData.length-2);
	document.getElementById("guiTV_Show_Metadata").innerHTML = htmlForMetaData;
	
	//Set Overview Scroller
	Support.scrollingText("guiTV_Show_Overview");
	
	//Process Media Info
	this.getMediaInfo();
	
	//Set MediaInfo Height
	if (this.menuItems.length < 5) {
		document.getElementById("guiTV_Show_MediaAlternative").style.bottom = "50px";
	}
	
	//Update Selected Item
	this.updateSelectedItems();

	//Set Focus for Key Events
	document.getElementById("GuiPage_ItemDetails").focus();
}

//Function sets CSS Properties so show which user is selected
GuiPage_ItemDetails.updateSelectedItems = function () {
	for (var index = 0; index < this.menuItems.length; index++){	
		if (index == this.selectedItem) {
			document.getElementById(this.menuItems[index]).className = "FilmListSingle EpisodeListSelected";	
		} else {	
			document.getElementById(this.menuItems[index]).className = "FilmListSingle";		
		}		
	} 

	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.menuItems.length;
	document.getElementById("guiTV_Episode_SubOptions").style.display="none";
	
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		this.subMenuItems = this.ItemData.Chapters;
		
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();			
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		this.subMenuItems = this.ItemData.People;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Suggested") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		this.subMenuItems = this.SimilarFilms.Items;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	}  else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Trailer") {
		if (this.ItemData.LocalTrailerCount > 1) {
			document.getElementById("guiTV_Episode_SubOptions").style.display="";			
			this.subMenuItems = this.trailerItems;
			this.selectedItem2 = 0;
			this.topLeftItem2 = 0;
			this.updateDisplayedItems2();
		}
	}
}

GuiPage_ItemDetails.keyDown = function()
{
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
			if (this.selectedItem > 0) {
				this.selectedItem--;
				this.updateSelectedItems();
			}
		break;
		case tvKey.KEY_DOWN:
			this.selectedItem++;
			if (this.selectedItem > this.menuItems.length-1) {
				this.selectedItem--;
			} else {
				this.updateSelectedItems();
			}
		break;
		case tvKey.KEY_LEFT:
			alert ("RIGHT");
			if (this.ItemData.Type == "Episode") {
				this.processLeftKey();
			}
			break;
		case tvKey.KEY_RIGHT:
			alert ("RIGHT");
			if (this.ItemData.Type == "Episode") {
				this.processRightKey();
			} else {
				if (this.menuItems[this.selectedItem] != "guiTV_Episode_Play" && this.menuItems[this.selectedItem] != "guiTV_Episode_Resume" ) {
					this.processSelectedItem();
				}
			}
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
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle"; 
			GuiMainMenu.requested("GuiPage_ItemDetails",this.menuItems[this.selectedItem],"FilmListSingle EpisodeListSelected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_ItemDetails");
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

GuiPage_ItemDetails.processLeftKey = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" || this.menuItems[this.selectedItem] == "guiTV_Episode_Resume" ) {
		if (this.AdjacentData.Items.length == 2) {
			var url = Server.getItemInfoURL(this.AdjacentData.Items[0].Id);
			GuiPage_ItemDetails.start(this.AdjacentData.Items[0].Name,url,0);
		} else {
			if (this.ItemData.IndexNumber != 1) {
				var url = Server.getItemInfoURL(this.AdjacentData.Items[0].Id);
				GuiPage_ItemDetails.start(this.AdjacentData.Items[0].Name,url,0);
			}
		}
	}
}

GuiPage_ItemDetails.processRightKey = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" || this.menuItems[this.selectedItem] == "guiTV_Episode_Resume" ) {
		if (this.AdjacentData.Items.length == 2) {
			var url = Server.getItemInfoURL(this.AdjacentData.Items[1].Id);
			GuiPage_ItemDetails.start(this.AdjacentData.Items[1].Name,url,0);
		} else {
			if (this.ItemData.IndexNumber < this.AdjacentData.Items[0].IndexNumber) {
				var url = Server.getItemInfoURL(this.AdjacentData.Items[0].Id);
				GuiPage_ItemDetails.start(this.AdjacentData.Items[0].Name,url,0);
			}
		}
	} else {
		this.processSelectedItem();
	}
}

GuiPage_ItemDetails.processSelectedItem = function() {	
	switch (this.menuItems[this.selectedItem]) {
	case "guiTV_Episode_Play":
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.ItemData.Id);
		GuiPlayer.start("PLAY",url,0,"GuiPage_ItemDetails");
		break;
	case "guiTV_Episode_Resume":
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.ItemData.Id);
		GuiPlayer.start("PLAY",url,this.ItemData.UserData.PlaybackPositionTicks / 10000,"GuiPage_ItemDetails");
		break;

	case "guiTV_Episode_Trailer":
		if (this.ItemData.LocalTrailerCount > 1) {
			document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle";
			this.updateSelectedItems2();
			document.getElementById("GuiPage_ItemDetailsSub").focus();
		} else {
			Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			var url = Server.getItemInfoURL(this.trailerItems[0].Id);
			GuiPlayer.start("PLAY",url,0,"GuiPage_ItemDetails");
		}
		break;
	case "guiTV_Episode_Chapters":
	case "guiTV_Episode_Cast":
	case "guiTV_Episode_Suggested":
		document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle";
		this.updateSelectedItems2();
		document.getElementById("GuiPage_ItemDetailsSub").focus();
		break;	
	default:
		break;	
	}
}

//----------------------------------------------------------------------------------------------------------------------------------

GuiPage_ItemDetails.updateDisplayedItems2 = function() {
	var htmlToAdd = "";
	//Aesthetics
	if (this.subMenuItems.length < 4) {
		htmlToAdd += "<div class=FilmListSubSingle></div>";
	}
	if (this.subMenuItems.length < 2) {
		htmlToAdd += "<div class=FilmListSubSingle></div>";
	}
	
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
			var resumeTicksSamsung = this.subMenuItems[index].StartPositionTicks / 10000;
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'>"+this.subMenuItems[index].Name+"<br>"+Support.convertTicksToTimeSingle(resumeTicksSamsung)+"</div>";
		}
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'>"+this.subMenuItems[index].Name+"<br>"+this.subMenuItems[index].Type+"</div>";
		}
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Suggested" || this.menuItems[this.selectedItem] == "guiTV_Episode_Trailer" ) {
			htmlToAdd += "<div id="+index+" class='FilmListSubSingle'>"+this.subMenuItems[index].Name+"</div>";
		}
	}
	
	//Aesthetics
	if (this.subMenuItems.length < 4) {
		htmlToAdd += "<div class=FilmListSubSingle></div>";
	}
	if (this.subMenuItems.length < 2) {
		htmlToAdd += "<div class=FilmListSubSingle></div>";
		htmlToAdd += "<div class=FilmListSubSingle></div>";
	}
	document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
}

GuiPage_ItemDetails.updateSelectedItems2 = function() {
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {	
		if (index == this.selectedItem2) {
			document.getElementById(index).className = "FilmListSubSingle EpisodeListSelected";	
		} else {	
			document.getElementById(index).className = "FilmListSubSingle";		
		}	
	} 
	document.getElementById("Counter").innerHTML = (this.selectedItem2 + 1) + "/" + this.subMenuItems.length;
}

GuiPage_ItemDetails.subKeyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	if (document.getElementById("Notifications").style.visibility == "") {
		document.getElementById("Notifications").style.visibility = "hidden";
		document.getElementById("NotificationText").innerHTML = "";
		
		//Change keycode so it does nothing!
		keyCode = "VOID";
	}
	
	switch(keyCode)
	{	
		case tvKey.KEY_UP:
			this.selectedItem2--;
			if (this.selectedItem2 < 0) {
				this.selectedItem2++;
			}
			if (this.selectedItem2 < this.topLeftItem2) {
				this.topLeftItem2--;
				this.updateDisplayedItems2();
			}
			this.updateSelectedItems2();
		break;
		case tvKey.KEY_DOWN:
			this.selectedItem2++;
			if (this.selectedItem2 > this.subMenuItems.length-1) {
				this.selectedItem2--;
			}
			if (this.selectedItem2 >= this.topLeftItem2 + this.getMaxDisplay2()) {
				this.topLeftItem2++;
				this.updateDisplayedItems2();
			}
			this.updateSelectedItems2();
			break;
		case tvKey.KEY_LEFT:
		case tvKey.KEY_RETURN:
			alert("RETURN Sub");
			widgetAPI.blockNavigation(event);
			document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.menuItems.length;
			document.getElementById(this.menuItems[this.selectedItem]).className = "FilmListSingle EpisodeListSelected";
			document.getElementById(this.selectedItem2).className = "FilmListSubSingle";
			document.getElementById("GuiPage_ItemDetails").focus();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem2();
			break;	
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			document.getElementById(this.selectedItem2).className = "FilmListSubSingle";
			GuiMainMenu.requested("GuiPage_ItemDetailsSub",this.selectedItem2,"FilmListSubSingle EpisodeListSelected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_ItemDetails");
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

GuiPage_ItemDetails.processSelectedItem2 = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.ItemData.Id);
		GuiPlayer.start("PLAY",url,this.subMenuItems[this.selectedItem2].StartPositionTicks / 10000,"GuiPage_ItemDetails");
	}
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Suggested") {
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		GuiPage_ItemDetails.start(this.subMenuItems[this.selectedItem2].Name,url,0);
	}
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Trailer") {
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		GuiPlayer.start("PLAY",url,0,"GuiPage_ItemDetails");
	}
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
		Support.updateURLHistory("GuiPage_ItemDetails",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var cast = this.subMenuItems[this.selectedItem2].Name.replace(/ /g, '+');
		var url = Server.getItemInfoURL(this.subMenuItems[this.selectedItem2].Id);
		GuiPage_CastMember.start(this.subMenuItems[this.selectedItem2].Name,url,0,0);
	}
}


GuiPage_ItemDetails.getMediaInfo = function() {
	var is3D = (this.ItemData.MediaSources[0].Video3DFormat != null ? "3D" : "Not3D");
	var container = this.ItemData.MediaSources[0].Container;
	var videoCodec = null; var videoRatio = null; var audioCodec = null; var audioChannels = null;
		
	var MEDIASTREAMS = this.ItemData.MediaSources[0].MediaStreams;
	
	var videoCount = 0; audioCount = 0;
	for (var mediaStream = 0; mediaStream < MEDIASTREAMS.length; mediaStream++) {
		if (MEDIASTREAMS[mediaStream].Type == "Video") {
			videoCount++;
		}
		if (MEDIASTREAMS[mediaStream].Type == "Audio") {
			audioCount++;
		}
	}
	
	for (var mediaStream = 0; mediaStream < MEDIASTREAMS.length; mediaStream++) {
		if (MEDIASTREAMS[mediaStream].Type == "Video" && (videoCount == 1 || MEDIASTREAMS[mediaStream].IsDefault == true)) {
			videoCodec = MEDIASTREAMS[mediaStream].Codec;
			videoRatio  = MEDIASTREAMS[mediaStream].AspectRatio;	
		}
		if (MEDIASTREAMS[mediaStream].Type == "Audio" && (audioCount == 1 || MEDIASTREAMS[mediaStream].IsDefault == true)) {
			audioCodec = MEDIASTREAMS[mediaStream].Codec;
			audioChannels  = MEDIASTREAMS[mediaStream].Channels;
		}
	}
	
	var items = [container,videoCodec, videoRatio, audioCodec, audioChannels, is3D];
	document.getElementById("guiTV_Show_MediaAlternative").innerHTML += this.processMediaInfo(items);			
}


GuiPage_ItemDetails.processMediaInfo = function(itemsArray) {
	var htmlToAdd = "";
	for (var index = 0; index < itemsArray.length; index++) {
		alert (itemsArray[index]);
		switch (itemsArray[index]) {
		//Container
		case "mkv":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_mkv-2.png)></div>";
			break;
		case "avi":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_avi-2.png)></div>";
			break;
		case "mp4":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_mp4.png)></div>";
			break;	
		//VideoCodec	
		case "h264":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_h264.png)></div>";
			break;
		case "mpeg4":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_mpeg4visual.png)></div>";
			break;	
		//AspectRatios	
		case "16:9":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_178.png)></div>";
			break;
		case "2.35:1":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_235.png)></div>";
			break;
		case "2.40:1":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/aspect_240.png)></div>";
			break;	
		//AudioCodec	
		case "aac":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_aac-2.png)></div>";
			break;	
		case "ac3":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_ac3.png)></div>";
			break;
		case "dts":
		case "dca":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_dts.png)></div>";
			break;	
		case "flac":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_flac.png)></div>";
			break;
		case "vorbis":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/codec_vorbis.png)></div>";
			break;	
		//AudioChannels	
		case 1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_1.png)></div>";
			break;	
		case 2:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_2.png)></div>";
			break;
		case 3:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_3.png)></div>";
			break;	
		case 4:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_4.png)></div>";
			break;
		case 5:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_5.png)></div>";
			break;	
		case 6:	
		case 5.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_6.png)></div>";
			break;
		case 7:	
		case 6.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_7.png)></div>";
			break;
		case 8:	
		case 7.1:
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/channels_8.png)></div>";
			break;
		//Specials
		case "3D":
			htmlToAdd += "<div class='mediaInfo' style=background-image:url(images/MediaInfo/media_3d.png)></div>";
			break;	
		default:
			break;
		}
	}
	return htmlToAdd;
}