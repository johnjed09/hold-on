import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HoldOnService implements OnModuleDestroy {
  private intervalCount = 0;
  private timer: NodeJS.Timeout | null = null;
  private readonly oneSecond = 1000;

  // This is our "Radio Station" that broadcasts the time. Add new emitters
  private timeSource = new BehaviorSubject<number>(0);
  public time$ = this.timeSource.asObservable();
  private timerStopSource = new BehaviorSubject<boolean>(false);
  public timerStop$ = this.timerStopSource.asObservable();

  start() {
    if (this.timer) return; // Prevent multiple timers
    this.tick();
  }

  private tick() {
    this.intervalCount++;
    this.timeSource.next(this.intervalCount); // Broadcast to listeners

    console.log('1 second passed.', this.intervalCount);

    this.timer = setTimeout(() => this.tick(), this.oneSecond);
  }

  private resetTimer() {
    this.intervalCount = 0;
    this.timeSource.next(this.intervalCount);
  }

  stop() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.timerStopSource.next(true);
      this.resetTimer();
    }
  }

  onModuleDestroy() {
    this.stop();
  }
}
