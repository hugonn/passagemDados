var clear = require('clear');
//Import BLE Library
//The library has been modified in order to display the beacon's localName variable on tlm beacon
var nobleEddy = require('./noble-eddystone');
var mqtt = require('mqtt');

const {exec} = require("child_process");

scanner = new nobleEddy();

var previousBeacon;	//variable to save previous Beacon ID
var threshold = -55;  //Min RSSI gain to be detected


console.log("Começando o processamento de sinal...\n");
/**
 *   UPDATED beacon event
 *   Display closest beacon found
 **/
var counter = 0;
 
scanner.on('updated', function(beacon) {
	var json;
	
	
	if (beacon.rssi > threshold) {
		counter++;

		if (previousBeacon !== beacon.id) {	//if beacon's ID changes, clean screen

			clear(); 
			previousBeacon = beacon.id;  4
			
		}
		var tag = 'MAC: ' + beacon.id.toUpperCase() + ' RSSI: ' + beacon.rssi + " Bateria: ";
		if(beacon.tlm.vbatt < 2900){
			tag += "\x1b[31m" + beacon.tlm.vbatt + "\x1b[37m" + " Contador ->" +counter + " TEmpo ->" + Date.now();
			console.error(tag);
		}else{
			tag +=	"\x1b[32m" + beacon.tlm.vbatt + "\x1b[37m" + " Contador ->" +counter + " TEmpo ->" + Date.now();
			console.log(tag);	
		}
		
		json = '{"Leitor":"H4G8N7","Tag":"'+beacon.id.toUpperCase()+'", "Rssi":"'+beacon.rssi+'", "Data":'+Date.now()+', "Bateria":'+beacon.tlm.vbatt+'}'
		
		exec("sudo mosquitto_pub -t CMV/leitura -m '" + json + "' -h 192.168.15.7 -p 1883", (error, stdout, stder) => {
			if(error) console.log(error);


		});
   }
});


scanner.startScanning(true);	//start scanner
