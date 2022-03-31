class OPC {
	static options = {};
	static variables = [];
	constructor(container = null) {
		this.container = container;
		this.options = {};
		this.existingOptions = {};
		this.variables = [];
		this.minimized = false;
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
		this.callParentFunction('OPC', this.options[variableName] );
		//delete existing
		Object.defineProperty(window, variableName, {
			get: function () {
				return OPC.options[variableName].value;
			}
		});
		this.callParentFunction('OPC', this.options[variableName]);
		return true;
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
		this.callParentFunction('OPC', this.options[variableName]);
		//delete existing
		Object.defineProperty(window, variableName, {
			get: function () {
				return OPC.options[variableName].value;
			}
		});
		this.callParentFunction('OPC', this.options[variableName]);
		return true;
	} 

	static palette(variableName, value, options) {
		//check existing params
		let url = new URL(document.location.href);
		if (url && url.searchParams.has(variableName)) {
			//if found, ignore requested value, replace with URL param
			value = url.searchParams.get(variableName);
		}

		this.options[variableName] = {
			name: variableName,
			type: 'palette',
			value: value,
			options: options
		}
		this.callParentFunction('OPC', this.options[variableName]);
		//delete existing
		Object.defineProperty(window, variableName, {
			get: function () {
				return OPC.options[variableName].value;
			}
		});
		this.callParentFunction('OPC', this.options[variableName]);
		return true;
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
		this.callParentFunction('OPC', this.options[variableName]);
		//delete existing
		Object.defineProperty(window, variableName, {
			get: function () {
				return OPC.options[variableName].value;
			}
		});
		this.callParentFunction('OPC', this.options[variableName]);
		return true;
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
		this.callParentFunction('OPC', this.options[variableName]);
		//delete existing
		Object.defineProperty(window, variableName, {
			get: function () {
				return OPC.options[variableName].value;
			}
		});
		this.callParentFunction('OPC', this.options[variableName]);
		return true;
	} 
	

	static set = function (variableName, value){
		OPC.options[variableName].value = value;
		if (typeof window.parameterChanged == 'function') {
			window.parameterChanged(variableName, value);
		}
	}

	static minimize = function (){
		OPC.minimized = true;
		this.callParentFunction('OPC_minimized', OPC.minimized);
	}
	static expand = function (){
		OPC.minimized = false;
		this.callParentFunction('OPC_minimized', OPC.minimized);
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