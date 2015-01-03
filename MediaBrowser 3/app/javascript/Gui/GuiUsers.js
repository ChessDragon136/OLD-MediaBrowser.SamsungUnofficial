var GuiUsers = {
	UserData : null,
	
	selectedUser : 0,
	topLeftItem : 0, 
	MAXCOLUMNCOUNT : 3,
	MAXROWCOUNT : 1
}

GuiUsers.getMaxDisplay = function() {
	return this.MAXCOLUMNCOUNT * this.MAXROWCOUNT;
}

GuiUsers.start = function(runAutoLogin) {
	//Reset Properties
	this.selectedUser = 0;
	this.topLeftItem = 0; 
	Support.destroyURLHistory();
	document.getElementById("NotificationText").innerHTML = "";
	document.getElementById("Notifications").style.visibility = "hidden";
	
	//Load Data
	var url = Server.getServerAddr() + "/Users/Public?format=json";
	this.UserData = Server.getContent(url);
	
	//Check for Default User
	var autoLogin = false;
	
	//Load File Data
	if (runAutoLogin == true) {
		var fileJson = JSON.parse(File.loadFile()); 
		for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
			if (this.UserData.length == 1 || fileJson.Servers[File.getServerEntry()].Users[index].Default == true) {
				var userId = fileJson.Servers[File.getServerEntry()].Users[index].UserId;
				//check if user exists on the server!
				for (var index2 = 0; index2 < this.UserData.length; index2++) {
					if (this.UserData[index2].Id == userId) {
						var User = fileJson.Servers[File.getServerEntry()].Users[index].UserName;
		    			var Password = fileJson.Servers[File.getServerEntry()].Users[index].Password;
						//Authenticate with MB3 - if fail somehow bail?					
						var authenticateSuccess = Server.Authenticate(userId, User, Password);		
						if (authenticateSuccess) {
							autoLogin = true;
							//Set File User Entry
							File.setUserEntry(index);
							//Set Server UserId
							Server.setUserID(userId);
							//Change Focus and call function in GuiMain to initiate the page!
							GuiMainMenu.start();
						} else {
							//Delete user from DB here - makes life much simpler to delete and read on success!!!
							File.deleteUser(index);				
						}	
						break;
					}
				}
				break;
			}
		}
	}

	if (autoLogin == false) {
		//Change Display
		document.getElementById("pageContent").className = "";
		document.getElementById("pageContent").innerHTML = "<div style='padding-top:60px;text-align:center'> \
			<div id=guiUsers_allusers></div> \
			<div id='guiUsers_pwd' style='visibility:hidden'> \
	    	Password: <br><input id='guiUsers_Password' type='text' size='20'/> \
	    	</div>	\
			<div>Pressing the Info button will bring up Help on all pages<br>Pressing the Tools button will select the menu bar once logged in</div> \
			</div>";
		
		if (this.UserData.length != 0) {
			GuiUsers.updateDisplayedUsers();
			GuiUsers.updateSelectedUser();
			document.getElementById("GuiUsers").focus();
		} else {
			document.getElementById("guiUsers_allusers").innerHTML = "Sorry, you have no public users and this app currently does not offer manual user logon";
			document.getElementById("GuiUsers").focus();
		}	
	}
}

GuiUsers.updateDisplayedUsers = function() {
	var htmltoadd = "";
	for (var index = this.topLeftItem; index < (Math.min(this.topLeftItem + this.getMaxDisplay(),this.UserData.length)); index++) {
		if (this.UserData[index].PrimaryImageTag) {			
			var imgsrc = Server.getImageURL(this.UserData[index].Id,"UsersPrimary",200,200,0,false,0);
			htmltoadd += "<div id=" + this.UserData[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ this.UserData[index].Name + "</div></div>";
		} else {
			htmltoadd += "<div id=" + this.UserData[index].Id + " style=background-image:url(images/loginusernoimage.png)><div class=menuItem>"+ this.UserData[index].Name + "</div></div>";
		}	
    }
		
	//Set Content to Server Data
	document.getElementById("guiUsers_allusers").innerHTML = htmltoadd;
}

//Function sets CSS Properties so show which user is selected
GuiUsers.updateSelectedUser = function () {	
	Support.updateSelectedNEW(this.UserData,this.selectedUser,this.topLeftItem,
			Math.min(this.topLeftItem + GuiUsers.getMaxDisplay(),this.UserData.length),"User Selected","User","");
}

//Function executes on the selection of a user - should log user in or generate error message on screen
GuiUsers.processSelectedUser = function () {
	var selectedUserId = this.UserData[this.selectedUser].Id;

	//Load JSON File
	var userInFile = false;
	var fileJson = JSON.parse(File.loadFile()); 
    if (fileJson.Servers[File.getServerEntry()].Users.length > 0) {	
    	for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
    		var UserId = fileJson.Servers[File.getServerEntry()].Users[index].UserId;
    		if (UserId == selectedUserId){
    			userInFile = true;
    			var User = fileJson.Servers[File.getServerEntry()].Users[index].UserName;
    			var Password = fileJson.Servers[File.getServerEntry()].Users[index].Password;
    			
    			//Authenticate with MB3 - if fail somehow bail?					
				var authenticateSuccess = Server.Authenticate(UserId, User, Password);		
				if (authenticateSuccess) {
					//Set File User Entry
					File.setUserEntry(index);
					//Set Server UserId
					Server.setUserID(UserId);
					//Change Focus and call function in GuiMain to initiate the page!
					GuiMainMenu.start();
				} else {
					//Delete user from DB here - makes life much simpler to delete and read on success!!!
					File.deleteUser(index);
					
					//Saved password failed - likely due to a user changing their password
					new GuiUsers_Input("guiUsers_Password");				
				}
				break;
    		}  		
    	}		
    }
	if (userInFile == false){
		if (this.UserData[this.selectedUser].HasPassword) {
			//Has password - Load IME	
			new GuiUsers_Input("guiUsers_Password");
		} else {
			var pwdSHA1 = Sha1.hash("",true);
			var authenticateSuccess = Server.Authenticate(this.UserData[this.selectedUser].Id, this.UserData[this.selectedUser].Name, pwdSHA1);		
			if (authenticateSuccess) {
				//Reset GUI to as new - Not Required as it already is!!
				//Add Username & Password to DB
				File.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,pwdSHA1);
				//Set Server UserId
				Server.setUserID(this.UserData[this.selectedUser].Id);
				//Change Focus and call function in GuiMain to initiate the page!
				GuiMainMenu.start();
			} else {
				//Div to display Network Failure - No password therefore no password error
				//This event should be impossible under normal circumstances
				GuiNotifications.setNotification("Network Error");
			}
		}
	}
	

}

