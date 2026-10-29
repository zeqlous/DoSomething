import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { ScheduleComponent } from './schedule';
import { SignupComponent } from './signup';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: SignupComponent, data: { mode: 'login' } },
  { path: '**', redirectTo: '' }
];
