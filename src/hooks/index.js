import { useEffect, useCallback, useRef } from "react";
import { defaultFormOptions } from "../types";
import { createInput } from "../components";

export function useCreateFormStore(stateOverloads = {}) {
  const _formId = useRef(nanoid(6)).current;
  const _formStore = useRef({
    inputs: {},
    _formId,
    formOptions: { ...defaultFormOptions, ...stateOverloads },
  }).current;

  //form config setup
  useEffect(() => {
    console.log("_FORMSTORE: ", _formStore);
    __FormStateInstances.set(_formId, _formStore);
    _formStore.resetForm = () => resetFormValues(_formStore.inputs);
    return () => {
      __FormStateInstances.delete(_formId);
    };
  }, [_formStore, _formId]);

  //input belongs to this form instance
  const Input = useCallback(createInput(_formStore), [_formStore]);

  return { _formStore, Input, _formId, formOptions: _formStore.formOptions };
}

const resetFormValues = (inputObj) => {
  for (let inputId in inputObj) {
    inputObj[inputId].value = "";
  }
};
