import { Component } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';

interface NavItem {
  id: 'schedule' | 'events' | 'settings';
  icon: string;
  label: string;
}

interface CalendarDay {
  dayNumber: number | string;
  isMuted?: boolean;
  event?: {
    title: string;
    type: 'green' | 'red';
  };
}

interface UpcomingEvent {
  icon: string;
  title: string;
  date: string;
  location: string;
  status: 'Confirmed' | 'Pending Approval';
  statusClass: 'confirmed' | 'pending';
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './schedule.html',
  styleUrl: './schedule.css'
})
export class ScheduleComponent {
  // Current active tab state
  activeTab: 'schedule' | 'events' | 'settings' = 'schedule';

  // Sidebar Navigation Items
  navItems: NavItem[] = [
    { id: 'schedule', icon: '📅', label: 'Schedule' },
    { id: 'events', icon: '👥', label: 'My Events' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  // Function to switch tabs
  selectTab(tabId: 'schedule' | 'events' | 'settings', event: Event): void {
    event.preventDefault();
    this.activeTab = tabId;
  }

  // Weekday Headers
  weekdays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calendar Days
  calendarDays: CalendarDay[] = [
    { dayNumber: 24, isMuted: true }, { dayNumber: 25, isMuted: true },
    { dayNumber: 26, isMuted: true }, { dayNumber: 27, isMuted: true },
    { dayNumber: 28, isMuted: true }, { dayNumber: 29, isMuted: true },
    { dayNumber: 30, isMuted: true },
    { dayNumber: 1 }, { dayNumber: 2 }, { dayNumber: 3 }, { dayNumber: 4 },
    { dayNumber: 5 }, { dayNumber: 6 }, { dayNumber: 7 },
    { dayNumber: 8 }, { dayNumber: 9 }, { dayNumber: 10 }, { dayNumber: 11 },
    { dayNumber: 12 }, { dayNumber: 13 }, { dayNumber: 14 },
    { dayNumber: 15, event: { title: 'Park Clean - Up', type: 'green' } },
    { dayNumber: 16 }, { dayNumber: 17 }, { dayNumber: 18 },
    { dayNumber: 19 }, { dayNumber: 20 }, { dayNumber: 21 },
    { dayNumber: 22, event: { title: 'Food Bank Sorting', type: 'red' } },
    { dayNumber: 23 }, { dayNumber: 24 }, { dayNumber: 25 },
    { dayNumber: 26 }, { dayNumber: 27 },
    { dayNumber: 28, event: { title: 'Mentorship Session', type: 'green' } },
    { dayNumber: 29 }, { dayNumber: 30 }, { dayNumber: 31 },
    { dayNumber: 1, isMuted: true }, { dayNumber: 2, isMuted: true },
    { dayNumber: 3, isMuted: true }, { dayNumber: 4, isMuted: true }
  ];

  // My Events List (matching the wireframe design)
  myEvents: UpcomingEvent[] = [
    {
      icon: '🌱',
      title: 'Park Clean-up',
      date: 'Oct 15 • 9:00 AM - 12:00 PM',
      location: 'Riverside Park • 4.2 miles away',
      status: 'Confirmed',
      statusClass: 'confirmed'
    },
    {
      icon: '❤️',
      title: 'Food Bank Sorting',
      date: 'Oct 22 • 2:00 PM - 5:00 PM',
      location: 'Community Center • 1.8 miles away',
      status: 'Pending Approval',
      statusClass: 'pending'
    },
    {
      icon: '📖',
      title: 'Mentorship Session',
      date: 'Oct 28 • 6:00 PM - 8:00 PM',
      location: 'Library Annex • 3.5 miles away',
      status: 'Confirmed',
      statusClass: 'confirmed'
    }
  ];
}