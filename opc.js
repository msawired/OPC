class OPC {
	static options = {};
	constructor() {
		this.options = {};
		this.collapsed = false;
		this.osc = null;
	}

	static setOSC(server, port = null) {
		// you can set the OSC server and port here
		// this will be used to send OSC messages when a variable changes
		// This will also be used to receive OSC messages to update the variables

		//load the OSC library
		if (typeof window.OSC === 'undefined') {
			let script = document.createElement('script');
			script.onload = function () {
				console.log('OSC library loaded');
				//initialize OSC
				OPC.loadOSC(server, port);
			};
			script.onerror = function () {
				console.log('OSC library failed to load');
			};
			script.src = 'https://cdn.jsdelivr.net/npm/osc@2.4/dist/osc-browser.min.js';
			document.head.appendChild(script);
		}
	}

	static loadOSC(server, port = null) {
		//initialize OSC
		OPC.osc = new osc.WebSocketPort({
			url: `${server}` + (port ? `:${port}` : ''), // URL to your Web Socket server.
			metadata: true
		});
		OPC.osc.on('open', function () {
			console.log('OSC connection opened');
		});
		OPC.osc.on('close', function () {
			console.log('OSC connection closed');
		});
		OPC.osc.on('error', function (error) {
			console.error('OSC error:', error);
		});
		OPC.osc.on('message', function (message) {
			//set variables based on message
			// console.log('OSC message:', message);
			if (message.address) {
				let variableName = message.address.slice(1); //remove the first slash
				if (OPC.options[variableName]) {
					if (message.args.length === 1) {
						let value = message.args[0].value;
						if (message.args[0].type === 'f') {
							value = parseFloat(value);
						} else if (message.args[0].type === 'i') {
							value = parseInt(value);
						} else if (message.args[0].type === 's') {
							value = value.split(',');
						}
						OPC._set(variableName, value);
					}
				}
			}
		});
		OPC.osc.on('ready', function () {
			console.log('OSC ready');
		});
		OPC.osc.open();
	}
	static oscSendMessage(varName, value) {
		let type;
		if (Array.isArray(value)) {
			type = 's';
			value = value.join(',');
		} else if (typeof value === 'string') {
			type = 's';
		} else if (typeof value === 'number') {
			type = 'f';
		} else if (typeof value === 'boolean') {
			type = 'i';
			value = value ? 1 : 0;
		}
		OPC.osc.send({
			address: `/${varName}`,
			args: [
				{ type, value }
			]
		});
	}


	static slider(variableNameOrConfig, value, min = 0, max = null, step = null) {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			value = variableNameOrConfig.value;
			min = variableNameOrConfig.min ?? min;
			max = variableNameOrConfig.max ?? max;
			step = variableNameOrConfig.step ?? step;
			label = variableNameOrConfig.label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = +url.searchParams.get(variableName);
		}


		max = max == null ? value * 2 : max;
		step = step == null ? value / 10 : step;

		this.options[variableName] = {
			name: variableName,
			type: 'slider',
			min, max, value, step, label, description
		}
		return this.initVariable(this.options[variableName]);
	}

	static toggle(variableNameOrConfig, value = true) {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			value = variableNameOrConfig.value ?? value;
			label = variableNameOrConfig.label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = +url.searchParams.get(variableName) == 1 ? true : false;
		}

		this.options[variableName] = {
			name: variableName,
			type: 'toggle',
			value, label, description
		}
		return this.initVariable(this.options[variableName]);
	}

	static palette(variableNameOrConfig, options, value = null) {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			options = variableNameOrConfig.options;
			value = variableNameOrConfig.value ?? value;
			label = variableNameOrConfig.label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//Note: query params are all strings, so turn it to array
			value = url.searchParams.get(variableName).split(',');
		}

		this.options[variableName] = {
			name: variableName,
			type: 'palette',
			value: value ?? options[0],
			options, label, description
		}
		return this.initVariable(this.options[variableName]);
	}
	static color(variableNameOrConfig, value = '#333333') {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			value = variableNameOrConfig.value ?? value;
			label = variableNameOrConfig.label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'color',
			value, label, description
		}
		return this.initVariable(this.options[variableName]);
	}

	static text(variableNameOrConfig, value, placeholder = null, maxChars = 1000) {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			value = variableNameOrConfig.value;
			placeholder = variableNameOrConfig.placeholder ?? placeholder;
			maxChars = variableNameOrConfig.maxChars ?? maxChars;
			label = variableNameOrConfig.label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'text',
			max: maxChars,
			value, placeholder, label, description
		}
		return this.initVariable(this.options[variableName]);
	}
	static button(variableNameOrConfig, value = 'Click Me!') {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			value = variableNameOrConfig.value ?? value;
			label = variableNameOrConfig.label ?? label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'button',
			value, label, description
		}
		return this.initVariable(this.options[variableName]);
	}

	//create the same for "select"
	static select(variableNameOrConfig, options, value = null) {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			options = variableNameOrConfig.options;
			value = variableNameOrConfig.value ?? value ?? options[Object.keys(options)[0]];
			label = variableNameOrConfig.label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
			value = value ?? options[Object.keys(options)[0]];
		}
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//Note: query params are all strings, so turn it to array
			value = url.searchParams.get(variableName).split(',');
		}

		this.options[variableName] = {
			name: variableName,
			type: 'select',
			value: value ?? options[0],
			options, label, description
		}
		return this.initVariable(this.options[variableName]);
	}

	static initVariable = function (option) {
		Object.defineProperty(window, option.name, {
			configurable: true,
			get: function () {
				return OPC.options[option.name].value;
			},
			set: function (value) {
				OPC._set(option.name, value);
				if (OPC.osc) {
					OPC.oscSendMessage(option.name, value);
				}
			}
		});
		this.callParentFunction('OPC', option);
		return true;
	}

	static _set(variableName, value) {
		OPC.options[variableName].value = value;
		OPC.callParentFunction('OPC', OPC.options[variableName]);
		if (typeof window.parameterChanged == 'function') {
			window.parameterChanged(variableName, value);
		}
	}

	static set(variableName, value) {
		window[variableName] = value;
	}

	static buttonPressed(variableName, value) {
		OPC.options[variableName].value = value;
		if (typeof window.buttonPressed == 'function') {
			window.buttonPressed(variableName, value);
		}

	}
	static buttonReleased(variableName, value) {
		OPC.options[variableName].value = value;
		if (typeof window.buttonReleased == 'function') {
			window.buttonReleased(variableName, value);
		}

	}

	static collapse() {
		OPC.collapsed = true;
		OPC.callParentFunction('OPC_collapsed', OPC.collapsed);
	}
	static expand() {
		OPC.collapsed = false;
		OPC.callParentFunction('OPC_collapsed', OPC.collapsed);
	}
	static delete(variableName) {
		if (OPC.options[variableName]) {
			delete OPC.options[variableName];
			delete window.variableName;
		}
		OPC.callParentFunction('OPC_delete', variableName);
	}

	static callParentFunction(functionName, arg = {}) {
		// console.log(arg);
		try {
			//try sending as is
			window.parent.postMessage({
				'messageType': functionName,
				'message': arg
			}, '*');
		} catch (error) {
			console.log('postMessage', error);
		}
	}

}