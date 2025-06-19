import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, map } from "rxjs";

@Injectable()
class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const isFreeResponse = this.reflector.get("isFreeResponse", handler);
    const statusCode = response.statusCode;

    if (!isFreeResponse) {
      return next.handle().pipe(
        map((data) => {
          return {
            status: statusCode,
            ...(typeof data !== 'object' || Array.isArray(data)
              ? { data }
              : data),
            message: 'success',
          };
        }),
      );
    }
    return next.handle();
  }
}

export default TransformInterceptor;