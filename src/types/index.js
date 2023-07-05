

export const createDefaultFormOptions = () => ({
  //react spinner component
  requireSpinner: true,
  spinner: null,
  // todo form state: changes, dirty fields, touched fields, reset function
  resetForm: null,
  // todo: input overloads. these are functions applied to all inputs
  // todo: in form by default
  inputUtils: {},
  // todo: submit suspense flag
  suspense: true,
  suspenseDelay: 2500,
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
  runOnBlur: null,
  runOnHover: null,
  setter: null,
  _counter: 0,
});
