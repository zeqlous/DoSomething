import { Component, computed, inject, signal } from '@angular/core';
import { Store, VolunteerEvent } from './store';

interface Cell {
  day: number;
  iso: string;
  events: VolunteerEvent[];
  isToday: boolean;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
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