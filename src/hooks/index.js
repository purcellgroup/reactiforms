import { useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid/non-secure";
import { createDefaultFormOptions, FORM_STATE_INSTANCES } from "../types";
import { createForm, createInput } from "../components";

export function useCreateFormStore(stateOverloads = {}) {
  const defaultFormOptions = useRef(createDefaultFormOptions());
  const FORM_ID = useRef(nanoid(6));
  const FORM_STORE = useRef({
    inputs: {},
    formId: FORM_ID.current,
    formOptions: { ...defaultFormOptions.current, ...stateOverloads },
  });

  //form config setup
  useEffect(() => {
    console.log("_FORMSTORE: ", FORM_ID.current);
    FORM_STATE_INSTANCES.set(FORM_ID.current, FORM_STORE.current);
    FORM_STORE.current.resetForm = () =>
      resetFormValues(FORM_STORE.current.inputs);
    return () => {
      FORM_STATE_INSTANCES.delete(FORM_ID.current);
    };
  }, []);

  //input belongs to this form instance
  const Input = useCallback(createInput(FORM_STORE.current), []);
  const Form = useCallback(createForm({ defaultFormOptions, FORM_STORE }), [])

  return {
    Input,
    Form,
    formOptions: FORM_STORE.current.formOptions,
    formStore: FORM_STORE.current,
    formId: FORM_ID.current,
  };
}

const resetFormValues = (inputObj) => {
  for (let inputId in inputObj) {
    inputObj[inputId].value = "";
  }
};
