import { NotFoundException } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

export abstract class CrudService<T extends ObjectLiteral & { id: number }> {
  protected constructor(
    protected readonly repository: Repository<T>,
    private readonly label: string,
  ) {}

  create(dto: DeepPartial<T>): Promise<T> {
    return this.repository.save(this.repository.create(dto));
  }

  findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
    if (!entity) this.notFound(id);
    return entity;
  }

  async update(id: number, dto: DeepPartial<T>): Promise<T> {
    const entity = await this.repository.preload(Object.assign({}, dto, { id }));
    if (!entity) this.notFound(id);
    return this.repository.save(entity);
  }

  async remove(id: number): Promise<void> {
    const result = await this.repository.delete(id);
    if (!result.affected) this.notFound(id);
  }

  async softRemove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.softDelete(id);
  }

  async restore(id: number): Promise<T> {
    const result = await this.repository.restore(id);
    if (!result.affected) this.notFound(id);
    return this.findOne(id);
  }

  protected notFound(id: number): never {
    throw new NotFoundException(`${this.label} ${id} introuvable.`);
  }
}
