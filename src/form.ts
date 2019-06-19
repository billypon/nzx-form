import { FormGroup } from '@angular/forms';
import { Dictionary } from '@billypon/ts-types';

import { FormState, EmptyFormGroup } from './form.types';

export class NzxForm {
  state: Dictionary<FormState>;
  submit: () => void;
  value: Dictionary = { };
  groupChange: () => void;
  layout: string = 'horizontal';
  class: string | Dictionary<boolean> = '';
  loading: boolean;

  private _group: FormGroup = EmptyFormGroup;
  get group(): FormGroup {
    return this._group;
  }
  set group(value: FormGroup) {
    this._group = value;
    if (this.groupChange) {
      this.groupChange();
    }
  }
}
