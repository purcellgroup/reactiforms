export const createDefaultFormOptions = () => ({
  //react spinner component
  requireSpinner: false,
  spinner: false,
  // todo form state: changes, dirty fields, touched fields
  // todo: input overloads. these are functions applied to all inputs
  // todo: in form by default
  inputUtils: {},
  // todo: submit suspense flag
  suspense: false,
  spinnerTimeout: null,
  handleSubmit: () => {
    console.warn("Form's handleSubmit not provided");
  },
});

// todo: extract function defs and flatten
export const createDefaultInputOptions = () => ({
  id: "",
  className: "",
  inputName: "",
  inputKey: null,
  disabled: false,
  type: "text",
  name: "",
  touched: false,
  isValid: false,
  initialInputValue: "",
  validate: null,
  runOnChange: null,
  runOnFocus: null,
  runOnTouch: null,
  runOnBlur: null,
  runOnInvalid: null,
  setter: null,
  debounce: 1300
});
