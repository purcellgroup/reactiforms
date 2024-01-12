// Importing necessary modules from external file
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  Dispatch,
} from "react";
import {
  DefaultForm,
  Input,
  FormValues,
  FormInputs,
  UnregisterInput,
  FormInstance,
  InputComponent,
  FormContext,
  DefaultInput,
} from "./types";

// Default options for an input
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

// Form class encapsulating form management logic
export class Form {
  private inputCounter: number;
  private inputMap: Map<string | number, Input>;
  private subscriberMap: Map<string | number, Set<React.Dispatch<Input>>>;
  private FormContext: React.Context<FormContext>;

  constructor() {
    // Initialize form properties
    this.inputCounter = 0;
    this.inputMap = new Map();
    this.subscriberMap = new Map();
    this.FormContext = React.createContext({} as FormContext);
  }

  // Get the form context
  useFormContext = () => {
    return React.useContext(this.FormContext);
  };

  // Register an input in the form
  registerInput = (
    key: number | string | null,
    input: Input
  ): UnregisterInput => {
    const inputId = key ?? this.inputCounter + 1;
    this.inputMap.set(inputId, input);
    this.subscriberMap.set(inputId, new Set());

    // unregister input
    return {
      newInputId: inputId,
      unregister: (key: number | string) => {
        const inputMapError = !this.inputMap.delete(key);
        const subMapError = !this.subscriberMap.delete(key);
        if (inputMapError || subMapError)
          throw new Error("Unregister Error: Input does not exist.");
      },
    };
  };

  // Update an input in the form
  updateInput = (key: string | number, newInput: Input) => {
    if (!newInput || key === null)
      throw Error("Invalid data while updating inputMap");
    this.inputMap.set(key, newInput);
    return key;
  };

  //!! TODO: test
  // Subscribe to changes in an input
  subscribeToInput = (
    key: string | number,
    dispatch: React.Dispatch<Input>
  ) => {
    const subscriberSet = this.subscriberMap.get(key);

    if (!subscriberSet)
      throw new Error("Subscribe Error: subscriber map failed");

    subscriberSet.add(dispatch);
    
    // Unsubscribe to input changes
    return (dispatch: React.Dispatch<Input>) => {
      const fail = subscriberSet.delete(dispatch);
      if (fail) throw new Error("Failed unsubscribing from input.");
    };
  };

  //!! TODO: test
  // Broadcast changes to all subscribers of an input
  broadcastToSubscribers = (key: string | number) => {
    const inputSet = this.subscriberMap.get(key);
    const inputVal = this.inputMap.get(key);

    if (!inputSet || !inputVal)
      throw new Error("Broadcast Error: Input not found.");

    inputSet.forEach((dispatch) => dispatch(inputVal));
  };

  // Reset all inputs in the form
  resetForm = () => {
    this.inputMap.forEach((input: Input) => {
      if (input.setter)
        input.setter((s: Input) => ({
          ...s,
          value: input.initialInputValue,
          isValid: false,
        }));
    });
  };

  // Get the current values of all inputs in the form
  getFormValues = () => {
    return Array.from(this.inputMap).reduce(
      (acc: FormValues, [id, input]): FormValues => {
        acc[id] = input.value;
        return acc;
      },
      {}
    );
  };

  // Get all inputs in the form
  getFormInputs = (): FormInputs => {
    if (this.inputMap.size) {
      return Object.fromEntries(this.inputMap);
    } else {
      console.warn(
        "Either this Form has no Input children or `getFormInputs` is running before the Form's Inputs are registered. \n"
      );
      return {};
    }
  };

  //!! TODO: test
  // Get an input by ID
  getInput = (id: any): Input | undefined => {
    return this.inputMap.get(id);
  };

  // Check if the form is valid based on input validations
  isValid = () => {
    return Array.from(this.inputMap.entries()).every(
      ([, input]) => input.isValid
    );
  };

  // React component for the form
  Form = (props: React.DOMAttributes<any>) => {
    const C = this.FormContext;
    return (
      <C.Provider
        value={{
          inputMap: this.inputMap,
          subscriberMap: this.subscriberMap,
          updateInput: this.updateInput,
          registerInput: this.registerInput,
          subscribeToInput: this.subscribeToInput,
          broadcastToSubscribers: this.broadcastToSubscribers,
        }}
      >
        <form {...props}>{props.children}</form>
      </C.Provider>
    );
  };

