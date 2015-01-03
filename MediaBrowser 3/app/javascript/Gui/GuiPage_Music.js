var GuiPage_Music = {				
		AlbumData : null,
		
		selectedItem : 0,
		topLeftItem : 0,
		
		selectedItem2 : 0,
		
		MAXCOLUMNCOUNT : 1,
		MAXROWCOUNT : 15,
		
		startParams : [],
		
		topMenuItems : ["PlayAll","QueueAll","ShuffleAll","InstantMix"],
		playItems : ["Play_","Queue_","Mix_"]
}

GuiPage_Music.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

//------------------------------------------------------------
//      Episode Functions
//------------------------------------------------------------

GuiPage_Music.start = function(title,url) {
	//Save Start Params
	this.startParams = [title,url];
	
	//Reset Vars
	this.selectedItem = -1;
	this.selectedItem2 = 0;

	//Load Data
	this.AlbumData = Server.getContent(url);
	
	//Set PageContent
	document.getElementById("pageContent").className = "";
	document.getElementById("pageContent").innerHTML = "<div id='guiTV_Show_Title' class='guiTV_Show_Title'></div>\ \
		<div id='GuiPage_Music_Globals' style='display:block;width:400px;text-align:center;'> \
		   <div id='PlayAll' style='display:inline-block;padding:10px;'>Play All</div> \
		   <div id='QueueAll' style='display:inline-block;padding:10px;'>Queue All</div> \
		   <div id='ShuffleAll' style='display:inline-block;padding:10px;'>Shuffle</div> \
		   <div id='InstantMix' style='display:inline-block;padding:10px;'>Instant Mix</div></div> \
		<div id='GuiPage_Music_Options' class='guiPage_Music_Options'></div> \
		<div id='guiPage_Music_Poster' class='guiPage_Music_Poster'></div>";
	document.getElementById("Counter").innerHTML = "1/1";	
		
	//Get Episode Poster	
	if (this.AlbumData.Items[0].AlbumPrimaryImageTag) {
		var imgsrc = Server.getImageURL(this.AlbumData.Items[0].AlbumId,"Primary",325,325,0,false,0); 	
		document.getElementById("guiPage_Music_Poster").style.backgroundImage = "url("+imgsrc + ")";
	} else {
		document.getElementById("guiPage_Music_Poster").style.backgroundImage = "url(images/collection.png)";
	}
	
	//Set Page Title
	document.getElementById("guiTV_Show_Title").innerHTML = this.AlbumData.Items[0].Artists + "<p class=guiTV_Show_SubTitle>" +  this.AlbumData.Items[0].Album + "</p>";
		
	//Get Page Items
	this.updateDisplayedItems();
	
	//Update Selected Item
	this.updateSelectedItems();
		
	//Set Focus for Key Events
	document.getElementById("GuiPage_Music").focus();
}

GuiPage_Music.updateDisplayedItems = function() {
	var htmlToAdd = "<table class=table><th style='width:33px'></th><th style='width:50px'></th><th style='width:45px'></th><th style='width:33px'></th><th style='width:250px'></th><th style='width:65px'></th>";
	for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.AlbumData.Items.length); index++){	
		if (this.AlbumData.Items[index].ParentIndexNumber === undefined || this.AlbumData.Items[index].IndexNumber === undefined) {
			TrackDetails = "?";
		} else {
			TrackDetails = this.AlbumData.Items[index].ParentIndexNumber+"." + this.AlbumData.Items[index].IndexNumber;
		}
		
		
		htmlToAdd += "<tr><td id=Play_"+this.AlbumData.Items[index].Id+" class='musicTableTd'>Play</td><td id=Queue_"+this.AlbumData.Items[index].Id+" class='musicTableTd'>Queue</td><td id=Mix_"+this.AlbumData.Items[index].Id+" class='musicTableTd'>Mix</td>" +
				"<td class='musicTableTd'>"+TrackDetails+ "</td><td id="+ this.AlbumData.Items[index].Id +" class='musicTableTd'>" + this.AlbumData.Items[index].Name + "</td>" +
						"<td class='musicTableTd'>"+Support.convertTicksToTimeSingle(this.AlbumData.Items[index].RunTimeTicks/10000,true)+"</td></tr>";		
	} 
	document.getElementById("GuiPage_Music_Options").innerHTML = htmlToAdd + "</table>";
}

