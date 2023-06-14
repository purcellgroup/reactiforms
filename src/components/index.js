import React, { useState, useEffect } from "react";
import { defaultInputOptions } from "../types";

export function Form({ handleSubmit, children }) {
  return <form onSubmit={handleSubmit}>{children}</form>;
}

export function createInput(formStore) {
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
        setInputState((s) => ({ ...s, value: e.target.value }));
        // setInputValue(e.target.value);
      };

      //setup input setter
      inputState.onChange = change;
      //add new input to form instance
      formStore.inputs[inputState.id] = inputState;

      return () => {
        formStore.inputs[inputState.id];
      };
    }, []);

    console.log(
      "input rendered, props, inputState, inputValue: ",
      props,
      inputState,
      inputValue
    );

    return (
      <input
        type={inputState.type}
        id={inputState.id}
        name={inputState.name}
        value={inputState.value}
        onChange={(e) =>
          setInputState((s) => ({ ...s, value: e.target.value }))
        }
      />
    );
  };
}
