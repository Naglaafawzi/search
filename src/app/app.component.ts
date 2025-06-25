import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VoiceSearchComponent } from '../componets/test-search/test-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,VoiceSearchComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'search';
}
