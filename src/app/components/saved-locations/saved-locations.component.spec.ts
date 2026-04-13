import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { SavedLocationsComponent } from './saved-locations.component';

describe('SavedLocationsComponent', () => {
  let component: SavedLocationsComponent;
  let fixture: ComponentFixture<SavedLocationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedLocationsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedLocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
