// validators/conditional-fields.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { PackageType } from '@src/campaign/dto/publishCampaignDto';

// Validator to prevent fields from being provided for non-custom packages
@ValidatorConstraint({ async: false })
export class IsNotAllowedWithPackageTypeConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const packageType = object.packageType;

    const nonCustomTypes = [
      PackageType.STARTER,
      PackageType.BASIC,
      PackageType.PREMIUM,
    ];

    if (nonCustomTypes.includes(packageType)) {
      // If value is provided (not null/undefined), validation fails
      return value === null || value === undefined;
    }

    // For custom package type, allow any value
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} should not be provided when package type is STARTER, BASIC, or PREMIUM. These values are auto-generated.`;
  }
}

export function IsNotAllowedWithPackageType(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotAllowedWithPackageTypeConstraint,
    });
  };
}

// Validator to require fields when package type is custom
@ValidatorConstraint({ async: false })
export class IsRequiredForCustomPackageConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const packageType = object.packageType;

    if (packageType === PackageType.CUSTOM) {
      return value !== null && value !== undefined && value !== '';
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is required when package type is CUSTOM.`;
  }
}

export function IsRequiredForCustomPackage(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: {
        ...validationOptions,
        always: true,
      },
      constraints: [],
      validator: IsRequiredForCustomPackageConstraint,
    });
  };
}
