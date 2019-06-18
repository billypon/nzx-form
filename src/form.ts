import { FormGroup } from '@angular/forms';
import { Dictionary } from '@billypon/ts-types';

import { FormState, EmptyFormGroup } from './form.types';

export class NzxForm {
  state: Dictionary<FormState>;
  group: FormGroup = EmptyFormGroup;
  submit: () => void;
  layout: string = 'horizontal';
  class: string = '';
}
