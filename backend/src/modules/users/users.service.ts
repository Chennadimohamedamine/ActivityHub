import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponseDto } from './dto/profile-responce.dto';
import { AdminUsersQueryDto } from './dto/admin-user-query.dto';
import { AuthUser } from 'src/common/interfaces/auth-user.interface';
import { profile } from 'console';


@Injectable()
export class UsersService {
  usersRepository: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

  ) { }



  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id },
	  select: ['id', 'Firstname', 'Lastname', 'Username', 'bio', 'profileImage', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user)
      throw new NotFoundException('User not found');

    user.Firstname = dto.firstName;
    user.Lastname = dto.lastName;
    user.bio = dto.bio;

    const updated = await this.userRepo.save(user);

    return {
      id: updated.id,
      Username: updated.Username,
      email: updated.email,
      firstName: updated.Firstname,
	  lastName: updated.Lastname,
      avatarUrl: updated.profileImage,
      bio: updated.bio,
    };
  }

  async updateimage(userId: string, imagePath: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.profileImage = imagePath;
    await this.userRepo.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

 async findByUsername(username: string) {
		return await this.userRepo.findOne({
			where: { Username: username },
			select: ['id', 'Firstname', 'Lastname', 'Username', 'bio', 'profileImage', 'createdAt', 'updatedAt'],
		});
}

 async findByUsernameWithoOwnProfile(username: string, user?: AuthUser) {
		const profileData =  await this.userRepo.findOne({
			where: { Username: username },
			select: ['id', 'Firstname', 'Lastname', 'Username', 'bio', 'profileImage', 'createdAt', 'updatedAt'],
		});


		return {
			...profileData,
			isOnMyOwnProfile: profileData?.id == user?.sub
	}
}

  async create(data: Partial<User>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }


  async getAdminUsers(query: AdminUsersQueryDto) {
    const { page = 1, limit = 10, search, role } = query;

    const qb = this.userRepo.createQueryBuilder('user');

    // Recherche par nom, email ou téléphone
    if (search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filtre par rôle
    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    // Compter le nombre de commandes
    qb.loadRelationCountAndMap('user.ordersCount', 'user.orders');

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      select: ['id', 'email', 'Username', 'bio', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
  async searchUsers(query: string, excludeUserId?: string): Promise<User[]> {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.Username ILIKE :q', { q: `%${query}%` })
      .select(['user.id', 'user.Username', 'user.profileImage'])
      .orderBy('user.createdAt', 'DESC')
      .take(20);
  
    if (excludeUserId) {
      qb.andWhere('user.id != :excludeId', { excludeId: excludeUserId });
    }
  
    return qb.getMany();
  }
}
