import JSZip from 'jszip';
import path, { join } from 'path';
import fs from 'fs/promises';

import { DFESProject } from './types';
import { randomUUID } from 'crypto';
import execa from 'execa';

const SECONDARY_KEY = '72475410b7fb4cebafa12284672cb9ce';

const serialize = (obj: any) => JSON.stringify(obj, null, 2);

const addUnicodeLiterals = (string: string) => string;

const JSZIP_OPTIONS = {
  createFolders: false,
};
export const zipIntents = async (project: DFESProject, outputPath: string): Promise<void> => {
  const zip = JSZip();

  zip.file('package.json', serialize(createPackage()), JSZIP_OPTIONS);
  zip.file(
    'agent.json',
    serialize(createAgent(project)).replace('"knowledgeServiceConfidenceAdjustment": 0', '"knowledgeServiceConfidenceAdjustment": 0.0'),
    JSZIP_OPTIONS
  );

  for (const entity of project.entities) {
    zip.file(`entities/${entity.entity.name}.json`, serialize(entity.entity), JSZIP_OPTIONS);
    zip.file(`entities/${entity.entity.name}_entries_en.json`, serialize(entity.values), JSZIP_OPTIONS);
  }

  for (const intent of project.intents) {
    zip.file(`intents/${intent.intent.name}.json`, addUnicodeLiterals(serialize(intent.intent)), JSZIP_OPTIONS);
  }

  zip.file('intents/Default Fallback Intent.json', addUnicodeLiterals(serialize(createDefaultFallbackIntent())), JSZIP_OPTIONS);
  zip.file('intents/Default Welcome Intent.json', addUnicodeLiterals(serialize(createDefaultWelcomeIntent())), JSZIP_OPTIONS);

  for (const intent of project.intents) {
    zip.file(`intents/${intent.intent.name}_usersays_en.json`, addUnicodeLiterals(serialize(intent.utterances)), JSZIP_OPTIONS);
  }
  zip.file('intents/Default Welcome Intent_usersays_en.json', addUnicodeLiterals(serialize(createDefaultWelcomeIntentUtterances())), JSZIP_OPTIONS);

  const prefix = join(__dirname, '..', 'project_unzipped');
  await fs.rm(prefix, { recursive: true, force: true });
  await fs.mkdir(prefix, { recursive: true });

  for (const file of Object.values(zip.files)) {
    if (file.dir) {
      throw new RangeError("Zip file contains a directory (which doesn't match DFES format)");
    } else {
      await fs.mkdir(path.dirname(join(prefix, file.name)), { recursive: true });

      await fs.writeFile(join(prefix, file.name), await file.async('nodebuffer'));
    }
  }

  await fs.rm(outputPath, { recursive: true, force: true });
  await execa('zip', ['-r', outputPath, './project_unzipped/'], { cwd: path.join(__dirname, '..') });
};

const createAgent = (project: DFESProject) => {
  const projectName = project.name.replaceAll(/\s/g, '_').replaceAll(/_+/g, '_');
  return {
    description: '',
    language: 'en',
    shortDescription: '',
    examples: '',
    linkToDocs: '',
    displayName: projectName,
    disableInteractionLogs: false,
    disableStackdriverLogs: true,
    defaultTimezone: 'America/New_York',
    isPrivate: true,
    mlMinConfidence: 0.3,
    supportedLanguages: [],
    enableOnePlatformApi: true,
    onePlatformApiVersion: 'v2',
    secondaryKey: SECONDARY_KEY,
    analyzeQueryTextSentiment: false,
    enabledKnowledgeBaseNames: [],
    knowledgeServiceConfidenceAdjustment: 0.0,
    dialogBuilderMode: false,
    baseActionPackagesUrl: '',
    enableSpellCorrection: false,
  };
};

const createPackage = () => {
  return { version: '1.0.0' };
};

