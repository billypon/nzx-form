import { TemplateRef } from '@angular/core';
import { FormGroup, AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { Dictionary } from '@billypon/ts-types';
import { ObservablePipe } from '@billypon/rxjs-types';

export interface FormState {
  label: string;
  value?: any;
  placeholder?: string;
  type?: string;
  subtype?: string;
  validators?: ValidatorFn[];
  asyncValidators?: AsyncValidatorFn[];
  updateOn?: 'change' | 'blur' | 'submit';
  addition?: FormStateAddition;
  disabled?: boolean;
  helpText?: string;
  errorText?: Dictionary<string>;
  template?: TemplateRef<void>;
}

export interface FormStateAddition extends Dictionary {
  allowClear?: boolean;
  data?: FormStateDataOption[];
  dataFrom?: string | Observable<FormStateDataOption[]> | FormStateAdditionDataFrom
  format?: string;
  multiline: boolean;
  size?: 'small' | 'default' | 'large';
  suffix?: string;
  tooltip?: string | {
    title: string;
    trigger?: 'hover' | 'focus' | 'click';
    placement?: 'top' | 'left' | 'right' | 'bottom' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';
  };
}

export interface FormStateAdditionDataFrom<T = any> {
  url: string;
  query?: Dictionary<string>;
  param?: Dictionary<string>;
  observe?: (observable: Observable<any>) => Observable<T[]>;
  parse?: (result?: any) => T[];
}

export interface FormStateDataOption<T = any> {
  label: string;
  value: T;
}

export interface FormGroupState {
  label?: string;
  state: Dictionary<FormState>;
}

export type FormStateDictionary = Dictionary<FormState> | Dictionary<FormGroupState>;

export interface FormField {
  label: string;
  placeholder: string;
  type: string;
  subtype: string;
  addition: FormStateAddition;
  required: boolean;
  helpText: string;
  errorText: Dictionary<string>;
  template: TemplateRef<void>;
  control: AbstractControl;
  errors?: string[];
}

export interface FormFieldDictionary extends Dictionary<FormField | Dictionary<FormField>> {
}

export const EmptyFormGroup = new FormGroup({ });
