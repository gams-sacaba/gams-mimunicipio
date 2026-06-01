import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SolicitudesComponent } from './pages/solicitudes/solicitudes.component';
import { DatosComponent } from './pages/datos/datos.component';
import { BandejaComponent } from './pages/bandeja/bandeja.component';
import { HelpComponent } from './pages/help/help.component';
import { RecursosComponent } from './pages/recursos/recursos.component';

const routes: Routes = [
  { path: '', component: SolicitudesComponent },
  { path: 'bandeja', component: BandejaComponent },
  { path: 'solicitudes', component: SolicitudesComponent },
  { path: 'recursos', component: RecursosComponent },
  { path: 'ayuda', component: HelpComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PageRoutingModule {}
