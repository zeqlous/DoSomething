import { Component, inject, input } from '@angular/core';
import { Store, VolunteerEvent } from './store';

/**
 * The one place that decides what the action area of an event looks like:
 *   past event  -> "Completed" (no button)
 *   joined      -> "✓ Signed Up" + small Cancel link
 *   otherwise   -> "Volunteer" button
 */
@Component({
  selector: 'app-volunteer-action',
  standalone: true,
  template: `
    @if (store.isPast(event())) {
      <span class="badge completed">Completed</span>
    } @else if (store.isJoined(event().id)) {
      <div class="signed-up">
        <span class="badge signed">✓ Signed Up</span>
        <button type="button" class="cancel-link" (click)="store.requestCancel(event().id)">Cancel</button>
      </div>
    } @else {
      <button type="button" class="join-btn" (click)="store.signUp(event().id)">Volunteer</button>
    }
  `,
  styles: [`
    :host { display: inline-block; flex-shrink: 0; }
    .join-btn { background: #ffbb00; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; white-space: nowrap; font-family: inherit; }
    .join-btn:hover { background: #f0b000; }
    .badge { display: inline-block; font-size: 12px; font-weight: bold; padding: 6px 12px; border-radius: 12px; white-space: nowrap; font-family: Arial, sans-serif; }
    .badge.signed { background: #e6f4ea; color: #137333; }
    .badge.completed { background: #e8f0fe; color: #1a73e8; }
    .signed-up { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .cancel-link { background: none; border: none; padding: 0; font-size: 12px; color: #666; text-decoration: underline; cursor: pointer; font-family: inherit; }
    .cancel-link:hover { color: #b00020; }
  `]
})
export class VolunteerActionComponent {
  store = inject(Store);
  event = input.required<VolunteerEvent>();
}
