import { BaseModels } from '@voiceflow/base-types';
import { Utils, utteranceEntityPermutations } from '@voiceflow/common';
import { randomUUID } from 'crypto';
import { DFESIntent, DFESIntentUttererances } from './types';
import { getDFESSlotType, sanitizeResourceName } from './utils';

import { EntitiesByIndex, getJsonEntityLength } from './entity';

export const voiceflowToDFESIntent = (intent, slotsByID: Map<string, BaseModels.Slot>, responses: readonly string[] = []): DFESIntent => {
  return {
    id: randomUUID(),
    name: sanitizeResourceName(Utils.intent.cleanVFIntentName(intent.name)),
    auto: true,
    contexts: [],
    responses: [
      {
        resetContexts: false,
        action: '',
        affectedContexts: [],
        parameters: (intent.slots ?? []).map((intentSlot): DFESIntent['responses'][0]['parameters'][number] => {
          const entity = slotsByID.get(intentSlot.id);

          const slotType = getDFESSlotType(entity);
          const name = entity.name.replace(/^@/, '');

          return {
            id: randomUUID(),
            name: name,
            required: false,
            dataType: slotType,
            value: `$${name}`,
            defaultValue: '',
            isList: false,
            prompts: [],
            promptMessages: [],
            noMatchPromptMessages: [],
            noInputPromptMessages: [],
            outputDialogContexts: [],
          };
        }),
        messages: responses.map((response) => ({
          type: '0',
          title: '',
          textToSpeech: '',
          lang: 'en',
          speech: [response],
          condition: '',
        })),
        speech: [],
      },
    ],
    priority: 500000,
    webhookUsed: false,
    webhookForSlotFilling: false,
    fallbackIntent: false,
    events: [],
    conditionalResponses: [],
    condition: '',
    conditionalFollowupEvents: [],
  };
};

export const VF_SLOT_KEY_TO_DFES_ENTITY_ID: Map<string, string> = new Map();

export const generateDFESUtterancesForIntent = (intent: BaseModels.Intent, slotMap: Map<string, BaseModels.Slot>): DFESIntentUttererances => {
  return utteranceEntityPermutations({
    entitiesByID: Object.fromEntries(slotMap),
    utterances: intent.inputs.map((x) => x.text),
  }).map((utterance) => {
    const data: DFESIntentUttererances[number]['data'] = [];
    const entitiesByStartIndex: EntitiesByIndex = new Map(utterance.entities.map((entity) => [entity.startPos, entity]));

    let plainTextBuffer = '';
    for (let i = 0; i < utterance.text.length; i++) {
      if (entitiesByStartIndex.has(i)) {
        // This is the beginning of an annotation
        const entity = entitiesByStartIndex.get(i)!;
        const entityLength = getJsonEntityLength(entity);

        const sample = utterance.text.slice(i, i + entityLength + 1);

        if (plainTextBuffer.trim()) {
          // Add the text preceeding the entity
          data.push({
            text: plainTextBuffer.trim(),
            userDefined: false,
          });
        }

        // Flush and reset the buffer
        plainTextBuffer = '';

        // Add the entity
        data.push({
          text: sample.trim(),
          meta: `@${entity.entity}`,
          alias: entity.entity.startsWith('sys.') ? entity.entity.slice('sys.'.length) : entity.entity,
          userDefined: false,
        });

        // Skip past this slice of text
        // Subtract 1 because the loop will i++
        i += sample.length - 1;
      } else {
        // This is a plain character
        plainTextBuffer += utterance.text[i];
      }
    }

    if (plainTextBuffer.trim()) {
      // Add the final text
      data.push({
        text: plainTextBuffer.trim(),
        userDefined: false,
      });
    }

    return {
      id: randomUUID(),
      data: data,
      isTemplate: false,
      count: 0,
      lang: 'en',
      updated: 0,
    };
  });
};
