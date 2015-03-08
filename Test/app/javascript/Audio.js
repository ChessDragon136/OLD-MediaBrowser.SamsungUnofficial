var Audio = {
	pluginAudio : null
}

Audio.init = function() {
	var success = true;
	this.pluginAudio = document.getElementById("pluginAudio");
	this.pluginAudio.Open("Audio", "1.000", "GetVolume");

	return (!this.pluginAudio) ? false : true;
}

Audio.deinit = function() {
	if(!this.pluginAudio) {
		this.pluginAudio.Close();
	}
}

Audio.setRelativeVolume = function(delta) {
	this.pluginAudio.Execute('SetVolumeWithKey', delta);
}