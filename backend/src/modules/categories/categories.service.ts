import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) { }

  async getAll() {
    return await this.categoryRepo.find();
  }

  async add(createCategoryDto: CreateCategoryDto) {
    const exists = await this.categoryRepo.findOne({
      where: { name: createCategoryDto.name },
    });
    if (exists) 
      throw new Error('Category already exists');

    return this.categoryRepo.save(this.categoryRepo.create({
      ...createCategoryDto, 
      name: createCategoryDto.name}));
  }

  async remove(categoryId: string) {
    return await this.categoryRepo.delete(categoryId);
  }

  async initDefaultCategories(categories: string[]) {
    const existing = await this.categoryRepo.find();
    const existingNames = existing.map((c) => c.name);

    const newCategories = categories
      .filter((name) => !existingNames.includes(name))
      .map((name) => this.categoryRepo.create({ name: name }));

    if (newCategories.length) {
      await this.categoryRepo.save(newCategories);
    }

    return { message: 'Categories seeded successfully' };
  }

  async onModuleInit() {
    const defaultCategories = [
      'sports',
      'outdoors',
      'social',
      'tech',
      'arts',
      'music',
      'fitness',
      'gaming',
      'learning',
      'networking'
    ];
    await this.initDefaultCategories(defaultCategories);
  }
}
