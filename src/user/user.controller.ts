import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from 'user/user.service';
import { docs } from 'user/user.docs';
import { plainToClass } from 'class-transformer';
import { UserPointLogsResponse, UserPointsResponse } from 'user/dto';

@ApiTags('user')
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:userId/points')
  @docs.getPoints('포인트 조회')
  async getPoints(@Param('userId') userId: string) {
    const point = await this.userService.getPoints(userId);
    return plainToClass(UserPointsResponse, { point });
  }

  @Get('/:userId/point-logs')
  @docs.getPoints('포인트 이력 조회')
  async getPointLogs(@Param('userId') userId: string) {
    /**
     * TODO: pagination
     */
    const logs = await this.userService.getPointLogs(userId);
    return plainToClass(UserPointLogsResponse, { logs });
  }
}
