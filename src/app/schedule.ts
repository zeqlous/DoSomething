import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.html',
  styleUrls: ['./schedule.css']
})
export class ScheduleComponent {
  activeTab = 'events';
  navItems = [
    { id: 'schedule', label: 'Calendar View', icon: '📅' },
    { id: 'events', label: 'Upcoming Events', icon: '📋' }
  ];
  myEvents = [
    { title: 'Dog Sitting', date: 'October 25, 2026 - 2:00 PM', location: 'Lincoln, NE', status: 'Confirmed', statusClass: 'confirmed', icon: '🐕' }
  ];

  selectTab(tabId: string, event: Event) {
    event.preventDefault();
    this.activeTab = tabId;
  }
}