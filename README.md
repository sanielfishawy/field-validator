# Validator

This is a simple package for validating values (typically input by the user).

## Installation
`npm install validator`

## Usage
After importing the validator, you can create a validator instance using
```
let validator = new Validator(params);
let results = validator.validate(value);
```

where params are:

| parameter  | description
|------------|-------------
|_type_      | the type of input expected.  Currenly limited to number, string, and hexString
|_required_  | if truthy, considers the input to be required
|_min_       | if set, applies a minimum to the input value.  For numbers it is based upon value and for strings it represents length.
|_max_       | if set, applies a maximum to the input value.  For numbers it is based upon value and for strings it represents length.
|_regex_     | if set to a regular expression, will apply this against any string input
|_validator_ | if set to a function, run this in addition to any other checks.  The function must return null if validations passed, and an error message otherwise
|_name_      | if set, will use this in constructing the error message
|_message_   | if set, will return this message if any validatio failes rather than any of the constructed messages.

The validation is performed using the validate method on the value;
The result is an object of form
```
{
  errors,
  errorMessage
}

Where errors is a dictionary indexed by the validation error type and returns the value that was validated against (except in the case of the custom validator, in which it contains the error message).
```

## Examples

Suppose you are querying the user for a value for a name, which must be between 6 and 15 chars long, start with a letter, and only include letters, numbers, and _, i.e. match the regular expression `/^[a-zA-Z][a-zA-Z0-9_]+$/`, you can create the validator as

```
let nameValidator = new Validator({name:'name',regex:/^[a-zA-Z][a-zA-Z0-9_]+$/,min:6,max:15,required:true})

let input = getuserInput();
-- Assume input is too short and doesn't match the regex, e.g. 9/13

let valitionResult = nameValidator.validate('9/13');
if ( validationResult ) {

  // Now validation result will contain errors that has two keys: 'min' and 'custom'

  let {errors,errorMessage} = validationResult;
  console.log('errors=',errors)

// errors= { min: 6, regex: /^[a-zA-Z][a-zA-Z0-9_]+$/ }

  console.log('error message=',errorMessage)

// error message= name must be at least of length 6 and must match regular expression /^[a-zA-Z][a-zA-Z0-9_]+$/

}
```

The user may not understand what the validation result means, so it may be more userfriendly to create the validator with:

```
let nameValidator = new Validator({name:'name',regex:/^[a-zA-Z][a-zA-Z0-9_]+$/,min:6,max:15,required:true,message:'The name must be between 6 and 15 characters long, start with a leter, and only contain letters, numbers, and _'})

let {errorMessage} = nameValidator.validate(input);
console.log('error message=',errorMessage)

// error message= The name must be between 6 and 15 characters long, start with a leter, and only contain letters, numbers, and _
```

You could also provide a custom validator, for example, one that enforces that the input have at least one capital letter, one number, and one special character and starts with a letter (you could do this with regex):

```
let passwordValidation = (value) => {
  if ( !/[a-z,A-Z]/.test(value[0]) || !/[A-Z]/.test(value) || !/[0-9]/.test(value) || !/[*&^%$#@.,:;]/.test(value) )
    return 'must contain at least one capital letter, one number, and one special character and starts with a letter'
  else
    return null;
}

let passwordValidator = new Validator({type:'string',min:8,max:15,validator:passwordValidation})

```