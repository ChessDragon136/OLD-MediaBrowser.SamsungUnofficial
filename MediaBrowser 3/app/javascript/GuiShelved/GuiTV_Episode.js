var GuiTV_Episode = {				
		EpisodeData : null,
		SeasonData : null,
		AdjacentData : null,
		
		menuItems : [],
		subMenuItems : [],
		
		selectedItem : 0,
		
		selectedItem2 : 0,
		topLeftItem2 : 0,
		MAXCOLUMNCOUNT2 : 1,
		MAXROWCOUNT2 : 5,
		
		startParams : []
}

GuiTV_Episode.getMaxDisplay2 = function() {
	return this.MAXCOLUMNCOUNT2 * this.MAXROWCOUNT2;
}
//------------------------------------------------------------
//      Episode Functions
//------------------------------------------------------------

GuiTV_Episode.start = function(title,url,selectedItem) {
	//Save Start Params
	this.startParams = [title,url];
	
	//Reset Vars
	this.selectedItem = selectedItem;
	this.menuItems.length = 0;

	this.EpisodeData = Server.getContent(url);
	this.AdjacentData = Server.getContent(Server.getAdjacentEpisodesURL(this.EpisodeData.SeriesId,this.EpisodeData.SeasonId,this.EpisodeData.Id));
	
	//Set PageContent
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id='EpisodesSeriesInfo'></div>\ \
		<div id='guiTV_Episode_Options' class='guiTV_Episode_Options'></div> \
		<div id='guiTV_Episode_SubOptions' class='guiTV_Episode_SubOptions'></div> \
		<div id='guiTV_Episode_Poster' class='guiTV_Episode_Poster'></div> \
		<div id='guiTV_Episode_Overview' class='guiTV_Episode_Overview'></div>";
	document.getElementById("Counter").innerHTML = "1/1";	
	
	//Get Page Backdrop (Episodes themselved don't have backdrops - check anyway
	if (this.EpisodeData.BackdropImageTags.length > 0) {
		var imgsrc = Server.getImageURL(this.EpisodeData.Id,"Backdrop",960,540,0,false,0);
		document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
	} else if (this.EpisodeData.ParentBackdropImageTags.length > 0) {
		var imgsrc = Server.getImageURL(this.EpisodeData.ParentBackdropItemId,"Backdrop",960,540,0,false,0);
		document.getElementById("pageBackground").style.backgroundImage="url(" + imgsrc + ")";
	} else {
		document.getElementById("pageBackground").style.backgroundImage="url('images/NoBackdrop.png')";
	}
	
	//If cover art use that else use text
	if (this.EpisodeData.ParentLogoItemId) {
		var imgsrc = Server.getImageURL(this.EpisodeData.ParentLogoItemId,"Logo",300,40,0,false,0);
		document.getElementById("EpisodesSeriesInfo").style.backgroundImage="url('"+imgsrc+"')";
		document.getElementById("EpisodesSeriesInfo").className = 'EpisodesSeriesInfoLogo';	
	} else {
		document.getElementById("EpisodesSeriesInfo").innerHTML = this.EpisodeData.SeriesName + " | Season " +  this.EpisodeData.ParentIndexNumber + " | " +  this.EpisodeData.Name;
		document.getElementById("EpisodesSeriesInfo").className = 'EpisodesSeriesInfo';
	}
	
	//Get Episode Poster	
	if (this.EpisodeData.ImageTags.Primary) {
		var imgsrc = Server.getImageURL(this.EpisodeData.Id,"Primary",220,125,0,false,0); 	
		document.getElementById("guiTV_Episode_Poster").style.backgroundImage = "url("+imgsrc + ")";
	} else {
		document.getElementById("guiTV_Episode_Poster").style.backgroundImage = "url(images/collection.png)";
	}
	
	//Set Page Title
	var PremiereDate = "";
	if (this.EpisodeData.PremiereDate) {
		PremiereDate = this.EpisodeData.PremiereDate;
		PremiereDate = PremiereDate.substring(8,10) + "/" + PremiereDate.substring(5,7) + "/" + PremiereDate.substring(0,4);
	}
	
	//Get Episode Overview
	if (this.EpisodeData.Overview == null) {
   		document.getElementById("guiTV_Episode_Overview").innerHTML = "There is currently no Overview Metadata associated to this show";
   	} else {
   		document.getElementById("guiTV_Episode_Overview").innerHTML = this.EpisodeData.Overview;
   	}
	
	Support.scrollingText("guiTV_Episode_Overview");
	
	//Get Page Items
	if (this.EpisodeData.UserData.PlaybackPositionTicks > 0) {
		this.menuItems.push("guiTV_Episode_Resume");
		this.resumeTicksSamsung = this.EpisodeData.UserData.PlaybackPositionTicks / 10000;
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div class=EpisodeOption><div id=guiTV_Episode_Resume>RESUME - "+Support.convertTicksToTimeSingle(this.resumeTicksSamsung)+"</div></div>";
	}

	this.menuItems.push("guiTV_Episode_Play");
	document.getElementById("guiTV_Episode_Options").innerHTML += "<div class=EpisodeOption><div id=guiTV_Episode_Play>PLAY</div></div>";	
	
	if (this.EpisodeData.Chapters.length > 0) {
		this.menuItems.push("guiTV_Episode_Chapters");
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div class=EpisodeOption><div id=guiTV_Episode_Chapters>CHAPTERS</div></div>";
	}
	//Add Blank for aesthetics
	document.getElementById("guiTV_Episode_Options").innerHTML += "<div class=EpisodeOption></div>";
	
	if (this.EpisodeData.People.length > 0) {
		this.menuItems.push("guiTV_Episode_Cast");
		document.getElementById("guiTV_Episode_Options").innerHTML += "<div class=EpisodeOption><div id=guiTV_Episode_Cast>CAST</div></div>";
	}
	
	//Update Selected Item
	this.updateSelectedItems();
	
	//Set Focus for Key Events
	document.getElementById("GuiTV_Episode").focus();
}

