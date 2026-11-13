import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IconName } from './icon';

export type Category = 'Outdoors' | 'Animals' | 'Food & Hunger' | 'Seniors' | 'Community';

export interface VolunteerEvent {
  id: number;
  title: string;
  date: string;       // ISO yyyy-mm-dd
  time: string;       // start, e.g. "9:00 AM"
  endTime: string;    // end, e.g. "12:00 PM"
  location: string;   // city
  venue: string;      // specific place / address (placeholder data)
  org: string;        // organization hosting the shift
  category: Category;
  details: string;
  imageUrl: string;   // '' shows the icon tile
  imageAlt: string;   // text description for screen readers
  icon: IconName;
}

export interface Account {
  name: string;
  email: string;
  created?: number;   // ms timestamp, shown as "Member since"
}

interface StoredUser extends Account {
  salt: string;
  hash: string;
  joined: number[];
  favorites?: string[]; // optional so accounts saved by V2 still load
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

function normalizeUsers(value: unknown): StoredUser[] {
  if (!Array.isArray(value)) return [];
  return value.filter((u): u is StoredUser => !!u && typeof u === 'object' &&
    typeof u.name === 'string' && typeof u.email === 'string' &&
    typeof u.salt === 'string' && typeof u.hash === 'string')
    .map(u => ({
      ...u,
      email: u.email.trim().toLowerCase(),
      created: typeof u.created === 'number' && Number.isFinite(u.created) ? u.created : Date.now(),
      joined: Array.isArray(u.joined) ? u.joined.filter((id): id is number => typeof id === 'number' && Number.isFinite(id)) : [],
      favorites: Array.isArray(u.favorites) ? u.favorites.filter((org): org is string => typeof org === 'string') : [],
    }));
}

function normalizeAccount(value: unknown): Account | null {
  if (!value || typeof value !== 'object') return null;
  const a = value as Partial<Account>;
  if (typeof a.name !== 'string' || typeof a.email !== 'string') return null;
  return { name: a.name, email: a.email.trim().toLowerCase(), created: typeof a.created === 'number' && Number.isFinite(a.created) ? a.created : Date.now() };
}

function normalizePending(value: unknown): PendingSignup | null {
  if (!value || typeof value !== 'object') return null;
  const p = value as Partial<PendingSignup>;
  return typeof p.eventId === 'number' && Number.isFinite(p.eventId) && typeof p.returnUrl === 'string'
    ? { eventId: p.eventId, returnUrl: p.returnUrl } : null;
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

    readonly events: VolunteerEvent[] = [
    { id: 1, title: 'Community Garden Cleanup', date: '2026-09-10', time: '9:00 AM', endTime: '12:00 PM', location: 'Lincoln, NE', venue: 'Neighborhood Garden, 27th & Q St', org: 'Prairie Garden Collective', category: 'Outdoors', details: 'Weeding and mulching shared garden beds.', imageUrl: '', imageAlt: 'Sprout icon for a garden event', icon: 'sprout' },
    { id: 2, title: 'Dog Sitting', date: '2026-10-25', time: '2:00 PM', endTime: '5:00 PM', location: 'Lincoln, NE', venue: 'Lincoln Paws Shelter', org: 'Lincoln Paws Shelter', category: 'Animals', details: 'Walk and feed dogs for a local shelter.', imageUrl: '', imageAlt: 'Paw print icon for an animal shelter event', icon: 'paw' },
    { id: 3, title: 'Food Bank Sorting', date: '2026-11-07', time: '10:00 AM', endTime: '1:00 PM', location: 'Lincoln, NE', venue: 'Pantry Warehouse, 1st & O St', org: 'Lincoln Pantry Network', category: 'Food & Hunger', details: 'Sort and box donated food.', imageUrl: '', imageAlt: 'Box icon for a food bank event', icon: 'package' },
    { id: 4, title: 'Park Trail Cleanup', date: '2026-11-14', time: '1:00 PM', endTime: '3:30 PM', location: 'Lincoln, NE', venue: 'Trailhead parking lot', org: 'Friends of Lincoln Parks', category: 'Outdoors', details: 'Pick up litter along the trail. Gloves and bags provided.', imageUrl: '', imageAlt: 'Tree icon for a park cleanup event', icon: 'tree' },
    { id: 5, title: 'Senior Center Game Day', date: '2026-11-14', time: '4:00 PM', endTime: '6:00 PM', location: 'Lincoln, NE', venue: 'Sunrise Senior Center', org: 'Sunrise Senior Center', category: 'Seniors', details: 'Play cards and board games with residents.', imageUrl: '', imageAlt: 'Dice icon for a game day event', icon: 'dice' },
    { id: 6, title: 'Holiday Toy Drive', date: '2026-12-05', time: '11:00 AM', endTime: '2:00 PM', location: 'Lincoln, NE', venue: 'Community Center, Main Hall', org: 'Holiday Helpers', category: 'Community', details: 'Collect and wrap toys for local families.', imageUrl: '', imageAlt: 'Gift icon for a toy drive event', icon: 'gift' },
    { id: 7, title: 'Shelter Kennel Care', date: '2026-12-12', time: '9:00 AM', endTime: '11:30 AM', location: 'Lincoln, NE', venue: 'Lincoln Paws Shelter', org: 'Lincoln Paws Shelter', category: 'Animals', details: 'Clean kennels and help with morning feeding.', imageUrl: '', imageAlt: 'Paw print icon for an animal shelter event', icon: 'paw' },
    { id: 8, title: 'Winter Pantry Pack-Out', date: '2027-01-16', time: '10:00 AM', endTime: '12:00 PM', location: 'Lincoln, NE', venue: 'Pantry Warehouse, 1st & O St', org: 'Lincoln Pantry Network', category: 'Food & Hunger', details: 'Pack winter meal boxes for families.', imageUrl: '', imageAlt: 'Box icon for a food bank event', icon: 'package' },
    ];

  readonly categories: Category[] = ['Outdoors', 'Animals', 'Food & Hunger', 'Seniors', 'Community'];
  /** Every organization that has at least one event. */
  readonly orgs: string[] = [...new Set(this.events.map(e => e.org))].sort();

  /** All registered accounts. Front-end demo only: a real app needs a server for passwords. */
  private readonly users = signal<StoredUser[]>(normalizeUsers(load<unknown>('users', [], 'local')));

  readonly account = signal<Account | null>(normalizeAccount(load<unknown>('account', null)));
  readonly joinedIds = signal<number[]>(this.joinedFor(this.account()?.email));
  readonly favoriteOrgs = signal<string[]>(this.favoritesFor(this.account()?.email));
  /** Signup the visitor started before creating an account. */
  readonly pending = signal<PendingSignup | null>(normalizePending(load<unknown>('pending', null)));
  /** Event to scroll to / highlight after returning from signup. */
  readonly focusEventId = signal<number | null>(null);
  /** Event waiting on the "cancel this shift?" confirmation. */
  readonly cancelTarget = signal<VolunteerEvent | null>(null);
  /** Event shown in the details dialog. */
  readonly detailTarget = signal<VolunteerEvent | null>(null);
  /** Current toast message, or null. */
  readonly toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly now = signal(new Date());
  private readonly midnightTimer = this.scheduleMidnight();
  private readonly todayIso = computed(() => this.toIso(this.now()));

  readonly openEvents = computed(() => this.events.filter(e => !this.isPast(e)));
  readonly pastEvents = computed(() => this.events.filter(e => this.isPast(e)));
  /** Upcoming shifts only; past events never show up as "My Upcoming Shifts". */
  readonly myEvents = computed(() =>
    this.events
      .filter(e => this.joinedIds().includes(e.id) && !this.isPast(e))
      .sort((a, b) => a.date.localeCompare(b.date) || this.minutes(a.time) - this.minutes(b.time))
  );
  /** Signed-up events that already happened, newest first. */
  readonly pastShifts = computed(() =>
    this.events
      .filter(e => this.joinedIds().includes(e.id) && this.isPast(e))
      .sort((a, b) => b.date.localeCompare(a.date))
  );
  readonly hoursPast = computed(() => this.pastShifts().reduce((sum, e) => sum + this.durationHours(e), 0));
  readonly hoursUpcoming = computed(() => this.myEvents().reduce((sum, e) => sum + this.durationHours(e), 0));

  /** "1:30 PM" -> minutes since midnight, for ordering events on the same day. */
  public minutes(time: string): number {
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
    if (!m) return 0;
    const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0);
    return h * 60 + Number(m[2]);
  }

