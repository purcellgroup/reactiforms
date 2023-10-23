# tiny-fast-forms

## How to use this library


There is no css applied to built in components. This lib provides a built store and pub-sub model to minimize re-rendering of forms. Only the Input component rerenders when state updates. Input state is signaled to the form object and you can use getters to act on input state changes even from ancestor components.

***
### Functionality

In the file where you creating the Form component import `createFormStore`.

```js
import { createFormStore } from "tiny-fast-forms";
```

Use this factory like you would the React Context API. Invoke to receive a pointer to available methods and components.

```js
const { Form, Input, getFormValues, isFormValid, getInput } = createFormStore();
```

`Form` and `Input` are wrappers over `<form />` and `<input />`, so you may pass all the normal attributes you would into a primitive form. Props for controlled forms are unnecessary as they are built into the wrapper. You do not need `onChange` and `value` props.

```js
  <Form
    onSubmit={(e) => {
      // `getFormValues` is internally called on submit and given to React's event object. You may also try getters directly in your submit, or any other method on the form.
      if(isFormValid()){
        // do the thing
        console.log(e.inputValues);
      }
    }}
  >
    <label htmlFor="input-1a">1a: </label>
    <Input
      id="input-1a"
      name="input-1a"
      runOnFocus={() => {
        console.log("running on focus");
      }}
      validate={(text) => (text.length >= 2)}
    />
    <button>Submit form 1</button>
  </Form>
```

### Available Form methods

Destructure (or read) these from `createFormStore()`. NOTE: Inputs are registered on mount so getters running before React's commit phase will read from an empty Form.

 - `getFormValues`:  Invoke for KVPs of all input **values** of your Form. Keys are the `id` properties given to each input. If inputs have no `id`, they are assigned a counter.
 - `getFormInputs`:  Invoke for all Inputs of Form as KVPs. 
 - `getInput`:  Invoke with id of input you want. If input is not in the Form returns `undefined` instead. 
 - `isFormValid`:  Returns a boolean after reading the `isValid` property of all Inputs. 
 - `resetForm`:  Use to manually reset input values. Called internally after running `onSubmit`, so you may not need to call this yourself. 
 - `getFormStore`:  Allows you to read the Form's metadata and configuration. 

### Available Form properties

You may configure these properties by giving `createFormStore` an initial options object. Most of these features are coming soon.

 - `handleSubmit`: Placeholder function that simply `warn`s if `onSubmit` handler not provided.
 - `requireSpinner`: Defaults to `false`. Feature coming soon: use this flag to cause form to use your provided spinner on submission.
 - `spinner`: `Boolean`. Feature coming soon: Flag to start spinner on submission. Flip to false to turn spinner off when async event completes. Setter will be provided.
 - `spinnerTimeout`: `null | number` Use to provide a hard coded spinner run time.

### Available Input properties

Input component prop default values below. Props not listed here will be passed into the `input` primitive. Expect a React warning if using a prop not listed.

  - `inputKey`: `null` Used as an internal identifier. Borrows the value of `id` if there is one, otherwise will be assigned a counter value.
  - `type`: `text`
  - `name`: `""`
  - `touched`: `false`
  - `isValid`: `false`
  - `initialInputValue`: `""`
  - `validate`: `null`
  - `runOnChange`: `null`
  - `runOnFocus`: `null`
  - `runOnBlur`: `null`
  - `runOnInvalid`: `null` 