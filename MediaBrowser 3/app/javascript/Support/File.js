var File = {
		ServerEntry : null,
		UserEntry : null
};

File.getServerEntry = function() {
	return this.ServerEntry;
}

File.setServerEntry = function(serverEntry) {
	this.ServerEntry = serverEntry;
}

File.getUserEntry = function() {
	return this.UserEntry;
}

File.setUserEntry = function(userEntry) {
	this.UserEntry = userEntry;
}

File.deleteOldSettingsFile = function() {
	var fileSystemObj = new FileSystem();
	fileSystemObj.deleteCommonFile(curWidget.id + '/MB3_Settings.xml');
}

File.deleteSettingsFile = function() {
	var fileSystemObj = new FileSystem();
	fileSystemObj.deleteCommonFile(curWidget.id + '/MB3_Settings.json');
}

File.loadFile = function() {
	var fileSystemObj = new FileSystem();
	
	var bValid = fileSystemObj.isValidCommonPath(curWidget.id); 
	if (!bValid) {  
		fileSystemObj.createCommonDir(curWidget.id); 
		var fileObj = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		var contentToWrite = '{"Servers":[],"TV":{}}';
		fileObj.writeLine(contentToWrite); 
		fileSystemObj.closeCommonFile(fileObj); 
	}
	
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (!openRead) {
		fileSystemObj.createCommonDir(curWidget.id); 
		var fileObj = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		var contentToWrite = '{"Servers":[],"TV":{}}';
		fileObj.writeLine(contentToWrite); 
		fileSystemObj.closeCommonFile(fileObj); 
		return contentToWrite;
	} else {
		var fileContents = openRead.readAll();
		fileSystemObj.closeCommonFile(openRead);		
		return fileContents;
	}
};

File.saveServerToFile = function(Id,Name,ServerIP) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	
		
		var serverExists = false;
		for (var index = 0; index < fileJson.Servers.length; index++) {
			if (Id == fileJson.Servers[index].Id) {
				this.ServerEntry = index;
				serverExists = true;
				alert ("Server already exists in file - not adding - Server Entry: " + this.ServerEntry);
			}
		}
		
		if (serverExists == false) {
			this.ServerEntry = fileJson.Servers.length
			fileJson.Servers[fileJson.Servers.length] = {"Id":Id,"Name":Name,"Path":ServerIP,"Default":false,"Users":[]};
			var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
			if (openWrite) {
				openWrite.writeLine(JSON.stringify(fileJson)); 
				fileSystemObj.closeCommonFile(openWrite); 
				alert ("Server added to file - Server Entry: " + this.ServerEntry);
			}
		}	
	}
}

File.setDefaultServer = function (defaultIndex) {
	var fileJson = JSON.parse(File.loadFile()); 
	for (var index = 0; index < fileJson.Servers.length; index++) {
		alert (index + " " + defaultIndex);
		if (fileJson.Servers[defaultIndex].Id == fileJson.Servers[index].Id ) {
			fileJson.Servers[index].Default = true;
		} else {
			fileJson.Servers[index].Default = false;
		}
	}
	
	var fileSystemObj = new FileSystem();
	var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
	if (openWrite) {
		openWrite.writeLine(JSON.stringify(fileJson)); 
		fileSystemObj.closeCommonFile(openWrite); 
	}
	GuiNotifications.setNotification(fileJson.Servers[defaultIndex].Name + " is now your default Server and will be logged in autiomatically from now on","Default Server Changed",true);
}

File.deleteServer = function (index) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		fileJson.Servers.splice(index);
		
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson)); 
			fileSystemObj.closeCommonFile(openWrite); 
		}
		
		if (fileJson.Servers.length == 0) {
			GuiPage_IP.showGUI();
		}
	}	
}

File.addUser = function (UserId, Name, Password) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		this.UserEntry = fileJson.Servers[this.ServerEntry].Users.length;
		
		view1 = Server.getServerAddr() + "/mediabrowser/Users/"+UserId+"/Items?format=json&SortBy=DatePlayed&SortOrder=Descending&Filters=IsResumable&Limit=12&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName&ImageTypeLimit=1";
		view2 = Server.getServerAddr() + "/mediabrowser/Shows/NextUp?format=json&IncludeItemTypes=Episode&UserId="+UserId+"&ExcludeLocationTypes=Virtual&fields=SortName&ImageTypeLimit=1"
		
		fileJson.Servers[this.ServerEntry].Users[this.UserEntry] = {"UserId":UserId,"UserName":Name,"Password":Password,"Default":false,"View1":view1,View1Name:"Resume All Items","View2":view2,View2Name:"TV Next Up"};
		
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson)); 
			fileSystemObj.closeCommonFile(openWrite); 
		}
	}
}

File.deleteUser = function (index) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		fileJson.Servers[this.ServerEntry].Users.splice(index);
		
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson)); 
			fileSystemObj.closeCommonFile(openWrite); 
		}
	}
}

File.updateUserSettings = function (altered) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		fileJson.Servers[this.ServerEntry].Users[this.UserEntry] = altered;
		
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson)); 
			fileSystemObj.closeCommonFile(openWrite); 
		}
	}
}


File.updateServerSettings = function (altered) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		fileJson.Servers[this.ServerEntry] = altered;
		
		var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
		if (openWrite) {
			openWrite.writeLine(JSON.stringify(fileJson)); 
			fileSystemObj.closeCommonFile(openWrite); 
		}
	}
}

File.writeAll = function (toWrite) {
	var fileSystemObj = new FileSystem();
	var openWrite = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'w');
	if (openWrite) {
		openWrite.writeLine(JSON.stringify(toWrite)); 
		fileSystemObj.closeCommonFile(openWrite); 
	}
}

//---------------------------------------------------------------------------------------------------------------------------------
//-  GET FUNCTIONS
//---------------------------------------------------------------------------------------------------------------------------------

File.getUserProperty = function(property) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		if (fileJson.Servers[this.ServerEntry].Users[this.UserEntry][property] === undefined) {
			//Get System Default
			for (var index = 0; index < GuiPage_Settings.Settings.length; index++) {
				if (GuiPage_Settings.Settings[index] == property) {
					//Write setting here?
					fileJson.Servers[this.ServerEntry].Users[this.UserEntry][property] = GuiPage_Settings.SettingsDefaults[index];
					File.writeAll(fileJson);
					break;
				}
			}
		} 
		return fileJson.Servers[this.ServerEntry].Users[this.UserEntry][property];	
	}
}

File.getTVProperty = function(property) {
	var fileSystemObj = new FileSystem();
	var openRead = fileSystemObj.openCommonFile(curWidget.id + '/MB3_Settings.json', 'r');
	if (openRead) {
		var fileJson = JSON.parse(openRead.readLine()); //Read line as only 1 and skips line break!
		fileSystemObj.closeCommonFile(openRead);	

		if (fileJson.TV === undefined) {
			fileJson.TV = {};
			File.writeAll (fileJson);
		}
		
		if (fileJson.TV[property] === undefined) {
			//Get System Default
			for (var index = 0; index < GuiPage_Settings.TVSettings.length; index++) {
				if (GuiPage_Settings.TVSettings[index] == property) {
					//Write setting here?
					fileJson.TV[property] = GuiPage_Settings.TVSettingsDefaults[index];
					File.writeAll(fileJson);
					break;
				}
			}
		} 
		return fileJson.TV[property];			
	}
}