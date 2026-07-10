import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { GreetDto } from './greet.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('greet')
  getGreet(@Query() query: GreetDto): string {
    return this.appService.getGreet(query.name);
  }
}
