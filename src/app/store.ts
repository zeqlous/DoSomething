import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from './icon';

export interface VolunteerEvent {
  id: number;
  title: string;
  date: string;      // ISO yyyy-mm-dd (easy to compare and to place on the calendar)
  time: string;
  location: string;
  details: string;
  imageUrl: string;  // leave '' to show the icon tile instead
  icon: IconName;
}

export interface Account {
  name: string;
  email: string;
}

/** What is kept in the browser for each registered account (including their shifts). */
interface StoredUser extends Account {
  salt: string;
  hash: string;
  joined: number[];
}

/** A signup the visitor started before they had an account. */
export interface PendingSignup {
  eventId: number;
  returnUrl: string;
}

// 'session' = cleared when the tab closes. 'local' = kept, so accounts survive logging out.
type Area = 'session' | 'local';
const area = (a: Area) => (a === 'local' ? localStorage : sessionStorage);

function load<T>(key: string, fallback: T, a: Area = 'session'): T {
  try {
    const raw = area(a).getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown, a: Area = 'session') {
  try {
    area(a).setItem(key, JSON.stringify(value));
  } catch { /* storage unavailable; state just lives in memory */ }
}
function remove(key: string, a: Area = 'session') {
  try {
    area(a).removeItem(key);
  } catch { /* ignore */ }
}

async function digest(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}

@Injectable({ providedIn: 'root' })
export class Store {
  private router = inject(Router);

  // Later: replace this array with a fetch() to your database / API.
  readonly events: VolunteerEvent[] = [
    { id: 1, title: 'Community Garden Cleanup', date: '2026-09-10', time: '9:00 AM', location: 'Lincoln, NE', details: 'Weeding and mulching shared garden beds.', imageUrl: '', icon: 'sprout' },
    { id: 2, title: 'Dog Sitting', date: '2026-10-25', time: '2:00 PM', location: 'Lincoln, NE', details: 'Walk and feed dogs for a local shelter.', imageUrl: '', icon: 'paw' },
    { id: 3, title: 'Food Bank Sorting', date: '2026-11-07', time: '10:00 AM', location: 'Lincoln, NE', details: 'Sort and box donated food.', imageUrl: '', icon: 'package' },
    { id: 4, title: 'Park Trail Cleanup', date: '2026-11-14', time: '1:00 PM', location: 'Lincoln, NE', details: 'Pick up litter along the trail.', imageUrl: '', icon: 'tree' },
    { id: 5, title: 'Senior Center Game Day', date: '2026-11-14', time: '4:00 PM', location: 'Lincoln, NE', details: 'Play cards and board games with residents.', imageUrl: '', icon: 'dice' },
    { id: 6, title: 'Holiday Toy Drive', date: '2026-12-05', time: '11:00 AM', location: 'Lincoln, NE', details: 'Collect and wrap toys for local families.', imageUrl: '', icon: 'gift' },
  ];

  /** All registered accounts. Front-end demo only: a real app needs a server for passwords. */
  private readonly users = signal<StoredUser[]>(load<StoredUser[]>('users', [], 'local'));

  readonly account = signal<Account | null>(load<Account | null>('account', null));
  readonly joinedIds = signal<number[]>(this.joinedFor(load<Account | null>('account', null)?.email));

  /** Signup the visitor started before creating an account. */
  readonly pending = signal<PendingSignup | null>(load<PendingSignup | null>('pending', null));
  /** Event to scroll to / highlight after returning from signup. */
  readonly focusEventId = signal<number | null>(null);
  /** Event waiting on the "cancel this shift?" confirmation. */
  readonly cancelTarget = signal<VolunteerEvent | null>(null);
  /** Event shown in the details dialog. */
  readonly detailTarget = signal<VolunteerEvent | null>(null);
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

  // ---------- details dialog ----------

  openDetails(id: number) {
    const event = this.events.find(e => e.id === id);
    if (event) this.detailTarget.set(event);
  }

  closeDetails() {
    this.detailTarget.set(null);
  }

  /** Escape key: close the top-most dialog only. */
  dismissOverlay() {
    if (this.cancelTarget()) this.cancelTarget.set(null);
    else this.detailTarget.set(null);
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
      this.detailTarget.set(null);
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
    this.persistJoined(this.joinedIds().filter(x => x !== event.id));
    this.cancelTarget.set(null);
    this.showToast(`You cancelled ${event.title}.`);
  }

  dismissCancel() {
    this.cancelTarget.set(null);
  }

  private join(event: VolunteerEvent) {
    this.persistJoined([...this.joinedIds(), event.id]);
  }

  private joinedFor(email?: string): number[] {
    return this.users().find(u => u.email === email)?.joined ?? [];
  }

  /** Update the signed-in list and keep it on the account so it survives logging out. */
  private persistJoined(next: number[]) {
    this.joinedIds.set(next);
    const email = this.account()?.email;
    if (email) this.setUsers(this.users().map(u => (u.email === email ? { ...u, joined: next } : u)));
  }

  // ---------- account ----------

  private setUsers(next: StoredUser[]) {
    this.users.set(next);
    save('users', next, 'local');
  }

  private startSession(user: StoredUser) {
    const acct: Account = { name: user.name, email: user.email };
    this.account.set(acct);
    save('account', acct);
    this.joinedIds.set(user.joined);
  }

  /** Create an account and sign in. */
  async register(name: string, email: string, password: string): Promise<'ok' | 'exists' | 'error'> {
    const key = email.trim().toLowerCase();
    if (this.users().some(u => u.email === key)) return 'exists';
    try {
      const salt = crypto.randomUUID();
      const user: StoredUser = { name, email: key, salt, hash: await digest(salt + password), joined: [] };
      this.setUsers([...this.users(), user]);
      this.startSession(user);
      return 'ok';
    } catch {
      return 'error';
    }
  }

  /** Sign in to an existing account. Returns false when the email/password don't match. */
  async login(email: string, password: string): Promise<boolean> {
    const user = this.users().find(u => u.email === email.trim().toLowerCase());
    if (!user) return false;
    try {
      if ((await digest(user.salt + password)) !== user.hash) return false;
    } catch {
      return false;
    }
    this.startSession(user);
    return true;
  }

  /**
   * After signup/login: finish the volunteer signup they started and go back to it
   * (or to `destination`, e.g. '/schedule'). With nothing pending, go to `destination` or home.
   */
  finishSignup(destination?: string) {
    const pending = this.pending();
    this.clearPending();
    if (!pending) {
      this.router.navigateByUrl(destination ?? '/');
      return;
    }
    const event = this.events.find(e => e.id === pending.eventId);
    this.focusEventId.set(pending.eventId);
    this.router.navigateByUrl(destination ?? pending.returnUrl).then(() => {
      if (!event) return;
      if (this.isPast(event)) {
        this.showToast('That event has already happened, so sign-ups are closed.');
      } else if (!this.isJoined(event.id)) {
        this.join(event);
        this.showToast(`You're signed up for ${event.title}.`);
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

  /** Ends the session only; the account and its shifts stay saved for the next login. */
  logout() {
    this.account.set(null);
    this.joinedIds.set([]);
    this.cancelTarget.set(null);
    this.detailTarget.set(null);
    this.clearPending();
    remove('account');
    this.showToast('You have been logged out.');
  }
}
