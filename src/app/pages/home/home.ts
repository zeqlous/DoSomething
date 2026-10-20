import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common'; // Import NgFor

interface Opportunity {
  title: string;
  date: string;
  location: string;
  status: 'Pending Approval' | 'Open' | 'Completed';
  statusClass: 'pending' | 'open' | 'completed';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgFor, NgClass],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  
  // Open opportunities list
  openOpportunities: Opportunity[] = [
    {
      title: 'Food Bank Sorting',
      date: 'Oct. 22 • 2:00 PM - 5:30 PM',
      location: 'Community Center • 1.5 miles away',
      status: 'Pending Approval',
      statusClass: 'pending'
    },
    {
      title: 'Park Clean-Up',
      date: 'Oct. 24 • 9:00 AM - 12:30 PM',
      location: 'Riverview Park • 3.2 miles away',
      status: 'Open',
      statusClass: 'open'
    },
    {
      title: 'Senior Center Visit',
      date: 'Oct. 28 • 1:00 PM - 3:00 PM',
      location: 'Senior Center • 3.5 miles away',
      status: 'Pending Approval',
      statusClass: 'pending'
    }
  ];

  // Past opportunities list
  pastOpportunities: Opportunity[] = [
    {
      title: 'Beach Cleanup',
      date: 'Sep. 18 • 8:00 AM - 11:00 AM',
      location: 'North Beach • 4.1 miles away',
      status: 'Completed',
      statusClass: 'completed'
    },
  ];
}