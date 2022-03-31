# OpenProcessing Configurator 3000

This is a helper library that allows sketches on OpenProcessing to provide a UI to play with dynamic variables in their sketches. At the moment, UI components are only displayed if sketch is viewed on OpenProcessing, otherwise they are ignored and variables are set to 'defaultValue'.

## Example

Example below will display a range slider that you can change live while playing your sketch. 

```
//var radius = 10; //instead of defining a variable, use below
OPC.slider('radius', 10);

function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
}

function draw() {
	circle(mouseX, mouseY, radius);
}
```

## Available Options

### Slider

Displays a range slider that user can change. 

```
OPC.slider(variableName, defaultValue, [min], [max], [step]);
```
**Example**
```
OPC.slider('radius', 10, 1, 100, 1);
```

**Defaults**
min: 0
max: 2*defaulValue
step: defaultValue/10 (divides the slider to 10 steps)

### Toggle

Displays a true/false toggle. Also support values 1/0. 

```
OPC.toggle(variableName, defaultValue);
//example: OPC.toggle('hasFill', false);
```

**Defaults**
defaultValue: true

### Text
Displays a single-line text entry field. Optional placeholder text is displayed if there is no text in the text field.

```
OPC.text(variableName, defaultValue, [placeholder]);
```
**Example**
```
OPC.text('my_text', '', 'Enter Title');
```

### Color

Displays a single color selector. Uses the native browser color picker, so the interface may vary. Hex values are recommended. Alpha values are not supported.

```
OPC.color(variableName, defaultValue);
//example: OPC.color('bg_color', '#ffffff');
```

**Default values**
defaultValue: #333333

### Color Palette

Allows user to switch color palette used. Each pallete is an array of colors (HEX values). 'defaultValue' may be set to something else other that the ones provided in the array, however, is not recommended since user will not be able to use it again after changing the pallete.

```
OPC.color(variableName, defaultValue, palleteOptions);
```

**Defaults**

None.

**Example**

```
OPC.palette('palette', 
["#eabfcb", "#c191a1", "#a4508b", "#5f0a87", "#2f004f"],
[
	["#eabfcb", "#c191a1", "#a4508b", "#5f0a87", "#2f004f"],
	["#c3dfe0", "#bcd979", "#9dad6f", "#7d6d61", "#5e574d"],
	["#4464ad", "#a4b0f5", "#f58f29", "#7d4600", "#466995"]
]);
```