//Function sets CSS Properties so show which user is selected
GuiTV_Episode.updateSelectedItems = function () {
	for (var index = 0; index < this.menuItems.length; index++){	
		if (index == this.selectedItem) {
			document.getElementById(this.menuItems[index]).className = "SeasonTitleSelected";	
		} else {	
			document.getElementById(this.menuItems[index]).className = "SeasonTitle";		
		}		
	} 
	document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.menuItems.length;
	document.getElementById("guiTV_Episode_SubOptions").style.display="none";
	
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		this.subMenuItems = this.EpisodeData.Chapters;
		
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
				
	} else if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
		document.getElementById("guiTV_Episode_SubOptions").style.display="";
		this.subMenuItems = this.EpisodeData.People;
		this.selectedItem2 = 0;
		this.topLeftItem2 = 0;
		this.updateDisplayedItems2();
	}
}

GuiTV_Episode.keyDown = function()
{
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
		case tvKey.KEY_LEFT:
			alert ("LEFT");
			if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" || this.menuItems[this.selectedItem] == "guiTV_Episode_Resume" ) {
				if (this.AdjacentData.Items.length == 2) {
					var url = Server.getItemInfoURL(this.AdjacentData.Items[0].Id);
					GuiTV_Episode.start(this.AdjacentData.Items[0].Name,url,0);
				} else {
					if (this.EpisodeData.IndexNumber != 1) {
						var url = Server.getItemInfoURL(this.AdjacentData.Items[0].Id);
						GuiTV_Episode.start(this.AdjacentData.Items[0].Name,url,0);
					} else {
						//Cant return you douche! 
					}
				}
			}		
		break;
		case tvKey.KEY_RIGHT:
			alert ("RIGHT");
			if (this.menuItems[this.selectedItem] == "guiTV_Episode_Play" || this.menuItems[this.selectedItem] == "guiTV_Episode_Resume" ) {
				if (this.AdjacentData.Items.length == 2) {
					var url = Server.getItemInfoURL(this.AdjacentData.Items[1].Id);
					GuiTV_Episode.start(this.AdjacentData.Items[1].Name,url,0);
				} else {
					if (this.EpisodeData.IndexNumber < this.AdjacentData.Items[0].IndexNumber) {
						var url = Server.getItemInfoURL(this.AdjacentData.Items[0].Id);
						GuiTV_Episode.start(this.AdjacentData.Items[0].Name,url,0);
					} else {
						//Cant return you douche! 
					}
				}
			} else {
				this.processSelectedItem();
			}
		break;
		case tvKey.KEY_UP:
			this.selectedItem--;
			if (this.selectedItem < 0) {
				this.selectedItem++;
				Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
				document.getElementById(this.menuItems[this.selectedItem]).className = "SeasonTitle";
				GuiMainMenu.requested("GuiTV_Episode",this.menuItems[this.selectedItem],"SeasonTitleSelected");
			} else {
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
			Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			document.getElementById(this.menuItems[this.selectedItem]).className = "SeasonTitle";
			GuiMainMenu.requested("GuiTV_Episode",this.menuItems[this.selectedItem],"SeasonTitleSelected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiTV_Episode");
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

GuiTV_Episode.processSelectedItem = function() {	
	switch (this.menuItems[this.selectedItem]) {
	case "guiTV_Episode_Play":
		Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.EpisodeData.Id);
		GuiPlayer.start("PLAY",url,0,"GuiTV_Episode");
		break;
	case "guiTV_Episode_Resume":
		Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.EpisodeData.Id);
		GuiPlayer.start("PLAY",url,this.EpisodeData.UserData.PlaybackPositionTicks / 10000,"GuiTV_Episode");
		break;
	case "guiTV_Episode_Chapters":
		document.getElementById(this.menuItems[this.selectedItem]).className = "SeasonTitle";
		this.updateSelectedItems2();
		document.getElementById("GuiTV_EpisodeSub").focus();
		break;
	case "guiTV_Episode_Cast":
		document.getElementById(this.menuItems[this.selectedItem]).className = "SeasonTitle";
		this.updateSelectedItems2();
		document.getElementById("GuiTV_EpisodeSub").focus();
		break;	
	default:
		break;	
	}
}