GuiUsers.keyDown = function()
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
		case tvKey.KEY_RETURN:
		case tvKey.KEY_PANEL_RETURN:
			alert("RETURN");
			widgetAPI.sendReturnEvent();
			break;
		case tvKey.KEY_LEFT:
			alert("LEFT");	
			this.selectedUser--;
			if (this.selectedUser < 0) {
				this.selectedUser = this.UserData.length - 1;
				if(this.UserData.length > this.MAXCOLUMNCOUNT) {
					this.topLeftItem = (this.selectedUser-2);
					GuiUsers.updateDisplayedUsers();
				} else {
					this.topLeftItem = 0;
				}
			} else {
				if (this.selectedUser < this.topLeftItem) {
					this.topLeftItem--;
					if (this.topLeftItem < 0) {
						this.topLeftItem = 0;
					}
					GuiUsers.updateDisplayedUsers();
				}
			}
			GuiUsers.updateSelectedUser();
			break;
		case tvKey.KEY_RIGHT:
			alert("RIGHT");	
			this.selectedUser++;
			if (this.selectedUser >= this.UserData.length) {
				this.selectedUser = 0;
				this.topLeftItem = 0;
				GuiUsers.updateDisplayedUsers();
			} else {
				if (this.selectedUser >= this.topLeftItem+this.getMaxDisplay() ) {
					this.topLeftItem++;
					GuiUsers.updateDisplayedUsers();
				}
			}
			GuiUsers.updateSelectedUser();
			break;
		case tvKey.KEY_ENTER:
		case tvKey.KEY_PANEL_ENTER:
			alert("ENTER");
			GuiUsers.processSelectedUser();
			break;	
		case tvKey.KEY_BLUE:
			Server.setServerAddr("");
			File.setServerEntry(null);
			GuiPage_Servers.start();
			break;
		case tvKey.KEY_INFO:
			alert ("INFO KEY");
			GuiHelper.toggleHelp("GuiUsers");
			break;
		case tvKey.KEY_EXIT:
			alert ("EXIT KEY");
			widgetAPI.sendExitEvent();
			break;
		default:
			alert("Unhandled key");
			break;
	}
};


//////////////////////////////////////////////////////////////////
//  Input method for entering user password                     //
//////////////////////////////////////////////////////////////////
var GuiUsers_Input  = function(id) {   
    var imeReady = function(imeObject) {    	
    	installFocusKeyCallbacks();   	
    	document.getElementById("guiUsers_pwd").style.visibility="";
    	document.getElementById("guiUsers_Password").focus();
    }
    
    var ime = new IMEShell(id, imeReady,'en');
    ime.setKeypadPos(680,90);
        
    var installFocusKeyCallbacks = function () {
        ime.setKeyFunc(tvKey.KEY_ENTER, function (keyCode) {
            alert("Enter key pressed");    
           
            //Save pwd value first, then wipe for next use
            var pwd = document.getElementById("guiUsers_Password").value;
            ime.setString("");
            
            //Set focus back to GuiUsers to reset IME
            document.getElementById("GuiUsers").focus(); 
                             
            GuiUsers.IMEAuthenticate(pwd);           
        });
        
        //Keycode to abort login from password screen
        ime.setKeyFunc(tvKey.KEY_RED, function (keyCode) {
        	document.getElementById("guiUsers_pwd").style.visibility="hidden";
        	document.getElementById("GuiUsers").focus();
        	
        }); 
        
        ime.setKeyFunc(tvKey.KEY_INFO, function (keyCode) {
        	GuiHelper.toggleHelp("GuiUsers");	
        });
        
        ime.setKeyFunc(tvKey.KEY_EXIT, function (keyCode) {
        	widgetAPI.sendExitEvent();
        });      
    }   
}

//Run from IME if user has password - Run in GuiUsers for ease of access to class variables
GuiUsers.IMEAuthenticate = function(password) {
    var pwdSHA1 = Sha1.hash(password,true);
	var authenticateSuccess = Server.Authenticate(this.UserData[this.selectedUser].Id, this.UserData[this.selectedUser].Name, pwdSHA1);		
	if (authenticateSuccess) {
		//Reset GUI to as new!
		document.getElementById("guiUsers_pwd").style.visibility="hidden";

		//Add Username & Password to DB
		File.addUser(this.UserData[this.selectedUser].Id,this.UserData[this.selectedUser].Name,pwdSHA1);

		//Set UserID in Server
		Server.setUserID(this.UserData[this.selectedUser].Id);
		
		//Change Focus and call function in GuiMain to initiate the page!
		GuiMainMenu.start();
	} else {
		//Wrong password - Reset IME focus and notifty user
		document.getElementById("guiUsers_Password").focus();
		GuiNotifications.setNotification("Wrong Password or Network Error");
	}  
}