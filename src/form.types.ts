import { TemplateRef } from '@angular/core';
import { FormGroup, AbstractControl, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { Dictionary } from '@billypon/ts-types';

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
  hidden?: boolean | (() => boolean);
  helpText?: string | (() => string);
  errorText?: Dictionary<string | ((state: object) => string)>;
  template?: TemplateRef<void>;
  fullControlTpl?: TemplateRef<void>;
  controlTpl?: TemplateRef<void>;
  helpTpl?: TemplateRef<void>;
  errorTpl?: TemplateRef<void>;
}

export interface FormStateGroup {
  label?: string;
  state: Dictionary<FormState>;
}

export type FormStateDictionary = Dictionary<FormState> | Dictionary<FormStateGroup>;

export interface FormField {
  label: string;
  placeholder: string;
  type: string;
  subtype: string;
  addition: FormStateAddition;
  required: boolean;
  hidden: () => boolean;
  helpText: () => string;
  errorText: Dictionary<(state: object) => string>;
  template: TemplateRef<void>;
  fullControlTpl?: TemplateRef<void>;
  controlTpl: TemplateRef<void>;
  helpTpl?: TemplateRef<void>;
  errorTpl?: TemplateRef<void>;
  control: AbstractControl;
  errors?: string[];
}

export interface FormFieldDictionary extends Dictionary<FormField | Dictionary<FormField>> {
}

export interface FormStateAddition {
  size?: 'small' | 'default' | 'large';
  label?: boolean;
  class?: {
    item?: string;
    label?: string;
    control?: string;
  }
}

export interface InputAddition extends FormStateAddition {
  maxlength?: number;
  addonBefore?: string | TemplateRef<void>;
  addonAfter?: string | TemplateRef<void>;
  prefix?: string | TemplateRef<void>;
  suffix?: string | TemplateRef<void>;
  multiline?: boolean;
}

export interface InputNumberAddition extends FormStateAddition {
  format?: string;
}

export interface SelectAddition extends FormStateAddition {
  data?: SelectDataOption[];
  dataFrom?: string | Observable<SelectDataOption[]> | SelectDataFrom;
  allowClear?: boolean;
}

export interface SelectDataOption<T = any> {
  label: string;
  value: T;
}

export interface SelectDataFrom<T = any> {
  url: string;
  query?: Dictionary<string>;
  param?: Dictionary<string>;
  observe?: (observable: Observable<any>) => Observable<T[]>;
  parse?: (result?: any) => T[];
}

export const EmptyFormGroup = new FormGroup({ });
