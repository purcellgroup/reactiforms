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

// copy of store for mutations
export let FORM_STORE_INSTANCES: Map<number, Form> = new Map();
let NEXT_FORM_STORE_INSTANCES: Map<number, Form> = FORM_STORE_INSTANCES;

let FORM_COUNTER = 0;

const UNSUB_FORM = (formId: number) => {
  GEN_MUTABLE_STORE();

  NEXT_FORM_STORE_INSTANCES.delete(formId);
  FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
};

const SUB_FORM = (formId: number, form: Form) => {
  GEN_MUTABLE_STORE();
  NEXT_FORM_STORE_INSTANCES.set(formId, form);
  FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
};

const GEN_MUTABLE_STORE = () => {
  if (NEXT_FORM_STORE_INSTANCES === FORM_STORE_INSTANCES) {
    NEXT_FORM_STORE_INSTANCES = new Map();
    FORM_STORE_INSTANCES.forEach((value, key) => {
      NEXT_FORM_STORE_INSTANCES.set(key, value);
    });
  }
};

const GEN_FORM_ID = () => {
  ++FORM_COUNTER;
  return FORM_COUNTER;
};

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

const createDefaultFormOptions = () => ({
  //react spinner component
  requireSpinner: false,
  spinner: null,
  // todo form state: changes, dirty fields, touched fields
  // todo: input overloads. these are functions applied to all inputs
  // todo: in form by default
  inputUtils: {},
  // todo: submit suspense flag
  suspense: false,
  spinnerTimeout: null,
  onSubmit: () => {
    console.warn("Form's `onSubmit` not provided");
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

export class Form {
  private inputCounter: number;
  private inputMap: Map<string | number, Input>;
  private subscriberMap: Map<string | number, Set<React.Dispatch<Input>>>;
  private FormContext: React.Context<FormContext>;

  constructor() {
    this.inputCounter = 0;
    this.inputMap = new Map();
    this.subscriberMap = new Map();
    this.FormContext = React.createContext({} as FormContext);
  }

  useFormContext = () => {
    return React.useContext(this.FormContext);
  };

  registerInput = (
    key: number | string | null,
    input: Input
  ): UnregisterInput => {
    const inputId = key ?? this.inputCounter + 1;
    this.inputMap.set(inputId, input);
    this.subscriberMap.set(inputId, new Set());

    //unregister input
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

  updateInput = (key: string | number, newInput: Input) => {
    if (!newInput || key === null)
      throw Error("Invalid data while updating inputMap");
    this.inputMap.set(key, newInput);
    return key;
  };

  //!! TODO: test
  subscribeToInput = (
    key: string | number,
    dispatch: React.Dispatch<Input>
  ) => {
    const subscriberSet = this.subscriberMap.get(key);

    if (!subscriberSet)
      throw new Error("Subscribe Error: subscriber map failed");

    subscriberSet.add(dispatch);

    // unsubscribe to input
    return (dispatch: React.Dispatch<Input>) => {
      const fail = subscriberSet.delete(dispatch);
      if (fail) throw new Error("Failed unsubscribing from input.");
    };
  };

  //!! TODO: test
  broadcastToSubscribers = (key: string | number) => {
    const inputSet = this.subscriberMap.get(key);
    const inputVal = this.inputMap.get(key);

    if (!inputSet || !inputVal)
      throw new Error("Broadcast Error: Input not found.");

    inputSet.forEach((dispatch) => dispatch(inputVal));
  };

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

  getFormValues = () => {
    return Array.from(this.inputMap).reduce(
      (acc: FormValues, [id, input]): FormValues => {
        acc[id] = input.value;
        return acc;
      },
      {}
    );
  };

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
  getInput = (id: any): Input | undefined => {
    return this.inputMap.get(id);
  };

  isFormValid = () => {
    return Array.from(this.inputMap.entries()).every(
      ([, input]) => input.isValid
    );
  };

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

    //!! probs not needed. test with a dynamic classname
    // useEffect(() => {
    //   setInputState((s) => ({ ...s, ...props }));
    // }, [props]);

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

  createForm = (): FormInstance => {
    return {
      resetForm: this.resetForm,
      getFormValues: this.getFormValues,
      getFormInputs: this.getFormInputs,
      getInput: this.getInput,
      isFormValid: this.isFormValid,
      Form: this.Form,
      Input: this.Input,
    };
  };
}

export function createForm(): Form {
  const formInstance = new Form();
  return formInstance;
}

// todo: utility hook to rerender HOCs for Inputs
//!! needs modification due to Form class refactor. types out of scope
// export function _useInput(
//   get_input: typeof getInput,
//   subscribe: typeof subscribeToInput
// ) {
//   return function (inputId: string) {
//     const subscribed = useRef(false);
//     const [i, setI] = useState(() => get_input(inputId));

//     // if (!_subscribed.current) {
//     // }

//     useEffect(() => {
//       const unsubscribe = subscribe(inputId, setI);
//       subscribed.current = true;

//       return () => {
//         unsubscribe(inputId);
//       };
//     }, []);

//     return i;
//   };
// }

// export function useInput(inputId: string) {
//   const subscribed = useRef(false);
//   const [i, setI] = useState(() => getInput(inputId));

//   useEffect(() => {
//     let unsubscribe: (inputId: string) => void;

//     if (!subscribed.current) {
//       unsubscribe = subscribeToInput(inputId, setI);
//       subscribed.current = true;
//     }

//     return () => {
//       if (unsubscribe) unsubscribe(inputId);
//     };
//   }, []);

//   return i;
// }

export const isFunction = (fn: any): fn is Function => {
  if (typeof fn === "function") return true;
  console.error(new Error("Optional handlers must be functions."));
  return false;
};
