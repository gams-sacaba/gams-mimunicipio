import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
// import { OrganigramaComponent } from './components/pages/organigrama/organigrama.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import(`./components/page-routing.module`).then(
            (m) => m.PageRoutingModule
          ),
      },
    ],
    canActivate: [AuthGuard],
    data: { roles: ['root', 'user', 'visitor'] },
  },
  //   { path: 'organigrama', component: OrganigramaComponent },
  // Redirigir a home por defecto
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
