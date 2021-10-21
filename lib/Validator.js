/**
 * @typedef Types
 * @description Validation types supported.  The auto type tries to determine the type automatically.
 * @readonly
 * @enum {string}
 */
const Types = {
  auto: 'auto',
  string: 'string',
  number: 'number',
  hexString: 'hexString',
}

/**
 * @typedef Test
 * @readonly
 * @enum {string}
 */
const Test = {
  min: 'min',
  max: 'max',
  regex: 'regex',
  required: 'required',
  validType: 'validType',
  customValidation: 'customValidation'
}

const FailMessages = {
  required: 'is required',
  minValue: 'must be >= ##',
  maxValue: 'must be <= ##',
  minLength: 'must be at least of length ##',
  maxLength: 'must be at most of length ##',
  regex: 'must match regular expression ##',
  notNumber: 'must be a number',
  notString: 'must be a string',
  notHexString: 'must be a hex string',
}

function isHexString(value) {
  return typeof value == 'string' && /^[a-fA-F0-9]+$/.test(value);
}

/**
 * @typedef dictionary
 * @dict
 */

/**
 * An object that corresponds to a custom validation function
 * @typedef {function} CustomValidator - a function that takes the value and returns an error message or null
 */

/**
 * An object that corresponds to a custom validation function
 * @typedef ValidationError
 * @property {object} errors - Error object, keyed by the test that failed and the value that it was tested against (if any)
 * @property {string} errorMessage - the error message to display if the validation fails.  This could be the custom message provided or the composite message otherwise
 */

class Validator {
  /**
   *
   * @param {object} params - parameters defining the validator
   * @param {type} [params.type=string] = one of the valid types.  If unrecognized, it defaults to string.
   * @param {string} [params.name] = the name for the entity that is being validated.  If present it is used in the construction of error messages
   * @param {number} [params.min] = minimum value - for numbers it is value, for strings it is length (gte semantic)
   * @param {number} [params.max] = max value - for numbers it is value, for strings it is length (lte semantic)
   * @param {boolean} [params.required=false] = if set, the value must be set and not blank
   * @param {RegExp} [params.regex] - if set, the string value must match the regex
   * @param {string} [params.message] - if set, this message is the message to display if the validation fails.  If not specified, it is determined automatically.
   * @param {CustomValidator} [params.validator] - if set, this is function is run in addition to any other rules.  The function must return a boolean
   */
  constructor(params) {
    this.min = params.min;
    this.max = params.max;
    this.type = Types[params.type] || Types.auto
    this.required = params.required || false
    this.regex = params.regex;
    this.message = params.message;
    this.validator = params.validator;
    this.name = params.name || 'value';
  }

  /**
   *
   * @param {Array<string>} fragments - create a composite sentence from the fragments
   * @returns {string} - the composite sentence
   */
  _makeCompositeSentence(fragments) {
    return fragments.length > 1 ? fragments.slice(0,fragments.length-1).map(s => s.trim()).join(', ') + ' and ' + fragments.slice(-1)[0].trim() : fragments[0].trim()
  }

  /**
   * Return the validators error message based upon the rules
   * @param {dictionary} - errors
   * @param {string} - other error message
   * @returns {string} - error message describing he issues
   * @private
   */
  _errorMessage(errors) {
    if ( this.message ) return this.message
    else return this.name + ' ' + this._createMessage(errors)
  }
  /**
   * Create an automatic message based upon the rules
   * @param {Array<string>} errors - array of failed conditions used to construct the error message
   * @returns {string} - the composed error message
   * @private
   */
  _createMessage(errors) {
    let m = [];
    if ( errors[Test.required] ) m.push(FailMessages.required)
    if ( errors[Test.min] ) m.push(
      this.type == Types.number ? FailMessages.minValue.replace('##',this.min) : FailMessages.minLength.replace('##',this.min)
    )
    if ( errors[Test.max] ) m.push(
        this.type == Types.number ? FailMessages.maxValue.replace('##',this.max) : FailMessages.maxLength.replace('##',this.max)
    )
    if ( errors[Test.regex]) m.push(FailMessages.regex.replace('##',this.regex.toString()));
    if ( errors[Test.validType]) m.push(
      this.type == Types.number ? FailMessages.notNumber :
      this.type == Types.hexString ? FailMessages.notHexString :
      FailMessages.notString)
    // A custom error message is not one o ours
    if ( errors[Test.customValidation] ) m.push(errors[Test.customValidation]);
    return this._makeCompositeSentence(m);
  }

  /**
   *
   * @param {any} value - validate the input value based upon the previous rules
   * @returns {ValidationError|null} - returns the validation error object if there were errors, else null
   */
  validate(value) {
    let type;
    if ( this.type === Types.auto ) {
      if ( !isNaN(value) ) type = Types.number
      else if ( isHexString(value) ) type = Types.hex
      else type = Types.string
    } else
      type = this.type;

    let errors={};
    if ( value == null ) {
      if ( this.required ) errors[Test.required] = true;
    } else {
      // not null
      if ( type == Types.number ) {
        if ( isNaN(value) ) errors[Test.validType] = Types.number;
        else {
          if ( this.min != null && value < this.min) errors[Test.min] = this.min;
          if ( this.max != null && value > this.max ) errors[Test.max] = this.max;
        }
      } else {
        // String
        if ( type == Types.string && typeof value != 'string' ) errors[Test.validType] = type;
        else {
          if ( this.max != null && value.length < this.min) errors[Test.min] = this.min;
          if ( this.max != null && value.length > this.max ) errors[Test.max] = this.max;
          if ( this.regex != null && !this.regex.test(value) ) errors[Test.regex] = this.regex;
          if ( type == Types.hexString && !isHexString(value) ) errors[Test.validType] = type;
        }
      }
    }
    if ( this.validator && typeof this.validator == 'function' ) {
      let customErrorMessage = this.validator(value);
      if ( customErrorMessage ) errors[Test.customValidation] = customErrorMessage;
    }
    if ( Object.keys(errors).length > 0 ) {
      return {
        errors,
        errorMessage: this._errorMessage(errors)
      }
    } else {
      return null;
    }
  }
}

module.exports = {
  Validator,
  Types,
  Test
}
