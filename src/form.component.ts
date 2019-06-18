import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dictionary } from '@billypon/ts-types';

import {
  FormState,
  FormGroupState,
  FormStateAddition,
  FormStateAdditionDataFrom,
  FormStateDataOption,
  FormStateDictionary,
  FormField,
  FormFieldDictionary,
  EmptyFormGroup
} from './form.types';

@Component({
  selector: 'nzx-form',
  templateUrl: './form.component.pug'
})
export class NzxFormComponent {
  @Input('state')
  set formState(value: FormStateDictionary) {
    if (value) {
      this.groupLabel = { };
      const { group, field } = this.buildForm(value);
      this.formGroup = this.fb.group(group);
      this.formField = field;
      this.initForm(value, field);
      this.formGroupChange.emit(this.formGroup);
    }
  }

  @Output('groupChange')
  formGroupChange = new EventEmitter<FormGroup>();

  @Output('submitChange')
  formSubmitChange = new EventEmitter<() => void>();

  @Input('layout')
  formLayout: string = 'horizontal';

  @Output('submit')
  formSubmit = new EventEmitter<Dictionary>();

  formGroup: FormGroup = EmptyFormGroup;
  formField: FormFieldDictionary;
  groupLabel: Dictionary<string>;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.formSubmitChange.emit(this.submitForm.bind(this));
  }

  protected buildForm(state: FormStateDictionary): { group: Dictionary; field: FormFieldDictionary } {
    const group: Dictionary = { };
    const field: FormFieldDictionary = { };
    Object.keys(state).forEach(name => {
      const groupState = state[name] as FormGroupState;
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
        placeholder = '',
        tooltip,
        type,
        subtype,
        validators,
        addition,
        disabled,
        extra,
        error,
        template
      } = state[name] as FormState;
      group[name] = [ { value, disabled }, validators ];
      field[name] = {
        label,
        placeholder: placeholder !== undefined ? placeholder : label,
        tooltip,
        type: type || 'input',
        subtype: subtype || 'text',
        required: ((validators || [ ]) as any).includes(Validators.required),
        addition: addition || { },
        extra,
        error: error || { },
        template,
      } as FormField;
    });
    return { group, field };
  }

  submitForm(): void {
    if (!this.formGroup.invalid) {
      this.formSubmit.emit(this.formGroup.value);
    }
  }

  protected initForm(state: FormStateDictionary, field: FormFieldDictionary, prefix = ''): void {
    Object.keys(state).forEach(x => {
      const path = prefix + x;
      const control = this.formGroup.get(path);
      if (control instanceof FormGroup) {
        this.initForm((state[x] as FormGroupState).state, field[x] as Dictionary<FormField>, `${ path }`);
        return;
      }
      control.valueChanges.subscribe(() => {
        field[x].errors = null;
        if (control.errors) {
          (field[x] as FormField).errors = Object.keys(control.errors);
        }
      });
      field[x].control = control;
      const { addition = { } } = state[x] as FormState;
      if (addition.dataFrom) {
        if (typeof addition.dataFrom === 'string') {
          (this.http.get(addition.dataFrom) as Observable<FormStateDataOption[]>).subscribe(items => addition.data = items);
        } else if (addition.dataFrom instanceof Observable) {
          addition.dataFrom.subscribe(items => addition.data = items);
        } else if ([ 'query', 'param' ].every(target => !addition.dataFrom[target])) {
          this.loadData(addition);
        } else {
          [ 'query', 'param' ].forEach(target => {
            if (addition.dataFrom[target]) {
              this.initReference(addition.dataFrom[target], () => this.loadData(addition));
            }
          });
        }
      }
    });
  }

  private initReference(object: Dictionary, callback: Function): void {
    let load: boolean = true;
    Object.keys(object).forEach(x => {
      const path = object[x];
      if (path[0] === '#') {
        const control = this.formGroup.get(path.substr(1));
        if (control) {
          control.valueChanges.subscribe(value => {
            object[x] = value;
            callback();
          });
        }
      }
      load = load && path[0] !== '#';
    });
    if (load) {
      callback();
    }
  }

  protected loadData(addition: FormStateAddition): void {
    let url: string = (addition.dataFrom as FormStateAdditionDataFrom).url || addition.dataFrom as string;
    const { query, param, map, parse } = addition.dataFrmm as FormStateAdditionDataFrom;
    if (url) {
      if (param) {
        Object.keys(param).forEach(x => url = url.replace(':' + x, param[x]));
      }
      const params = query ? new HttpParams({ fromObject: query }) : null;
      const observable = this.http.get(url, { params });
      (!parse ? observable : observable.pipe(parse)).subscribe((items: any[]) => {
        if (map) {
          items.forEach(item => {
            Object.keys(map).forEach(x => item[x] = item[map[x]]);
          });
        }
        addition.data = items;
      });
    }
  }

  updateValidity(control: AbstractControl): void {
    if (this.formGroup.updateOn === 'change') {
      control.updateValueAndValidity({ onlySelf: true });
    }
  }
}
