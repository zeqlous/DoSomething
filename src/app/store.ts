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

/** A signup the visitor started before they had an account. */
export interface PendingSignup {
  eventId: number;
  returnUrl: string;
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
function remove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch { /* ignore */ }
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

  /** Signup the visitor started before creating an account. */
  readonly pending = signal<PendingSignup | null>(load<PendingSignup | null>('pending', null));
  /** Event to scroll to / highlight after returning from signup. */
  readonly focusEventId = signal<number | null>(null);
  /** Event waiting on the "cancel this shift?" confirmation. */
  readonly cancelTarget = signal<VolunteerEvent | null>(null);
  /** Current toast message, or null. */
  readonly toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  private todayIso = this.toIso(new Date());

  readonly openEvents = computed(() => this.events.filter(e => e.date >= this.todayIso));
  readonly pastEvents = computed(() => this.events.filter(e => e.date < this.todayIso));
  /** Upcoming shifts only; past events never show up as "My Upcoming Shifts". */
  readonly myEvents = computed(() =>
    this.events
      .filter(e => this.joinedIds().includes(e.id) && e.date >= this.todayIso)
      .sort((a, b) => a.date.localeCompare(b.date) || this.minutes(a.time) - this.minutes(b.time))
  );

  /** "1:30 PM" -> minutes since midnight, for ordering events on the same day. */
  private minutes(time: string): number {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
    if (!m) return 0;
    const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0);
    return h * 60 + Number(m[2]);
  }

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

  isPast(e: VolunteerEvent) {
    return e.date < this.todayIso;
  }

  // ---------- toast ----------

  showToast(message: string) {
    clearTimeout(this.toastTimer);
    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3500);
  }

  dismissToast() {
    clearTimeout(this.toastTimer);
    this.toast.set(null);
  }

  // ---------- volunteering ----------

  /**
   * Sign up for an event. Visitors without an account are sent to the signup
   * page and brought back to this page (and this event) once they finish.
   */
  signUp(id: number) {
    const event = this.events.find(e => e.id === id);
    if (!event) return;

    if (this.isPast(event)) {
      this.showToast('That event has already happened, so sign-ups are closed.');
      return;
    }
    if (!this.account()) {
      const pending: PendingSignup = { eventId: id, returnUrl: this.router.url };
      this.pending.set(pending);
      save('pending', pending);
      this.router.navigate(['/signup']);
      return;
    }
    if (this.isJoined(id)) return;

    this.join(event);
    this.showToast(`You're signed up for ${event.title}.`);
  }

  /** Step 1 of cancelling: open the confirmation dialog. */
  requestCancel(id: number) {
    const event = this.events.find(e => e.id === id);
    if (event && this.isJoined(id)) this.cancelTarget.set(event);
  }

  /** Step 2: the visitor confirmed. */
  confirmCancel() {
    const event = this.cancelTarget();
    if (!event) return;
    const next = this.joinedIds().filter(x => x !== event.id);
    this.joinedIds.set(next);
    save('joined', next);
    this.cancelTarget.set(null);
    this.showToast(`You cancelled ${event.title}.`);
  }

  dismissCancel() {
    this.cancelTarget.set(null);
  }

  private join(event: VolunteerEvent) {
    const next = [...this.joinedIds(), event.id];
    this.joinedIds.set(next);
    save('joined', next);
  }

  // ---------- account ----------

  register(name: string, email: string) {
    const acct = { name, email }; // password intentionally NOT stored
    this.account.set(acct);
    save('account', acct);
  }

  /** After signup: finish the volunteer signup they started and go back to it. */
  finishSignup() {
    const pending = this.pending();
    this.clearPending();
    if (!pending) {
      this.router.navigate(['/']);
      return;
    }
    const event = this.events.find(e => e.id === pending.eventId);
    this.focusEventId.set(pending.eventId);
    this.router.navigateByUrl(pending.returnUrl).then(() => {
      if (!event) return;
      if (this.isPast(event)) {
        this.showToast('That event has already happened, so sign-ups are closed.');
      } else if (!this.isJoined(event.id)) {
        this.join(event);
        this.showToast(`Account created. You're signed up for ${event.title}.`);
      }
    });
  }

  /** The visitor left the signup page without creating an account. */
  abandonSignup() {
    const url = this.pending()?.returnUrl ?? '/';
    this.clearPending();
    this.router.navigateByUrl(url);
  }

  private clearPending() {
    this.pending.set(null);
    remove('pending');
  }

  logout() {
    this.account.set(null);
    this.joinedIds.set([]);
    this.cancelTarget.set(null);
    this.clearPending();
    remove('account');
    remove('joined');
    this.showToast('You have been logged out.');
  }
}
