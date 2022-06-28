import { ApiProperty } from '@nestjs/swagger';

class PointLogDto {
  @ApiProperty({ description: '적립/회수한 포인트' })
  amount: number;

  @ApiProperty({ description: '포인트 변동 이유' })
  message: string;
}

export class UserPointLogsResponse {
  @ApiProperty({ type: [PointLogDto], description: '유저 포인트 이력' })
  logs: PointLogDto[];
}
