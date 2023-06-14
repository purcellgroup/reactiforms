import React, { useState, useEffect } from "react";
import { createDefaultInputOptions } from "../types";

export function Form({ handleSubmit, children }) {
  //!! todo: create suspense 
  return <form onSubmit={handleSubmit}>{children}</form>;
}

export function createInput(formStore) {
  //new inputs get their own default options
  const defaultInputOptions = createDefaultInputOptions();
  return function ({ initialInputValue, runOnChange, ...props }) {
    const [inputState, setInputState] = useState({
      ...defaultInputOptions,
      ...props,
      value: initialInputValue || "",
    });
    // const [inputValue, setInputValue] = useState(initialInputValue || "");

    useEffect(() => {
      //user can run utility fn on change
      const change = function (e) {
        if (runOnChange) runOnChange(e);
        //todo run `validate` when input changes
        setInputState((s) => ({ ...s, value: e.target.value }));
        // setInputValue(e.target.value);
      };

      //!! todo: create onFocus overload to enable "touched" feature
      //!! without relying on scoped this

      //setup input setter
      inputState.onChange = change;
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
        onBlur={inputState.onBlur}
      />
    );
  };
}
