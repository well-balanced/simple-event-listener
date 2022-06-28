import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from 'app.module';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const docConfig = new DocumentBuilder()
    .setTitle('simple-event-listener')
    .setDescription('handle review event (triple assignment)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, docConfig);
  writeFileSync('./swagger-spec.json', JSON.stringify(document));
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
