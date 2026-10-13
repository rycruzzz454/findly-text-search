
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

interface Hit {
  start: number;
  end: number;
  line: number;
  column: number;
  text: string;
}

interface SearchResponse {
  totalHits: number;
  hits: Hit[];
  truncated: boolean;
}

interface Segment {
  text: string;
  highlight: boolean;
}

const EXAMPLE = `Automation helps businesses save time.
With automation, repetitive tasks become easier.
Good automation improves efficiency.`;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  input = EXAMPLE;
  query = 'automation';
  caseSensitive = false;
  searching = false;
  searched = false;
  error = '';

  results: SearchResponse = {
    totalHits: 0,
    hits: [],
    truncated: false
  };

  segments: Segment[] = [];

  runSearch(): void {
    this.error = '';
    this.searched = false;

    if (!this.query.trim()) {
      this.error = 'Enter a word or phrase to search for.';
      return;
    }

    if (!this.input) {
      this.error = 'Enter some text to search.';
      return;
    }

    this.searching = true;

    this.http.post<SearchResponse>(
      '/api/search',
      {
        input: this.input,
        query: this.query,
        caseSensitive: this.caseSensitive
      }
    ).subscribe({
      next: (result) => {
        this.results = result;
        this.segments = this.buildSegments(this.input, result.hits);
        this.searched = true;
        this.searching = false;
        this.error = '';

        // Immediately refresh the Angular interface
        this.cdr.detectChanges();
      },

      error: (err: HttpErrorResponse) => {
        this.searching = false;
        this.searched = false;

        this.error =
          err.error?.error ||
          'Unable to connect to the search API. Make sure the backend is running on port 3000.';

        // Refresh the interface when an error occurs
        this.cdr.detectChanges();
      }
    });
  }

  loadExample(): void {
    this.input = EXAMPLE;
    this.query = 'automation';
    this.caseSensitive = false;
    this.clearResults();
  }

  clearAll(): void {
    this.input = '';
    this.query = '';
    this.clearResults();
  }

  clearResults(): void {
    this.searched = false;
    this.searching = false;
    this.error = '';

    this.results = {
      totalHits: 0,
      hits: [],
      truncated: false
    };

    this.segments = [];
    this.cdr.detectChanges();
  }

  private buildSegments(source: string, hits: Hit[]): Segment[] {
    const segments: Segment[] = [];
    let cursor = 0;

    for (const hit of hits) {
      if (
        hit.start < cursor ||
        hit.end > source.length ||
        hit.start >= hit.end
      ) {
        continue;
      }

      if (hit.start > cursor) {
        segments.push({
          text: source.slice(cursor, hit.start),
          highlight: false
        });
      }

      segments.push({
        text: source.slice(hit.start, hit.end),
        highlight: true
      });

      cursor = hit.end;
    }

    if (cursor < source.length) {
      segments.push({
        text: source.slice(cursor),
        highlight: false
      });
    }

    return segments;
  }
}
