import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

import { MaterialModule } from '../shared/material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

//Personalización de paginator en todos los módulos a español
import { CustomPaginatorIntl } from './utils/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AuthInterceptor } from './guards/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SolicitudesComponent } from './components/pages/solicitudes/solicitudes.component';

import { SolicitudHistorialComponent } from './components/layout/solicitud-historial/solicitud-historial.component';
import { SolicitudCardComponent } from './components/layout/solicitud-card/solicitud-card.component';
import { FormPermisoComponent } from './components/layout/form-permiso/form-permiso.component';
import { FormVacacionComponent } from './components/layout/form-vacacion/form-vacacion.component';
import { CardCalendarComponent } from './components/content/card-calendar/card-calendar.component';
import { ModalVacacionComponent } from './components/content/modal-vacacion/modal-vacacion.component';
import { PdfVacacionComponent } from './components/content/pdf-vacacion/pdf-vacacion.component';
import { ModalReemplazoComponent } from './components/content/modal-reemplazo/modal-reemplazo.component';
import { DatosComponent } from './components/pages/datos/datos.component';
import { ModificarPasswordComponent } from './components/layout/modificar-password/modificar-password.component';
import { MessageDialogComponent } from '../shared/components/message-dialog/message-dialog.component';
import { FormFechaComponent } from './components/layout/form-fecha/form-fecha.component';
import { BandejaComponent } from './components/pages/bandeja/bandeja.component';
import { FormHoraComponent } from './components/layout/form-hora/form-hora.component';
import { HelpComponent } from './components/pages/help/help.component';
import { ModalVideoComponent } from './components/content/modal-video/modal-video.component';

// Define los formatos de fecha
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YY',
  },
  display: {
    dateInput: 'DD/MM/YY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SolicitudesComponent,
    SolicitudHistorialComponent,
    SolicitudCardComponent,
    FormPermisoComponent,
    FormVacacionComponent,
    CardCalendarComponent,
    ModalVacacionComponent,
    PdfVacacionComponent,
    ModalReemplazoComponent,
    DatosComponent,
    ModificarPasswordComponent,
    MessageDialogComponent,
    FormFechaComponent,
    BandejaComponent,
    FormHoraComponent,
    HelpComponent,
    ModalVideoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    AsyncPipe,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [
    AuthService,
    AuthGuard,
    provideClientHydration(),
    provideAnimationsAsync(),
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
