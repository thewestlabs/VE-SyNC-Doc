class BLEDevice{constructor(e,t,a,i,n){if(this.namePrefix=e,this.writeServiceUuid=t,this.notifyServiceUuid=a,this.writeCharUuid=i,this.notifyCharUuid=n,this.deviceName="",this.server=null,this.writeChar=null,this.notifyChar=null,this.isBluefy=navigator.userAgent.indexOf("Bluefy")>0,this.constructor==BLEDevice)throw new Error("Abstract classes can't be instantiated.")}async connect(){try{if(!this.isBluefy&&void 0!==navigator.bluetooth.getDevices){const e=await navigator.bluetooth.getDevices();e&&e.length>0&&(this.device=e.find((e=>e.name&&e.name.startsWith(this.namePrefix))))}this.device||(this.device=await navigator.bluetooth.requestDevice({filters:[{namePrefix:this.namePrefix}],optionalServices:[this.writeServiceUuid,this.notifyServiceUuid]})),this.deviceName=this.device.name,console.log(`Connecting to device ${this.device.name}`),this.server=await this.device.gatt.connect();const e=await this.server.getPrimaryService(this.writeServiceUuid),t=await this.server.getPrimaryService(this.notifyServiceUuid);this.writeChar=await e.getCharacteristic(this.writeCharUuid),this.notifyChar=await t.getCharacteristic(this.notifyCharUuid),await this.notifyChar.startNotifications(),await this.notifyChar.addEventListener("characteristicvaluechanged",this.read.bind(this)),this.onConnect(),this.device.addEventListener("gattserverdisconnected",this.onServerDisconnected.bind(this))}catch(e){this.onError(e)}}async write(e){await this.writeChar.writeValue(e)}async disconnect(){this.device.gatt.connected?await this.device.gatt.disconnect():console.log("Bluetooth Device is already disconnected"),this.onDisconnect()}onServerDisconnected(){console.log("Disonnected from gaat server")}read(e){this.onData(e.target.value)}onConnect(){console.log(`Connected to ${this.device.name}`)}onDisconnect(){console.log(`Disonnected from ${this.device.name}`)}onData(e){console.log(e)}onError(e){console.error(e)}}const NAME_PREFIX="VE-SYNC",WRITE_SERVICE_UUID="00000001-0000-1000-8000-00805f9b34fb",NOTIFY_SERVICE_UUID="00000001-0000-1000-8000-00805f9b34fb",WRITE_CHAR_UUID="00000002-0000-1000-8000-00805f9b34fb",NOTIFY_CHAR_UUID="00000003-0000-1000-8000-00805f9b34fb",HEART_BEAT_INTERVAL=1e4;class VESyNC extends BLEDevice{constructor(){super("VE-SYNC",WRITE_SERVICE_UUID,NOTIFY_SERVICE_UUID,WRITE_CHAR_UUID,NOTIFY_CHAR_UUID),this.partialData="",this.onDataTimer=null,this.lastWriteTime=0,this.heartBeatTimer=null,this.tabDebounceInterval=1e3,this.isPicoTimeValid=!0}async start(){await this.connect()}async stop(){await this.disconnect()}onConnect(){super.onConnect(),this.scheduleHearBeat(),document.querySelector("#device_name").textContent=this.deviceName,document.querySelectorAll(".hide").forEach((e=>{e.classList.remove("hidden")})),document.querySelector("#search").classList.add("hidden"),document.querySelector("#restart").classList.add("hidden"),document.querySelector(".tab.active").click()}onDisconnect(){super.onDisconnect(),document.querySelectorAll(".hide").forEach((e=>{e.classList.add("hidden")})),document.querySelector("#search").classList.remove("hidden"),clearInterval(this.heartBeatTimer)}onServerDisconnected(){this.onDisconnect(),document.querySelector("#response").textContent="Bluetooth disconnected"}scheduleHearBeat(){clearInterval(this.heartBeatTimer),this.heartBeatTimer=setInterval(this.sendHearBeat.bind(this),1e4)}async sendCommand(e=""){await this._sendCommand(e),this.scheduleHearBeat()}async _sendCommand(e){console.log(`writing: ${e}`);const t=new TextEncoder("utf-8");await this.writeChar.writeValue(t.encode(e)),this.lastWriteTime=Date.now()}async sendHearBeat(){this.lastWriteTime>=Date.now()-1e4-100&&(this.tabDebouce=!0,"stats"==document.querySelector(".tab.active").id?await this.sendCommand(JSON.stringify({__command:"read",stats:""})):await this._sendCommand(" "),setTimeout((()=>{this.tabDebouce=!1}).bind(this),this.tabDebounceInterval))}onData(e){const t=new TextDecoder("utf-8").decode(e).replace(/(\r\n)/gm,"");if(!t||"_ack_"==t)return console.log("heartbeat ack");try{const e=JSON.parse(t);this.onFullData(e)}catch(e){this.onPartialData(t)}}onPartialData(e){this.partialData+=e;try{const e=JSON.parse(this.partialData);this.onFullData(e)}catch(t){console.log("data chunk received, length=",e.length)}clearInterval(this.onDataTimer);const t=this;this.onDataTimer=setInterval((()=>{t.partialData=""}),1e3)}onFullData(e){console.log("onFullData",e),this.partialData="","stats"==e.__command?this.renderStats(e):this.renderForm(e),"reload_required"==e.__command&&this.reloadCurrentTabAfterDelay(2e3),"restart_required"==e.__command&&document.querySelector("#restart").classList.remove("hidden")}onError(e){document.querySelector("#response").textContent=e,super.onError(e)}async fetchData(e){document.querySelector("#tab-area").textContent="Loading..";var t={__command:"read"};e.split(",").forEach((e=>{t[e]=""})),await this.sendCommand(JSON.stringify(t))}async saveData(){document.querySelector("#response").textContent="Saving..";var e={__command:"write"};document.querySelectorAll('[data-field*="true"]').forEach((t=>{"boolean"==t.dataset.type?e[t.dataset.key]=!t.classList.contains("off"):"number"==t.dataset.type?e[t.dataset.key]=parseInt(t.value):e[t.dataset.key]=t.value})),document.querySelector("#tab-area").textContent="",await this.sendCommand(JSON.stringify(e))}async onTabClick(e){this.tabDebouce||(document.querySelectorAll(".tab").forEach((e=>e.classList.remove("active"))),e.currentTarget.classList.add("active"),"stats"==e.currentTarget.id?document.querySelector("#save").classList.add("hidden"):(document.querySelector("#save").classList.remove("hidden"),document.querySelector("#sync_time").classList.add("hidden")),this.tabDebouce=!0,await this.fetchData(e.currentTarget.dataset.fields),setTimeout((()=>{this.tabDebouce=!1}).bind(this),this.tabDebounceInterval))}renderStats(e){const t=document.getElementById("tab-area");t.innerHTML="";var a="";e.devices.forEach(((e,t)=>{e.name&&(a+=`<div class="device-header">\n          <img src="images/${e.type}.png"/> \n          <div class="device-title">\n            <div class="device-name">${e.name}</div>\n            <div class="device-port">Connected to Port-${t+1}</div>\n          </div>\n        </div>\n        <div class="section"> </div>\n        <div class="grid-container">`,Object.keys(e.fields).sort().forEach((i=>{a+=`\n          <div class="grid-item">\n            <div class="label">${i.replaceAll("_"," ")}</div>\n            <div class="value" data-key="${i}" data-device="${t}">${e.fields[i].value} <span class="unit">${e.fields[i].value}</span></div>\n          </div>`})),a+="</div>")})),t.innerHTML=a,"not_connected"==e.__subcommand&&(t.innerHTML='<div class="empty"><img src="images/not_connected.png"/></div>'),this.isPicoTimeValid=e.__is_time_valid,this.isPicoTimeValid?document.querySelector("#sync_time").classList.add("hidden"):document.querySelector("#sync_time").classList.remove("hidden"),this.showResult(e)}renderForm(e){const t=document.getElementById("tab-area"),a=document.querySelector(".tab.active").dataset.fields.split(","),i=Object.keys(e).sort(((e,t)=>a.indexOf(e)-a.indexOf(t)));t.innerHTML="",i.forEach((a=>{const i=e[a];var n=null;if(null==i||0==a.indexOf("__"));else if("boolean"==typeof i)n=this._getInstantToggleNode(i,this.toggleElement);else if("string"==typeof i){const e=a.includes("password")?"password":"text";(n=document.createElement("input")).className="input",n.setAttribute("type",e),n.setAttribute("value",i)}else"number"==typeof i&&((n=document.createElement("input")).className="input",n.setAttribute("type","number"),n.setAttribute("min",1),n.setAttribute("value",i));if(n){const e=document.createElement("div");e.className="input-label",e.innerText=a.replaceAll("_"," ").replaceAll("mqqt","mqtt")+":",n.dataset.field=!0,n.dataset.key=a,n.dataset.type=typeof i,t.appendChild(e),t.appendChild(n)}})),this.showResult(e)}_getInstantToggleNode(e,t){const a=document.createElement("div");return a.className="toggle"+(1==e||"on"==e?"":" off"),a.innerHTML='<div class="tab"></div>',a.onclick=t.bind(this),a}toggleElement(e){e.target.classList.toggle("off")}async toggleInstantNode(e){if(confirm("Confirm toggle?")){this.toggleElement(e);const t=!e.currentTarget.classList.contains("off");await this.sendCommand(JSON.stringify({__command:"set_field",status:t,field:e.currentTarget.parentNode.dataset.key,device:e.currentTarget.parentNode.dataset.device})),this.reloadCurrentTabAfterDelay(3e3)}}showResult(e){e.__error?document.querySelector("#response").innerHTML=`<span class="error">${e.__error}</span>`:document.querySelector("#response").textContent=e.__result?e.__result:""}async syncTime(){const e=new Date;await this.sendCommand(JSON.stringify({__command:"sync_time",time:`${e.getFullYear()}-${e.getMonth()}-${e.getDate()}:${e.getHours()}:${e.getMinutes()}:${e.getSeconds()}:${e.getDay()}`})),this.reloadCurrentTabAfterDelay(3e3)}async restart(){await this.sendCommand(JSON.stringify({__command:"restart"})),this.reconnectAfterDelay()}async confirmRestart(){confirm("Do you want to restart VE SyNC module?")&&await this.restart()}reloadCurrentTabAfterDelay(e=8e3){window.setTimeout((()=>{document.querySelector(".tab.active").click()}),e)}reconnectAfterDelay(e=8e3){window.setTimeout((()=>{document.querySelector("#search").click()}),e)}}window.addEventListener("DOMContentLoaded",(async()=>{let e=new VESyNC;document.querySelector("#search").addEventListener("click",(async()=>await e.start())),document.querySelector("#disconnect").addEventListener("click",(async()=>await e.stop())),document.querySelector("#sync_time").addEventListener("click",(async()=>await e.syncTime())),document.querySelector("#restart").addEventListener("click",(async()=>await e.restart())),document.querySelector("#stats_restart").addEventListener("click",(async()=>await e.confirmRestart())),document.querySelector("#save").addEventListener("click",(async()=>await e.saveData())),document.querySelectorAll(".tab").forEach((t=>{t.addEventListener("click",e.onTabClick.bind(e))})),window.addEventListener("beforeunload",(async()=>await e.stop()))}));
