import React, { useState, useEffect, useCallback } from "react";
import { createDefaultInputOptions } from "../types";
import { nanoid } from "nanoid/non-secure";
import { GEN_FORM_STORE, useCreateFormStore } from "../utils";

export function createForm(formInstance) {
  return function ({ children, onSubmit, ...props }) {
    // todo: create suspense
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.inputValues = formInstance.getFormValues();
          e.formData = formInstance;
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

export function Form2({ children, onSubmit, ...props }) {
  //!! unpack non html attributes from props
  const formInstance = useCreateFormStore(props);
  return (
    <form
      {...props}
      onSubmit={(e) => {
        e.preventDefault();
        e.inputValues = formInstance.getFormValues();
        e.formData = formInstance;
        if (onSubmit) {
          onSubmit(e);
        } else {
          formInstance.formOptions.handleSubmit();
        }
      }}
    >
      {children}
    </form>
  );
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
      inputKey: ++formStore._inputCounter,
      value: initialInputValue || "",
      onChange: change,
      onFocus: focus,
    });

    useEffect(() => {
      setInputState((s) => ({ ...s, ...props }));
    }, [props]);

    useEffect(() => {
      if (!inputState.setter)
        setInputState((s) => ({ ...s, setter: setInputState }));

      //!! no mutations of instance map.
      //!! create sub/unsub helpers for this
      formStore._map_inputs_to_next();
      if (props.id) {
        formStore._next_inputs.set(props.id, inputState);
      } else {
        formStore._next_inputs.set(inputState.inputKey, inputState);
      }
      formStore.inputs = formStore._next_inputs;

      //cleanup input from form instance
      return () => {
        formStore._map_inputs_to_next();
        if (inputState.id) formStore._next_inputs.delete(inputState.id);
        if (inputState.inputKey)
          formStore._next_inputs.delete(inputState.inputKey);
        formStore.inputs = formStore._next_inputs;
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

export function Input2(props) {
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
    inputKey: ++formStore._inputCounter,
    value: initialInputValue || "",
    onChange: change,
    onFocus: focus,
  });

  useEffect(() => {
    setInputState((s) => ({ ...s, ...props }));
  }, [props]);

  useEffect(() => {
    if (!inputState.setter)
      setInputState((s) => ({ ...s, setter: setInputState }));

    //!! no mutations of instance map.
    //!! create sub/unsub helpers for this
    formStore._map_inputs_to_next();
    if (props.id) {
      formStore._next_inputs.set(props.id, inputState);
    } else {
      formStore._next_inputs.set(inputState.inputKey, inputState);
    }
    formStore.inputs = formStore._next_inputs;

    //cleanup input from form instance
    return () => {
      formStore._map_inputs_to_next();
      if (inputState.id) formStore._next_inputs.delete(inputState.id);
      if (inputState.inputKey)
        formStore._next_inputs.delete(inputState.inputKey);
      formStore.inputs = formStore._next_inputs;
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