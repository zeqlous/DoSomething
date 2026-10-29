import { Component, computed, inject, signal } from '@angular/core';
import { Store, VolunteerEvent } from './store';
import { VolunteerActionComponent } from './volunteer-action';

interface Cell {
  day: number;
  iso: string;
  events: VolunteerEvent[];
  isToday: boolean;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [VolunteerActionComponent],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css']
})
export class ScheduleComponent {
  store = inject(Store);

  activeTab = signal<'calendar' | 'events'>('calendar');
  navItems = [
    { id: 'calendar' as const, label: 'Calendar View', icon: '📅' },
    { id: 'events' as const, label: 'My Shifts', icon: '📋' }
  ];

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  selectedIso = signal<string | null>(null);

  constructor() {
    // Coming back from signup: open the day of the event the visitor picked.
    const id = this.store.focusEventId();
    const event = id === null ? undefined : this.store.events.find(e => e.id === id);
    if (event) {
      const d = new Date(event.date + 'T00:00:00');
      this.month.set(new Date(d.getFullYear(), d.getMonth(), 1));
      this.selectedIso.set(event.date);
      this.store.focusEventId.set(null);
    } else {
      // Otherwise open on today.
      this.selectedIso.set(this.store.toIso(new Date()));
    }
  }

  statusOf(e: VolunteerEvent): 'past' | 'signed' | 'available' {
    if (this.store.isPast(e)) return 'past';
    return this.store.isJoined(e.id) ? 'signed' : 'available';
  }

  longDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
  }

  isToday(iso: string): boolean {
    return iso === this.store.toIso(new Date());
  }

  goToToday() {
    const now = new Date();
    this.month.set(new Date(now.getFullYear(), now.getMonth(), 1));
    this.selectedIso.set(this.store.toIso(now));
  }

  monthLabel = computed(() =>
    this.month().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  // Leading nulls pad the grid so day 1 lands on the right weekday.
  cells = computed<(Cell | null)[]>(() => {
    const m = this.month();
    const y = m.getFullYear();
    const mo = m.getMonth();
    const todayIso = this.store.toIso(new Date());
    const out: (Cell | null)[] = Array(new Date(y, mo, 1).getDay()).fill(null);
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this.store.toIso(new Date(y, mo, d));
      out.push({ day: d, iso, events: this.store.events.filter(e => e.date === iso), isToday: iso === todayIso });
    }
    return out;
  });

  selectedEvents = computed(() => {
    const iso = this.selectedIso();
    return iso ? this.store.events.filter(e => e.date === iso) : [];
  });

  selectTab(id: 'calendar' | 'events', event: Event) {
    event.preventDefault();
    this.activeTab.set(id);
  }

  changeMonth(delta: number) {
    const m = this.month();
    this.month.set(new Date(m.getFullYear(), m.getMonth() + delta, 1));
    this.selectedIso.set(null);
  }

  selectDay(cell: Cell) {
    this.selectedIso.set(cell.iso);
  }
}
