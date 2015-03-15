var GuiUsers_Manual = {
	selectedItem : 0, //0 = User, 1 = Password
}

GuiUsers_Manual.start = function() {
	//Reset Properties
	this.selectedItem = 0;
	document.getElementById("NotificationText").innerHTML = "";
	document.getElementById("Notifications").style.visibility = "hidden";
	
	//Change Display
	document.getElementById("pageContent").innerHTML = "<div class='GuiPage_NewServer'> \
		<p style='padding-bottom:5px'>Username</p> \
		<form><input id='user' style='z-index:10;' type='text' size='50' value=''/></form> \
		<p style='padding-bottom:5px'>Password</p> \
		<form><input id='pass' style='z-index:10;' type='text' size='50' value=''/></form> \
		</div>";
	
	new GuiUsers_Manual_Input("user");	
}

GuiUsers_Manual.IMEAuthenticate = function(user, password) {
    var pwdSHA1 = Sha1.hash(password,true);
    var authenticateSuccess = Server.Authenticate(null, user, pwdSHA1);		
    if (authenticateSuccess) {   	
    	document.getElementById("NoKeyInput").focus();
    	
    	//Add Username & Password to DB for settings purpose - Password is blanked!
    	var userInFile = false;
    	var fileJson = JSON.parse(File.loadFile()); 
		for (var index = 0; index < fileJson.Servers[File.getServerEntry()].Users.length; index++) {
			if (fileJson.Servers[File.getServerEntry()].Users[index].UserName == user) {
				userInFile = true;
				File.setUserEntry(index);
			}
		}
    	
		if (userInFile == false) {
			File.addUser(Server.getUserID(),user,Sha1.hash("",true),false);
		}
			
    	//Change Focus and call function in GuiMain to initiate the page!
    	GuiMainMenu.start();
    } else {
    			
    	alert ("Authentication Failed");
    	
    	//Wrong password - Reset IME focus and notifty user
    	document.getElementById("user").value = "";
    	document.getElementById("pass").value = "";
    			
    	document.getElementById("user").focus();
    	GuiNotifications.setNotification("Wrong User / Password Combination or Network Error");
    }     		
}

//////////////////////////////////////////////////////////////////
//  Input method for entering user password                     //
//////////////////////////////////////////////////////////////////
var GuiUsers_Manual_Input  = function(id) {   
    var imeReady = function(imeObject) {    	
    	installFocusKeyCallbacks(); 
    	document.getElementById(id).focus();
    }
    
    var ime = new IMEShell(id, imeReady,'num');
    ime.setKeypadPos(680,90);
           
    var installFocusKeyCallbacks = function () {
        ime.setKeyFunc(tvKey.KEY_ENTER, function (keyCode) {
            alert("Enter key pressed");  
            if (GuiUsers_Manual.selectedItem == 0) {
            	//Set IME to Password field
            	GuiUsers_Manual.selectedItem++;
            	new GuiUsers_Manual_Input("pass");
            	document.getElementById("pass").focus;
            } else {
            	//Process Login Here
            	var usr = document.getElementById("user").value;
            	var pwd = document.getElementById("pass").value;
            	GuiUsers_Manual.IMEAuthenticate(usr,pwd);
            }        
        });
        
        ime.setKeyFunc(tvKey.KEY_DOWN, function (keyCode) {
            alert("Enter key pressed");  
            if (GuiUsers_Manual.selectedItem == 0) {
            	//Set IME to Password field
            	GuiUsers_Manual.selectedItem++;
            	new GuiUsers_Manual_Input("pass");
            	document.getElementById("pass").focus;
            } else {
            	//Process Login Here
            	var usr = document.getElementById("user").value;
            	var pwd = document.getElementById("pass").value;
            	GuiUsers_Manual.IMEAuthenticate(usr,pwd);
            }        
        });
        
        ime.setKeyFunc(tvKey.KEY_UP, function (keyCode) {
            alert("Enter key pressed");  
            if (GuiUsers_Manual.selectedItem == 1) {
            	//Set IME to Password field
            	GuiUsers_Manual.selectedItem--;
            	new GuiUsers_Manual_Input("user");
            	document.getElementById("user").focus;
            }        
        });
        
        //Keycode to abort login from password screen      
        ime.setKeyFunc(tvKey.KEY_INFO, function (keyCode) {
        	GuiHelper.toggleHelp("GuiUsers_Manual");	
        });
        
        ime.setKeyFunc(tvKey.KEY_EXIT, function (keyCode) {
        	document.getElementById("NoKeyInput").focus();
        	widgetAPI.sendExitEvent();
        });   
    }
};