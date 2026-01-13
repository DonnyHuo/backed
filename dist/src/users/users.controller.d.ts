import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(page?: number, limit?: number): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProfile(user: any): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<any>;
}
