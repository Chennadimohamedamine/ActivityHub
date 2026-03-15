import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.add(createCategoryDto);
  }

  @Get()
  getAll() {
    return this.categoriesService.getAll();
  }

  @Delete(':name')
  remove(@Param('name') categoryName: string) {
    return this.categoriesService.remove(categoryName);
  }
}
