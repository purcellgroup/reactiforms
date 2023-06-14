// dynamic instances for new form components
export const __FormStateInstances = new Map();

export const defaultFormOptions = {
  //!! need submit logic
  handleSubmit: async () => {
    console.warn("Form submit function not provided");
  },
  //!! need validation logic
  //react spinner component
  spinner: null,
  //!! form state: changes, dirty fields, touched fields, reset function
  resetForm: null,
};

// todo: extract function defs and flatten
export const defaultInputOptions = {
  //!! field/button disabling
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
  validate: function (fn) {
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
  onFocus: function (fn) {
    this.touched = true;
    fn(this);
  },
  onBlur: function (fn) {
    fn(this);
  },
};
