import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactElement,
} from "react";
import {
  // Form,
  createDefaultInputOptions,
  broadcastToSubscribers,
  registerInput,
  updateInputMap,
  getInput,
  subscribeToInput,
} from "./core";
// import type { getInput, subscribeToInput } from "./core";
import {
  DefaultInput,
  FormComponent,
  FormInstance,
  Input,
  InputComponent,
  UnregisterInput,
} from "./types";

export function FormFactory(formInstance: FormInstance): FormComponent {
  // if (!(formInstance instanceof FormInstance)) {
  //   throw new Error(
  //     "Internal Error: Form instance invalid. Something is *really* wrong"
  //   );
  // }

  return function ({ children, onSubmit, ...props }): ReactElement {
    // todo: create suspense
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (onSubmit && isFunction(onSubmit)) {
            onSubmit(e, formInstance.getFormValues());
          } else {
            formInstance.options.handleSubmit();
          }

          formInstance.resetForm();
        }}
        {...props}
      >
        {children}
      </form>
    );
  };
}

//!! MIGRATE TO PUB SUB PATTERN for dependents to update

export function InputFactory(formInstance: FormInstance): InputComponent {
  const defaultInputOptions: DefaultInput = createDefaultInputOptions();

  // const inputSubscribers = new Map<
  //   string | number,
  //   Set<React.Dispatch<Input>>
  // >();

  // const subscribeToInput = (
  //   key: string | number,
  //   dispatch: React.Dispatch<Input>
  // ) => {
  //   const subscriberSet = inputSubscribers.get(key);
  //   if (subscriberSet) subscriberSet.add(dispatch);
  //   return (key: string | number) => {
  //     inputSubscribers.delete(key);
  //   };
  // };

  // const broadcastToSubscribers = (key: string | number) => {
  //   const inputSet = inputSubscribers.get(key);
  //   const inputVal = formInstance._inputMap().get(key);
  //   if (inputSet && inputVal) {
  //     inputSet.forEach((dispatch) => dispatch(inputVal));
  //   }
  // };

  return function (props: Input) {
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
    const key = useRef<null | string | number>(props.id ?? null);
    const touched = useRef<null | boolean>(null);
    // handler overrides
    const change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      // use fresh react state for runOnChange
      setInputState((s: Input): Input => {
        const newState: Input = {
          ...s,
          value: e.target.value,
        };
        if (runOnChange && isFunction(runOnChange)) runOnChange(newState, e);
        if (key.current !== null) broadcastToSubscribers(key.current);
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
          isValid:
            validate && isFunction(validate)
              ? validate(inputState.value)
              : false,
        };
        if (runOnBlur && isFunction(runOnBlur)) runOnBlur(newState, e);
        return newState;
      });
    }, []);

    const [inputState, _setInputState] = useState<Input>({
      ...defaultInputOptions,
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
          if (key.current !== null) updateInputMap(key.current, newState);
          return newState;
        });
      },
      [key, formInstance]
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
          registeredInput = registerInput(props.id, inputState);
          key.current = props.id;
        } else {
          registeredInput = registerInput(null, inputState);
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
        if (key.current) {
          const { unregister } = registeredInput;
          unregister(key.current);
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
}

// utility hook to rerender HOCs for Inputs
export function _useInput(
  get_input: typeof getInput,
  subscribe: typeof subscribeToInput
) {
  return function (inputId: string) {
    const subscribed = useRef(false);
    const [i, setI] = useState(() => get_input(inputId));

    // if (!_subscribed.current) {
    // }

    useEffect(() => {
      const unsubscribe = subscribe(inputId, setI);
      subscribed.current = true;

      return () => {
        unsubscribe(inputId);
      };
    }, []);

    return i;
  };
}

export function useInput(inputId: string) {
  const subscribed = useRef(false);
  const [i, setI] = useState(() => getInput(inputId));

  useEffect(() => {
    let unsubscribe: (inputId: string) => void;

    if (!subscribed.current) {
      unsubscribe = subscribeToInput(inputId, setI);
      subscribed.current = true;
    }

    return () => {
      if (unsubscribe) unsubscribe(inputId);
    };
  }, []);

  return i;
}

export const isFunction = (fn: any): fn is Function => {
  if (typeof fn === "function") return true;
  console.error(new Error("Optional handlers must be functions."));
  return false;
};