  // TODO: adjust input factory for new form instance
  // todo: needs form properties and input register
  // React component for an input in the form
  Input = (props: Input) => {
    const _form = this.useFormContext();
    //props needs to be internally stable
    const {
      initialInputValue,
      runOnChange,
      runOnFocus,
      runOnTouch,
      runOnBlur,
      runOnInvalid,
      validate,
      ...restOfProps
    } = props;
    const key = useRef<null | string | number>(null);
    const touched = useRef<null | boolean>(null);
    const unregisterInput = useRef<UnregisterInput | null>(null);

    // handler overrides
    const change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // use fresh react state for runOnChange
      setInputState((s: Input): Input => {
        const newState: Input = {
          ...s,
          value: e.target.value,
          isValid:
            validate && isFunction(validate) ? validate(e.target.value) : null,
        };
        if (runOnChange && isFunction(runOnChange)) runOnChange(newState, e);
        if (key.current !== null) _form.broadcastToSubscribers(key.current);
        return newState;
      });
    }, []);

    const focus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setInputState((s: Input): Input => {
        const newState: Input = { ...s, touched: true };
        if (runOnFocus && isFunction(runOnFocus)) runOnFocus(newState, e);
        if (!touched.current) {
          touched.current = true;
          if (runOnTouch && isFunction(runOnTouch)) runOnTouch(newState, e);
        }
        return newState;
      });
    }, []);

    const blur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setInputState((s: Input): Input => {
        const newState: Input = {
          ...s,
        };
        if (runOnBlur && isFunction(runOnBlur)) runOnBlur(newState, e);
        return newState;
      });
    }, []);

    const [inputState, _setInputState] = useState<Input>({
      ...createDefaultInputOptions(),
      ...props,
      value: initialInputValue || "",
      onChange: change,
      onFocus: focus,
      onBlur: blur,
    });

    const setInputState = useCallback(
      (val: Input | ((s: Input) => Input)) => {
        // write to input in map while react state updates
        _setInputState((s: Input): Input => {
          // callbacks are expected to return an Input type
          const newState = typeof val === "function" ? val(s) : val;
          if (key.current !== null) _form.updateInput(key.current, newState);
          return newState;
        });
      },
      [key, _form]
    );

    useEffect(() => {
      // registers this input
      let registeredInput: UnregisterInput;
      if (key.current === null) {
        if (props.id) {
          key.current = props.id;
          registeredInput = _form.registerInput(key.current, inputState);
        } else {
          registeredInput = _form.registerInput(null, inputState);
          key.current = registeredInput.newInputId;
        }

        setInputState((s) => ({
          ...s,
          setter: setInputState,
          inputKey: key.current,
        }));
      }

      //cleanup input from form instance
      return () => {
        if (unregisterInput.current) {
          const { unregister, newInputId } = unregisterInput.current;
          unregister(newInputId);
        }
      };
    }, []);

    return (
      <input
        value={inputState.value}
        onChange={change}
        onFocus={focus}
        onBlur={blur}
        onInvalid={runOnInvalid ?? undefined}
        {...restOfProps}
      />
    );
  };

  // Create a public form instance
  createPublicForm = (): FormInstance => {
    return {
      resetForm: this.resetForm,
      getFormValues: this.getFormValues,
      getFormInputs: this.getFormInputs,
      getInput: this.getInput,
      isValid: this.isValid,
      Form: this.Form,
      Input: this.Input,
    };
  };
}

// Factory function to create a form instance
export function createForm(): FormInstance {
  return new Form().createPublicForm();
}

// Check if a given value is a function
export const isFunction = (fn: any): fn is Function => {
  if (typeof fn === "function") return true;
  console.error(new Error("Optional handlers must be functions."));
  return false;
};

// Infrastructure for possible larger form pub/sub if necessary
// Copy of store for mutations
// A map to store instances of forms
export let FORM_STORE_INSTANCES: Map<number, Form> = new Map();
// A copy of the form store for mutations
let NEXT_FORM_STORE_INSTANCES: Map<number, Form> = FORM_STORE_INSTANCES;

// Counter to generate unique form IDs
let FORM_COUNTER = 0;

// Function to unsubscribe a form with a given formId
const UNSUB_FORM = (formId: number) => {
  GEN_MUTABLE_STORE();

  NEXT_FORM_STORE_INSTANCES.delete(formId);
  FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
};

// Function to subscribe a form with a given formId and form instance
const SUB_FORM = (formId: number, form: Form) => {
  GEN_MUTABLE_STORE();
  NEXT_FORM_STORE_INSTANCES.set(formId, form);
  FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
};

// Function to generate a mutable store to avoid rerenders
const GEN_MUTABLE_STORE = () => {
  if (NEXT_FORM_STORE_INSTANCES === FORM_STORE_INSTANCES) {
    NEXT_FORM_STORE_INSTANCES = new Map();
    FORM_STORE_INSTANCES.forEach((value, key) => {
      NEXT_FORM_STORE_INSTANCES.set(key, value);
    });
  }
};

// Function to generate a unique form ID
const GEN_FORM_ID = () => {
  ++FORM_COUNTER;
  return FORM_COUNTER;
};

// Function to generate form options with default values
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

// Function to create default form options
const createDefaultFormOptions = () => ({
  // React spinner component
  requireSpinner: false,
  spinner: null,
  // Todo: form state: changes, dirty fields, touched fields
  // Todo: input overloads. These are functions applied to all inputs
  // Todo: in form by default
  inputUtils: {},
  // Todo: submit suspense flag
  suspense: false,
  spinnerTimeout: null,
  onSubmit: () => {
    console.warn("Form's `onSubmit` not provided");
  },
});
