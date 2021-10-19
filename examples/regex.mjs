import {Validator} from '../index.mjs'

let nameValidator = new Validator({name:'name',regex:/^[a-zA-Z][a-zA-Z0-9_]+$/,min:6,max:15,required:true})
let input = '9/13'

let result = nameValidator.validate(input);

let {errors,errorMessage} = result;

console.log('errors=',errors)
console.log('error message=',errorMessage)

// Now try again with the custom message

nameValidator = new Validator({
  name:'name',
  regex:/^[a-zA-Z][a-zA-Z0-9_]+$/,
  min:6,max:15,
  required:true,
  message:'The name must be between 6 and 15 characters long, start with a letter, and only contain letters, numbers, and _'
})

result = nameValidator.validate(input);

errorMessage = result.errorMessage;

console.log('error message=',errorMessage)

