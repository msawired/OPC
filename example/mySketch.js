// OPC SETUP
// You can easily create dynamic variables to use in your sketch.
// Read full documentation at https://github.com/msawired/OPC

// Example: Create a variable "radius" that can be controlled via a slider, with default value 250
OPC.slider('radius', 250);

//you can also provide the arguments in a single object, with optional additional arguments [label, description]
OPC.slider({
	name: 'stroke_weight',
	value: 3,
	min: 1,
	max: 10,
	step: 1,
	label: 'Circle Border',
	description: 'Changes the border size of the circle'
});

// OPC.toggle('has_stroke', true); //short version
OPC.toggle({
	name: 'has_stroke',
	value: true,
	label: 'Border Enabled?',
	description: 'Adds a border on the circles'
});

OPC.color('bg_color', '#ffffff'); //native color selector

// Some color palette options to choose from
let myPalettes = [
	["#eabfcb", "#c191a1", "#a4508b", "#5f0a87", "#2f004f"],
	["#c3dfe0", "#bcd979", "#9dad6f", "#7d6d61", "#5e574d"],
	["#4464ad", "#a4b0f5", "#f58f29", "#7d4600", "#466995"]
];
OPC.palette('palette', myPalettes);

// text input
OPC.text('my_text', '', 'Enter Title');

// simple select (dropdown) version with array
// OPC.select('circles', [5,4,3,2,1]);

// advanced select with key->value pairs. Key is used as label in UI.
OPC.select('circles', {"A Lot": 5,"Few": 3,"One": 1});

// for buttons, see ButtonPressed and ButtonReleased functions below
OPC.button('pauseButton', 'Press & Hold to Pause');



// REST OF THE SKETCH BELOW

let paused = false;
let freakDistanceMax = 120;
let freak = 0;


function setup() {
	createCanvas(windowWidth, windowHeight);
	strokeWeight(5);
	frameRate(5);
}

function draw() {
	if(!paused){
		radius++; //any updates to variables in your code will also be reflected on OPC interface
	}
	background(bg_color);
	stroke_weight ? strokeWeight(stroke_weight) : strokeWeight(1);
	has_stroke ? stroke('#333') : noStroke();
	fill(palette[0]);
	circle(width / 5 * 0.5, height / 2, radius);

	if (circles >= 2) {
		fill(palette[1]);
		circle(width / 5 * 1.5, height / 2, radius);
	}
	if (circles >= 3) {
		fill(palette[2]);
		circle(width / 5 * 2.5, height / 2, radius);
	}
	if (circles >= 4) {
		fill(palette[3]);
		circle(width / 5 * 3.5, height / 2, radius);
	}
	if (circles >= 5) {
		fill(palette[4]);
		circle(width / 5 * 4.5, height / 2, radius);
	}

	fill('#333');
	textAlign('center');
	textSize(100);
	text(my_text, width / 2, height / 2 + 30);
}

//parameterChanged function is used every time a parameter is updated.
function parameterChanged(variableName, newValue) {
	// print(variableName,newValue);
}

//BUTTON FUNCTIONS
//buttonPressed function is used every time a button is pressed.
function buttonPressed(variableName) {
	//you can check variableName if you have multiple buttons
	if (variableName == 'pauseButton') {
		paused = true;
	}
}

//buttonReleased function is used every time a button is released.
function buttonReleased(variableName) {
	if (variableName == 'pauseButton') {
		paused = false;
	}
}