//Function sets CSS Properties so show which user is selected
GuiPage_Music.updateSelectedItems = function () {
	if (this.selectedItem == -1) {
		//Resets original Items to White
		document.getElementById(this.AlbumData.Items[0].Id).style.color = "white";
		for (var index = 0; index < this.playItems.length; index++) {
			document.getElementById(this.playItems[index]+this.AlbumData.Items[0].Id).className = "musicTableTd";
		}
		
		//Sets Correct Item To Red
		for (var index = 0; index < this.topMenuItems.length; index++) {
			if (index == this.selectedItem2) {
				document.getElementById(this.topMenuItems[index]).className = "red";
			} else {
				document.getElementById(this.topMenuItems[index]).className = "";
			}
		}		
	} else {
		//Resets original Item to White
		for (var index = 0; index < this.topMenuItems.length; index++) {
			document.getElementById(this.topMenuItems[index]).className = "";
		}
		
		//Finds correct items to set Red / Green
		for (var index = this.topLeftItem; index < Math.min(this.topLeftItem + this.getMaxDisplay(),this.AlbumData.Items.length); index++){	
			if (index == this.selectedItem) {
				document.getElementById(this.AlbumData.Items[index].Id).style.color = "green";
				for (var index2 = 0; index2 < this.playItems.length; index2++) {
					if (index2 == this.selectedItem2) {
						document.getElementById(this.playItems[index2]+this.AlbumData.Items[index].Id).className = "musicTableTd red";
					} else {
						document.getElementById(this.playItems[index2]+this.AlbumData.Items[index].Id).className = "musicTableTd";
					}
				}
			} else {
				document.getElementById(this.AlbumData.Items[index].Id).style.color = "white";
				for (var index2 = 0; index2 < this.playItems.length; index2++) {
					document.getElementById(this.playItems[index2]+this.AlbumData.Items[index].Id).className = "musicTableTd";
				}
			}
		}
	}
	
	//Set Counter to be album count or x/3 for top part
	if (this.selectedItem == -1) {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/3";
	} else {
		document.getElementById("Counter").innerHTML = (this.selectedItem + 1) + "/" + this.AlbumData.Items.length;
	}
	
}

