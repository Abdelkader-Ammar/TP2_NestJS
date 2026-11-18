import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ADMIN_ROLE } from '../user/roles';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';

@Controller('skill')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SkillController {
  constructor(private readonly service: SkillService) {}

  @Post()
  @Roles(ADMIN_ROLE)
  create(@Body() dto: CreateSkillDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(ADMIN_ROLE)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSkillDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(ADMIN_ROLE)
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Delete(':id/soft')
  @Roles(ADMIN_ROLE)
  @HttpCode(204)
  softRemove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softRemove(id);
  }

  @Patch(':id/restore')
  @Roles(ADMIN_ROLE)
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.service.restore(id);
  }
}
