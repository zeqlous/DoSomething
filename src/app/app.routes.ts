import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Schedule } from './pages/schedule/schedule';
import { Search } from './pages/search/search';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'schedule', component: Schedule },
  { path: 'search', component: Search },
  { path: '**', redirectTo: '' }
];