import { Test, TestingModule } from '@nestjs/testing';
import { UserSavedActivitiesService } from './user-saved-activities.service';

describe('UserSavedActivitiesService', () => {
  let service: UserSavedActivitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserSavedActivitiesService],
    }).compile();

    service = module.get<UserSavedActivitiesService>(UserSavedActivitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
