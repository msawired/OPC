# OpenProcessing Configurator 3000

This is a helper library that allows sketches on OpenProcessing to provide a UI to play with dynamic variables in their sketches. At the moment, UI components are only displayed if sketch is viewed on OpenProcessing, otherwise they are ignored and variables are set to 'defaultValue'.

## Example

See the full demo on [OpenProcessing](https://openprocessing.org/sketch/1532131).

A simple example below will display a range slider that you can change live while playing your sketch. 

```js
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

```js
OPC.slider(variableName, defaultValue, [min], [max], [step]);
```

**Example**

```js
OPC.slider('radius', 10, 1, 100, 1);
```

**Defaults**

min: 0

max: 2*defaulValue

step: defaultValue/10 (divides the slider to 10 steps)

### Toggle

Displays a true/false toggle. Also support values 1/0. 

```js
OPC.toggle(variableName, defaultValue);
//example: OPC.toggle('hasFill', false);
```

**Defaults**
defaultValue: true

### Text

Displays a single-line text entry field. Optional placeholder text is displayed if there is no text in the text field.

```javascript
OPC.text(variableName, defaultValue, [placeholder]);
```

**Example**

```javascript
OPC.text('my_text', '', 'Enter Title');
```

### Button

Displays a button. You should use buttonPressed and/or buttonReleased events (see below) to detect user interaction. For simple interactions, using buttonReleased function should suffice.
**buttonText** parameter is used in the button text, and it is also set as the default value for the button variable.

```javascript
OPC.button(variableName, buttonText);
//example: OPC.button('myButton', 'Click Me!');
```

**Default values**
defaultValue: #333333

### Color

Displays a single color selector. Uses the native browser color picker, so the interface may vary. Hex values are recommended. Alpha values are not supported.

```javascript
OPC.color(variableName, defaultValue);
//example: OPC.color('bg_color', '#ffffff');
```

**Default values**
defaultValue: #333333

### Color Palette

Allows user to switch color palette used. Each pallete is an array of colors (HEX values). 'defaultValue' may be set to something else other that the ones provided in the array, however, is not recommended since user will not be able to use it again after changing the pallete.

```javascript
OPC.palette(variableName, defaultValue, palleteOptions);
```

**Defaults**

None

**Example**

```javascript
OPC.palette('palette',
    ["#eabfcb", "#c191a1", "#a4508b", "#5f0a87", "#2f004f"],
    [
        ["#eabfcb", "#c191a1", "#a4508b", "#5f0a87", "#2f004f"],
        ["#c3dfe0", "#bcd979", "#9dad6f", "#7d6d61", "#5e574d"],
        ["#4464ad", "#a4b0f5", "#f58f29", "#7d4600", "#466995"]
    ]);
```

## Events

### parameterChanged(variableName, value)

To get an alert everytime a variable changes, you can create "parameterChanged" function in your sketch. For example, if your sketch requires resizing when user changes a variable, you can use this function to get the alert and make necessary changes.

**Example**

```javascript
function parameterChanged(variableName, value) {
    if (variableName === 'canvasSize') {
        resizeCanvas(value, value);
        print('Canvas size updated');
    }
}
```

### buttonPressed([variableName], [value])

To get an alert everytime user presses a button. If you are using multiple buttons, you can differentiate by looking up the variableName. 

**Example**

```javascript
function buttonPressed(variableName, value) {
	if (variableName === 'myButton') {
		print('Button is pressed');
	}
}
```

### buttonReleased([variableName], [value])

To get an alert everytime user releases a pressed a button. If you are using multiple buttons, you can differentiate by looking up the variableName. 

**Example**

```javascript
function buttonPressed(variableName, value) {
	if (variableName === 'myButton') {
		print('Button is released');
	}
}
```


## Utilities

### collapse()

Collapses the OPC configurator panel.
**Example**

```javascript
OPC.collapse();
```

### expand()

Expands the OPC configurator panel.
**Example**

```javascript
OPC.expand();
```

### delete(variableName)

Deletes a variable and removes its UI component from the interface.
**Example**

```javascript
OPC.delete('myVariable');
```
