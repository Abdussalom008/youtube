import { IsEmail, IsString } from "class-validator";

export class CreateAuthDto {
  @IsEmail()
  email: string;
  @IsString()
  phone_number: string;
  @IsString()
  username: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  password: string;
  @IsString()
  session_token: string
}

