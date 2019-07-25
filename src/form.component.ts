import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InputBoolean } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { Dictionary } from '@billypon/ts-types';

import {
  FormState,
  FormStateGroup,
  FormStateDictionary,
  FormField,
  FormFieldDictionary,
  FormStateAddition,
  SelectAddition,
  SelectDataFrom,
  SelectDataOption,
  EmptyFormGroup,
} from './form.types';

export function hasError(control: AbstractControl): boolean {
  return control.invalid && (control.touched || control.dirty);
}

@Component({
  selector: 'nzx-form',
  templateUrl: './form.component.pug'
})
export class NzxFormComponent implements OnInit {
  @Input('state')
  set formState(value: FormStateDictionary) {
    if (value) {
      this.groupLabel = { };
      const { group, field } = this.buildForm(value);
      this.formGroup = this.fb.group(group);
      this.formGroupChange.emit(this.formGroup);
      this.formField = field;
      this.initForm(value, field);
    }
  }

  @Output('groupChange')
  formGroupChange = new EventEmitter<FormGroup>();

  @Output('submitChange')
  formSubmitChange = new EventEmitter<() => void>();

  @Output('onSubmit')
  formSubmit = new EventEmitter<Dictionary>();

  @Input('loading') @InputBoolean()
  formLoading: boolean;

  @Input('layout')
  formLayout: string = 'horizontal';

  @Input('size')
  controlSize: 'small' | 'default' | 'large' = 'large';

  readonly hasError = hasError;

  formGroup: FormGroup = EmptyFormGroup;
  formField: FormFieldDictionary;
  groupLabel: Dictionary<string>;

  constructor(private fb: FormBuilder, private http: HttpClient) {
  }

  ngOnInit() {
    this.formSubmitChange.emit(this.submitForm.bind(this));
  }

  protected buildForm(state: FormStateDictionary): { group: Dictionary; field: FormFieldDictionary } {
    const group: Dictionary = { };
    const field: FormFieldDictionary = { };
    Object.keys(state).forEach(name => {
      const groupState = state[name] as FormStateGroup;
      if (groupState.state) {
        this.groupLabel[name] = groupState.label;
        const x = this.buildForm(groupState.state);
        group[name] = this.fb.group(x.group);
        field[name] = x.field as Dictionary<FormField>;
        return;
      }
      const {
        label,
        value,
        placeholder,
        type,
        subtype,
        validators,
        asyncValidators,
        updateOn = 'change',
        addition = { },
        disabled,
        helpText,
        errorText,
        template,
        controlTpl,
      } = state[name] as FormState;
      group[name] = [ { value, disabled }, { validators, asyncValidators, updateOn } ];
      field[name] = {
        label,
        placeholder: placeholder === undefined ? label : (placeholder || ''),
        type: type || 'input',
        subtype: subtype || 'text',
        required: ((validators || [ ]) as any).includes(Validators.required),
        addition,
        helpText,
        errorText: errorText || { },
        template,
        controlTpl,
      } as FormField;
    });
    return { group, field };
  }

  submitForm(): void {
    if (this.formLoading) {
      return;
    }
    Object.keys(this.formGroup.controls).forEach(x => {
      const control = this.formGroup.controls[x];
      this.updateValidity(control, this.formField[x] as FormField);
      control.markAsTouched();
    });
    if (this.formGroup.valid) {
      this.formSubmit.emit(this.formGroup.value);
    }
  }

  protected initForm(states: FormStateDictionary, fields: FormFieldDictionary, prefix = ''): void {
    Object.keys(states).forEach(x => {
      const state = states[x] as FormState;
      const field = fields[x] as FormField;
      const path = prefix + x;
      const control = this.formGroup.get(path);
      if (control instanceof FormGroup) {
        this.initForm((states[x] as FormStateGroup).state, fields[x] as Dictionary<FormField>, path + '.');
        return;
      }
      control.valueChanges.subscribe(() => {
        field.errors = null;
        this.updateValidity(control, field);
      });
      field.control = control;
      const addition: SelectAddition = state.addition || { };
      if (addition.dataFrom) {
        if (typeof addition.dataFrom === 'string') {
          this.http.get(addition.dataFrom).subscribe((items: SelectDataOption[]) => addition.data = items);
        } else if (addition.dataFrom instanceof Observable) {
          addition.dataFrom.subscribe(items => addition.data = items);
        } else if ([ 'query', 'param' ].every(name => !addition.dataFrom[name])) {
          this.loadData(addition);
        } else {
          [ 'query', 'param' ].forEach(name => {
            if (addition.dataFrom[name]) {
              this.initSelect(addition, name);
            }
          });
        }
      }
    });
  }

  private initSelect(addition: SelectAddition, name: string): void {
    const params = addition.dataFrom[name];
    let load: boolean = true;
    Object.keys(params).forEach(x => {
      const path = params[x];
      if (path[0] === '#') {
        const control = this.formGroup.get(path.substr(1));
        if (control) {
          control.valueChanges.subscribe(value => {
            params[x] = value;
            if (value) {
              this.loadData(addition);
            } else {
              addition.data = [ ];
            }
          });
        }
      }
      load = load && path[0] !== '#';
    });
    if (load) {
      this.loadData(addition);
    }
  }

  protected loadData(addition: SelectAddition): void {
    const dataFrom = addition.dataFrom as SelectDataFrom;
    const { query, param, observe, parse } = dataFrom;
    let url: string = dataFrom.url || addition.dataFrom as string;
    if (url) {
      if (param) {
        Object.keys(param).forEach(x => url = url.replace(':' + x, param[x]));
      }
      const params = query ? new HttpParams({ fromObject: query }) : null;
      const observable = this.http.get(url, { params });
      addition.data = null;
      if (observe) {
        observe(observable).subscribe(items => addition.data = items);
      } else {
        observable.subscribe((result: any) => addition.data = parse ? parse(result) : result as SelectDataOption[]);
      }
    }
  }

  updateValidity(control: AbstractControl, field: FormField): void {
    control.setErrors(control.errors);
    if (control.errors) {
      field.errors = Object.keys(control.errors);
    }
  }

  getSizeClass(addition: FormStateAddition): Dictionary<boolean> {
    const dict: Dictionary<boolean> = { };
    const size = addition.size || this.controlSize;
    switch (size) {
      case 'small':
        dict.small = true;
        break;
      case 'large':
        dict.large = true;
        break;
      default:
        break;
    }
    return dict;
  }

  isShowLabel(field: FormField): boolean {
    return field.type !== 'select' || field.subtype !== '';
  }
}
