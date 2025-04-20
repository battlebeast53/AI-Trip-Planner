// import {
//   batch1Schema,
//   batch2Schema,
//   batch3Schema
// } from "./schemas";

// import OpenAI from "openai";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// const promptSuffix = `generate travel data according to the schema and in json format,
//                      do not return anything in your response outside of curly braces, 
//                      generate response as per the functin schema provided. Dates given,
//                      activity preference and travelling with may influence like 50% while generating plan.`;

// const callOpenAIApi = (prompt: string, schema: any, description: string) => {
//   console.log({ prompt, schema });
//   return openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "system", content: "You are a helpful travel assistant." },
//       { role: "user", content: prompt },
//     ],
//     functions: [{ name: "set_travel_details", parameters: schema, description }],
//     function_call: { name: "set_travel_details" },
//   });
// }

// export const generatebatch1 = (promptText: string) => {
//   const prompt = `${promptText}, ${promptSuffix}`;
//   const description = `Generate a description of information about a place or location according to the following schema:

//   - About the Place:
//     - A string containing information about the place, comprising at least 50 words.
  
//   - Best Time to Visit:
//     - A string specifying the best time to visit the place.
  
//   Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.
//   `;
//   return callOpenAIApi(prompt, batch1Schema, description);
// }

// type OpenAIInputType = {
//   userPrompt: string;
//   activityPreferences?: string[] | undefined;
//   fromDate?: number | undefined;
//   toDate?: number | undefined;
//   companion?: string | undefined;
// };

// export const generatebatch2 = (inputParams: OpenAIInputType) => {
//   const description = `Generate a description of recommendations for an adventurous trip according to the following schema:
//   - Top Adventures Activities:
//     - An array listing top adventure activities to do, including at least 5 activities.
//     - Each activity should be specified along with its location.
  
//   - Local Cuisine Recommendations:
//     - An array providing recommendations for local cuisine to try during the trip.
  
//   - Packing Checklist:
//     - An array containing items that should be included in the packing checklist for the trip.
  
//   Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;
//   return callOpenAIApi(getPropmpt(inputParams), batch2Schema, description);
// }

// export const generatebatch3 = (inputParams: OpenAIInputType) => {
//   const description = `Generate a description of a travel itinerary and top places to visit according to the following schema:
//   - Itinerary:
//     - An array containing details of the itinerary for the specified number of days.
//     - Each day's itinerary includes a title and activities for morning, afternoon, and evening.
//     - Activities are described as follows:
//       - Morning, Afternoon, Evening:
//         - Each includes an array of itinerary items, where each item has a description and a brief description.
  
//   - Top Places to Visit:
//     - An array listing the top places to visit along with their coordinates.
//     - Each place includes a name and coordinates (latitude and longitude).
  
//   Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;
//   return callOpenAIApi(getPropmpt(inputParams), batch3Schema, description);
// }

// const getPropmpt = ({ userPrompt, activityPreferences, companion, fromDate, toDate }: OpenAIInputType) => {
//   let prompt = `${userPrompt}, from date-${fromDate} to date-${toDate}`;

//   if (companion && companion.length > 0) prompt += `${prompt}, travelling with-${companion}`;

//   if (activityPreferences && activityPreferences.length > 0) prompt += `${prompt}, activity preferences-${activityPreferences.join(",")}`;

//   prompt = `${prompt}, ${promptSuffix}`;
//   return prompt;
// }




import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  batch1Schema,
  batch2Schema,
  batch3Schema
} from "./schemas";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

// Shared prompt suffix for all batches
const promptSuffix = `generate travel data according to the schema and in json format,
                     do not return anything in your response outside of curly braces, 
                     generate response as per the function schema provided. Dates given,
                     activity preference and travelling with may influence like 50% while generating plan.`;

// Extracts JSON block from Gemini output
const extractJSON = (text: string) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No valid JSON found in Gemini response");
  return JSON.parse(jsonMatch[0]);
};

// Core function that calls Gemini with prompt + schema + description
const callGeminiAPI = async (prompt: string, schema: any, description: string) => {
  console.log({ prompt, schema });

  const fullPrompt = `${prompt}\n\n${description}\n\nSchema:\n${JSON.stringify(schema)}\n\n${promptSuffix}`;

  const result = await model.generateContent(fullPrompt);
  const response = result.response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!response) throw new Error("No response text from Gemini");


  return extractJSON(response);
};

export const generatebatch1 = async (promptText: string) => {
  const prompt = `${promptText}, ${promptSuffix}`;
  const description = `Generate a description of information about a place or location according to the following schema:

  - About the Place:
    - A string containing information about the place, comprising at least 50 words.

  - Best Time to Visit:
    - A string specifying the best time to visit the place.

  Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callGeminiAPI(prompt, batch1Schema, description);
};

type GeminiInputType = {
  userPrompt: string;
  activityPreferences?: string[] | undefined;
  fromDate?: number | undefined;
  toDate?: number | undefined;
  companion?: string | undefined;
};

const getPrompt = ({
  userPrompt,
  activityPreferences,
  companion,
  fromDate,
  toDate,
}: GeminiInputType) => {
  let prompt = `${userPrompt}, from date-${fromDate} to date-${toDate}`;

  if (companion && companion.length > 0)
    prompt += `, travelling with-${companion}`;

  if (activityPreferences && activityPreferences.length > 0)
    prompt += `, activity preferences-${activityPreferences.join(",")}`;

  prompt = `${prompt}, ${promptSuffix}`;
  return prompt;
};

export const generatebatch2 = async (inputParams: GeminiInputType) => {
  const description = `Generate a description of recommendations for an adventurous trip according to the following schema:

  - Top Adventures Activities:
    - An array listing top adventure activities to do, including at least 5 activities.
    - Each activity should be specified along with its location.

  - Local Cuisine Recommendations:
    - An array providing recommendations for local cuisine to try during the trip.

  - Packing Checklist:
    - An array containing items that should be included in the packing checklist for the trip.

  Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callGeminiAPI(getPrompt(inputParams), batch2Schema, description);
};

export const generatebatch3 = async (inputParams: GeminiInputType) => {
  const description = `Generate a description of a travel itinerary and top places to visit according to the following schema:

  - Itinerary:
    - An array containing details of the itinerary for the specified number of days.
    - Each day's itinerary includes a title and activities for morning, afternoon, and evening.
    - Activities are described as follows:
      - Morning, Afternoon, Evening:
        - Each includes an array of itinerary items, where each item has a description and a brief description.

  - Top Places to Visit:
    - An array listing the top places to visit along with their coordinates.
    - Each place includes a name and coordinates (latitude and longitude).

  Ensure that the function response adheres to the schema provided and is in JSON format. The response should not contain anything outside of the defined schema.`;

  return callGeminiAPI(getPrompt(inputParams), batch3Schema, description);
};
