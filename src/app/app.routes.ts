import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { ScheduleComponent } from './pages/schedule/schedule';
import { SearchComponent } from './pages/search/search';
import { Signup } from './pages/signup/signup';
import { SignupConfirmation } from './pages/signup-confirmation/signup-confirmation';
import { RegistrationReview } from './pages/registration-review/registration-review';
import { RegistrationConfirmation } from './pages/registration-confirmation/registration-confirmation';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'schedule', component: ScheduleComponent },
  { path: 'search', component: SearchComponent },
  { path: 'signup', component: Signup },
  { path: 'signup-confirmation', component: SignupConfirmation },
  { path: 'registration-review', component: RegistrationReview },
  { path: 'registration-confirmation', component: RegistrationConfirmation },
  { path: '**', redirectTo: '' }
];