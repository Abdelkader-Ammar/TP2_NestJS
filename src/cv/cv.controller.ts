import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserEntity } from '../user/entities/user.entity';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';

@Controller('cv')
@UseGuards(JwtAuthGuard)
export class CvController {
  constructor(private readonly service: CvService) {}

  @Post()
  create(@Body() dto: CreateCvDto, @GetUser() user: UserEntity) {
    return this.service.createForUser(dto, user);
  }

  @Get()
  findAll(@GetUser() user: UserEntity) {
    return this.service.findAllForUser(user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity) {
    return this.service.findOneForUser(id, user);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCvDto, @GetUser() user: UserEntity) {
    return this.service.updateForUser(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: UserEntity) {
    return this.service.removeForUser(id, user);
  }
}
