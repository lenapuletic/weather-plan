import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivityInsightRequest,
  GeminiActivityInsightService,
} from '../../services/gemini-activity-insight.service';

export type ActivityInsightDialogData = ActivityInsightRequest;

@Component({
  selector: 'app-activity-insight-dialog',
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './activity-insight-dialog.component.html',
  styleUrl: './activity-insight-dialog.component.scss',
})
export class ActivityInsightDialogComponent implements OnInit {
  readonly data = inject<ActivityInsightDialogData>(MAT_DIALOG_DATA);
  private readonly gemini = inject(GeminiActivityInsightService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly insight = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.gemini.hasApiKey()) {
      this.loading.set(false);
      this.error.set(
        'AI tips are not configured. Add a Gemini API key to your environment (see README), or use Search on Google below.',
      );
      return;
    }

    this.gemini
      .getInsight(this.data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (text) => {
          this.insight.set(text);
          this.loading.set(false);
        },
        error: (e: Error) => {
          this.error.set(e.message ?? 'Something went wrong.');
          this.loading.set(false);
        },
      });
  }

  readonly googleSearchUrl = (() => {
    const q = `${this.data.city}, ${this.data.country} ${this.data.activityTitle}`;
    return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
  })();

  openGoogle(): void {
    window.open(this.googleSearchUrl, '_blank', 'noopener,noreferrer');
  }
}
