import { BaseModels, BaseNode, Utils } from '@voiceflow/base-types';
import { VoiceflowModels } from '@voiceflow/voiceflow-types';
import fs from 'fs/promises';
import path from 'path';
import { getSteps } from './diagram';
import { voiceflowToDFESEntity } from './entity';
import { generateDFESUtterancesForIntent, voiceflowToDFESIntent } from './intent';
import { DFESIntent, DFESProject } from './types';
import { getDFESSlotType, sanitizeResourceName, slateToPlaintext } from './utils';
import { zipIntents } from './zip';

async function main() {
  // get first parameter from command line
  const [, , ...args] = process.argv;

  const readFilePath = args[0] || 'project.vf';
  const { dir: readFileDirectory, name: readFileName } = path.parse(readFilePath);

  console.log(`Reading ${readFileName}`);

  const content = JSON.parse(await fs.readFile(readFilePath, 'utf8')) as VoiceflowModels.VF;
  const diagrams = content.diagrams;
  const platformData = content.version.platformData;

  const intentMap: Map<string, BaseModels.Intent> = new Map(platformData.intents.map((intent: BaseModels.Intent) => [intent.key, intent] as const));

  const slotMap = new Map<string, BaseModels.Slot>(
    platformData.slots.map((slot: BaseModels.Slot) => {
      const slotType = getDFESSlotType(slot);

      return [
        slot.key,
        {
          ...slot,
          name: sanitizeResourceName(slot.name),
          type: { value: slotType },
        },
      ];
    })
  );

  const dfesProject: DFESProject = { name: content.project.name, intents: [], entities: [] };

  for (const diagram of Object.values(diagrams)) {
    const steps = getSteps(diagram);
    const stepsArray = Array.from(steps.values());

    for (const [index, step] of stepsArray.entries()) {
      if (step.type === BaseNode.NodeType.INTENT && step.data?.intent) {
        const intent = intentMap.get(step.data.intent);
        if (!intent) continue;

        let dfesIntent: DFESIntent;

        // Get the next step, and check if it's a speak or text step
        const nextStep = stepsArray[index + 1];
        if (Utils.step.isText(nextStep)) {
          dfesIntent = voiceflowToDFESIntent(
            intent,
            slotMap,
            nextStep.data.texts.map((dialog) => slateToPlaintext(dialog.content))
          );
        } else if (Utils.step.isSpeak(nextStep)) {
          dfesIntent = voiceflowToDFESIntent(
            intent,
            slotMap,
            nextStep.data.dialogs.map((dialog) => dialog.content)
          );
        } else {
          dfesIntent = voiceflowToDFESIntent(intent, slotMap);
        }

        dfesProject.intents.push({
          intent: dfesIntent,
          utterances: generateDFESUtterancesForIntent(intent, slotMap),
        });
      }
    }
  }

  // Entities
  for (const slot of slotMap.values()) {
    // Skip if builtin
    if (slot.type.value.startsWith('@sys.')) continue;

    dfesProject.entities.push({
      entity: voiceflowToDFESEntity(slot),
      values: slot.inputs.map((input) => {
        const split = input.split(',');
        const [canonical] = split;

        return {
          value: canonical.trim(),
          // DFES includes the canonical value as a synonym
          synonyms: split.map((synonym) => synonym.trim()),
        };
      }),
    });
  }

  const exportFileName = `${readFileName}.zip`;
  const writePathName = path.join(readFileDirectory, exportFileName);

  await zipIntents(dfesProject, writePathName);

  console.log(`Successfully exported project to ${exportFileName}`);
}

main();
