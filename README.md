# Reactiforms

This little package uses React context to minimize re-rendering of forms. Only the Input field rerenders when changes are made to inputs. Additional form utilities provided to make working with form data a little easier.

Provide a `validate` function as a prop to `Input` and you can easily check if your form state is valid on submission with `isFormValid`.

Broadcast of `Input` and `Form` state to subscribers coming soon.

***
## How to Use

In your Form component file, import `createFormStore`.

```js
import { createForm } from "reactiforms";
```

Create the Form object and extract the Form provider and Input components, along with any utilities you may need.

```js
const { Form, Input, getFormValues, isFormValid, resetForm } = createForm();
```

`Form` and `Input` are wrappers over `<form />` and `<input />` and are compatible with regular html attributes. Props for React controlled forms are unnecessary as they are built into the wrapper - you do not need `onChange` and `value` props.

```js
  <Form
    onSubmit={(e) => {
      // use like a vanilla submit handler.
      // Default behavior already prevented.

      if(isFormValid()){

        // do the thing
        console.log(getFormValues());

        // handy reset function provided
        resetForm();
      }
    }}
  >
    <label htmlFor="input-1a">1a: </label>
    <Input
      id="input-1"
      name="input-1"
      runOnFocus={() => console.log("running on focus")}
      runOnBlur={() => console.log("running on blur")}
      validate={(text) => (text.length >= 4)}
    />
    <button>Submit</button>
  </Form>
```

## Available Form methods

Destructure (or read) these from `createForm()`. NOTE: Inputs are registered on mount so getters running before React's commit phase will read from an empty Form.

 - `getFormValues`:  Invoke for KVPs of all input **values** of your Form. Keys are the `id` properties given to each input. If inputs have no `id`, they are assigned a counter.
 - `getFormInputs`:  Invoke for all Inputs of Form as KVPs. 
 - `getInput`:  Invoke with id of input you want. If input is not in the Form returns `undefined` instead. 
 - `isFormValid`:  Returns a boolean after reading the `isValid` property of all Inputs. 
 - `resetForm`:  Use to manually reset input values. 

## Available Form properties

You may configure these properties by giving `createFormStore` an initial options object. Most of these features are coming soon.

 - `handleSubmit`: Placeholder function that simply `warn`s if `onSubmit` handler not provided.
 - `requireSpinner`: Feature coming soon. Defaults to `false`. Use this flag to cause form to use your provided spinner on submission.
 - `spinner`: `Boolean` Feature coming soon. Flag to start spinner on submission. Flip to false to turn spinner off when async event completes. Setter will be provided.
 - `spinnerTimeout`: `null | number` Feature coming soon. Use to provide a hard coded spinner run time.

## Default Input properties

Input component prop default values below. Props not listed here will be passed into the `input` primitive. Expect a React warning if using a prop not listed.

  - `inputKey`: `null` Used as an internal identifier. Borrows the value of `id` if there is one, otherwise will be assigned a counter value.
  - `type`: `text`
  - `name`: `""`
  - `touched`: `false`
  - `isValid`: `null`
  - `initialInputValue`: `""`
  - `validate`: `null`
  - `runOnChange`: `null`
  - `runOnFocus`: `null`
  - `runOnBlur`: `null`
  - `runOnInvalid`: `null` 

## Todos

- dynamic styles when input data is invalid
- subscriptions to input and form data

Contributions welcome! Please create an [Issue](https://github.com/flow-state-15/Reactiforms/issues) if you spot an area of opportunity. [Pull Requests](https://github.com/flow-state-15/Reactiforms/pulls) for created issues are also welcome and appreciated. 