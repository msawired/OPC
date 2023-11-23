// This is an example client that can be used to test the OPC. You can customize this to adjust the UI to your needs.

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
  })

  let createId = () => Math.random().toString(36).substring(2, 6);

  let createControlContainer = (description) => {
    let wrapper = document.createElement("div");
    wrapper.classList.add("opc-control-wrapper");

    if (description) {
      let desc = document.createElement("div");
      desc.classList.add("opc-description");
      desc.textContent = description;
      wrapper.appendChild(desc);
    }
    let inputContainer = document.createElement("div");
    inputContainer.classList.add("opc-control");
    wrapper.appendChild(inputContainer);
    return [wrapper, inputContainer];
  };

  let _opcCreateSlider = (option, controlsElem) => {
    let id = "slider-" + createId();
    let [wrapper, container] = createControlContainer(option.description);

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.label ?? option.name;

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
    controlsElem.appendChild(wrapper);
  };

  let _opcCreateToggle = (option, controlsElem) => {
    let id = "slider-" + createId();
    let [wrapper, container] = createControlContainer(option.description);

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.label ?? option.name;

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
    controlsElem.appendChild(wrapper);
  }

  let _opcCreateText = (option, controlsElem) => {
    let id = 'text-' + createId();
    let [wrapper, container] = createControlContainer(option.description);

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.label ?? option.name;

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
    controlsElem.appendChild(wrapper);
  }

  let _opcCreateSelect = (option, controlsElem) => {
    let id = 'select-' + createId();
    let [wrapper, container] = createControlContainer(option.description);

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.label ?? option.name;

    const selectInput = document.createElement("select");
    selectInput.id = id;
    selectInput.value = option.value;

    if (Array.isArray(option.options)) {
      for (let value of option.options) {
        let optionElem = document.createElement("option");
        optionElem.value = value;
        optionElem.textContent = value;
        selectInput.appendChild(optionElem);
      }
    } else {
      for (let [key, value] of Object.entries(option.options)) {
        let optionElem = document.createElement("option");
        optionElem.value = value;
        optionElem.textContent = key;
        selectInput.appendChild(optionElem);
      }
    }

    selectInput.addEventListener('change', () => {
      OPC.set(option.name, selectInput.value);
    })

    opcControlEvents[option.name] ||= [];
    opcControlEvents[option.name].push((v) => {
      selectInput.value = v;
    });

    container.appendChild(label);
    container.appendChild(selectInput);
    controlsElem.appendChild(wrapper);
  }

  let _opcCreateColorPicker = (option, controlsElem) => {
    let id = 'text-' + createId();
    let [wrapper, container] = createControlContainer(option.description);

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.label ?? option.name;

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
    controlsElem.appendChild(wrapper);
  }

  let _opcCreateButton = (option, controlsElem) => {
    let id = 'text-' + createId();
    let [wrapper, container] = createControlContainer(option.description);

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
    controlsElem.appendChild(wrapper);
  }

  let _opcCreatePalettePicker = (option, controlsElem) => {
    let id = 'text-' + createId();
    let [wrapper, container] = createControlContainer(option.description);

    let label = document.createElement("label");
    label.setAttribute("for", id);
    label.textContent = option.label ?? option.name;

    let selected = option.options.indexOf(option.value);

    const paletteElem = document.createElement("div");
    paletteElem.classList.add("opc-palette-container");
    let palettes = [];
    for (let palette of option.options) { // noprotect
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
    controlsElem.appendChild(wrapper);
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
        case "select":
          _opcCreateSelect(option, controlsElem);
          break;
        default:
          console.warn(`OPC Control type ${option.type} not supported`);
      }
    })
  }
}
