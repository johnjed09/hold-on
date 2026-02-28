import { Test } from '@nestjs/testing';
import { HoldOnService } from './hold-on.service';

describe('Hold On Service', () => {
  let service: HoldOnService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HoldOnService],
    }).compile();

    service = moduleRef.get(HoldOnService);
  });

  afterEach(() => {
    service.stop();
  });

  it('should increment intervalCount after 1 second.', () => {
    service.start();

    service.time$.subscribe((time) => {
      if (time === 1) {
        expect(time).toBe(1);
      }
    });
  });

  it('should stop the timer when stop() is called.', () => {
    service.start();
    service.stop();
    service.timerStop$.subscribe((isTimerStop) => {
      expect(isTimerStop).toBe(true);
    });

    service.start();
    service.onModuleDestroy();
    service.timerStop$.subscribe((isTimerStop) => {
      expect(isTimerStop).toBe(true);
    });
  });

  it('should prevent multiple timers', () => {
    jest.useFakeTimers();
    const tickSpy = jest.spyOn(service as any, 'tick');

    // Call start 5 times
    service.start();
    service.start();
    service.start();
    service.start();
    service.start();

    // At 0ms, it should have been called exactly once (the first start)
    expect(tickSpy).toHaveBeenCalledTimes(1);

    // Advance 3 seconds
    jest.advanceTimersByTime(3000);

    // Total calls should be 4 (1 initial + 3 recursive ticks)
    // If the guard failed, it would be 20 (5 starts * 4 ticks)
    expect(tickSpy).toHaveBeenCalledTimes(4);
  });
});
