import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { EventThumbComponent } from './event-thumb';
import { IconComponent, IconName } from './icon';
import { Store, VolunteerEvent } from './store';
import { VolunteerActionComponent } from './volunteer-action';

interface Cell {
  day: number;
  iso: string;
  events: VolunteerEvent[];
  visible: VolunteerEvent[];  // first two only, so the box never grows
  extra: number;              // "+N more"
  isToday: boolean;
}

type Tab = 'calendar' | 'events' | 'past';
const MAX_CHIPS = 2;

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [VolunteerActionComponent, EventThumbComponent, IconComponent, NgTemplateOutlet],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css']
})
export class ScheduleComponent {
  store = inject(Store);

  activeTab = signal<Tab>('calendar');
  navItems: { id: Tab; label: string; icon: IconName }[] = [
    { id: 'calendar', label: 'Calendar View', icon: 'calendar' },
    { id: 'events', label: 'My Shifts', icon: 'list' },
    { id: 'past', label: 'Past Shifts', icon: 'check' }
  ];

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  selectedIso = signal<string | null>(null);

  // My Shifts filters
  shiftQuery = signal('');
  shiftOrg = signal('all');
  filtersActive = computed(() => !!this.shiftQuery().trim() || this.shiftOrg() !== 'all');

  private matches(e: VolunteerEvent): boolean {
    const q = this.shiftQuery().trim().toLowerCase();
    if (q && ![e.title, e.org, e.venue, e.category].join(' ').toLowerCase().includes(q)) return false;
    return this.shiftOrg() === 'all' || e.org === this.shiftOrg();
  }
  upcomingShifts = computed(() => this.store.myEvents().filter(e => this.matches(e)));
  pastShifts = computed(() => this.store.pastShifts().filter(e => this.matches(e)));
  myOrgs = computed(() =>
    [...new Set([...this.store.myEvents(), ...this.store.pastShifts()].map(e => e.org))].sort());
  shownCount = computed(() => (this.activeTab() === 'past' ? this.pastShifts() : this.upcomingShifts()).length);

  clearFilters() {
    this.shiftQuery.set('');
    this.shiftOrg.set('all');
  }

  constructor() {
    effect(() => {
      const org = this.shiftOrg();
      if (org !== 'all' && !this.myOrgs().includes(org)) this.shiftOrg.set('all');
    });
    const id = this.store.focusEventId();
    const event = id === null ? undefined : this.store.events.find(e => e.id === id);
    if (event) {
      const d = new Date(event.date + 'T00:00:00');
      this.month.set(new Date(d.getFullYear(), d.getMonth(), 1));
      this.selectedIso.set(event.date);
      this.store.focusEventId.set(null);
    } else {
      this.selectedIso.set(this.store.toIso(this.store.now()));
    }
  }

  statusOf(e: VolunteerEvent): 'past' | 'signed' | 'available' {
    if (this.store.isPast(e)) return 'past';
    return this.store.isJoined(e.id) ? 'signed' : 'available';
  }

  statusLabel(e: VolunteerEvent): string {
    const s = this.statusOf(e);
    return s === 'signed' ? 'signed up' : s;
  }

  longDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  /** Screen-reader label for a calendar day, including event names. */
  cellLabel(c: Cell): string {
    if (!c.events.length) return this.longDate(c.iso) + ', no events';
    const list = c.events.map(e => `${e.title} (${this.statusLabel(e)})`).join('; ');
    return `${this.longDate(c.iso)}, ${c.events.length} ${c.events.length === 1 ? 'event' : 'events'}: ${list}`;
  }

  isToday(iso: string): boolean {
    return iso === this.store.toIso(this.store.now());
  }

  goToToday() {
    const now = this.store.now();
    this.month.set(new Date(now.getFullYear(), now.getMonth(), 1));
    this.selectedIso.set(this.store.toIso(now));
  }

  monthLabel = computed(() => this.month().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));

  cells = computed<(Cell | null)[]>(() => {
    const m = this.month();
    const y = m.getFullYear();
    const mo = m.getMonth();
    const todayIso = this.store.toIso(this.store.now());
    const out: (Cell | null)[] = Array(new Date(y, mo, 1).getDay()).fill(null);
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = this.store.toIso(new Date(y, mo, d));
      const events = this.store.events.filter(e => e.date === iso);
      out.push({ day: d, iso, events, visible: events.slice(0, MAX_CHIPS), extra: Math.max(0, events.length - MAX_CHIPS), isToday: iso === todayIso });
    }
    return out;
  });

  selectedEvents = computed(() => {
    const iso = this.selectedIso();
    return iso ? this.store.events.filter(e => e.date === iso) : [];
  });

  selectTab(id: Tab) {
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
