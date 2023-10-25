// @ts-nocheck
import { Context } from 'telegraf';
import { Guard } from 'telegraf/src/core/helpers/util';
import { FilteredContext } from 'telegraf/typings/context';
import { UpdateType } from 'telegraf/typings/telegram-types';

export type EventContext<Event extends UpdateType | Guard<Context['update']>> =
  FilteredContext<Context, Event>;

export interface IEvent<Filter extends UpdateType | Guard<Context['update']>> {
  readonly EVENT_NAME: Filter;

  execute(ctx: EventContext<Filter>): Promise<void>;
}
