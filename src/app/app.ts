import { Component, computed, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { EventThumbComponent } from './event-thumb';
import { IconComponent } from './icon';
import { Store } from './store';
import { VolunteerActionComponent } from './volunteer-action';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, EventThumbComponent, VolunteerActionComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  host: { '(document:keydown.escape)': 'store.dismissOverlay()' }
})
export class AppComponent {
  store = inject(Store);
  private router = inject(Router);

  year = new Date().getFullYear();

  /** "Jane Q. Doe" -> "JD" */
  initials = computed(() => {
    const parts = (this.store.account()?.name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (parts[0][0] + last).toUpperCase();
  });

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }
}
