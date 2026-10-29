import { NgTemplateOutlet } from '@angular/common';
import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventThumbComponent } from './event-thumb';
import { IconComponent } from './icon';
import { Store } from './store';
import { VolunteerActionComponent } from './volunteer-action';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, VolunteerActionComponent, EventThumbComponent, IconComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  store = inject(Store);

  /** Past opportunities start collapsed. */
  showPast = signal(false);
  /** The next few shifts for the "Your upcoming shifts" strip. */
  nextShifts = computed(() => this.store.myEvents().slice(0, 3));

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
