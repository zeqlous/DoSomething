import { Component, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from './store';
import { VolunteerActionComponent } from './volunteer-action';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, VolunteerActionComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  store = inject(Store);

  constructor() {
    // Coming back from signup: scroll to the event the visitor was looking at.
    afterNextRender(() => {
      const id = this.store.focusEventId();
      if (id === null) return;
      document.getElementById('event-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => this.store.focusEventId.set(null), 2500);
    });
  }
}
