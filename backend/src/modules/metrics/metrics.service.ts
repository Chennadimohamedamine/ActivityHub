import { Injectable } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {

  public httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
  });

  public httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests',
    buckets: [0.1, 0.3, 0.5, 1, 2],
  });

  incrementRequests() {
    this.httpRequestsTotal.inc();
  }

  startTimer() {
    return this.httpRequestDuration.startTimer();
  }
}
