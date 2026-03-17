import { Test, TestingModule } from '@nestjs/testing';
import { HoldOnGateway } from './hold-on.gateway';
import { HoldOnService } from './hold-on.service';
import { BehaviorSubject, of, Subject } from 'rxjs';

describe('HoldOnGateway', () => {
  let gateway: HoldOnGateway;
  let service: HoldOnService;

  const timeSubject = new Subject<number>();
  const stopSubject = new Subject<boolean>();
  const holdListSubject = new Subject<string[]>();

  const mockServer = {
    emit: jest.fn(),
  };
  const mockHoldOnService = {
    provide: HoldOnService,
    useValue: {
      time$: timeSubject.asObservable(),
      timerStop$: stopSubject.asObservable(),
      holdList$: holdListSubject.asObservable(),
      someoneHold: jest.fn(),
      someoneRelease: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HoldOnGateway, mockHoldOnService],
    }).compile();

    gateway = module.get(HoldOnGateway);
    service = module.get(HoldOnService);

    gateway.server = mockServer as any;

    gateway.afterInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit() hoisted states', () => {
    it('should emit "timer" when the service time$ changes', () => {
      const testTime = 5;

      // Trigger the observable in the service
      timeSubject.next(testTime);

      // Verify the gateway called server.emit with the right data
      expect(mockServer.emit).toHaveBeenCalledWith('timer', testTime);
    });

    it('should emit "stop" when the service timerStop$ emits true', () => {
      stopSubject.next(true);

      expect(mockServer.emit).toHaveBeenCalledWith('stop', 'Timer stopped!');
    });

    it('should NOT emit "stop" when timerStop$ is false', () => {
      stopSubject.next(false);
      expect(mockServer.emit).not.toHaveBeenCalledWith(
        'stop',
        'Timer stopped!',
      );
    });
  });

  describe('socket message gateway', () => {
    it('should call service.start() when handleStart is triggered', () => {
      gateway.handleStart();
      expect(service.start).toHaveBeenCalled();
    });

    it('should call service.stop() when handleStop is triggered', () => {
      gateway.handleStop();
      expect(service.stop).toHaveBeenCalled();
    });
  });
});
