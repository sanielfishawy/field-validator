import {expect} from 'chai';
import { describe, it } from 'mocha';
import {Validator,Types,Test as ValidationTest} from './lib/Validator.js'

function tests() {
  describe( 'Internal Utility Functions', () => {
    let numValidator;
    before(() => {
      numValidator = new Validator({type:Types.number,min:3,max:10,required:true})
    });
    describe('Composition tests', () => {
      it('should handle a single fragment', () => {
        let s = ['a single fragment']
        expect(numValidator._makeCompositeSentence(s)).to.equal(s[0]);
      });
      it('should handle two fagments', () => {
        let s1 = 'fragment 1'
        let s2 = 'fragment 2'
        let s = [s1,s2]
        expect(numValidator._makeCompositeSentence(s)).to.equal(s.join(' and '));
      });
      it('should handle multiple fagments', () => {
        let s1 = 'fragment 1'
        let s2 = 'fragment 2'
        let s3 = 'fragment 3'
        let s = [s1,s2,s3]
        expect(numValidator._makeCompositeSentence(s)).to.not.equal(s.join(' and '));
        expect(numValidator._makeCompositeSentence(s)).to.equal(s1 + ', ' + s2 + ' and ' + s3);
      });
    })
  });
  describe('only type validation', () => {
    let validator;
    it('should validate that the input is a number for type number', () => {
      validator = new Validator({type:Types.number})
      let result = validator.validate('string')
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.validType);
      let {errorMessage} = result;
      expect(errorMessage).to.eql('value must be a number')
    });
  });
  describe('numerical validation', () => {
    let numValidator;
    before(() => {
      numValidator = new Validator({type:Types.number,min:3,max:10,required:true})
    });
    it('should pass the min test', () => {
      let result = numValidator.validate(0);
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.min);
      let {errorMessage} = result;
      expect(errorMessage).to.eql('value must be >= 3')
    });
    it('should pass the max test', () => {
      let result = numValidator.validate(20);
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.max);
      let {errorMessage} = result;
      expect(errorMessage).to.eql('value must be <= 10')
    });
    it('should pass the requirement test', () => {
      let result = numValidator.validate(null);
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.required);
      let {errorMessage} = result;
      expect(errorMessage).to.eql('value is required')
    });
  });
  describe('string validation', () => {
    let stringValidator,fieldName = 'name';
    before(() => {
      stringValidator = new Validator({type:Types.string,min:10,max:20,required:true,regex:/^[\w\s]+$/,name:fieldName})
    });
    it('should pass the min test', () => {
      let result = stringValidator.validate('too short');
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.min);
      let {errorMessage} = result;
      expect(errorMessage).to.eql(`${fieldName} must be at least of length 10`)
    });
    it('should pass the max test', () => {
      let result = stringValidator.validate('this is way longer than the 20 chars max');
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.max);
      let {errorMessage} = result;
      expect(errorMessage).to.eql(`${fieldName} must be at most of length 20`)
    });
    it('should pass the requirement test', () => {
      let result = stringValidator.validate(null);
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.required);
      let {errorMessage} = result;
      expect(errorMessage).to.eql(`${fieldName} is required`)
    });
    it('should pass the regexp test', () => {
      let result = stringValidator.validate('this has a nonword;');
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.regex);
    });
    it('should address multiple failures', () => {
      let result = stringValidator.validate('&^x');
      expect(result).to.not.be.null;
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(2);
      expect(violations).to.include(ValidationTest.regex);
      expect(violations).to.include(ValidationTest.min);
      let {errorMessage} = result;
      expect(errorMessage).to.include('and');
    });
  })
  describe('Hex String validation',() => {
    it('should understand hex strings',() => {
      let validator = new Validator({type:Types.hexString})
      expect(validator.validate('F')).to.be.null;
      expect(validator.validate('3f')).to.be.null;
      expect(validator.validate('3fcc')).to.be.null;
      expect(validator.validate('022')).to.be.null;
      expect(validator.validate('022g')).to.not.be.empty
      expect(validator.validate('az')).to.to.not.be.empty
    })
    it('should support hex strings with other limitations',() => {
      let validator = new Validator({type:Types.hexString,min:2,max:6})
      expect(validator.validate('F')).to.not.be.empty;
      expect(validator.validate('3f')).to.be.null;
      expect(validator.validate('3fcc')).to.be.null;
      expect(validator.validate('022')).to.be.null;
      expect(validator.validate('022g')).to.not.be.empty;
      expect(validator.validate('az')).to.not.be.empty;
      expect(validator.validate('123ABCDE')).to.not.be.empty;
    })
    it('should support limiting value to allowed values', () => {
      let validator = new Validator({type:Types.string,allowed:['one','two','three']})
      let result = validator.validate('ONE')
      expect(result.errors[ValidationTest.allowed]).to.not.be.null;
      result = validator.validate('one')
      expect(result).to.be.null
      result = validator.validate('two')
      expect(result).to.be.null

    });
  })
  describe('Custom validation', () => {
    it('should support custom validator for numerical values', () => {
      let customValidator = (value) => {
        if ( value % 2 == 0 ) return 'must be an odd number'
        else return null;
      }
      let validator = new Validator({type:Types.number,min:5,validator:customValidator})
      let result = validator.validate(7)
      expect(result).to.be.null;
      result = validator.validate(8)
      let violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(1);
      expect(violations).to.include(ValidationTest.customValidation)
      let {errorMessage} = result;
      expect(errorMessage).to.eql('value must be an odd number')
      result = validator.validate(2)
      violations = Object.keys(result.errors);
      expect(violations.length).to.be.eql(2);
      expect(violations).to.include(ValidationTest.min)
      expect(violations).to.include(ValidationTest.customValidation)
      errorMessage = result.errorMessage;
      expect(errorMessage).to.eql('value must be >= 5 and must be an odd number')
    });
  })
  describe('Added types', () => {
    before(() => {
      Validator.addTypedef({
        type: 'mac',
        regex: /^([a-fA-F0-9]{2}:){1,}[a-fA-F0-9]{2}$/,
        min:17,
        max:17,
        message:'must have standard MAC format of form nn:nn:nn:nn:nn:nn where nn is a hex pair'
      })
    });
    it('should support dynamically added typedefs', () => {
      let validator = new Validator({type:'mac'})
      expect(validator.validate('something')).to.not.be.empty
      expect(validator.validate('12:13')).to.not.be.empty
      expect(validator.validate('12:13:dd')).to.not.be.empty
      expect(validator.validate('12:13:dd:ee:ff')).to.not.be.empty
      expect(validator.validate('12:13:dd:ee:ff:1g')).to.not.be.empty
      expect(validator.validate('12:13:dd:ee:ff:10:')).to.not.be.empty
      expect(validator.validate('12:13:dd:ee:ff:10')).to.be.null
    });
    it('should disallow overloading native types', () => {
      expect(() => {
        Validator.addTypedef({
          type: 'string',
          regex: /^([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}$/,
          min:17,
          max:17,
          message:'must have standard MAC format of form nn:nn:nn:nn:nn:nn where nn is a hex pair'
        })

      }).to.throw(Error);
    });
    it('should allow overriding typedef params at realtime', () => {
      let validator = new Validator({type:'mac',min:8,max:8})
      expect(validator.validate('12:13:dd:ee:ff:10')).to.not.be.empty
      expect(validator.validate('12:13:gg')).to.not.be.empty
      expect(validator.validate('12:13:dd:ee:ff:10')).to.not.be.empty
      expect(validator.validate('12:13:ff')).to.be.null

    });
  });
}

tests();
