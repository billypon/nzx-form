import { Component, OnInit } from '@angular/core';
import { Dictionary } from '@billypon/ts-types';

import { NzxForm } from 'nzx-form';

@Component({
  selector: 'nzx-form-table-demo-basic',
  template: '<nzx-form [state]="form.state" (groupChange)="form.group = $event" [layout]="form.layout" (onSubmit)="onSubmit($event)"></nzx-form>'
})

export class NzxFormDemoBasicComponent implements OnInit {
  form: NzxForm = new NzxForm;

  ngOnInit(): void {
    this.form.state = {
      label: 'test',
      value: 'test value'
    };
  }

  onSubmit(value: Dictionary): void {
    console.log(value);
  }
}
