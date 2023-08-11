import type {
  DefaultForm,
  Input,
  FormValues,
  FormInputs,
  FormComponent,
  MutationAction,
  UnregisterInput,
  FormInstance,
} from "./types";
import { _useInput, InputFactory, FormFactory } from "./react_adapters";

// copy of store for mutations
// export let FORM_STORE_INSTANCES: Map<number, Form> = new Map();
// let NEXT_FORM_STORE_INSTANCES: Map<number, Form> = FORM_STORE_INSTANCES;

// let FORM_COUNTER = 0;

// const UNSUB_FORM = (formId: number) => {
//   GEN_MUTABLE_STORE();

//   NEXT_FORM_STORE_INSTANCES.delete(formId);
//   FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
// };

// const SUB_FORM = (formId: number, form: Form) => {
//   GEN_MUTABLE_STORE();
//   NEXT_FORM_STORE_INSTANCES.set(formId, form);
//   FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
// };

// const GEN_MUTABLE_STORE = () => {
//   if (NEXT_FORM_STORE_INSTANCES === FORM_STORE_INSTANCES) {
//     NEXT_FORM_STORE_INSTANCES = new Map();
//     FORM_STORE_INSTANCES.forEach((value, key) => {
//       NEXT_FORM_STORE_INSTANCES.set(key, value);
//     });
//   }
// };

let inputCounter: number = 0;
let inputs = new Map<string | number, Input>();
let nextInputs = new Map<string | number, Input>();

//! debugging only
export function inspectInputMap() {
  return inputs
}

const mutate_global_inputs = ({ action, key, newInput }: MutationAction) => {
  // only one function can mutate global inputs
  // map values must always be type Input
  // fail loud

  try {
    switch (action) {
      case "add": {
        if (!newInput) throw Error("adding input with no newInput");
        const newInputCount = inputCounter + 1;

        // handle no given key
        if (key !== null) {
          inputs.set(key, newInput);
        } else {
          inputs.set(newInputCount, newInput);
        }

        inputCounter = newInputCount;
        return key ?? newInputCount;
      }
      case "delete": {
        if (key === null) throw Error("null key");
        const newInputCount = inputCounter - 1;
        inputs.delete(key);
        inputCounter = newInputCount;
        return newInputCount;
      }
      case "update": {
        if (!newInput || key === null) throw Error("invalid data in update");
        inputs.set(key, newInput);
        return key;
      }
      default:
        throw Error(`Invalid Action: "${action}"`);
    }
  } catch (error) {
    throw new Error("mutation failed in `mutate_global_inputs`");
  }
};

const inputSubscribers = new Map<string | number, Set<React.Dispatch<Input>>>();

export const subscribeToInput = (
  key: string | number,
  dispatch: React.Dispatch<Input>
) => {
  const subscriberSet = inputSubscribers.get(key);
  if (subscriberSet) subscriberSet.add(dispatch);

  // unsubscribe to input
  return (key: string | number) => {
    inputSubscribers.delete(key);
  };
};

export const broadcastToSubscribers = (key: string | number) => {
  const inputSet = inputSubscribers.get(key);
  const inputVal = inputs.get(key);
  if (inputSet && inputVal) {
    inputSet.forEach((dispatch) => dispatch(inputVal));
  }
};

export const registerInput = (
  key: number | string | null,
  input: Input
): UnregisterInput => {
  const inputId = mutate_global_inputs({ action: "add", key, newInput: input });

  //unregister input from map
  return {
    newInputId: inputId,
    unregister: (key: number | string) =>
      mutate_global_inputs({ action: "delete", key }),
  };
};

export const updateInputMap = (key: number | string, newState: Input) => {
  mutate_global_inputs({ action: "update", key, newInput: newState });
};

export function FormInstance(config: Record<string, any>): FormInstance {
  return {
    // formId: GEN_FORM_ID(),
    options: GEN_FORM_OPTIONS(config),
    _inputMap: (): typeof inputs => inputs,
    resetForm: () => resetFormValues(inputs),
    getFormValues: () => getFormValues(inputs),
    getFormInputs: () => getFormInputs(inputs),
    isFormValid: () => validateForm(inputs),
    getInput,
    ...config,
  };
}

export function createForm(config: Record<string, any>): FormInstance {
  const form = FormInstance(config);
  form.Input = InputFactory(form);
  form.Form = FormFactory(form);
  // form.useInput = _useInput(getInput, subscribeToInput);
  return form;
}

// export class Form {
//   public formId: number;
//   public options: DefaultForm;
//   public resetForm: () => void;
//   public getFormValues: () => FormValues;
//   public getFormInputs: () => FormInputs;
//   public isFormValid: () => boolean;
//   public Input: () => void;
//   public FormProvider: FormComponent;
//   public getInput: (id: string) => Input | undefined;
//   public useInput: (id: string) => Input | null;

