import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MaterialModule } from "./material/material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxMatSelectSearchModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [],
})
export class SharedModule {}
