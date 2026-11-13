import { NgTemplateOutlet } from '@angular/common';
import { Component, afterNextRender, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventThumbComponent } from './event-thumb';
import { IconComponent } from './icon';
import { Category, Store, VolunteerEvent } from './store';
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

  showPast = signal(false);
  nextShifts = computed(() => this.store.myEvents().slice(0, 3));

  // Search + filters
  query = signal('');
  category = signal<Category | 'all'>('all');
  favoritesOnly = signal(false);
  filtersActive = computed(() => !!this.query().trim() || this.category() !== 'all' || this.favoritesOnly());

  private matches(e: VolunteerEvent): boolean {
    const q = this.query().trim().toLowerCase();
    if (q && ![e.title, e.details, e.org, e.venue, e.location, e.category].join(' ').toLowerCase().includes(q)) return false;
    if (this.category() !== 'all' && e.category !== this.category()) return false;
    if (this.favoritesOnly() && !this.store.isFavorite(e.org)) return false;
    return true;
  }

  openFiltered = computed(() => this.store.openEvents().filter(e => this.matches(e)));
  pastFiltered = computed(() => this.store.pastEvents().filter(e => this.matches(e)));
  resultsMessage = computed(() => {
    const n = this.openFiltered().length;
    return `${n} open ${n === 1 ? 'opportunity' : 'opportunities'} shown`;
  });

  clearFilters() {
    this.query.set('');
    this.category.set('all');
    this.favoritesOnly.set(false);
  }

  constructor() {
    effect(() => {
      this.store.account();
      this.favoritesOnly.set(false);
    });
    afterNextRender(() => {
      const id = this.store.focusEventId();
      if (id === null) return;
      document.getElementById('event-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => this.store.focusEventId.set(null), 2500);
    });
  }
}
