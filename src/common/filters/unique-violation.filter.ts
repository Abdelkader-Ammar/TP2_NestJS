import { ArgumentsHost, Catch, ConflictException, ExceptionFilter, HttpException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

const PG_UNIQUE_VIOLATION = '23505';

// Transforme une violation de contrainte d'unicité (username, email, cin, designation...) en 409.
// Toute autre erreur de base de données reste une 500.
@Catch(QueryFailedError)
export class UniqueViolationFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const { code, detail } = exception.driverError as { code?: string; detail?: string };
    const error: HttpException =
      code === PG_UNIQUE_VIOLATION
        ? new ConflictException(`La valeur du champ ${/Key \((.+?)\)=/.exec(detail ?? '')?.[1] ?? 'unique'} existe déjà.`)
        : new InternalServerErrorException();

    const response = host.switchToHttp().getResponse<Response>();
    response.status(error.getStatus()).json(error.getResponse());
  }
}
