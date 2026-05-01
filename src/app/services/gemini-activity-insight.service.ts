import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const FLASH_MODEL_FALLBACKS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-1.5-flash',
];

function extractGeminiErrorMessage(err: unknown): string | null {
  if (!(err instanceof HttpErrorResponse)) {
    return null;
  }
  const body = err.error;
  if (body && typeof body === 'object') {
    const nested = (body as { error?: { message?: string } }).error?.message;
    if (nested) {
      return nested;
    }
    const top = (body as { message?: string }).message;
    if (top) {
      return top;
    }
  }
  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }
  return null;
}

function shouldTryNextModel(err: unknown): boolean {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 429 || err.status === 404) {
      return true;
    }
  }
  const fromError = err instanceof Error ? err.message : '';
  const msg = extractGeminiErrorMessage(err) || fromError;
  if (!msg) {
    return false;
  }
  return /quota exceeded|resource_exhausted|free_tier|limit:\s*0|not found for API version|was not found|NOT_FOUND|is not supported/i.test(
    msg,
  );
}

function formatInsightHttpError(err: unknown): string {
  const geminiMsg = extractGeminiErrorMessage(err);
  const isRateLimited =
    (err instanceof HttpErrorResponse && err.status === 429) ||
    Boolean(
      geminiMsg &&
      /quota exceeded|resource_exhausted|rate limit|429|too many requests|free_tier/i.test(
        geminiMsg,
      ),
    );

  if (isRateLimited) {
    return (
      'Gemini hit a rate limit or your free quota for this model is exhausted (HTTP 429). ' +
      'Wait a minute and try again, check usage at https://aistudio.google.com/rate-limit , ' +
      'or set `gemini.model` in the environment to a model listed for your key in Google AI Studio. ' +
      'If you need steady traffic, enable billing on the Google Cloud project tied to your API key.'
    );
  }

  return (
    geminiMsg ||
    (err instanceof HttpErrorResponse && err.message) ||
    (err instanceof Error ? err.message : null) ||
    'Could not load suggestions. Check your connection or API key.'
  );
}

export interface ActivityInsightRequest {
  city: string;
  country: string;
  activityTitle: string;
  weatherSummary: string;
}

interface GeminiGenerateContentResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message?: string };
}

@Injectable({
  providedIn: 'root',
})
export class GeminiActivityInsightService {
  private readonly http = inject(HttpClient);

  getInsight(req: ActivityInsightRequest): Observable<string> {
    if (!this.isGeminiConfigured()) {
      return throwError(
        () =>
          new Error(
            'Gemini is not configured. For production use a proxy URL (see README); for local dev set gemini.proxyBaseUrl or gemini.apiKey in environment.ts.',
          ),
      );
    }

    const models = this.resolveModelOrder();
    return this.tryModels(models, 0, req);
  }

  /** Preferred model first, then deduped fallbacks. */
  private resolveModelOrder(): string[] {
    const preferred = environment.gemini.model?.trim();
    const base = preferred
      ? [preferred, ...FLASH_MODEL_FALLBACKS.filter((m) => m !== preferred)]
      : [...FLASH_MODEL_FALLBACKS];
    return [...new Set(base)];
  }

  private tryModels(
    models: string[],
    index: number,
    req: ActivityInsightRequest,
  ): Observable<string> {
    if (index >= models.length) {
      return throwError(
        () =>
          new Error(
            'Could not get AI tips from any Gemini model we tried. Check your key, model names in Google AI Studio, and quotas at https://aistudio.google.com/rate-limit',
          ),
      );
    }

    const model = models[index]!;
    return this.postGenerateContent(model, req).pipe(
      catchError((err) => {
        if (shouldTryNextModel(err) && index + 1 < models.length) {
          return this.tryModels(models, index + 1, req);
        }
        return throwError(() => new Error(formatInsightHttpError(err)));
      }),
    );
  }

  private postGenerateContent(
    model: string,
    req: ActivityInsightRequest,
  ): Observable<string> {
    const proxyBase = environment.gemini.proxyBaseUrl?.trim();
    const key = environment.gemini.apiKey?.trim();

    let url: string;
    let params: HttpParams | undefined;

    if (proxyBase) {
      const base = proxyBase.replace(/\/$/, '');
      url = `${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      params = undefined;
    } else if (key) {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      params = new HttpParams().set('key', key);
    } else {
      return throwError(
        () => new Error('Gemini is not configured (missing proxy URL and API key).'),
      );
    }

    const systemText =
      'You help travelers pick realistic things to do. Reply in plain text (short paragraphs or bullet lines with leading "- "). ' +
      'Give 3–6 practical tips for enjoying the given activity in the named city given current weather. ' +
      'Do not invent specific addresses, phone numbers, prices, or business names you are not sure about; ' +
      'suggest types of places or neighborhoods instead and tell the user to verify hours. ' +
      'Stay concise and friendly.';

    const userText =
      `City: ${req.city}, ${req.country}\n` +
      `Activity: ${req.activityTitle}\n` +
      `Weather snapshot: ${req.weatherSummary}`;

    const body = {
      systemInstruction: {
        parts: [{ text: systemText }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userText }],
        },
      ],
    };

    return this.http
      .post<GeminiGenerateContentResponse>(url, body, params ? { params } : {})
      .pipe(
        map((res) => {
          if (res.error?.message) {
            throw new Error(res.error.message);
          }
          const text = res.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (!text) {
            throw new Error(
              'No suggestion was returned. Try again in a moment.',
            );
          }
          return text;
        }),
      );
  }

  /** For tests / UI checks without calling the API */
  hasApiKey(): boolean {
    return this.isGeminiConfigured();
  }

  private isGeminiConfigured(): boolean {
    return Boolean(
      environment.gemini.proxyBaseUrl?.trim() ||
        environment.gemini.apiKey?.trim(),
    );
  }
}
