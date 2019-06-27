import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
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

  @Input('layout')
  formLayout: string = 'horizontal';

  @Output('onSubmit')
  formSubmit = new EventEmitter<Dictionary>();

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
        template
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
          this.http.get(addition.dataFrom).subscribe((items: FormStateDataOption[]) => addition.data = items);
        } else if (addition.dataFrom instanceof Observable) {
          addition.dataFrom.subscribe(items => addition.data = items);
        } else if ([ 'query', 'param' ].every(name => !addition.dataFrom[name])) {
          this.loadData(addition);
        } else {
          [ 'query', 'param' ].forEach(name => {
            if (addition.dataFrom[name]) {
              this.initReference(addition, name);
            }
          });
        }
      }
    });
  }

  private initReference(addition: FormStateAddition, name: string): void {
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

  protected loadData(addition: FormStateAddition): void {
    const dataFrom = addition.dataFrom as FormStateAdditionDataFrom;
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
        observable.subscribe((result: any) => addition.data = parse ? parse(result) : result as FormStateDataOption[]);
      }
    }
  }

  updateValidity(control: AbstractControl): void {
    control.setErrors(control.errors);
  }
}
