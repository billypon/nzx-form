import { FormGroup } from '@angular/forms';
import { Dictionary } from '@billypon/ts-types';

import { FormState, FormStateGroup, EmptyFormGroup } from './form.types';

export class NzxForm {
  state: Dictionary<FormState>;
  stateGroup: Dictionary<FormStateGroup>;
  submit: () => void;
  value: Dictionary = { };
  groupChange: (group: FormGroup) => void;
  layout: string = 'horizontal';
  class: string | Dictionary<boolean> = '';

  private _group: FormGroup = EmptyFormGroup;
  get group(): FormGroup {
    return this._group;
  }
  set group(value: FormGroup) {
    this._group = value;
    if (this.groupChange) {
      this.groupChange(value);
    }
  }

  private _loading: boolean;
  get loading(): boolean {
    return this._loading;
  }
  set loading(value: boolean) {
    this._loading = value;
    if (this._group) {
      this._group[value ? 'disable' : 'enable']();
    }
  }
}
