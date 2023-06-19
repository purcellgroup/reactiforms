import { useEffect, useCallback, useRef, useState } from "react";
// import { nanoid } from "nanoid/non-secure";
import {
  // createDefaultFormOptions,
  FORM_STORE_INSTANCES,
} from "../types";
// import { createForm, createInput } from "../components";
import { GEN_FORM_STORE, GEN_STABLE_REF } from "../utils";

export function useCreateFormStore(stateOverloads = {}) {
  // const defaultFormOptions = useRef(createDefaultFormOptions());
  // const FORM_ID = useRef(nanoid(6));
  // const FORM_STORE = useRef({
  //   inputs: new Map(),
  //   formId: FORM_ID.current,
  //   formOptions: { ...defaultFormOptions.current, ...stateOverloads },
  // });

  // if (!FORM_STORE_INSTANCES.has(FORM_ID.current)) {
  //   FORM_STORE_INSTANCES.set(FORM_ID.current, FORM_STORE.current);
  //   FORM_STORE.current.resetForm = () =>
  //     resetFormValues(FORM_STORE.current.inputs);
  // }
  const [GET_FORM_STORE] = useState(useGenStore(stateOverloads));

  //form config setup
  useEffect(() => {
    return () => {
      FORM_STORE_INSTANCES.delete(GET_FORM_STORE().formId);
    };
  }, []);

  //input belongs to this form instance
  // const Input = useCallback(createInput(FORM_STORE.current), []);
  // const Form = useCallback(
  //   createForm(FORM_STORE_INSTANCES.get(FORM_ID.current)),
  //   []
  // );

  return GET_FORM_STORE(); // -> stable ref

  // return {
  //   Input,
  //   Form,
  //   formOptions: FORM_STORE.current.formOptions,
  //   formId: FORM_ID.current,
  //   getFormStore: () => {
  //     console.log("getFormStore, FORM_STORE_INSTANCES: ", FORM_STORE_INSTANCES);
  //     console.log("getFormStore, FORM_ID: ", FORM_ID.current);
  //     return FORM_STORE_INSTANCES.get(FORM_ID.current);
  //   },
  //   isFormValid: () =>
  //     validateForm(FORM_STORE_INSTANCES.get(FORM_ID.current).inputs),
  //   FORM_STORE_INSTANCES,
  // };
}

//assign stable refs to hooks and insulate from rerenders
const useGenStore = (stateOverloads) => {
  let unique_store = null;
  return () => {
    if (!unique_store) unique_store = GEN_FORM_STORE(stateOverloads);
    return unique_store; // reference fn; invoke for stable store
  };
};

const useGenRef = (value) => GEN_STABLE_REF(value); // -> fn
