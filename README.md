# VE SyNC
VE SyNC is a WiFi adapter designed for Victron Energy¹ brand charge controllers. Checkout the product [here](https://www.tindie.com/products/33256/). Tested with SmartSolar/BlueSolar series MPPT controllers.

<img src=https://github.com/thewestlabs/VE-SyNC-Doc/assets/111796612/660d1b89-5d74-48db-a301-0b9e89e192f2 width=360px />

### Configuration
**a. Pre-installed Pico W**
  1. All pre-installed Picos come with firmware already baked into it.
  2. Power the VE SyNC module through Micro-USB or 12v/24v JST PH connector. Connect module to your Victron device using VE.Direct cable. 
  3. Configure with bluetooth using this webpage -> [VE SyNC App](https://thewestlabs.github.io/VE-SyNC-Doc/). Read more about using the app on [Wiki](https://github.com/thewestlabs/VE-SyNC-doc/wiki/BLE-App).

**b. Using your own Pico W**

If you opted for your own Pico, check manual configuration steps [wiki/Manual-configuration](https://github.com/thewestlabs/VE-SyNC-doc/wiki/Manual-configuration)

### Data cable

You can use either genuine [VE.Direct](https://www.amazon.com/dp/B01F9ESFZS) cable (recommended) or build your on DIY cables. ([How?](https://github.com/thewestlabs/VE-SyNC-Doc/wiki/DIY-VE.Direct-cable))

### LED color codes

After the initial bootstrap settles in:
  1. 🟢 Green blinking every 3 seconds - Device is healthy and connected
  2. 🟡 Yellow blinking every 3 seconds - Device is healthy but not connected to either Victron or WiFi
  3. ⭕ Red blinking - Temporary error
  4. 🔴 Red steady - Fatal error occured

### PVOutput/ Home assistant / MQTT
Enable and configure cloud uploads using the BLE app. More details can be found at [Wiki/BLE App](https://github.com/thewestlabs/VE-SyNC-Doc/wiki/BLE-App).

### Supported devices
Pretty much any Victron device with a VE.Direct port except BMV-60X.

### FAQ
  1. Will my Victron bluetooth continue to work?  
    Yes, bult-in SmartSolar BLE will continue to work. But BlueSolar external BLE module will not work, because port is occupied. (You can try experimenting with a splitter at your own risk).
  2. Can I upload Inverter/Shunt data to PVOutput?  
    Only charge controller data will be uploaded to PVOutput, other devices will be ignored. But MQTT with HA discovery and custom logging should work with any VE.Direct devices.
  3. Do I need Cerbo GX or Venus OS?  
    It works independently and connects directly to your WiFi. No need of Cerbo GX or Venus OS.

### Where to buy
<a href="https://www.tindie.com/stores/westlabs/?ref=offsite_badges&utm_medium=badges&utm_campaign=badge_medium"><img src="https://d2ss6ovg47m0r5.cloudfront.net/badges/tindie-mediums.png" alt="I sell on Tindie" width="150" height="78"></a>

### Disclaimers
- ¹Victron Energy and all other trademarks used here are the property of their respective owners.
- This device and software is provided only as a DIY project for your home, the developer is not liable for any damages caused by it.
