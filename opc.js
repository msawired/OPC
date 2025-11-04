/**
 * OpenProcessing Configurator (OPC) - A dynamic UI control system for creative coding
 * 
 * Provides a simple API to create interactive controls (sliders, toggles, colors, etc.)
 * that automatically generate UI elements and can be synchronized via OSC.
 * 
 * @example
 * // Create a slider control
 * let speed = OPC.slider('speed', 5, 0, 10, 0.1);
 * 
 * // Create an easing function
 * let myEase = OPC.ease('myEase', [
 *   { pX: 0, pY: 0, cX: 0.42, cY: 0 },
 *   { pX: 1, pY: 1, cX: 0.58, cY: 1 }
 * ]);
 */
class OPC {
	static options = {};
	
	/**
	 * Creates a new OPC instance
	 */
	constructor() {
		this.options = {};
		this.collapsed = false;
		this.osc = null;
	}

	/**
	 * Creates a slider control for numeric values
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {number} value - Initial value
	 * @param {number} [min=0] - Minimum value
	 * @param {number} [max=null] - Maximum value (defaults to value * 2)
	 * @param {number} [step=null] - Step increment (defaults to value / 10)
	 * @returns {number} The current value of the slider
	 * 
	 * @example
	 * // Simple slider
	 * let speed = OPC.slider('speed', 5, 0, 10, 0.1);
	 * 
	 * // Using config object
	 * let opacity = OPC.slider({
	 *   name: 'opacity',
	 *   value: 0.8,
	 *   min: 0,
	 *   max: 1,
	 *   step: 0.01,
	 *   label: 'Opacity Level',
	 *   description: 'Controls the transparency'
	 * });
	 */
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

	/**
	 * Creates a toggle (checkbox) control for boolean values
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {boolean} [value=true] - Initial boolean value
	 * @returns {boolean} The current state of the toggle
	 * 
	 * @example
	 * // Simple toggle
	 * let showGrid = OPC.toggle('showGrid', false);
	 * 
	 * // Using config object
	 * let debugMode = OPC.toggle({
	 *   name: 'debugMode',
	 *   value: false,
	 *   label: 'Debug Mode',
	 *   description: 'Show debug information'
	 * });
	 */
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

	/**
	 * Creates a color palette selector control
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {Array} options - Array of color arrays or color options
	 * @param {Array} [value=null] - Initial selected palette (defaults to first option)
	 * @returns {Array} The currently selected color palette
	 * 
	 * @example
	 * // Simple palette
	 * let colors = OPC.palette('colors', [
	 *   ['#FF0000', '#00FF00', '#0000FF'],
	 *   ['#FFFF00', '#FF00FF', '#00FFFF']
	 * ]);
	 * 
	 * // Using config object
	 * let theme = OPC.palette({
	 *   name: 'theme',
	 *   options: [
	 *     ['#1a1a1a', '#333333', '#666666'],
	 *     ['#ffffff', '#f0f0f0', '#e0e0e0']
	 *   ],
	 *   label: 'Color Theme',
	 *   description: 'Choose a color scheme'
	 * });
	 */
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
	/**
	 * Creates a color picker control
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {string} [value='#333333'] - Initial color value in hex format
	 * @returns {string} The current color value
	 * 
	 * @example
	 * // Simple color picker
	 * let bgColor = OPC.color('backgroundColor', '#FF0000');
	 * 
	 * // Using config object
	 * let strokeColor = OPC.color({
	 *   name: 'strokeColor',
	 *   value: '#0000FF',
	 *   label: 'Stroke Color',
	 *   description: 'Color for drawing strokes'
	 * });
	 */
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

