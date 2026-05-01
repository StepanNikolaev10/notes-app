import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsIn,
  IsString,
} from 'class-validator';
import { status } from '../../../prisma/generated/enums';

export class TrashNotesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  readonly noteIds: string[];

  @IsIn([status.default, status.archived])
  readonly currentStatus: Exclude<status, 'TRASHED'>;
}
