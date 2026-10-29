import { Component, computed, input } from '@angular/core';
import { IconComponent } from './icon';
import { VolunteerEvent } from './store';

/** Event picture, or a tinted tile with the event's icon when there is no imageUrl. */
@Component({
  selector: 'app-event-thumb',
  standalone: true,
  imports: [IconComponent],
  host: { '[attr.data-size]': 'size()' },
  template: `
    @if (event().imageUrl) {
      <img [src]="event().imageUrl" alt="" />
    } @else {
      <span class="placeholder" aria-hidden="true"><app-icon [name]="event().icon" [size]="iconSize()" /></span>
    }
  `,
  styles: [`
    :host { display: block; flex-shrink: 0; overflow: hidden; border-radius: var(--radius); background: var(--blue-bg); color: var(--primary); }
    :host([data-size='sm']) { width: 48px; height: 48px; }
    :host([data-size='md']) { width: 56px; height: 56px; }
    :host([data-size='lg']) { width: 100%; height: 180px; }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .placeholder { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; }
  `]
})
export class EventThumbComponent {
  event = input.required<VolunteerEvent>();
  size = input<'sm' | 'md' | 'lg'>('md');
  iconSize = computed(() => ({ sm: 24, md: 28, lg: 64 })[this.size()]);
}
