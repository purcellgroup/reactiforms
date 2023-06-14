import React, { useState, useEffect, useCallback, useRef } from "react";
// import

export function Form(props) {
  return <form onSubmit={props.handleSubmit}>{props.children}</form>;
}

export function createInput(formStore) {
  return function (props) {
    const [inputState, setInputState] = useState({
      ...defaultInputOptions,
      ...props,
    });
    const [inputValue, setInputValue] = useState(props.initialInputValue || "");

    useEffect(() => {
      //user can run utility fn on change
      const change = function (e) {
        if (props.runOnChange) props.runOnChange(e);
        setInputState((s) => ({ ...s, value: e.target.value }));
        setInputValue(e.target.value);
      };

      //setup input setter pair
      inputState.onChange = change;
      inputState.value = inputValue;
      //add new input to form instance
      formStore.inputs[inputState.id] = inputState;
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
        value={inputValue.value}
        onChange={(e) =>
          setInputState((s) => ({ ...s, value: e.target.value }))
        }
      />
    );
  };
}
