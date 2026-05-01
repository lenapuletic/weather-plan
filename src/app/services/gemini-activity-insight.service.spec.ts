import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { GeminiActivityInsightService } from './gemini-activity-insight.service';
import { environment } from '../../environments/environment';

describe('GeminiActivityInsightService', () => {
  let service: GeminiActivityInsightService;
  let httpMock: HttpTestingController;
  const originalGeminiKey = environment.gemini.apiKey;
  const originalProxyBase = environment.gemini.proxyBaseUrl;
  const originalModel = environment.gemini.model;

  beforeEach(() => {
    environment.gemini.proxyBaseUrl = '';
    environment.gemini.apiKey = 'test-gemini-key';
    environment.gemini.model = '';

    TestBed.configureTestingModule({
      providers: [GeminiActivityInsightService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GeminiActivityInsightService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    environment.gemini.apiKey = originalGeminiKey;
    environment.gemini.proxyBaseUrl = originalProxyBase;
    environment.gemini.model = originalModel;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getInsight should map response text', (done) => {
    const req = {
      city: 'Berlin',
      country: 'DE',
      activityTitle: 'Cycling',
      weatherSummary: '12°C, light rain',
    };

    service.getInsight(req).subscribe({
      next: (text) => {
        expect(text).toBe('Tip one\nTip two');
        done();
      },
      error: done.fail,
    });

    const httpReq = httpMock.expectOne((r) =>
      r.url.includes('generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'),
    );
    expect(httpReq.request.method).toBe('POST');
    expect(httpReq.request.params.get('key')).toBe('test-gemini-key');
    expect(httpReq.request.body.contents[0].parts[0].text).toContain('Berlin');

    httpReq.flush({
      candidates: [{ content: { parts: [{ text: 'Tip one\nTip two' }] } }],
    });
  });

  it('getInsight should try next model when first returns 429', (done) => {
    service
      .getInsight({
        city: 'Berlin',
        country: 'DE',
        activityTitle: 'Hiking',
        weatherSummary: '10°C',
      })
      .subscribe({
        next: (text) => {
          expect(text).toBe('From lite');
          done();
        },
        error: done.fail,
      });

    const first = httpMock.expectOne((r) => r.url.includes('models/gemini-2.5-flash:generateContent'));
    first.flush('{}', { status: 429, statusText: 'Too Many Requests' });

    const second = httpMock.expectOne((r) => r.url.includes('models/gemini-2.5-flash-lite:generateContent'));
    second.flush({
      candidates: [{ content: { parts: [{ text: 'From lite' }] } }],
    });
  });

  it('getInsight should error when candidates empty', (done) => {
    service
      .getInsight({
        city: 'X',
        country: 'Y',
        activityTitle: 'Z',
        weatherSummary: 'w',
      })
      .subscribe({
        next: () => done.fail('expected error'),
        error: (e: Error) => {
          expect(e.message).toContain('No suggestion');
          done();
        },
      });

    const httpReq = httpMock.expectOne(() => true);
    httpReq.flush({ candidates: [] });
  });

  it('hasApiKey should be false when key and proxy empty', () => {
    environment.gemini.apiKey = '';
    environment.gemini.proxyBaseUrl = '';
    expect(service.hasApiKey()).toBe(false);
  });

  it('getInsight should use proxy URL when proxyBaseUrl is set', (done) => {
    environment.gemini.apiKey = '';
    environment.gemini.proxyBaseUrl = 'http://localhost:8787';

    service
      .getInsight({
        city: 'Paris',
        country: 'FR',
        activityTitle: 'Walking',
        weatherSummary: '20°C',
      })
      .subscribe({
        next: (text) => {
          expect(text).toBe('Via proxy');
          done();
        },
        error: done.fail,
      });

    const httpReq = httpMock.expectOne((r) =>
      r.url.startsWith('http://localhost:8787/v1beta/models/gemini-2.5-flash:generateContent'),
    );
    expect(httpReq.request.params.keys().length).toBe(0);
    httpReq.flush({
      candidates: [{ content: { parts: [{ text: 'Via proxy' }] } }],
    });
  });

  it('getInsight should error immediately when key empty', (done) => {
    environment.gemini.apiKey = '';
    environment.gemini.proxyBaseUrl = '';
    service
      .getInsight({
        city: 'A',
        country: 'B',
        activityTitle: 'C',
        weatherSummary: 'D',
      })
      .subscribe({
        next: () => done.fail('expected error'),
        error: (e: Error) => {
          expect(e.message).toContain('not configured');
          done();
        },
      });
  });
});
