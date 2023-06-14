import { useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid/non-secure";
import { defaultFormOptions, __FormStateInstances } from "../types";
import { createInput } from "../components";

export function useCreateFormStore(stateOverloads = {}) {
  const _formId = useRef(nanoid(6));
  const _formStore = useRef({
    inputs: {},
    _formId: _formId.current,
    formOptions: { ...defaultFormOptions, ...stateOverloads },
  });

  //form config setup
  useEffect(() => {
    console.log("_FORMSTORE: ", _formStore.current);
    __FormStateInstances.set(_formId.current, _formStore.current);
    _formStore.current.resetForm = () =>
      resetFormValues(_formStore.current.inputs);
    return () => {
      __FormStateInstances.delete(_formId.current);
    };
  }, []);

  //input belongs to this form instance
  const Input = useCallback(createInput(_formStore.current), []);

  return {
    _formStore: _formStore.current,
    Input,
    _formId: _formId.current,
    formOptions: _formStore.current.formOptions,
  };
}

const resetFormValues = (inputObj) => {
  for (let inputId in inputObj) {
    inputObj[inputId].value = "";
  }
};
