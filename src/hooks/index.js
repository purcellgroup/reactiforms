import { useEffect, useCallback, useRef, useState } from "react";
// import { nanoid } from "nanoid/non-secure";
import {
  // createDefaultFormOptions,
  FORM_STORE_INSTANCES,
} from "../types";
// import { createForm, createInput } from "../components";
import { GEN_FORM_STORE, GEN_STABLE_REF } from "../utils";

export function useCreateFormStore(stateOverloads = {}) {
  const [GET_FORM_STORE] = useState(useGenStore(stateOverloads));

  //form config setup
  useEffect(() => {
    console.warn("UE IN useCreateFormStore invoked, FORM_STORE_INSTANCES: ", FORM_STORE_INSTANCES)
    return () => {
      if(GET_FORM_STORE) {
        console.warn("**RETURN** IN UE invoked, GET_FORM_STORE: ", GET_FORM_STORE())
        FORM_STORE_INSTANCES.delete(GET_FORM_STORE().formId);
      }
    };
  }, [GEN_FORM_STORE]);

  console.warn("useCreateFormStore invoked, GET_FORM_STORE: ", GET_FORM_STORE())

  return GET_FORM_STORE(); // -> stable ref
}

//assign stable refs to hooks and insulate from rerenders
const useGenStore = (stateOverloads) => {
  console.log('useGenStore invoked')
  let unique_store = null;
  return () => {
    if (!unique_store) unique_store = GEN_FORM_STORE(stateOverloads);
    console.log('useGenStore invoked, unique_store: ', unique_store())
    return unique_store; // reference fn; invoke for stable store
  };
};

const useGenRef = (value) => GEN_STABLE_REF(value); // -> fn
