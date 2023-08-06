import { Request } from 'express';
import { AppAbility } from '../casl/casl-ability.factory';

export interface IPolicyHandler {
  handle(ability: AppAbility, request: Request): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility, request: Request) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
