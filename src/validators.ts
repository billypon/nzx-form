import { ValidatorFn, AbstractControl, FormControl } from '@angular/forms';

export function test(fn: (value: any, control: FormControl) => any): ValidatorFn {
  return function (control: FormControl) {
    const result = fn(control.value, control);
    return result === true ? null : { test: result === false ? true : result };
  };
}

export function requiredBy(path: Array<string | number> | string, fn?: (value: any) => boolean): ValidatorFn {
  let field: AbstractControl;
  const validatorFn = function (control: FormControl) {
    if (!field) {
      field = control.root.get(path);
      if (field) {
        field.valueChanges.subscribe(value => {
          if (fn && fn(value)) {
            control.updateValueAndValidity({ onlySelf: true });
          } else if (value) {
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
      }
    }
    if (field && control.value) {
      return { required: true };
    }
    return null;
  };
  validatorFn['_required'] = true;
  return validatorFn;
}

export function equalWith(path: Array<string | number> | string): ValidatorFn {
  let field: AbstractControl;
  return function (control: FormControl) {
    if (!field) {
      field = control.root.get(path);
      if (field) {
        field.valueChanges.subscribe(value => {
          if (control.value === value) {
            control.updateValueAndValidity({ onlySelf: true });
          }
        });
      }
    }
    if (field && control.value !== field.value) {
      return { equalWith: true };
    }
    return null;
  };
}
