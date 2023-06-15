import React, { useState, useEffect, useCallback } from "react";
import { createDefaultFormOptions, createDefaultInputOptions } from "../types";

export function createForm(formOptions) {
  return function ({ children, ...props }) {
    //!! todo: create suspense
    return (
      <form onSubmit={formOptions.handleSubmit} {...props}>
        {children}
      </form>
    );
  };
}

/* 
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
*/

export function createInput(formStore) {
  //new inputs get their own default options
  const defaultInputOptions = createDefaultInputOptions();
  return function ({
    initialInputValue,
    runOnChange,
    runOnFocus,
    validate,
    ...props
  }) {
    const change = useCallback((e) => {
      if (runOnChange) runOnChange(e);
      setInputState((s) => ({
        ...s,
        value: e.target.value,
        isValid: validate ? validate(e.target.value) : validate,
      }));
    }, []);

    const focus = useCallback((e) => {
      if (runOnFocus) runOnFocus(e);
      setInputState((s) => ({ ...s, touched: true }));
    }, []);

    const [inputState, setInputState] = useState({
      ...defaultInputOptions,
      ...props,
      value: initialInputValue || "",
      onChange: change,
      onFocus: focus,
    });

    useEffect(() => {
      //user can run utility fn on change

      //!! todo: create onFocus overload to enable "touched" feature
      //!! without relying on scoped this
      // const focus = (e) => {
      //   if (inputState.onFocus) inputState.onFocus(e);
      //   setInputState((s) => ({ ...s, touched: true }));
      // };

      //apply modified handlers

      //add new input to form instance
      formStore.inputs[inputState.id] = inputState;

      return () => {
        formStore.inputs[inputState.id];
      };
    }, []);

    console.log("input rendered, props, inputState: ", props, inputState);

    return (
      <input
        type={inputState.type}
        id={inputState.id}
        name={inputState.name}
        value={inputState.value}
        onChange={inputState.onChange}
        onFocus={inputState.onFocus}
        // onBlur={inputState.onBlur}
      />
    );
  };
}
