// dynamic instances for new form components
export const FORM_STATE_INSTANCES = new Map();

export const createDefaultFormOptions = () => ({
  //!! need submit logic
  handleSubmit: async (e) => {
    console.warn("Form submit function not provided");
  },
  //!! need validation logic
  //react spinner component
  spinner: null,
  //!! form state: changes, dirty fields, touched fields, reset function
  resetForm: null,
  // todo: input overloads. these are functions applied to all inputs
  // todo: in form by default
  inputUtils: {},
  // todo: submit suspense flag
  suspense: true,
  suspenseDelay: 2500,
});

// todo: extract function defs and flatten
export const createDefaultInputOptions = () => ({
  id: "",
  className: "",
  inputName: "",
  disabled: false,
  type: "text",
  name: "",
  runOnChange: null,
  touched: false,
  isValid: false,
  initialInputValue: "",
  validate: null,
});
