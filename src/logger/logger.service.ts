import { Injectable, Logger } from '@nestjs/common';
import { LoggerOptions } from './interfaces/logger-options.interface';
import { isEqual } from 'lodash';
import { Console } from 'console';
import { EntityObject } from './interfaces/entity-object.interface';
import { LoggerChange } from './interfaces/logger-change.interface';
import { LoggerActions } from './enums/logger-actions.enum';
import { DeleteReasons } from 'src/catalog/enums/delete-reasons.enum';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class LoggerService {
    private readonly logger = new Logger("AppLogger");

    constructor(
        private cls: ClsService
    ) {}

    public create(
        entity: EntityObject,
        message?: string
    ): void {
        // log create
        const logMessage = this.getLoggerFormat({
            message,
            entity,
            action: LoggerActions.Create
        });

        this.logger.log(logMessage);
    }

    public update(
        prev: EntityObject,
        result: EntityObject,
        message?: string
    ): void {
        const changes = this.getChanges(prev, result);
        if (changes.length == 0) return;

        // log update
        const logMessage = this.getLoggerFormat({
            message,
            entity: result,
            action: LoggerActions.Update,
            changes
        });

        this.logger.log(logMessage);
    }

    public deleteOne(
        entity: EntityObject,
        reason: DeleteReasons = DeleteReasons.Manual,
        message?: string,
    ): void {
        // log delete
        const logMessage = this.getLoggerFormat({
            message,
            entity,
            action: LoggerActions.Delete,
            data: { reason }
        });

        this.logger.log(logMessage);
    }

    public deleteMany(
        entities: EntityObject[],
        reason: DeleteReasons = DeleteReasons.Manual,
        message?: string,
    ): void {
        entities.forEach(entity => {
            // log delete
            const logMessage = this.getLoggerFormat({
                message,
                entity,
                action: LoggerActions.Delete,
                data: { reason }
            });

            this.logger.log(logMessage);
        });
    }

    public restoreOne(
        entity: EntityObject,
        deleteAll: boolean = false,
        reason: DeleteReasons = DeleteReasons.Manual,
        message?: string,
    ): void {
        // log restore
        const logMessage = this.getLoggerFormat({
            message,
            entity,
            action: LoggerActions.Restore,
            data: { reason, deleteAll}
        });

        this.logger.log(logMessage);
    }

    public restoreMany(
        entities: EntityObject[],
        deleteAll: Boolean = false,
        reason: DeleteReasons = DeleteReasons.Manual,
        message?: string,
    ): void {
        entities.forEach(entity => {
            // log restore
            const logMessage = this.getLoggerFormat({
                message,
                entity,
                action: LoggerActions.Restore,
                data: { reason, deleteAll }
            });

            this.logger.log(logMessage);
        });
    }

    public deletePermanentlyOne(
        entity: EntityObject,
        message?: string,
    ): void {
        // log delete
        const logMessage = this.getLoggerFormat({
            message,
            entity,
            action: LoggerActions.DeletePermanently,
        });

        this.logger.warn(logMessage);
    }

    public deletePermanentlyMany(
        entities: EntityObject[],
        message?: string,
    ): void {
        entities.forEach(entity => {
            // log delete
            const logMessage = this.getLoggerFormat({
                message,
                entity,
                action: LoggerActions.DeletePermanently,
            });

            this.logger.warn(logMessage);
        });
    }

    public error(error: string): void{
        this.logger.error(error);
    }

    private getLoggerFormat(options: LoggerOptions): string {
        const userId = this.cls.get('user')?.sub ?? null;

        const rawFormat = {
            message: options.message,
            entity: options.entity?.constructor.name,
            id: options.entity?.id,
            action: options.action,
            data: options.data,
            changes: this.getChangesFormat(options.changes ?? [])
        }

        let messageFormated = ``;

        if (rawFormat.message) messageFormated += `${rawFormat.message} `
        if (rawFormat.entity) messageFormated += `${rawFormat.entity} `
        if (rawFormat.id) messageFormated += `| id = ${rawFormat.id} `
        if (rawFormat.action) messageFormated += `| [${rawFormat.action}] `
        if (rawFormat.data) {
            const entries = Object.entries(rawFormat.data);
            entries.forEach(entry => {
                messageFormated += `| ${entry[0]}: ${entry[1]} `;
            })
        }
        if (rawFormat.changes) {
            messageFormated += `| changes: ${rawFormat.changes} `
        }

        // add userId
        if(userId){
            messageFormated += `| userId = ${userId}`;
        }
        
        return messageFormated;
    }

    private getChangesFormat(changes: LoggerChange[]): string {
        let format = ``;

        changes.forEach((change, index) => {
            format += `${change.value}: ${change.old} -> ${change.new}`

            if (index < changes.length - 1) {
                format += ` | `
            }
        })

        return format;
    }

    private getChanges(prev?: EntityObject, result?: EntityObject): LoggerChange[] {
        if (!prev && !result) {
            return [];
        }

        const plainPrev = this.plainObject(prev);
        const plainResult = this.plainObject(result);

        const changedKeys = Object.keys({ ...plainPrev, ...plainResult })
            .filter(key => {
                return plainResult[key] != undefined && !isEqual(String(plainPrev[key]), String(plainResult[key]));
            })

        return changedKeys.map(changeKey => {
            return {
                value: changeKey,
                old: plainPrev[changeKey],
                new: plainResult[changeKey]
            }
        })
    }

    private plainObject(obj: any): JSON {
        return JSON.parse(JSON.stringify(obj));
    }
}
