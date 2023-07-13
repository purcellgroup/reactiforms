import React, { useState, useEffect, useCallback, useRef } from "react";
import { createDefaultInputOptions } from "../types";

export function createForm(formInstance) {
  return function ({ children, onSubmit, ...props }) {
    // todo: create suspense
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.inputValues = formInstance.getFormValues();
          e.formData = formInstance;

          if (onSubmit && isFunction(onSubmit)) {
            onSubmit(e);
          } else {
            formInstance.formOptions.handleSubmit();
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

export function createInput(formStore) {
  const defaultInputOptions = createDefaultInputOptions();
  return function (props) {
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
    const key = useRef(null);
    const touched = useRef(null);
    // handler overrides
    const change = useCallback((e) => {
      // use fresh react state for runOnChange
      if (runOnChange && isFunction(runOnChange)) runOnChange(e.target.value);
      setInputState((s) => {
        const newState = {
          ...s,
          value: e.target.value,
        };
        return newState;
      });
    }, []);

    
    const focus = useCallback((e) => {
      if (runOnFocus && isFunction(runOnFocus)) runOnFocus(e);
      if (!touched.current) {
        touched.current = true;
        if (runOnTouch && isFunction(runOnTouch)) runOnTouch(e);
        setInputState((s) => ({ ...s, touched: true }));
      }
    }, []);
    
    const blur = useCallback((e) => {
      setInputState((s) => {
        const newState = {
          ...s,
          isValid: validate && isFunction(validate) ? validate(inputState.value) : false,
        };
        if (runOnBlur && isFunction(runOnBlur)) runOnBlur(newState);
        return newState
      });
    }, []);
    
    const [inputState, _setInputState] = useState({
      ...defaultInputOptions,
      ...props,
      value: initialInputValue || "",
      onChange: change,
      onFocus: focus,
      onBlur: blur
    });

    const setInputState = useCallback(
      (val) => {
        // write to input in map while react state updates
        _setInputState((s) => {
          const newState = typeof val === "function" ? val(s) : val;
          if (key.current) formStore.inputs.set(key.current, newState);
          return newState;
        });
      },
      [key, formStore]
    );

    //!! probs not needed. test with a dynamic classname
    // useEffect(() => {
    //   setInputState((s) => ({ ...s, ...props }));
    // }, [props]);

    useEffect(() => {
      // registers this input
      if (!key.current) {
        if (props.id) {
          formStore._register_input(props.id, inputState);
          key.current = props.id;
        } else {
          const _ = formStore._inputCounter + 1;
          formStore._register_input(_, inputState);
          key.current = _;
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
          formStore._unregister_input(key.current);
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

const isFunction = (fn) => {
  if (typeof fn === "function") return true;
  console.error(new Error("Optional handlers must be functions."));
  return false;
};