	/**
	 * Creates a text input control
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {string} value - Initial text value
	 * @param {string} [placeholder=null] - Placeholder text
	 * @param {number} [maxChars=1000] - Maximum character limit
	 * @returns {string} The current text value
	 * 
	 * @example
	 * // Simple text input
	 * let title = OPC.text('title', 'My Artwork', 'Enter title...');
	 * 
	 * // Using config object
	 * let description = OPC.text({
	 *   name: 'description',
	 *   value: '',
	 *   placeholder: 'Describe your work...',
	 *   maxChars: 500,
	 *   label: 'Description',
	 *   description: 'Brief description of the artwork'
	 * });
	 */
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
	/**
	 * Creates a button control that can trigger actions
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {string} [value=null] - Button label (defaults to variable name)
	 * @returns {string} The button's current value/label
	 * 
	 * @example
	 * // Simple button
	 * let resetBtn = OPC.button('reset', 'Reset Scene');
	 * 
	 * // Using config object
	 * let saveBtn = OPC.button({
	 *   name: 'save',
	 *   value: 'Save Image',
	 *   label: 'Save',
	 *   description: 'Save the current canvas as an image'
	 * });
	 */
	static button(variableNameOrConfig, value = null) {
		let variableName, label, description;
		if (typeof variableNameOrConfig === 'object') {
			variableName = variableNameOrConfig.name;
			value = variableNameOrConfig.value ?? value;
			label = variableNameOrConfig.label ?? label;
			description = variableNameOrConfig.description;
		} else {
			variableName = variableNameOrConfig;
			value = value ?? variableName;
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

	/**
	 * Creates a dropdown select control
	 * 
	 * @param {string|Object} variableNameOrConfig - Variable name or config object
	 * @param {Object|Array} options - Options object or array of values
	 * @param {*} [value=null] - Initial selected value (defaults to first option)
	 * @returns {*} The currently selected value
	 * 
	 * @example
	 * // Simple select with array
	 * let shape = OPC.select('shape', ['circle', 'square', 'triangle']);
	 * 
	 * // Select with object options
	 * let quality = OPC.select('quality', {
	 *   'Low': 1,
	 *   'Medium': 2,
	 *   'High': 3
	 * });
	 * 
	 * // Using config object
	 * let blendMode = OPC.select({
	 *   name: 'blendMode',
	 *   options: ['normal', 'multiply', 'screen', 'overlay'],
	 *   value: 'normal',
	 *   label: 'Blend Mode',
	 *   description: 'How shapes blend with background'
	 * });
	 */
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

	/**
	 * Creates a read-only label display
	 * 
	 * @param {string} variableName - Variable name for the label
	 * @param {*} [value=null] - Value to display
	 * @param {string} [description=null] - Optional description
	 * @returns {*} The current label value
	 * 
	 * @example
	 * // Simple label
	 * let frameCount = OPC.label('frameCount', 0);
	 * 
	 * // Label with description
	 * let fps = OPC.label('fps', 60, 'Current frames per second');
	 */
	static label(variableName, value = null, description = null) {
		this.options[variableName] = {
			name: variableName,
			type: 'label',
			label: variableName,
			value,
			description
		};
		return this.initVariable(this.options[variableName]);
	}

	/**
	 * Creates a title/heading display element
	 * 
	 * @param {string} title - The title text to display
	 * @param {string} [description=null] - Optional description text
	 * @returns {string} The title text
	 * 
	 * @example
	 * // Simple title
	 * OPC.title('Animation Settings');
	 * 
	 * // Title with description
	 * OPC.title('Color Controls', 'Adjust the color scheme of the artwork');
	 */
	static title(title, description = null) {
		this.options[title] = {
			name: title,
			type: 'title',
			value: title,
			description
		};
		return this.initVariable(this.options[title]);
	}


	/**
	 * Creates an interactive Bézier curve editor for custom easing functions
	 * 
	 * @param {string} functionName - Name of the Bézier function variable
	 * @param {Array} [anchors=null] - Array of anchor points with format [{pX, pY, cX, cY}, ...]
	 *   - pX, pY: Point coordinates (0-1 range)
	 *   - cX, cY: Control handle coordinates (0-1 range)
	 * @returns {Function} Bézier function that takes t (0-1) and returns eased value (0-1)
	 * 
	 * @example
	 * // Default ease-in-out
	 * let myBezier = OPC.bezier('myBezier');
	 * 
	 * // Custom Bézier curve
	 * let bounceBezier = OPC.bezier('bounceBezier', [
	 *   { pX: 0, pY: 0, cX: 0.25, cY: 0.46 },
	 *   { pX: 0.5, pY: 1.2, cX: 0.45, cY: 1.0 },
	 *   { pX: 1, pY: 1, cX: 0.75, cY: 0.8 }
	 * ]);
	 * 
	 * // Usage in animation
	 * let progress = myBezier(t); // t from 0 to 1
	 */
	static bezier(functionName, anchors = null) {
		if (!anchors) { //set default to ease-in-out
			anchors = [
				{ pX: 0, pY: 0, cX: 0.42, cY: 0 },
				{ pX: 1, pY: 1, cX: 0.58, cY: 1 }
			];
		}
		if (!Array.isArray(anchors) || anchors.length === 0 ||
			typeof anchors[0] !== 'object' || !('pX' in anchors[0])) {
			throw new Error('OPC.bezier expects anchor array format: [{pX, pY, cX, cY}, ...]');
		}

		this.options[functionName] = {
			name: functionName,
			type: 'bezier',
			value: anchors,
			marker: null,
			description: null
		};
		return this.initVariable(this.options[functionName]);
	}

	/* HELPER METHODS */

	/**
	 * Initializes a variable by creating a getter/setter property on the window object
	 * and notifying the parent frame about the new control
	 * 
	 * @private
	 * @param {Object} option - The option configuration object
	 * @returns {*} The initialized variable value
	 */
	static initVariable = function (option) {
		Object.defineProperty(window, option.name, {
			configurable: true,
			get: function () {
				if (option.type == 'bezier') {
					return OPC.getEaseFunction(option);
				}
				return OPC.options[option.name].value;
			},
			set: function (value) {
				OPC._set(option.name, value);
				if (OPC.osc) {
					OPC.oscSendMessage(option.name, value);
				}
			},
		});
		this.callParentFunction('OPC', option);
		return window[option.name];
	}

	/**
	 * Internal method to update a variable's value and notify listeners
	 * 
	 * @private
	 * @param {string} variableName - Name of the variable to update
	 * @param {*} value - New value to set
	 */
	static _set(variableName, value) {
		OPC.options[variableName].value = value;
		OPC.callParentFunction('OPC', OPC.options[variableName]);
		if (typeof window.parameterChanged == 'function') {
			window.parameterChanged(variableName, value);
		}
	}

	/**
	 * Programmatically sets the value of an OPC variable
	 * 
	 * @param {string} variableName - Name of the variable to update
	 * @param {*} value - New value to assign
	 * 
	 * @example
	 * // Update a slider value programmatically
	 * OPC.set('speed', 7.5);
	 * 
	 * // Update a toggle state
	 * OPC.set('showGrid', true);
	 */
	static set(variableName, value) {
		window[variableName] = value;
	}

	/**
	 * Handles button press events and triggers callback if defined
	 * 
	 * @param {string} variableName - Name of the button variable
	 * @param {*} value - Button value/label
	 */
	static buttonPressed(variableName, value) {
		OPC.options[variableName].value = value;
		if (typeof window.buttonPressed == 'function') {
			window.buttonPressed(variableName, value);
		}
	}
	/**
	 * Handles button release events and triggers callback if defined
	 * 
	 * @param {string} variableName - Name of the button variable
	 * @param {*} value - Button value/label
	 */
	static buttonReleased(variableName, value) {
		OPC.options[variableName].value = value;
		if (typeof window.buttonReleased == 'function') {
			window.buttonReleased(variableName, value);
		}
	}

	/**
	 * Collapses the OPC control panel UI
	 */
	static collapse() {
		OPC.collapsed = true;
		OPC.callParentFunction('OPC_collapsed', OPC.collapsed);
	}
	
	/**
	 * Expands the OPC control panel UI
	 */
	static expand() {
		OPC.collapsed = false;
		OPC.callParentFunction('OPC_collapsed', OPC.collapsed);
	}
	/**
	 * Removes an OPC variable and its control from the UI
	 * 
	 * @param {string} variableName - Name of the variable to delete
	 */
	static delete(variableName) {
		if (OPC.options[variableName]) {
			delete OPC.options[variableName];
			delete window[variableName];
			OPC.callParentFunction('OPC_delete', variableName);
		}
	}

	/* HELPER METHODS */

	/**
	 * Sends messages to the parent frame (OPC UI)
	 * 
	 * @private
	 * @param {string} functionName - Name of the function/event to call
	 * @param {*} [arg] - Data to pass with the message
	 */
	static callParentFunction(functionName, arg) {
		const msg = typeof arg === 'undefined' ? {} : arg;
		if (window.parent) {
			window.parent.postMessage({
				'messageType': functionName,
				'message': msg
			}, "*");
		}
	}

	/**
	 * Converts easing anchor points into a smooth easing function using Bézier curves
	 * 
	 * @private
	 * @param {Object} option - The ease option configuration
	 * @param {Array} option.value - Array of anchor points [{pX, pY, cX, cY}, ...]
	 * @returns {Function} Easing function that takes t (0-1) and returns eased value
	 */
	static getEaseFunction(option) {
		let anchors = option.value;
		// Accept anchors as JSON string or array of objects
		if (typeof anchors === 'string') {
			try { anchors = JSON.parse(anchors); } catch (e) { throw new Error('OPC.getEaseFunction: invalid JSON'); }
		}
		if (!Array.isArray(anchors) || anchors.length < 2) {
			throw new Error('OPC.getEaseFunction expects at least two anchors in format: [{pX,pY,cX,cY}, ...]');
		}
		// Basic validation and normalization
		anchors = anchors.map(a => {
			if (typeof a !== 'object' || !('pX' in a && 'pY' in a && 'cX' in a && 'cY' in a)) {
				throw new Error('OPC.getEaseFunction anchor missing one of pX,pY,cX,cY');
			}
			return {
				pX: +a.pX, pY: +a.pY,
				cX: +a.cX, cY: +a.cY
			};
		});

		// Flip the last anchor's control point outward if given as mirrored
		if (anchors.length > 1) {
			const last = anchors[anchors.length - 1];
			last.cX = 2 * last.pX - last.cX;
			last.cY = 2 * last.pY - last.cY;
		}

		// Ensure anchors are sorted by pX and within [0,1]
		anchors.sort((A, B) => A.pX - B.pX);
		if (anchors[0].pX !== 0 || anchors[anchors.length - 1].pX !== 1) {
			// allow slight float error
			if (Math.abs(anchors[0].pX - 0) > 1e-9 || Math.abs(anchors.at(-1).pX - 1) > 1e-9) {
				throw new Error('OPC.getEaseFunction: first pX must be 0 and last pX must be 1');
			}
		}
		for (let i = 1; i < anchors.length; i++) {
			if (anchors[i].pX < anchors[i - 1].pX - 1e-12) {
				throw new Error('OPC.getEaseFunction: pX values must be non‑decreasing');
			}
		}

		// Helper: mirror incoming control at the next anchor (anchor2)
		function incomingControlOf(anchor2) {
			// Second handle is the point symmetric to the provided handle of anchor2
			// i.e., c2 = (2*p2 - c2_provided)
			return [2 * anchor2.pX - anchor2.cX, 2 * anchor2.pY - anchor2.cY];
		}

		// Cubic Bézier evaluation for one segment
		function evalCubic(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
			const mt = 1 - t;
			const mt2 = mt * mt, mt3 = mt2 * mt;
			const t2 = t * t, t3 = t2 * t;
			const x = mt3 * p1x + 3 * mt2 * t * c1x + 3 * mt * t2 * c2x + t3 * p2x;
			const y = mt3 * p1y + 3 * mt2 * t * c1y + 3 * mt * t2 * c2y + t3 * p2y;
			return [x, y];
		}

		// dx/dt for cubic Bézier
		function evalDx(p1x, c1x, c2x, p2x, t) {
			const mt = 1 - t;
			return 3 * mt * mt * (c1x - p1x) + 6 * mt * t * (c2x - c1x) + 3 * t * t * (p2x - c2x);
		}

		// Precompute segments for speed
		const segments = [];
		for (let i = 0; i < anchors.length - 1; i++) {
			const a1 = anchors[i];
			const a2 = anchors[i + 1];
			const [c2x, c2y] = incomingControlOf(a2);
			segments.push({
				p1x: a1.pX, p1y: a1.pY,
				c1x: a1.cX, c1y: a1.cY,
				c2x, c2y,
				p2x: a2.pX, p2y: a2.pY
			});
		}

		// Locate the segment for a given x (assumes non‑decreasing pX)
		function findSegmentIndex(x) {
			// binary search
			let lo = 0, hi = segments.length - 1;
			if (x <= segments[0].p1x) return 0;
			if (x >= segments.at(-1).p2x) return segments.length - 1;
			while (lo <= hi) {
				const mid = (lo + hi) >> 1;
				const s = segments[mid];
				if (x < s.p1x) { hi = mid - 1; }
				else if (x > s.p2x) { lo = mid + 1; }
				else { return mid; }
			}
			return Math.max(0, Math.min(segments.length - 1, lo));
		}

		// Solve for t such that cubic.x(t) == targetX on the given segment
		function solveTforX(seg, targetX, eps = 1e-6) {
			const { p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y } = seg;

			// Handle edge exact hits
			if (Math.abs(targetX - p1x) <= eps) return 0;
			if (Math.abs(targetX - p2x) <= eps) return 1;

			// Initial guess using linear proportion within the segment
			let t = (targetX - p1x) / (p2x - p1x);
			t = t < 0 ? 0 : t > 1 ? 1 : t;

			// Newton iterations
			for (let i = 0; i < 10; i++) {
				const [x] = evalCubic(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t);
				const dx = evalDx(p1x, c1x, c2x, p2x, t);
				const err = x - targetX;
				if (Math.abs(err) <= eps) return t;
				if (Math.abs(dx) < 1e-12) break; // avoid divide by near‑zero
				t -= err / dx;
				if (t < 0) t = 0; else if (t > 1) t = 1;
			}

			// Bisection fallback (robust)
			let lo = 0, hi = 1, tMid = 0.5, xMid = 0;
			for (let i = 0; i < 40; i++) {
				tMid = 0.5 * (lo + hi);
				xMid = evalCubic(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, tMid)[0];
				if (Math.abs(xMid - targetX) <= eps) break;
				if (xMid > targetX) hi = tMid; else lo = tMid;
			}
			return tMid;
		}

		function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

		// Return easing function: y = f(t) where t in [0,1] is interpreted as x
		return function ease(t) {
			const x = clamp01(+t || 0);
			// exact boundaries
			if (x <= segments[0].p1x) {
				OPC.callParentFunction('OPC_bezier_marker', { name: option.name, x: segments[0].p1x, y: segments[0].p1y });
				return segments[0].p1y;
			}
			if (x >= segments.at(-1).p2x) {
				OPC.callParentFunction('OPC_bezier_marker', { name: option.name, x: segments.at(-1).p2x, y: segments.at(-1).p2y });
				return segments.at(-1).p2y;
			}

			const idx = findSegmentIndex(x);
			const seg = segments[idx];
			const tt = solveTforX(seg, x);
			const result = evalCubic(seg.p1x, seg.p1y, seg.c1x, seg.c1y, seg.c2x, seg.c2y, seg.p2x, seg.p2y, tt);
			// Send marker position once per bezier function call
			OPC.callParentFunction('OPC_bezier_marker', { name: option.name, x: result[0], y: result[1] });
			return result[1];
		};
	}

	/* OSC FUNCTIONS */

	/**
	 * Sets up OSC (Open Sound Control) integration for remote control of OPC variables
	 * 
	 * @param {string} server - WebSocket server URL (e.g., 'ws://localhost')
	 * @param {number} [port=null] - Optional port number
	 * 
	 * @example
	 * // Connect to OSC server
	 * OPC.setOSC('ws://localhost', 8080);
	 * 
	 * // Now OPC variables can be controlled via OSC messages
	 * // Send OSC message to /speed with value 7.5 to update speed slider
	 */
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

	/**
	 * Initializes the OSC WebSocket connection and sets up message handlers
	 * 
	 * @private
	 * @param {string} server - WebSocket server URL
	 * @param {number} [port=null] - Optional port number
	 */
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
			console.log('OSC connection closed. Trying again in 5 seconds...');
			//try again in 5 seconds
			setTimeout(function () {
				OPC.osc.open();
			}, 5000);

		});
		OPC.osc.on('error', function (error) {
			console.log('OSC connection error. Trying again in 5 seconds...');
			//try again in 5 seconds
			setTimeout(function () {
				OPC.osc.open();
			}, 5000);

		});
		OPC.osc.on('message', function (message) {
			//set variables based on message
			// console.log('OSC message:', message);
			if (message.address) {
				let variableName = message.address.slice(1); //remove the first slash
				if (OPC.options[variableName]) {
					if (message.args.length === 1) {
						let value = message.args[0];
						if (typeof message.args[0] === 'object') {
							value = message.args[0].value;
							if (message.args[0].type === 'f') {
								value = parseFloat(value);
							} else if (message.args[0].type === 'i') {
								value = parseInt(value);
							} else if (message.args[0].type === 's') {
								value = value.split(',');
							}
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
	/**
	 * Sends an OSC message with the specified variable name and value
	 * 
	 * @param {string} varName - Name of the variable (becomes OSC address)
	 * @param {*} value - Value to send (automatically typed for OSC)
	 * 
	 * @example
	 * // Send a float value
	 * OPC.oscSendMessage('speed', 5.5);
	 * 
	 * // Send a boolean (converted to integer)
	 * OPC.oscSendMessage('enabled', true); // sends 1
	 * 
	 * // Send an array (converted to comma-separated string)
	 * OPC.oscSendMessage('colors', ['#FF0000', '#00FF00']);
	 */
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


}