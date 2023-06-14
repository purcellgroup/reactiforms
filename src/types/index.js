// dynamic instances for new form components
export const __FormStateInstances = new Map();

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
  value: "",
  runOnChange: null,
  touched: false,
  isValid: false,
  initialInputValue: null,
  validate: (fn) => {
    console.log("validate, THIS", this);
    if (fn) {
      if (fn(this)) {
        this.isValid = true;
      }
    } else {
      console.warn("Input validation function not provided");
    }
  },
  onChange: (e) => {
    console.warn("DEFAULT CHANGE FN, e: ", e);
  },
  onFocus: (fn) => {
    console.log("on focus THIS: ", this);
    this.touched = true;
    fn(this);
  },
  onBlur: (fn) => {
    console.log("on blur THIS: ", this);
    fn(this);
  },
});
