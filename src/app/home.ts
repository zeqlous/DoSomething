import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from './store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  store = inject(Store);
}