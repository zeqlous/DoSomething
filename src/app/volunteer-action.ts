import { Component, inject, input } from '@angular/core';
import { IconComponent } from './icon';
import { Store, VolunteerEvent } from './store';

/**
 * The one place that decides what the action area of an event looks like:
 *   past event  -> "Completed" (gray, no button)
 *   joined      -> "Signed Up" (green) + red-outline Cancel button
 *   otherwise   -> "Volunteer" call-to-action button
 */
@Component({
  selector: 'app-volunteer-action',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (store.isPast(event())) {
      <span class="badge completed">Completed</span>
    } @else if (store.isJoined(event().id)) {
      <div class="signed-up">
        <span class="badge signed"><app-icon name="check" [size]="14" /> Signed Up</span>
        <button type="button" class="btn btn-sm btn-danger-outline" [attr.aria-label]="'Cancel ' + event().title" (click)="store.requestCancel(event().id)">Cancel</button>
      </div>
    } @else {
      <button type="button" class="btn btn-sm btn-accent" [attr.aria-label]="'Volunteer for ' + event().title" (click)="store.signUp(event().id)">Volunteer</button>
    }
  `,
  styles: [`
    :host { display: inline-block; flex-shrink: 0; }
    .badge { display: inline-flex; align-items: center; gap: var(--space-1); font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: var(--radius-pill); white-space: nowrap; }
    .badge.signed { background: var(--green-bg); color: var(--green); }
    .badge.completed { background: var(--gray-bg); color: var(--gray-text); }
    .signed-up { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); }
  `]
})
export class VolunteerActionComponent {
  store = inject(Store);
  event = input.required<VolunteerEvent>();
}
