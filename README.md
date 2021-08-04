# OpenProcessing Configurator 3000
This is a helper library that allows sketches on OpenProcessing to provide a UI to play with dynamic variables in their sketches. At the moment, UI components are only displayed if sketch is viewed on OpenProcessing, otherwise they are ignored and variables are set to 'defaultValue'.

## Example
Example below will display a range slider that you can change live while playing your sketch. 
```
//var radius = 10; //instead of defining a variable, use below
OPC.slider('radius', 10, 0, 100, 1);

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
}

function draw() {
	ellipse(mouseX, mouseY, radius, radius);
}
```

## Available Functions
At the moment, only a few options are available, and more UI components are being added. Arguments in brackets are optional.

### Slider
Displays a range slider that user can change. 
```
OPC.slider(variableName, defaultValue, [min], [max], [step]);
```
Default values:
min: 0
max: 2*defaulValue
step: defaultValue/10
