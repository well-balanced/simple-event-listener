import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from 'user/user.service';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:userId/points')
  async getPoints(@Param('userId') userId: string) {
    const point = await this.userService.getPoints(userId);
    return { point };
  }

  @Get('/:userId/point-logs')
  async getPointLogs(@Param('userId') userId: string) {
    /**
     * TODO: pagination
     */
    const logs = await this.userService.getPointLogs(userId);
    return { logs };
  }
}