//----------------------------------------------------------------------------------------------------------------------------------

GuiTV_Episode.updateDisplayedItems2 = function() {
	var htmlToAdd = "";
	//Aesthetics
	if (this.subMenuItems.length < 4) {
		htmlToAdd += "<div class=EpisodeSubOption></div>";
	}
	if (this.subMenuItems.length < 2) {
		htmlToAdd += "<div class=EpisodeSubOption></div>";
	}
	
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
			var resumeTicksSamsung = this.subMenuItems[index].StartPositionTicks / 10000;
			htmlToAdd += "<div class=EpisodeSubOption><div id="+index+" class=SeasonTitle>"+this.subMenuItems[index].Name+"</div>"+Support.convertTicksToTimeSingle(resumeTicksSamsung)+"</div>";
		}
		if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
			htmlToAdd += "<div class=EpisodeSubOption ><div id="+index+" class=SeasonTitle>"+this.subMenuItems[index].Name+"</div>"+this.subMenuItems[index].Type+"</div>";
		}
	}
	
	//Aesthetics
	if (this.subMenuItems.length < 4) {
		htmlToAdd += "<div class=EpisodeSubOption></div>";
	}
	if (this.subMenuItems.length < 2) {
		htmlToAdd += "<div class=EpisodeSubOption></div>";
		htmlToAdd += "<div class=EpisodeOption></div>";
	}
	document.getElementById("guiTV_Episode_SubOptions").innerHTML = htmlToAdd;
}

GuiTV_Episode.updateSelectedItems2 = function() {
	for (var index = this.topLeftItem2; index < Math.min(this.topLeftItem2 + this.getMaxDisplay2(),this.subMenuItems.length);index++) {	
		if (index == this.selectedItem2) {
			document.getElementById(index).className = "SeasonTitleSelected";	
		} else {	
			document.getElementById(index).className = "SeasonTitle";		
		}	
	} 
	document.getElementById("Counter").innerHTML = (this.selectedItem2 + 1) + "/" + this.subMenuItems.length;
}

GuiTV_Episode.subKeyDown = function()
{
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

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
			document.getElementById(this.menuItems[this.selectedItem]).className = "SeasonTitleSelected";
			document.getElementById(this.selectedItem2).className = "SeasonTitle";
			document.getElementById("GuiTV_Episode").focus();
			break;	
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			this.processSelectedItem2();
			break;	
		case tvKey.KEY_TOOLS:
			alert ("TOOLS KEY");
			widgetAPI.blockNavigation(event);
			Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
			document.getElementById(this.selectedItem2).className = "SeasonTitle";
			GuiMainMenu.requested("GuiTV_EpisodeSub",this.selectedItem2,"SeasonTitleSelected");
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiTV_Episode");
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

GuiTV_Episode.processSelectedItem2 = function() {
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Chapters") {
		Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var url = Server.getItemInfoURL(this.EpisodeData.Id);
		GuiPlayer.start("PLAY",url,this.subMenuItems[this.selectedItem2].StartPositionTicks / 10000,"GuiTV_Episode");
	}
	if (this.menuItems[this.selectedItem] == "guiTV_Episode_Cast") {
		Support.updateURLHistory("GuiTV_Episode",this.startParams[0],this.startParams[1],null,null,this.selectedItem,null,true);
		var cast = this.subMenuItems[this.selectedItem2].Name.replace(/ /g, '+');
		var url = Server.getCustomURL("/Persons/"+cast+"?format=json&userId=" + Server.getUserID());
		GuiPage_CastMember.start(this.subMenuItems[this.selectedItem2].Name,url,0,0);
	}
}