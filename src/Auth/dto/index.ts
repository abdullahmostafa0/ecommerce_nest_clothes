
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength, registerDecorator, ValidationOptions, ValidationArguments, MaxLength, Matches } from "class-validator";
export function IsNotEqualTo(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isNotEqualTo',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    // consider null/undefined allowed to be handled by other decorators
                    if (value === undefined || value === null) return true;
                    return value !== relatedValue;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} should not be equal to ${relatedPropertyName}`;
                }
            },
        });
    };
}

export function IsEqualTo(property: string, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'isEqualTo',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    // if either is undefined/null let other validators handle requiredness
                    if (value === undefined || value === null) return true;
                    return value === relatedValue;
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} must match ${relatedPropertyName}`;
                }
            },
        });
    };
}

export class signupDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;

    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(1000)
    address: string;

    @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
    phone: string;

    @IsStrongPassword()
    @IsNotEmpty()
    @IsEqualTo('password', { message: 'Confirm password must match password' })
    confirmPassword: string;
}

export class signinDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;


    @IsStrongPassword()
    @IsNotEmpty()
    password: string;

}

export class confirmDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;



    @IsNotEmpty()
    otp: string;

}

export class resendDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;
}

export class forgetPasswordDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;
}

export class resetPasswordDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @MinLength(3)
    email: string;

    @IsNotEmpty()
    otp: string;

    

    @IsStrongPassword()
    @IsNotEmpty()
    password: string;


}


