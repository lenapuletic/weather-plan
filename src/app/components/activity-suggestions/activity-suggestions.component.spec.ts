import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivitySuggestionsComponent } from './activity-suggestions.component';
import { WeatherStore } from '../../store/weather.store';
import { WeatherData } from '../../interface/weather.interface';
import { MatDialogConfig } from '@angular/material/dialog';
import {
  ActivityInsightDialogComponent,
  ActivityInsightDialogData,
} from '../activity-insight-dialog/activity-insight-dialog.component';

describe('ActivitySuggestionsComponent', () => {
  let component: ActivitySuggestionsComponent;
  let fixture: ComponentFixture<ActivitySuggestionsComponent>;
  let dialog: MatDialog;

  const mockWeather: WeatherData = {
    name: 'Testville',
    main: {
      temp: 18,
      humidity: 55,
      feels_like: 17,
      pressure: 1012,
    },
    wind: { speed: 3 },
    weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
    sys: { country: 'TS', id: 1 },
    coord: { lon: 0, lat: 0 },
  };

  const currentWeather = signal<WeatherData | null>(null);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivitySuggestionsComponent, MatDialogModule, NoopAnimationsModule],
      providers: [
        {
          provide: WeatherStore,
          useValue: {
            currentWeather,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitySuggestionsComponent);
    component = fixture.componentInstance;
    dialog = TestBed.inject(MatDialog);
    currentWeather.set(null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show activities when weather is set', () => {
    currentWeather.set(mockWeather);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.activity-card');
    expect(cards.length).toBe(4);
  });

  it('should open insight dialog when an activity is clicked', () => {
    const openSpy = spyOn(dialog, 'open');
    currentWeather.set(mockWeather);
    fixture.detectChanges();

    const firstCard = fixture.nativeElement.querySelector('.activity-card') as HTMLButtonElement;
    expect(firstCard).toBeTruthy();
    firstCard.click();

    expect(openSpy).toHaveBeenCalled();
    const call = openSpy.calls.mostRecent();
    expect(call.args[0]).toBe(ActivityInsightDialogComponent);
    const cfg = call.args[1] as MatDialogConfig<ActivityInsightDialogData>;
    expect(cfg.data?.city).toBe('Testville');
    expect(cfg.data?.country).toBe('TS');
    expect(cfg.data?.activityTitle).toBeTruthy();
    expect(cfg.data?.weatherSummary).toContain('°C');
  });
});
