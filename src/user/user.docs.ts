import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwaggerMethodDoc } from 'common/types';
import { UserController } from 'user/user.controller';
import { UserPointLogsResponse, UserPointsResponse } from './dto';

export const docs: SwaggerMethodDoc<UserController> = {
  getPoints(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '유저의 포인트를 조회합니다.',
      }),
      ApiResponse({ type: UserPointsResponse }),
    );
  },

  getPointLogs(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '유저의 포인트 부여/회수 이력을 조회합니다.',
      }),
      ApiResponse({ type: UserPointLogsResponse }),
    );
  },
};
