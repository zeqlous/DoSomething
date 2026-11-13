import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from './store';
import { initials as makeInitials } from './initials';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent {
  store = inject(Store);

  initials = computed(() => makeInitials(this.store.account()?.name ?? ''));

  memberSince = computed(() => {
    const t = this.store.account()?.created;
    return t ? new Date(t).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
  });

  /** Each organization with how many open events it has. */
  orgRows = computed(() =>
    this.store.orgs.map(name => ({ name, open: this.store.openEvents().filter(e => e.org === name).length })));
}
