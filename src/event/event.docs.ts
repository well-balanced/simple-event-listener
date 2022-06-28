import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { SwaggerMethodDoc } from 'common/types';
import { EventController } from 'event/event.controller';

export const docs: SwaggerMethodDoc<EventController> = {
  events(summary: string) {
    return applyDecorators(
      ApiOperation({
        summary,
        description: '이벤트를 핸들링 하는 API 입니다.',
      }),
    );
  },
};
