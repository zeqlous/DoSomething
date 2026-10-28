import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface VolunteerEvent {
  id: number;
  title: string;
  date: string;      // ISO yyyy-mm-dd (easy to compare and to place on the calendar)
  time: string;
  location: string;
  details: string;
  imageUrl: string;  // leave '' to show the emoji icon instead
  icon: string;
}

export interface Account {
  name: string;
  email: string;
}

// sessionStorage = cleared when the tab closes. Works in `ng serve` and on GitHub Pages.
function load<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage unavailable; state just lives in memory */ }
}

@Injectable({ providedIn: 'root' })
export class Store {
  private router = inject(Router);

  // Later: replace this array with a fetch() to your database / API.
  readonly events: VolunteerEvent[] = [
    { id: 1, title: 'Community Garden Cleanup', date: '2026-09-10', time: '9:00 AM', location: 'Lincoln, NE', details: 'Weeding and mulching shared garden beds.', imageUrl: '', icon: '🌱' },
    { id: 2, title: 'Dog Sitting', date: '2026-10-25', time: '2:00 PM', location: 'Lincoln, NE', details: 'Walk and feed dogs for a local shelter.', imageUrl: '', icon: '🐕' },
    { id: 3, title: 'Food Bank Sorting', date: '2026-11-07', time: '10:00 AM', location: 'Lincoln, NE', details: 'Sort and box donated food.', imageUrl: '', icon: '🥫' },
    { id: 4, title: 'Park Trail Cleanup', date: '2026-11-14', time: '1:00 PM', location: 'Lincoln, NE', details: 'Pick up litter along the trail.', imageUrl: '', icon: '🌳' },
    { id: 5, title: 'Senior Center Game Day', date: '2026-11-14', time: '4:00 PM', location: 'Lincoln, NE', details: 'Play cards and board games with residents.', imageUrl: '', icon: '🎲' },
    { id: 6, title: 'Holiday Toy Drive', date: '2026-12-05', time: '11:00 AM', location: 'Lincoln, NE', details: 'Collect and wrap toys for local families.', imageUrl: '', icon: '🎁' },
  ];

  readonly account = signal<Account | null>(load<Account | null>('account', null));
  readonly joinedIds = signal<number[]>(load<number[]>('joined', []));

  private todayIso = this.toIso(new Date());

  readonly openEvents = computed(() => this.events.filter(e => e.date >= this.todayIso));
  readonly pastEvents = computed(() => this.events.filter(e => e.date < this.todayIso));
  readonly myEvents = computed(() =>
    this.events.filter(e => this.joinedIds().includes(e.id)).sort((a, b) => a.date.localeCompare(b.date))
  );

  toIso(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  when(e: VolunteerEvent): string {
    const d = new Date(e.date + 'T00:00:00');
    return `${d.toLocaleDateString('en-US', { dateStyle: 'long' })} - ${e.time}`;
  }

  isJoined(id: number) {
    return this.joinedIds().includes(id);
  }

  /** Sign up / cancel. Sends visitors without an account to the signup page. */
  toggle(id: number) {
    if (!this.account()) {
      this.router.navigate(['/signup']);
      return;
    }
    const next = this.isJoined(id) ? this.joinedIds().filter(x => x !== id) : [...this.joinedIds(), id];
    this.joinedIds.set(next);
    save('joined', next);
  }

  register(name: string, email: string) {
    const acct = { name, email }; // password intentionally NOT stored
    this.account.set(acct);
    save('account', acct);
  }

  logout() {
    this.account.set(null);
    this.joinedIds.set([]);
    sessionStorage.removeItem('account');
    sessionStorage.removeItem('joined');
  }
}