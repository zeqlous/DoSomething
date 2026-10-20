import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ScheduleComponent } from './pages/schedule/schedule';
import { SearchComponent } from './pages/search/search';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'search', component: SearchComponent },
  { path: '**', redirectTo: '' }
];