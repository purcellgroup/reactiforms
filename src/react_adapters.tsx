import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  InputHTMLAttributes,
  FC,
  ReactElement,
} from "react";
import { Form, createDefaultInputOptions, subscribeToInput, broadcastToSubscribers, registerInput, updateInputMap } from "./core";
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
            onSubmit(e, formInstance.getFormValues(), formInstance);
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
    const key = useRef<null | string | number>(null);
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
          if (key.current) updateInputMap(key.current, newState)
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
      if (!key.current) {
        if (props.id) {
          registeredInput = registerInput(props.id, inputState);
          key.current = props.id;
        } else {
          registeredInput = registerInput(null, inputState);
          key.current = registeredInput.newInputId;
        }
      }

      setInputState((s) => ({
        ...s,
        setter: setInputState,
        inputKey: key.current,
      }));

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
        onInvalid={runOnInvalid}
        {...restOfProps}
      />
    );
  };
}

// utility hook to rerender HOCs for Inputs
export function _useInput({ getInput, subscribeToInput, unsubscribeToInput }) {
  return function (inputId: string) {
    const _subscribed = useRef(false);
    const [i, setI] = useState(() => getInput(inputId));

    if (!_subscribed.current) {
      subscribeToInput(inputId, setI);
      _subscribed.current = true;
    }

    useEffect(() => {
      return () => {
        unsubscribeToInput(inputId);
        _subscribed.current = false;
      };
    }, []);

    return i;
  };
}

const isFunction = (fn: any): fn is Function => {
  if (typeof fn === "function") return true;
  console.error(new Error("Optional handlers must be functions."));
  return false;
};
