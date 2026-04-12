import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import {
  DuplicateProductNameError,
  InsufficientStockError,
  InvalidSaleStateError,
  ProductNotFoundError,
  SaleNotFoundError,
} from '../../../domain/errors/domain-errors';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Mapping logic
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';

    if (exception instanceof ProductNotFoundError || exception instanceof SaleNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    } else if (
      exception instanceof InsufficientStockError ||
      exception instanceof InvalidSaleStateError ||
      exception instanceof DuplicateProductNameError
    ) {
      status = HttpStatus.CONFLICT;
      message = exception.message;
    } else {
      // Fallback to default NestJS handling if it's an HttpException, or log unknown
      // Ideally we only want to handle OUR domain errors here, but @Catch() catches everything.
      // If catching everything, we must respect existing HttpExceptions.
      if (exception.getStatus && typeof exception.getStatus === 'function') {
        status = exception.getStatus();
        message = exception.getResponse()['message'] || exception.message;
      } else {
         this.logger.error(`Unexpected error: ${exception}`, exception.stack);
      }
    }

    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }
}
