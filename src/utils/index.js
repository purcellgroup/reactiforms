import { createForm, createInput } from "../components";
import { createDefaultFormOptions } from "../types";

// dynamic instances for new form components
//!! gen copy of map every new form store instance.
//!! Mutate copy.
export let FORM_STORE_INSTANCES = new Map();
// pointer for mutation
let NEXT_FORM_STORE_INSTANCES = FORM_STORE_INSTANCES;

//!! try/catch fragile logic for custom errors

//!! use integer as form id instead of nanoid
let FORM_COUNTER = 0;

const GEN_FORM_ID = () => {
  ++FORM_COUNTER;
  return FORM_COUNTER;
};

const GEN_FORM_OPTIONS = (stateOverloads) => ({
  ...createDefaultFormOptions(),
  ...stateOverloads,
});

const GEN_MUTABLE_STORE = () => {
  if (NEXT_FORM_STORE_INSTANCES === FORM_STORE_INSTANCES) {
    NEXT_FORM_STORE_INSTANCES = new Map();
    FORM_STORE_INSTANCES.forEach((value, key) => {
      NEXT_FORM_STORE_INSTANCES.set(key, value);
    });
  }
};

export const GEN_FORM_STORE = (stateOverloads) => {
  //stabilize instance references across renders
  const stable_id = GEN_FORM_ID();
  const stable_inputs = new Map();
  const stable_options = GEN_FORM_OPTIONS(stateOverloads);
  const stable_store = {
    inputs: new Map(),
    formId: stable_id,
    formOptions: stable_options,
    _inputCounter: 0,
  };

  stable_store._next_inputs = stable_store.inputs;
  stable_store._map_inputs_to_next = function () {
    if (stable_store._next_inputs === stable_store.inputs) {
      stable_store._next_inputs = new Map();
      stable_store.inputs.forEach((value, key) => {
        stable_store._next_inputs.set(key, value);
      });
    }
  };
  stable_store._register_input = function (key, input_state) {
    stable_store._inputCounter = stable_store._inputCounter + 1;
    stable_store._map_inputs_to_next();
    stable_store._next_inputs.set(key, input_state);
    stable_store.inputs = stable_store._next_inputs;
  };

  stable_store._unregister_input = function (key) {
    stable_store._inputCounter = stable_store._inputCounter - 1;
    stable_store._map_inputs_to_next();
    stable_store._next_inputs.delete(key);
    stable_store.inputs = stable_store._next_inputs;
  };

  stable_store._input_writes_to_map = function (key) {};

  stable_store.resetForm = () => resetFormValues(stable_store.inputs);

  stable_store.getFormValues = () => getFormValues(stable_store.inputs);

  stable_store.getFormInputs = () => getFormInputs(stable_store.inputs);

  stable_store.getInput = (id) => stable_store.inputs.get(id);

  stable_store.getFormStore = () =>
    FORM_STORE_INSTANCES.get(stable_store.formId);

  stable_store.isFormValid = () =>
    validateForm(FORM_STORE_INSTANCES.get(stable_store.formId).inputs);

  stable_store.Input = createInput(stable_store);

  stable_store.Form = createForm(stable_store);

  // utility hook to rerender HOCs for Inputs
  stable_store.useInput = (inputId) => {
    const [i, setI] = useState(null);
    const inputLoaded = useRef(null);

    useEffect(() => {
      if (!inputLoaded.current) {
        const loadStore = stable_store.inputs.get(inputId)
        setI(loadStore);
        inputLoaded.current = loadStore
      }
    }, []);
    return i;
  };

  stable_store.unsubscribe = () => {
    GEN_MUTABLE_STORE();

    NEXT_FORM_STORE_INSTANCES.delete(stable_store.formId);
    FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;
  };

  GEN_MUTABLE_STORE();
  NEXT_FORM_STORE_INSTANCES.set(stable_store.formId, stable_store);
  FORM_STORE_INSTANCES = NEXT_FORM_STORE_INSTANCES;

  return stable_store;
};

//assign stable refs to hooks and insulate from rerenders
export const genStore = (stateOverloads) => {
  let unique_store = null;
  return () => {
    if (!unique_store) unique_store = GEN_FORM_STORE(stateOverloads);
    return unique_store;
  };
};

export const createFormStore = (initialFormOptions) => {
  const store = genStore(initialFormOptions);
  return store();
};

// stabilized memo across renders
export const GEN_STABLE_REF = (value = null) => {
  const _ref = null;
  return () => {
    if (!_ref) {
      _ref = { current: value ? value : null };
    }
    return _ref;
  };
};
export const createStableRef = (value) => {
  const _ = GEN_STABLE_REF();
};
export const useStableRef = (value) => createStableRef(value);

// reset inputs in specific form store
// !! param is a map
export const resetFormValues = (inputs) => {
  inputs.forEach((input) => {
    if (input.setter)
      input.setter((s) => ({
        ...s,
        value: input.initialInputValue,
        isValid: false,
      }));
  });
};

// return input values of specific form
export const getFormValues = (inputs) =>
  Array.from(inputs).reduce((acc, [id, input]) => {
    acc[id] = input.value;
    return acc;
  }, {});

export const getFormInputs = (inputs) => {
  if (inputs.size) {
    return Object.fromEntries(inputs);
  } else {
    console.warn(
      "Either this Form has no Input children or `getFormInputs` is running before the Form's Inputs are registered. \n"
    );
    return {};
  }
};

export const validateForm = (inputs) =>
  Array.from(inputs.entries()).every(([, input]) => input.isValid);
