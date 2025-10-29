import {
  IsString,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PropertyType {
  RESIDENTIAL = 'residential',
  APARTMENT = 'apartment',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  NEW_DEVELOPMENT = 'newDevelopment',
  SHORTLET = 'shortLet',
}

export enum PreferredLanguageType {
  ENGLISH = 'english',
  YORUBA = 'yoruba',
  HAUSA = 'hausa',
  IGBO = 'igbo',
}

export enum ContactFrequencyType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum ProfileVisibilityType {
  PUBLIC = 'public',
  LIMITED = 'limited',
  PRIVATE = 'private',
}

export class UpdateUserPreferencesDto {
  @ApiProperty({
    enum: PropertyType,
    isArray: true,
    example: [PropertyType.APARTMENT, PropertyType.LAND],
    description: 'Types of properties the user is interested in',
  })
  @IsEnum(PropertyType, { each: true })
  propertyType: PropertyType[];

  @ApiProperty({
    example: 5000000,
    description: 'Minimum budget range in Naira',
  })
  @IsInt()
  @Min(0)
  minBudgetRange: number;

  @ApiProperty({
    example: 15000000,
    description: 'Maximum budget range in Naira',
  })
  @IsInt()
  @Min(0)
  maxBudgetRange: number;

  @ApiProperty({
    example: 'Lekki, Lagos',
    description: 'Preferred property location',
  })
  @IsString()
  preferredLocation: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['2', '3'],
    description: 'Preferred number of bedrooms',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  numberOfBedrooms?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Receive alerts for new property listings',
  })
  @IsOptional()
  @IsBoolean()
  newPropertyAlert?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Receive notifications for price changes',
  })
  @IsOptional()
  @IsBoolean()
  priceChangeNotifications?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive updates and news about the market',
  })
  @IsOptional()
  @IsBoolean()
  marketUpdatesAndNews?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Receive updates about investment opportunities',
  })
  @IsOptional()
  @IsBoolean()
  investmentOpportunities?: boolean;

  @ApiProperty({
    enum: PreferredLanguageType,
    example: PreferredLanguageType.ENGLISH,
    description: 'User preferred communication language',
  })
  @IsEnum(PreferredLanguageType)
  preferredLanguage: PreferredLanguageType;

  @ApiProperty({
    enum: ContactFrequencyType,
    example: ContactFrequencyType.WEEKLY,
    description: 'How often the user wants to be contacted',
  })
  @IsEnum(ContactFrequencyType)
  contactFrequency: ContactFrequencyType;

  @ApiProperty({
    enum: ProfileVisibilityType,
    example: ProfileVisibilityType.PUBLIC,
    description: 'Visibility setting for user profile',
  })
  @IsEnum(ProfileVisibilityType)
  profileVisibility: ProfileVisibilityType;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user has completed this preference stage',
  })
  @IsBoolean()
  isStageComplete?: boolean;
}
