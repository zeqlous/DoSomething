import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  openOpportunities = [
    { title: 'Dog Sitting', date: 'October 25, 2026', location: 'Lincoln, NE', status: 'Open', statusClass: 'open' }
  ];
  pastOpportunities = [
    { title: 'Community Garden Cleanup', date: 'September 10, 2026', location: 'Lincoln, NE', status: 'Completed', statusClass: 'completed' }
  ];
}