import { useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid/non-secure";
import { createDefaultFormOptions, __FormStateInstances } from "../types";
import { createInput } from "../components";

export function useCreateFormStore(stateOverloads = {}) {
  const defaultFormOptions = useRef(createDefaultFormOptions());
  const _formId = useRef(nanoid(6));
  const _formStore = useRef({
    inputs: {},
    _formId: _formId.current,
    formOptions: { ...defaultFormOptions.current, ...stateOverloads },
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
    Input,
    formOptions: _formStore.current.formOptions,
    formStore: _formStore.current,
    _formId: _formId.current,
  };
}

const resetFormValues = (inputObj) => {
  for (let inputId in inputObj) {
    inputObj[inputId].value = "";
  }
};
