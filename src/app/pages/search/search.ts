import { Component } from '@angular/core';
import { NgFor, NgIf, } from '@angular/common';
import { RouterLink } from '@angular/router';

interface SearchResult {
  title: string;
  description: string;
  dates: string;
  imageUrl: string;
  altText: string;
  isGray?: boolean;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './search.html',
  styleUrl: './search.css'
})
export class SearchComponent {
  searchQuery: string = 'Dog Sitting';

  searchResults: SearchResult[] = [
    {
      title: 'Dog Sitter | Dog Sitting company',
      description: 'Looking for volunteers who can work on the weekends. Volunteers must have experience with animals and must not have allergies for them.',
      dates: 'October 3, 2026 - October 24, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
      altText: 'Dog Sitter Volunteer',
      isGray: false
    },
    {
      title: 'Dog Sitting | Dog Volunteer Shelter',
      description: 'Looking for volunteers who can work on October 3, 2026.',
      dates: 'October 3, 2026 - October 3, 2026',
      imageUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
      altText: 'Dog Volunteer Shelter',
      isGray: true
    }
  ];
}