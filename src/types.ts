import React, {
  HTMLProps,
  JSXElementConstructor,
  ReactNode,
  SyntheticEvent,
  ReactElement,
  InputHTMLAttributes,
} from "react";
// import type { Form } from "./core";

export type Input = DefaultInput & InputHTMLAttributes<HTMLInputElement>;

export interface MutationAction {
  action: string;
  key: string | number | null;
  newInput?: Input;
}

export interface UnregisterInput {
  newInputId: number | string;
  unregister: (key: string | number) => void;
}

export interface DefaultInput {
  id: string;
  className: string;
  inputName: string;
  inputKey: null | string | number;
  type: string;
  name: string;
  touched: boolean;
  isValid: boolean;
  initialInputValue: string;
  validate:
    | null
    | ((value: string | number | readonly string[] | undefined) => boolean);
  runOnChange:
    | null
    | ((s: Input, e: React.ChangeEvent<HTMLInputElement>) => void);
  runOnFocus:
    | null
    | ((s: Input, e: React.FocusEvent<HTMLInputElement>) => void);
  runOnTouch:
    | null
    | ((s: Input, e: React.FocusEvent<HTMLInputElement>) => void);
  runOnBlur: null | ((s: Input, e: React.FocusEvent<HTMLInputElement>) => void);
  runOnInvalid: null | ((e: SyntheticEvent) => void);
  setter: null | React.Dispatch<React.SetStateAction<Input>>;
  debounce: 1300 | number;
}

export interface FormInstance {
  // formId: number;
  options: DefaultForm & Record<string, any>;
  resetForm: () => void;
  getFormValues: () => FormValues;
  getFormInputs: () => Record<string, Input> | Record<string, never>;
  getInput: (id: any) => Input | undefined;
  isFormValid: () => boolean;
  _inputMap: () => Map<string | number, Input>;
  Input?: InputComponent;
  Form?: FormComponent;
  // useInput?: (arg0: any) => Input | undefined;
}

export interface DefaultForm {
  requireSpinner: boolean;
  spinner: null | React.ReactElement;
  suspense: false;
  spinnerTimeout: null | number;
  handleSubmit: () => void;
}

export interface FormValues {
  [k: string]: string | number | readonly string[] | undefined;
}

export interface FormInputs {
  [k: string]: Input;
}

// components and hooks

export type FormComponent = (
  props: {
    children: ReactNode;
    onSubmit?: (e: SyntheticEvent, v: FormValues) => void;
  } & HTMLProps<HTMLFormElement>
) => React.ReactElement;

export type InputComponent = (
  props: Input
) => ReactElement<InputHTMLAttributes<HTMLInputElement>>;
