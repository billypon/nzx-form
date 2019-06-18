import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NgObjectPipesModule } from 'ngx-pipes';

import { NzxFormComponent } from './form.component';

@NgModule({
  imports: [ CommonModule, FormsModule, ReactiveFormsModule, NgZorroAntdModule, NgObjectPipesModule ],
  declarations: [ NzxFormComponent ],
  exports: [ NzxFormComponent ]
})
export class NzxFormModule {
}
