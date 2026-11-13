import { Component, computed, effect, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { EventThumbComponent } from './event-thumb';
import { IconComponent } from './icon';
import { Store } from './store';
import { VolunteerActionComponent } from './volunteer-action';
import { initials as makeInitials } from './initials';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, EventThumbComponent, VolunteerActionComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  host: { '(document:keydown.escape)': 'store.dismissOverlay()', '(document:keydown)': 'trapDialogFocus($event)' }
})

export class AppComponent {
  store = inject(Store);
  private router = inject(Router);
  private detailTrigger: HTMLElement | null = null;
  private cancelTrigger: HTMLElement | null = null;
  private detailWasOpen = false;
  private cancelWasOpen = false;

  year = new Date().getFullYear();

  initials = computed(() => makeInitials(this.store.account()?.name ?? ''));

  logout() {
    this.store.logout();
    this.router.navigate(['/']);
  }

  constructor() {
    // After each page change, move focus to <main> so keyboard / screen-reader users start at the new content.
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        setTimeout(() => document.getElementById('main')?.focus({ preventScroll: true }));
      }
    });

    // Each dialog layer remembers its own trigger so nested dialogs restore focus correctly.
    effect(() => {
      const detailOpen = !!this.store.detailTarget();
      const cancelOpen = !!this.store.cancelTarget();
      if (detailOpen && !this.detailWasOpen) this.detailTrigger = document.activeElement as HTMLElement;
      if (cancelOpen && !this.cancelWasOpen) this.cancelTrigger = document.activeElement as HTMLElement;
      if ((!this.detailWasOpen && detailOpen) || (!this.cancelWasOpen && cancelOpen)) {
        setTimeout(() => {
          this.topDialog()?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
        });
      }
      if (this.cancelWasOpen && !cancelOpen) {
        setTimeout(() => (detailOpen ? this.cancelTrigger : this.detailTrigger)?.focus());
        this.cancelTrigger = null;
      }
      if (this.detailWasOpen && !detailOpen && !cancelOpen) {
        setTimeout(() => this.detailTrigger?.focus());
        this.detailTrigger = null;
      }
      this.detailWasOpen = detailOpen;
      this.cancelWasOpen = cancelOpen;
    });
  }

  private topDialog(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.modal-top [role="dialog"]') ??
      document.querySelector<HTMLElement>('.modal-backdrop [role="dialog"]');
  }

  trapDialogFocus(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;
    const dialog = this.topDialog();
    if (!dialog) return;
    const items = [...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(el => el.getClientRects().length > 0);
    if (!items.length) { event.preventDefault(); dialog.focus(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  }

  skipToMain(event: Event) {
    event.preventDefault();
    document.getElementById('main')?.focus();
  }
}
