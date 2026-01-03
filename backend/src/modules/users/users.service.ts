import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CreateUserDto } from '../../dto/users/create-user.dto';
import { UpdateUserDto } from '../../dto/users/update-user.dto';
import { Notification } from '../../entities/notification.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
    ) { }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            order: { createdAt: 'ASC' },
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new BadRequestException('User with this email already exists');
        }

        const user = this.userRepository.create(createUserDto);
        // Password hashing handled by @BeforeInsert hook
        return this.userRepository.save(user);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);

        // Merge updates
        this.userRepository.merge(user, updateUserDto);

        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        // Manually delete related notifications first to satisfy FK constraints
        await this.notificationRepository.delete({ userId: id });

        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }
}