const createDefaultFallbackIntent = () => ({
  id: randomUUID(),
  name: 'Default Fallback Intent',
  auto: true,
  contexts: [],
  responses: [
    {
      resetContexts: false,
      action: 'input.unknown',
      affectedContexts: [],
      parameters: [],
      messages: [
        {
          type: '0',
          title: '',
          textToSpeech: '',
          lang: 'en',
          speech: [
            'I didn\u0027t get that. Can you say it again?',
            'I missed what you said. What was that?',
            'Sorry, could you say that again?',
            'Sorry, can you say that again?',
            'Can you say that again?',
            'Sorry, I didn\u0027t get that. Can you rephrase?',
            'Sorry, what was that?',
            'One more time?',
            'What was that?',
            'Say that one more time?',
            'I didn\u0027t get that. Can you repeat?',
            'I missed that, say that again?',
          ],
          condition: '',
        },
      ],
      speech: [],
    },
  ],
  priority: 500000,
  webhookUsed: false,
  webhookForSlotFilling: false,
  fallbackIntent: true,
  events: [],
  conditionalResponses: [],
  condition: '',
  conditionalFollowupEvents: [],
});

const createDefaultWelcomeIntentUtterances = () => [
  {
    id: randomUUID(),
    data: [
      {
        text: 'just going to say hi',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '9ee74876-5a1b-4037-b2dc-a687515e300d',
    data: [
      {
        text: 'heya',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '5e7951bf-876e-41d2-8e5f-af4b345088dd',
    data: [
      {
        text: 'hello hi',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '738e637b-9a7a-4d94-8754-44b69fe066f1',
    data: [
      {
        text: 'howdy',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: 'ecec95db-f50b-4cd2-b7e2-c0c97ae3091d',
    data: [
      {
        text: 'hey there',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '6eb135c1-591d-498c-8335-b3bf1a85b85c',
    data: [
      {
        text: 'hi there',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 1,
    lang: 'en',
    updated: 0,
  },
  {
    id: 'b7b8ce68-d877-4057-9f1f-03b04f35f30d',
    data: [
      {
        text: 'greetings',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '2b14aec4-22fb-4ad4-953f-6688130d21a8',
    data: [
      {
        text: 'hey',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '8f43f310-53a3-4735-b88c-aec6ba9bc1a3',
    data: [
      {
        text: 'long time no see',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '224cadf9-6aaf-41be-9c97-5197dc79ea58',
    data: [
      {
        text: 'hello',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '01110b4b-c837-49de-83a3-5a853756286f',
    data: [
      {
        text: 'lovely day isn\u0027t it',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: 'e7c95cca-58b2-4104-a3f4-686b3b4e321d',
    data: [
      {
        text: 'I greet you',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '9142e47e-15b0-40cf-82b8-f55237fb421a',
    data: [
      {
        text: 'hello again',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '1ccbdcfb-d845-4bd0-8751-e2baa6e5bfc6',
    data: [
      {
        text: 'hi',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: 'f0e94927-3044-41c6-9935-345cf4379db5',
    data: [
      {
        text: 'hello there',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
  {
    id: '19133f7d-222f-4aa2-935a-0e32dc282f04',
    data: [
      {
        text: 'a good day',
        userDefined: false,
      },
    ],
    isTemplate: false,
    count: 0,
    lang: 'en',
    updated: 0,
  },
];

const createDefaultWelcomeIntent = () => ({
  id: randomUUID(),
  name: 'Default Welcome Intent',
  auto: true,
  contexts: [],
  responses: [
    {
      resetContexts: false,
      action: 'input.welcome',
      affectedContexts: [],
      parameters: [],
      messages: [
        {
          type: '0',
          title: '',
          textToSpeech: '',
          lang: 'en',
          speech: ['Hi! How are you doing?', 'Hello! How can I help you?', 'Good day! What can I do for you today?', 'Greetings! How can I assist?'],
          condition: '',
        },
      ],
      speech: [],
    },
  ],
  priority: 500000,
  webhookUsed: false,
  webhookForSlotFilling: false,
  fallbackIntent: false,
  events: [
    {
      name: 'WELCOME',
    },
  ],
  conditionalResponses: [],
  condition: '',
  conditionalFollowupEvents: [],
});
