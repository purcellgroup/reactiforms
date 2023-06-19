import React, { useState, useEffect, useCallback } from "react";
import { createDefaultInputOptions } from "../types";
import { nanoid } from "nanoid/non-secure";

export function createForm(formInstance) {
  return function ({ children, onSubmit, ...props }) {
    // todo: create suspense
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.formData = formInstance.getFormValues();
          if (onSubmit) {
            onSubmit(e);
          } else {
            formInstance.formOptions.handleSubmit();
          }
        }}
        {...props}
      >
        {children}
      </form>
    );
  };
}

export function createInput(formStore) {
  //new inputs get their own default options
  const defaultInputOptions = createDefaultInputOptions();
  return function (props) {
    //!! simplify this to use fewer react hooks

    //props needs to be internally stable
    const {
      initialInputValue,
      runOnChange,
      runOnFocus,
      validate,
      ...restOfProps
    } = props;
    //handler overrides
    const change = useCallback((e) => {
      if (runOnChange) runOnChange(e);
      setInputState((s) => ({
        ...s,
        value: e.target.value,
        isValid: validate ? validate(e.target.value) : false,
      }));
    }, []);

    const focus = useCallback((e) => {
      if (runOnFocus) runOnFocus(e);
      setInputState((s) => ({ ...s, touched: true }));
    }, []);

    const [inputState, setInputState] = useState({
      ...defaultInputOptions,
      ...props,
      inputKey: nanoid(6),
      value: initialInputValue || "",
      onChange: change,
      onFocus: focus,
    });

    useEffect(() => {
      if (props.id) {
        formStore.inputs.set(props.id, inputState);
      } else {
        formStore.inputs.set(inputState.inputKey, inputState);
      }
    }, [inputState]);

    useEffect(() => {
      setInputState((s) => ({ ...s, ...props }));
    }, [props]);

    useEffect(() => {
      if (!inputState.setter)
        setInputState((s) => ({ ...s, setter: setInputState }));

      //cleanup input from form instance
      return () => {
        if (inputState.id) formStore.inputs.delete(inputState.id);
        if (inputState.inputKey) formStore.inputs.delete(inputState.inputKey);
      };
    }, []);

    return (
      <input
        value={inputState.value}
        onChange={inputState.onChange}
        onFocus={inputState.onFocus}
        {...restOfProps}
      />
    );
  };
}
