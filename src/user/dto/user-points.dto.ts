import { ApiProperty } from '@nestjs/swagger';

export class UserPointsResponse {
  @ApiProperty({ description: '유저 포인트' })
  point: number;
}
