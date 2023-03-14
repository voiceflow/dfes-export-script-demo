export type DFESIntent = {
  id: string;
  name: string;
  auto: true;
  contexts: [];
  responses: [
    {
      resetContexts: boolean;
      action: string;
      affectedContexts: [];
      parameters: Array<{
        id: string;
        name: string;
        required: boolean;
        dataType: string;
        value: string;
        defaultValue: string;
        isList: boolean;
        prompts: [];
        promptMessages: [];
        noMatchPromptMessages: [];
        noInputPromptMessages: [];
        outputDialogContexts: [];
      }>;
      messages: Array<{
        type: string;
        title: string;
        textToSpeech: string;
        lang: string;
        speech: string;
        condition: string;
      }>;
      speech: [];
    }
  ];
  priority: number;
  webhookUsed: boolean;
  webhookForSlotFilling: boolean;
  fallbackIntent: boolean;
  events: [];
  conditionalResponses: [];
  condition: string;
  conditionalFollowupEvents: [];
};

export type DFESIntentUttererances = Array<{
  id: string;
  data: Array<
    | {
        text: string;
        userDefined: boolean;
      }
    | {
        text: string;
        userDefined: boolean;
        meta: string;
        alias: string;
      }
  >;
  isTemplate: boolean;
  count: number;
  updated: number;
  lang: string;
}>;

export type DFESIntentContainer = {
  intent: DFESIntent;
  utterances: DFESIntentUttererances;
};

export type DFESEntity = {
  id: string;
  name: string;
  isOverridable: boolean;
  isEnum: boolean;
  isRegexp: boolean;
  automatedExpansion: boolean;
  allowFuzzyExtraction: boolean;
};

type DFESEntityUtterances = {
  canonical: string;
  synonyms: string[];
};

export type DFESEntityContainer = {
  entity: DFESEntity;
  values: DFESEntityUtterances[];
};

export type DFESProject = {
  name: string;
  intents: DFESIntentContainer[];
  entities: DFESEntityContainer[];
};
