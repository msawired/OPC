class OPC {
	static options = {};
	constructor() {
		this.options = {};
		this.collapsed = false;
	}

	static slider(variableName, value, min = 0, max = null, step = null){
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)){
			//if found, ignore requested value, replace with URL param
			value = +url.searchParams.get(variableName);
		}


		max = max == null? value*2: max;
		step = step == null? value/10: step;

		this.options[variableName] = {
			name: variableName,
			type: 'slider',
			value: value,
			min: min,
			max: max,
			step: step
		}
		return this.initVariable(this.options[variableName]);
	} 

	static toggle(variableName, value = true) {
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = +url.searchParams.get(variableName) == 1 ? true: false;
		}

		this.options[variableName] = {
			name: variableName,
			type: 'toggle',
			value: value
		}
		return this.initVariable(this.options[variableName]);
	} 

	static palette(variableName, value, options) {
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//Note: query params are all strings, so turn it to array
			value = url.searchParams.get(variableName).split(',');
		}

		this.options[variableName] = {
			name: variableName,
			type: 'palette',
			value: value,
			options: options
		}
		return this.initVariable(this.options[variableName]);
	} 
	static color(variableName, value = '#333333') {
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'color',
			value: value
		}
		return this.initVariable(this.options[variableName]);
	} 

	static text(variableName, value, placeholder = null, maxChars = 1000) {
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'text',
			value: value,
			placeholder: placeholder,
			max: maxChars
		}
		return this.initVariable(this.options[variableName]);
	} 
	static button(variableName, buttonText) {
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'button',
			value: buttonText
		}
		return this.initVariable(this.options[variableName]);
	} 

	static initVariable = function(option){
		Object.defineProperty(window, option.name, {
			get: function () {
				return OPC.options[option.name].value;
			},
			set: function (value) {
				OPC.options[option.name].value = value;
				OPC.callParentFunction('OPC', OPC.options[option.name]);
				if (typeof window.parameterChanged == 'function') {
					window.parameterChanged(option.name, value);
				}
			}
		});
		this.callParentFunction('OPC', option);
		return true;
	} 
	

	static set = function (variableName, value){
		window[variableName] = value;
	}
	static buttonPressed = function (variableName, value){
		OPC.options[variableName].value = value;
		if (typeof window.buttonPressed == 'function') {
			window.buttonPressed(variableName, value);
		}
		
	}
	static buttonReleased = function (variableName, value){
		OPC.options[variableName].value = value;
		if (typeof window.buttonReleased == 'function') {
			window.buttonReleased(variableName, value);
		}
		
	}
	static set = function (variableName, value){
		window[variableName] = value;
	}

	static collapse = function (){
		OPC.collapsed = true;
		OPC.callParentFunction('OPC_collapsed', OPC.collapsed);
	}
	static expand = function (){
		OPC.collapsed = false;
		OPC.callParentFunction('OPC_collapsed', OPC.collapsed);
	}

	static callParentFunction = function (functionName, arg = {}) {
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