import { useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid/non-secure";
import { createDefaultFormOptions, FORM_STORE_INSTANCES } from "../types";
import { createForm, createInput } from "../components";

export function useCreateFormStore(stateOverloads = {}) {
  const defaultFormOptions = useRef(createDefaultFormOptions());
  const FORM_ID = useRef(nanoid(6));
  const FORM_STORE = useRef({
    inputs: new Map(),
    formId: FORM_ID.current,
    formOptions: { ...defaultFormOptions.current, ...stateOverloads },
  });

  if (!FORM_STORE_INSTANCES.has(FORM_ID.current)) {
    FORM_STORE_INSTANCES.set(FORM_ID.current, FORM_STORE.current);
    FORM_STORE.current.resetForm = () =>
      resetFormValues(FORM_STORE.current.inputs);
  }

  //form config setup
  useEffect(() => {
    return () => {
      FORM_STORE_INSTANCES.delete(FORM_ID.current);
    };
  }, []);

  //input belongs to this form instance
  const Input = useCallback(createInput(FORM_STORE.current), []);
  const Form = useCallback(
    createForm(FORM_STORE_INSTANCES.get(FORM_ID.current)),
    []
  );

  return {
    Input,
    Form,
    formOptions: FORM_STORE.current.formOptions,
    formId: FORM_ID.current,
    getFormStore: () => {
      console.log("FORM_STORE_INSTANCES: ", FORM_STORE_INSTANCES);
      return FORM_STORE_INSTANCES.get(FORM_ID.current);
    },
  };
}

const resetFormValues = (inputMap) => {
  inputMap.forEach((input) => {
    input.value = input.initialInputValue || "";
  });
};
