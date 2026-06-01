import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ValidadorQrComponent } from './components/validador-qr/validador-qr.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'validar/:codigoHash', component: ValidadorQrComponent },
  {
    path: '',
    component: HomeComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import(`./components/page-routing.module`).then(
            (m) => m.PageRoutingModule,
          ),
      },
    ],
    canActivate: [AuthGuard],
    data: { roles: ['root', 'user', 'visitor'] },
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
