import { Transform, Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsInt, Min, IsDateString, MinLength, MaxLength, IsNumber } from "class-validator";

export class CreateActivityDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(40)
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    description: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.toLocaleLowerCase())
    categoryName: string;

    @IsDateString()
    scheduledAt: string;

    @IsString()
    @IsNotEmpty()
    location: string;
    
    @IsNumber()
    @Type(() => Number)
    participantsLimit: number;
}
