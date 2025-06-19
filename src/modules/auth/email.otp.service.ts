import { Injectable, InternalServerErrorException } from "@nestjs/common";
import OtpService from "./otp.service";
import RedisService from "src/core/database/redis.service";
import { ConfigService } from "@nestjs/config";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
class EmailOtpService {
    private MAX_DURATION_LINK: number = 86400;
    private MAX_EMAIL_RATE: number = 30;
    private MAX_HOURLY_LIMIT: number = 10
    
    constructor(
      private mailService: MailerService,
      private otpService: OtpService,
      private redisService: RedisService,
      private configService: ConfigService
    ){}
    async sendEmailLink(email: string){
        const token = this.otpService.getSessionToken()
        await this.setEmailToken(email, token)
        const fromEmail = this.configService.get("HOST_EMAIL") as string
        const url= `http://${this.configService.get("HOST_EMAIL_URL")}:4000/api/user/verify-email?token=${token}`
        try {
          await this.mailService.sendMail({
            from: fromEmail,
            to: email,
            subject: "Hello",
            html: `<a href=${url}>${url}</a>`
          })
        } catch (error) {
            throw new InternalServerErrorException(error)
        }
    }
    async sendEmailWithOtp(email: string){
        const otp = this.otpService.generateOtp()
    }
    async setEmailToken(token: string, email: string){
        const key = `email-verify${token}`
        await this.redisService.redis.setex(
            key,
            this.MAX_DURATION_LINK,
            JSON.stringify({
                email,
                createdAt: new Date()
            })
        )
    }
    async getEmailToken(token: string){
      const key = `email-verify${token}`
      return await this.redisService.getKey(key)
    }
}

export default EmailOtpService