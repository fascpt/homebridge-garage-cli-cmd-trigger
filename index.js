let Service, Characteristic, HomebridgeAPI;
const exec = require('child_process').exec;
const storage = require('node-persist');

module.exports = function(homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	HomebridgeAPI = homebridge;
	homebridge.registerAccessory('homebridge-garage-cli-cmd-trigger', 'GarageCliCmdTrigger', GarageCliCmdTrigger);
}

class GarageCliCmdTrigger {
	constructor (log, config) {

		//get config values
		this.name = config['name'] || "Garage CLI Command Trigger";
		this.autoCloseDelay = config["autoCloseDelay"] === undefined ? 0 : Number(config["autoCloseDelay"]);
		this.openCmd = config['openCmd'];
		this.closeCmd = config['closeCmd'];

		//initial setup
		this.log = log;
		this.service = new Service.GarageDoorOpener(this.name, this.name);
		this.setupGarageDoorOpenerService(this.service);

		this.informationService = new Service.AccessoryInformation();
		this.informationService
			.setCharacteristic(Characteristic.Manufacturer, 'github/fascpt')
			.setCharacteristic(Characteristic.Model, 'Garage CLI Command Trigger')
			.setCharacteristic(Characteristic.FirmwareRevision, '2.0.0-beta.2')
			.setCharacteristic(Characteristic.SerialNumber, this.name.replace(/\s/g, '').toUpperCase());

		//persist storage (async init)
		this.storage = storage;
		this.cacheDirectory = HomebridgeAPI.user.persistPath();
		this.storageReady = this.storage.init({dir: this.cacheDirectory, forgiveParseErrors: true})
			.then(() => this.storage.getItem(this.name))
			.then((cachedState) => {
				this.log.debug("Cached State: " + cachedState);
				if (cachedState === true) {
					this.log.debug("Using Saved OPEN State");
					this.service.updateCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.OPEN);
					this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
				} else {
					this.log.debug("Using Default CLOSED State");
					this.service.updateCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
					this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
				}
			})
			.catch((err) => {
				this.log.error("Storage init error: " + err);
				throw err;
			});
}

getServices () {
	return [this.informationService, this.service];
}

setupGarageDoorOpenerService (service) {
	this.log.debug("setupGarageDoorOpenerService");

	// Default to CLOSED until cached state loads from storage
	this.service.updateCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
	this.service.updateCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);

	service.getCharacteristic(Characteristic.TargetDoorState)
		.onGet(() => {
			return service.getCharacteristic(Characteristic.TargetDoorState).value;
		})
		.onSet(async (value) => {
			try {
				await this.storageReady;
			} catch {
				this.log.error("Cannot set state: storage unavailable");
				return;
			}
			if (value === Characteristic.TargetDoorState.OPEN) {
				this.log("Opening: " + this.name);
				this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.OPEN);
				await this.storage.setItem(this.name, true);
				if (this.openCmd !== undefined) {
					this.log("Executing OPEN command: '" + this.openCmd + "'");
					exec(this.openCmd);
				}
				this.log.debug("autoCloseDelay = " + this.autoCloseDelay);
				if (this.autoCloseDelay > 0) {
					this.log("Closing in " + this.autoCloseDelay + " seconds.");
					setTimeout(async () => {
						this.log("Auto Closing");
						this.service.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED);
						this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
						await this.storage.setItem(this.name, false);
					}, this.autoCloseDelay * 1000);
				}
			} else if (value === Characteristic.TargetDoorState.CLOSED) {
				this.log("Closing: " + this.name);
				this.service.setCharacteristic(Characteristic.CurrentDoorState, Characteristic.CurrentDoorState.CLOSED);
				await this.storage.setItem(this.name, false);
				if (this.closeCmd !== undefined) {
					this.log("Executing CLOSE command: '" + this.closeCmd + "'");
					exec(this.closeCmd);
				}
			}
		});
	}
}