GuiPage_Music.keyDown = function() {
	var keyCode = event.keyCode;
	alert("Key pressed: " + keyCode);

	switch(keyCode) {	
		case tvKey.KEY_LEFT:
			this.processLeftKey();
			break;
		case tvKey.KEY_RIGHT:
			this.processRightKey();
			break;	
		case tvKey.KEY_UP:
			this.processUpKey();				
		break;
		case tvKey.KEY_DOWN:
			this.processDownKey();
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
			this.handleReturn();
			break;	
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiPage_Music");
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

GuiPage_Music.handleReturn = function() {
	Support.updateURLHistory("GuiPage_Music",this.startParams[0],this.startParams[1],null,null,this.selectedItem,this.topLeftItem,true);
	
	if (this.selectedItem == -1) {
		for (var index = 0; index<this.playItems.length;index++) {
			document.getElementById(this.topMenuItems[index]).className = "";
		}
		this.selectedItem2 = 0;
		GuiMainMenu.requested("GuiPage_Music",this.topMenuItems[0],"red");
	} else {
		for (var index = 0; index<this.playItems.length;index++) {
			document.getElementById(this.playItems[index]+this.AlbumData.Items[this.selectedItem].Id).className = "musicTableTd";
		}
		this.selectedItem2 = 0;
		GuiMainMenu.requested("GuiPage_Music","Play_"+this.AlbumData.Items[this.selectedItem].Id,"musicTableTd red");
	}
}

GuiPage_Music.processUpKey = function() {
	this.selectedItem--;
	if (this.selectedItem < -1) {
		this.updateSelectedItems();
		this.selectedItem = -1;
		this.handleReturn();
	} else if (this.selectedItem == -1) {
		this.selectedItem2 = 0;
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

GuiPage_Music.processDownKey = function() {
	this.selectedItem++;
	if (this.selectedItem == 0) {
		this.selectedItem2 = 0;
	}
	if (this.selectedItem >= this.AlbumData.Items.length) {
		this.selectedItem--;
		if (this.selectedItem >= (this.topLeftItem  + this.getMaxDisplay())) {
			this.topLeftItem = this.topLeftItem + this.getMaxDisplay();
			this.updateDisplayedItems();
		}
	} else {
		if (this.selectedItem >= (this.topLeftItem + this.getMaxDisplay())) {
			this.topLeftItem++;
			this.updateDisplayedItems();
		}
	}
	this.updateSelectedItems();
}

GuiPage_Music.processLeftKey = function() {
	this.selectedItem2--;
	if (this.selectedItem2 < 0) {
		this.selectedItem2++;
	} else {
		this.updateSelectedItems();
	}
}

GuiPage_Music.processRightKey = function() {
	this.selectedItem2++;
	if (this.selectedItem == -1) {
		if (this.selectedItem2 > this.topMenuItems.length-1) {
			this.selectedItem2--;
		} else {
			this.updateSelectedItems();
		}
	} else {
		if (this.selectedItem2 > this.playItems.length-1) {
			this.selectedItem2--;
		} else {
			this.updateSelectedItems();
		}
	}
}

GuiPage_Music.processSelectedItem = function() {
	if (this.selectedItem == -1) {
		//Is Top Menu Bar
		switch (this.selectedItem2) {
		case 0:
			//Can just pass through URL from loading of this page
			GuiMusicPlayer.start("Album",this.startParams[1] + "&Fields=MediaSources","GuiPage_Music",false);
			break;
		case 1:
			//Can just pass through URL from loading of this page
			GuiMusicPlayer.start("Album",this.startParams[1] + "&Fields=MediaSources","GuiPage_Music",true);
			break;
		case 2:
			//SortBy=Random in URL
			var url = this.startParams[1].replace("SortBy=SortName","SortBy=Random")
			GuiMusicPlayer.start("Album",url + "&Fields=MediaSources","GuiPage_Music",false);
			break;
		case 3:
			//URM - Above URL in green
			var url = Server.getCustomURL("/Albums/"+this.AlbumData.Items[0].AlbumId + "/InstantMix?format=json&Limit=50&UserId="+Server.getUserID());
			GuiMusicPlayer.start("Album",url + "&Fields=MediaSources","GuiPage_Music",false);
			break;	
		}
	} else {
		switch (this.selectedItem2) {
		case 0:
			var url = Server.getItemInfoURL(this.AlbumData.Items[this.selectedItem].Id);
			GuiMusicPlayer.start("Song",url,"GuiPage_Music",false);
			break;
		case 1:
			var url = Server.getItemInfoURL(this.AlbumData.Items[this.selectedItem].Id);
			GuiMusicPlayer.start("Song",url,"GuiPage_Music",true);
			break;
		case 2:
			var url = Server.getCustomURL("/Songs/"+this.AlbumData.Items[this.selectedItem].Id + "/InstantMix?format=json&Limit=50&UserId="+Server.getUserID());
			GuiMusicPlayer.start("Album",url,"GuiPage_Music",false);
			break;
		}
	}
	
	//Genre Instant Mix
	//http://192.168.1.108:28067/mediabrowser/MusicGenres/Anime/InstantMix?UserId=4b4c128121aa642086bb225659a7d471&Fields=MediaSources%2CChapters&Limit=50
	//Artist Instant Mix
	//Artist/NameID/InstatnMix?
}