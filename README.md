# homebridge-garage-cli-cmd-trigger
[Homebridge](https://github.com/nfarina/homebridge) plugin to create a HomeKit Garage Door accessory with optional command line triggers. Why? iOS >13 CarPlay allows you to easily access your Garage when arriving and leaving your house. This plug-in allows to to create a Garage door which you can use as an automation trigger and trigger command line, e.g., to run a python script which sends a radio command to the Garage Door. Pull up to your house open the "Garage" on your dash which can unlock your front door, turn lights on, open your garage, etc.

![CarPlay Screenshot](https://github.com/fascpt/homebridge-garage-cli-cmd-trigger/blob/master/carplay.png?raw=true)

# Installation
1. Install [Homebridge](https://github.com/nfarina/homebridge#installation)
2. Install this plugin using `npm install -g homebridge-garage-cli-cmd-trigger`
3. Edit your configuration file like the example below and restart Homebridge

# Configuration Example
```
	"accessories": [
		{
			"accessory": "GarageCMDTrigger",
			"name": "Garage Command Trigger",
			"autoCloseDelay": 2,
			"openCmd": "echo Garage OPENED",
			"closeCmd": "echo Garage CLOSED"
		}
	]
```

# Configuration Parameters

* ```name``` __(required)__ Name of Garage to appear in Home app
* ```autoCloseDelay``` Number of seconds after opening door will automatically close. Remove parameter or set it to 0 to disable.
* ```openCmd``` CLI command that is executed when the garage is opened.
* ```closeCmd``` CLI command that is executed when the garage is closed.

# Credits

This plugin is a fork of [Homebridge-Controls-Your-Garage-Door-Remote](https://github.com/kropatschek/Homebridge-Controls-Your-Garage-Door-Remote) with command line feature borrowed from [homebridge-cmdtriggerswitch](https://github.com/hans-1/homebridge-cmdtriggerswitch).