  toIso(d: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  private scheduleMidnight(): ReturnType<typeof setTimeout> {
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    return setTimeout(() => {
      this.now.set(new Date());
      this.scheduleMidnight();
    }, Math.max(1, next.getTime() - Date.now()));
  }

  durationHours(e: VolunteerEvent): number {
    return Math.max(0, (this.minutes(e.endTime) - this.minutes(e.time)) / 60);
  }

  timeRange(e: VolunteerEvent): string {
    return `${e.time} – ${e.endTime}`;
  }

  when(e: VolunteerEvent): string {
    const d = new Date(e.date + 'T00:00:00');
    return `${d.toLocaleDateString('en-US', { dateStyle: 'long' })} · ${this.timeRange(e)}`;
  }

  isJoined(id: number) {
    return this.joinedIds().includes(id);
  }

  isPast(e: VolunteerEvent) {
    const [year, month, day] = e.date.split('-').map(Number);
    const end = /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? new Date(year, month - 1, day) : new Date(NaN);
    const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(e.endTime.trim());
    if (!match || Number.isNaN(end.getTime())) return e.date < this.todayIso();
    let hour = Number(match[1]) % 12;
    if (match[3].toUpperCase() === 'PM') hour += 12;
    end.setHours(hour, Number(match[2]), 0, 0);
    return end.getTime() <= this.now().getTime();
  }

  // ---- Favorites ----
  isFavorite(org: string) {
    return this.favoriteOrgs().includes(org);
  }

  toggleFavorite(org: string) {
    if (!this.account()) {
      this.showToast('Log in or sign up to save favorite organizations.');
      return;
    }
    const saved = this.isFavorite(org);
    const next = saved ? this.favoriteOrgs().filter(o => o !== org) : [...this.favoriteOrgs(), org];
    this.favoriteOrgs.set(next);
    const email = this.account()!.email;
    this.setUsers(this.users().map(u => (u.email === email ? { ...u, favorites: next } : u)));
    this.showToast(saved ? `Removed ${org} from your favorites.` : `Saved ${org} to your favorites.`);
  }

  private favoritesFor(email?: string): string[] {
    return this.users().find(u => u.email === email)?.favorites ?? [];
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
    const acct: Account = { name: user.name, email: user.email, created: user.created };
    this.account.set(acct);
    save('account', acct);
    this.joinedIds.set(user.joined ?? []);
    this.favoriteOrgs.set(user.favorites ?? []);
  }

  /** Create an account and sign in. */
  async register(name: string, email: string, password: string): Promise<'ok' | 'exists' | 'error'> {
    const key = email.trim().toLowerCase();
    if (this.users().some(u => u.email === key)) return 'exists';
    try {
      const salt = crypto.randomUUID();
      const user: StoredUser = { name, email: key, created: Date.now(), salt, hash: await digest(salt + password), joined: [], favorites: [] };
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
    this.favoriteOrgs.set([]);
    this.clearPending();
    remove('account');
    this.showToast('You have been logged out.');
  }
}
