import { Injectable, NotFoundException } from '@nestjs/common';
import { IUser, UserDocument, UserRepository } from '../../common';
import { SYS_MESSAGE } from '../../common/constants/message.constants';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: IUser['_id']): Promise<IUser> {
    const user = await this.userRepository.findOne({ filter: { _id: id } });
    if (!user) throw new NotFoundException(SYS_MESSAGE.USER.failure.find);
    return user;
  }

  async findByEmail(email: IUser['email']): Promise<IUser> {
    const user = await this.userRepository.findOne({ filter: { email } });
    if (!user) throw new NotFoundException(SYS_MESSAGE.USER.failure.find);
    return user;
  }
}
