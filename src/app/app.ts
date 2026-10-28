import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Store } from './store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  store = inject(Store);
  private router = inject(Router);

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }
}