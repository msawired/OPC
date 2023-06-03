if (window.OPC || typeof OPC === "function") {
  let controlsElem;

  // Hold events triggered when value changes
  let opcControlEvents = {};

  // Delay the construction of the elements until DOM is loaded
  let delay = (fn) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // In OP, this is loaded after the document is fully loaded, execute immediately
      fn()
    } else {
      // In standalone, wait for the document DOM to load
      document.addEventListener("DOMContentLoaded", fn, false);
    }
  }

  delay(() => {
    // Create controls element
    controlsElem = document.createElement("div");

    controlsElem.id = "opc-control-panel";
    document.body.appendChild(controlsElem);

    // Insert custom CSS. Perhaps this will go better in an optional CSS
    const style = document.createElement("style");
    style.textContent = `
      #opc-control-panel {
        position: absolute;
        top: 0px;
        right: 10px;
        padding: 1em;
        background-color: #ffffff;
        color: #333;
        border: 1px solid #000000;
        border-radius: 10px;
        z-index: 9999;
        width: 300px;
        display: flex;
        font-family: Montserrat, Helvetica, Arial, sans-serif;
        font-size: 13px;
        box-shadow: 2px 2px 4px #999;
        flex-direction: column;
      }
      #opc-control-panel .opc-control {
        display: flex;
        align-items: center;
        margin-bottom: 0.7em;
      }
      #opc-control-panel .opc-control:last-child {
        margin-bottom: 0;
      }
      #opc-control-panel .opc-control label {
        flex: 0 0 40%;
        text-transform: uppercase;
      }
      #opc-control-panel input {
        display: block;
        margin-left: auto;
      }
      #opc-control-panel input[type=number] {
        width: 3em;
        padding: 5px;
        margin-right: 3px;
      }
      #opc-control-panel input[type=checkbox] {
        transform: scale(1.2);
      }
      #opc-control-panel input[type=text] {
        flex: 1;
      }
      #opc-control-panel input[type=button] {
        flex: 1;
        padding: 0.2em 0.5em;
      }
      #opc-control-panel .opc-palette-container {
        flex: 1;
        height: 1.5em;
      }
      #opc-control-panel .opc-palette {
        display: none;
        height: 100%;
      }
      #opc-control-panel .opc-palette.active {
        display: flex;
      }
      #opc-control-panel .opc-palette .opc-palette-color {
        flex: 1;
      }
    `;
    document.head.appendChild(style);
  })

  let createId = () => Math.random().toString(36).substring(2, 6);

  let _opcCreateSlider = (option, controlsElem) => {
    let id = "slider-" + createId();
    let container = document.createElement("div");
    container.classList.add("opc-control");

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.name;

    const numInput = document.createElement("input");
    numInput.id = "num-" + id;
    numInput.type = "number";
    numInput.min = option.min;
    numInput.max = option.max;
    numInput.value = option.value;

    const slider = document.createElement("input");
    slider.id = id;
    slider.type = "range";
    slider.min = option.min;
    slider.max = option.max;
    slider.value = option.value;
    slider.step = option.step;

    numInput.addEventListener('input', () => {
      slider.value = numInput.value;
      OPC.set(option.name, numInput.value);
    });

    slider.addEventListener('input', () => {
      numInput.value = slider.value;
      OPC.set(option.name, slider.value);
    });

    opcControlEvents[option.name] ||= [];
    opcControlEvents[option.name].push((v) => {
      numInput.value = v;
      slider.value = v;
    });

    container.appendChild(label);
    container.appendChild(numInput);
    container.appendChild(slider);
    controlsElem.appendChild(container);
  };

  let _opcCreateToggle = (option, controlsElem) => {
    let id = "slider-" + createId();
    let container = document.createElement("div");
    container.classList.add("opc-control");

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.name;

    const toggleButton = document.createElement("input");
    toggleButton.id = id;
    toggleButton.type = "checkbox";
    toggleButton.classList.add("opc-toggle");
    toggleButton.checked = !!option.value;

    toggleButton.addEventListener('change', () => {
      OPC.set(option.name, toggleButton.checked);
    });

    opcControlEvents[option.name] ||= [];
    opcControlEvents[option.name].push((v) => {
      toggleButton.checked = v;
    });

    container.appendChild(label);
    container.appendChild(toggleButton);
    controlsElem.appendChild(container);
  }

  let _opcCreateText = (option, controlsElem) => {
    let id = 'text-' + createId();
    let container = document.createElement("div");
    container.classList.add("opc-control");

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.name;

    const textInput = document.createElement("input");
    textInput.id = id;
    textInput.type = "text";
    textInput.maxLength = option.max;
    textInput.minLength = 0;
    textInput.placeholder = option.placeholder;
    textInput.value = option.value;

    textInput.addEventListener('input', () => {
      OPC.set(option.name, textInput.value);
    })

    opcControlEvents[option.name] ||= [];
    opcControlEvents[option.name].push((v) => {
      textInput.value = v;
    });

    container.appendChild(label);
    container.appendChild(textInput);
    controlsElem.appendChild(container);
  }

  let _opcCreateColorPicker = (option, controlsElem) => {
    let id = 'text-' + createId();
    let container = document.createElement("div");
    container.classList.add("opc-control");

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.name;

    const colorInput = document.createElement("input");
    colorInput.id = id;
    colorInput.type = "color";
    colorInput.value = option.value;

    colorInput.addEventListener('input', () => {
      OPC.set(option.name, colorInput.value);
    });

    // TODO: Implement sync back of color variable. May be tricky for non RGB schemes
    container.appendChild(label);
    container.appendChild(colorInput);
    controlsElem.appendChild(container);
  }

  let _opcCreateButton = (option, controlsElem) => {
    let id = 'text-' + createId();
    let container = document.createElement("div");
    container.classList.add("opc-control");

    const buttonElem = document.createElement("input");
    buttonElem.id = id;
    buttonElem.type = "button";
    buttonElem.value = option.value;

    buttonElem.addEventListener('touchstart', () => {
      OPC.buttonPressed(option.name, buttonElem.value);
    });
    buttonElem.addEventListener('mousedown', () => {
      OPC.buttonPressed(option.name, buttonElem.value);
    });
    buttonElem.addEventListener('touchend', () => {
      OPC.buttonReleased(option.name, buttonElem.value);
    });
    buttonElem.addEventListener('click', () => {
      OPC.buttonReleased(option.name, buttonElem.value);
    });

    container.appendChild(buttonElem);
    controlsElem.appendChild(container);
  }

  let _opcCreatePalettePicker = (option, controlsElem) => {
    let id = 'text-' + createId();
    let container = document.createElement("div");
    container.classList.add("opc-control");

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.name;

    let selected = option.options.indexOf(option.value);

    const paletteElem = document.createElement("div");
    paletteElem.classList.add("opc-palette-container");
    let palettes = [];
    for (let palette of option.options) {
      let paletteContainer = document.createElement("div");
      paletteContainer.classList.add("opc-palette");
      if (option.value === palette) {
        paletteContainer.classList.add("active");
      }
      for (let color of palette) {
        let colorElem = document.createElement("div");
        colorElem.classList.add("opc-palette-color");
        colorElem.style.backgroundColor = color;
        paletteContainer.append(colorElem);
        colorElem.addEventListener;
      }
      palettes.push(paletteContainer);
      paletteContainer.addEventListener('click', () => {
        selected = (selected + 1) % option.options.length;
        for (let p of palettes) {
          p.classList.remove("active");
        }
        palettes[selected].classList.add("active");
        OPC.set(option.name, option.options[selected]);
      });
      paletteElem.append(paletteContainer);
    }

    // TODO: Implement sync back of palette variable
    container.appendChild(label);
    container.appendChild(paletteElem);
    controlsElem.appendChild(container);;
  }

  window.addEventListener('message', (event) => {
    try {
      if (event.data && event.data.messageType === 'OPC') {
        let listeners = opcControlEvents[event.data.message.name];
        if (listeners) {
          for (let listener of listeners) {
            listener(event.data.message.value);
          }
        }
      }
    } catch {
      // No-op - ignore error
    }
  })

  // Decorate OPC functions
  let _opcInitVariable = OPC.initVariable;
  OPC.initVariable = (option) => {
    delay(() => {
      _opcInitVariable.call(OPC, option);
      switch (option.type) {
        case "slider":
          _opcCreateSlider(option, controlsElem);
          break;
        case "toggle":
          _opcCreateToggle(option, controlsElem);
          break;
        case "text":
          _opcCreateText(option, controlsElem);
          break;
        case "color":
          _opcCreateColorPicker(option, controlsElem);
          break;
        case "button":
          _opcCreateButton(option, controlsElem);
          break;
        case "palette":
          _opcCreatePalettePicker(option, controlsElem);
          break;
        default:
          console.warn(`OPC Control type ${option.type} not supported`);
      }
    })
  }
}
