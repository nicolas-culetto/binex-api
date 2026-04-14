import { LoggerActions } from './../enums/logger-actions.enum';
import { EntityObject } from './entity-object.interface';
import { LoggerChange } from './logger-change.interface';

export interface LoggerOptions {
    message?: string, 
    entity?: EntityObject ,
    action?: LoggerActions,
    data?: Object,
    changes?: LoggerChange[]
}