import { nanoid } from 'nanoid/non-secure'
import { createForm, createInput } from "../components";
import { createDefaultFormOptions, FORM_STORE_INSTANCES } from "../types";

//!! try/catch fragile logic for custom errors

//!! use integer as form id instead of nanoid
const GEN_FORM_ID = () => nanoid(6);

const GEN_FORM_OPTIONS = (stateOverloads) => ({
  ...createDefaultFormOptions(),
  ...stateOverloads,
});

export const GEN_FORM_STORE = (stateOverloads) => {
  //stabilize instance references across renders
  const stable_id = GEN_FORM_ID();
  const stable_inputs = new Map();
  const stable_options = GEN_FORM_OPTIONS(stateOverloads);
  const stable_store = {
    inputs: stable_inputs,
    formId: stable_id,
    formOptions: stable_options,
  };
  
  if (!FORM_STORE_INSTANCES.has(stable_store.formId)) {
    FORM_STORE_INSTANCES.set(stable_store.formId, stable_store);
    stable_store.resetForm = () => resetFormValues(stable_store.inputs);
    stable_store.getFormValues = () => getFormValues(stable_store.inputs);
    stable_store.getFormStore = () => {
      return FORM_STORE_INSTANCES.get(stable_store.formId);
    }
    stable_store.isFormValid = () =>
      validateForm(FORM_STORE_INSTANCES.get(stable_store.formId).inputs)
    stable_store.Input = createInput(stable_store);
    stable_store.Form = createForm(stable_store)
  }

  return () => stable_store;
};

// stabilized memo across renders
export const GEN_STABLE_REF = (value = null) => {
  const _ref = { current: value ? value : null };
  return () => {
    _ref.current ? _ref : null;
  };
};

// reset inputs in specific form store
export const resetFormValues = (inputs) => {
  inputs.forEach((input) => {
    input.value = input.initialInputValue || "";
  });
};

// return input values of specific form
export const getFormValues = (inputs) =>
  Array.from(inputs.entries()).reduce((s, [id, input]) => {
    s[id] = input.value;
    return s;
  }, {});

export const validateForm = (inputs) =>
  Array.from(inputs.entries()).every(([, input]) => input.isValid);