//   private _inputCounter: number;
//   private _inputs: InputMap;
//   private _next_inputs: InputMap;
//   private _map_inputs_to_next: () => void;
//   private _register_input: (k: string, i: Input) => void;
//   private _unregister_input: (k: string) => void;
//   private _input_writes_to_map: () => void;

//   constructor(config?: Record<string, any>) {
//     if (
//       config === null ||
//       typeof config !== "object" ||
//       config.constructor !== Object
//     ) {
//       throw new Error(
//         "Invalid config object given to Form. Only plain objects (key-value pairs) are accepted."
//       );
//     }

//     this.formId = GEN_FORM_ID();
//     this.options = GEN_FORM_OPTIONS(config);

//     this.resetForm = () => resetFormValues(this._inputs);

//     this.getFormValues = () => getFormValues(this._inputs);

//     this.getFormInputs = () => getFormInputs(this._inputs);

//     this.getInput = (id: string) => this._inputs.get(id);

//     this.isFormValid = () => validateForm(this._inputs);

//     this.Input = _createInput(this);

//     this.FormProvider = _createForm(this);

//     this.useInput = (id: string) => _useInput(id, this._inputs.get(id));

//     this._inputCounter = 0;
//     this._inputs = new Map();
//     this._next_inputs = this._inputs;

//     this._map_inputs_to_next = () => {
//       if (this._next_inputs === this._inputs) {
//         this._next_inputs = new Map();
//         this._inputs.forEach((value, key) => {
//           this._next_inputs.set(key, value);
//         });
//       }
//     };

//     this._register_input = (key, input) => {
//       this._inputCounter = this._inputCounter + 1;
//       this._map_inputs_to_next();
//       this._next_inputs.set(key, input);
//       this._inputs = this._next_inputs;
//     };

//     this._unregister_input = (key) => {
//       this._inputCounter = this._inputCounter - 1;
//       this._map_inputs_to_next();
//       this._next_inputs.delete(key);
//       this._inputs = this._next_inputs;
//     };

//     // this._input_writes_to_map = function (key) {};

//     SUB_FORM(this.formId, this);
//   }
// }

// const GEN_FORM_ID = () => {
//   ++FORM_COUNTER;
//   return FORM_COUNTER;
// };

const GEN_FORM_OPTIONS = (
  config: Record<string, any>
): DefaultForm & Record<string, any> => ({
  requireSpinner: false,
  spinner: null,
  suspense: false,
  spinnerTimeout: null,
  handleSubmit: () => {
    console.warn("Form's handleSubmit not provided");
  },
  ...config,
});

//assign stable refs to hooks and insulate from rerenders
// export const genStore = (stateOverloads) => {
//   let unique_store = null;
//   return () => {
//     if (!unique_store) unique_store = GEN_FORM_STORE(stateOverloads);
//     return unique_store;
//   };
// };

// export const createFormStore = (initialFormOptions) => {
//   const store = genStore(initialFormOptions);
//   return store();
// };

// // stabilized memo across renders
// export const GEN_STABLE_REF = (value = null) => {
//   const _ref = null;
//   return () => {
//     if (!_ref) {
//       _ref = { current: value ? value : null };
//     }
//     return _ref;
//   };
// };
// export const createStableRef = (value) => {
//   const _ = GEN_STABLE_REF();
// };
// export const useStableRef = (value) => createStableRef(value);

// reset inputs in specific form store
// !! param is a map
export const resetFormValues = (_inputs: typeof inputs) => {
  _inputs.forEach((input: Input) => {
    if (input.setter)
      input.setter((s: Input) => ({
        ...s,
        value: input.initialInputValue,
        isValid: false,
      }));
  });
};

// return input values of specific form
export const getFormValues = (_inputs: typeof inputs) =>
  Array.from(_inputs).reduce((acc: FormValues, [id, input]): FormValues => {
    acc[id] = input.value;
    return acc;
  }, {});

export const getFormInputs = (_inputs: typeof inputs): FormInputs => {
  if (_inputs.size) {
    return Object.fromEntries(_inputs);
  } else {
    console.warn(
      "Either this Form has no Input children or `getFormInputs` is running before the Form's Inputs are registered. \n"
    );
    return {};
  }
};

export function getInput(id: any): Input | undefined {
  return inputs.get(id);
}

export const validateForm = (_inputs: typeof inputs) =>
  Array.from(_inputs.entries()).every(([, input]) => input.isValid);

// function subscribeToInput(form) {
//   return function(inputId, fn) {
//     form._inputSubscribers.set(inputId, fn)
//   }
// }

// function unsubscribeToInput(form) {
//   return function(inputId) {

//   }
// }

// function broadcastToSubscribers(form) {
//   return function(inputId) {
//     form._inputSubscribers.forEach()
//   }
// }

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
  debounce: 1300,
});
