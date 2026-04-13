import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { WeatherDashboardComponent } from './weather-dashboard.component';

describe('WeatherDashboardComponent', () => {
  let component: WeatherDashboardComponent;
  let fixture: ComponentFixture<WeatherDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeatherDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
