import { BaseModels } from '@voiceflow/base-types';
import { JSONEntity } from '@voiceflow/common';
import { randomUUID } from 'crypto';
import { sanitizeResourceName } from './utils';
import { DFESEntity } from './types';
import { VF_SLOT_KEY_TO_DFES_ENTITY_ID } from './intent';


export const voiceflowToDFESEntity = (entity: BaseModels.Slot): DFESEntity => {
  let id: string;

  if (VF_SLOT_KEY_TO_DFES_ENTITY_ID.has(entity.key)) {
    id = VF_SLOT_KEY_TO_DFES_ENTITY_ID.get(entity.key);
  } else {
    id = randomUUID();
    VF_SLOT_KEY_TO_DFES_ENTITY_ID.set(entity.key, id);
  }

  return {
    id,
    name: sanitizeResourceName(entity.name),
    isOverridable: true,
    isEnum: false,
    isRegexp: false,
    automatedExpansion: false,
    allowFuzzyExtraction: false,
  };
};
export type EntitiesByIndex = ReadonlyMap<number, JSONEntity>;
export const getJsonEntityLength = (entity: Readonly<JSONEntity>): number => entity.endPos - entity.startPos;
