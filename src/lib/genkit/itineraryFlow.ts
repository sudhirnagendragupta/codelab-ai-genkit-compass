/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Place,
  Destination,
  ItineraryFlowInput as ItineraryFlowInput,
  ItineraryFlowOutput as ItineraryFlowOutput,
} from './types';
import {
  getActivitiesForDestination,
  placesRetriever,
} from './placesRetriever';
import { ai } from './genkit.config';

import { run, z } from 'genkit';

export const ItineraryGeneratorPromptInput = ai.defineSchema(
  'ItineraryGeneratorPromptInput',
  z.object({
    request: z.string(),
    place: z.string(),
    placeDescription: z.string(),
    activities: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        imageUrl: z.string().optional(),
      }),
    ),
  }),
);

const generateItinerary = async (request: string, place: Place) => {
  const activities = await getActivitiesForDestination(place.ref);

  const itineraryGenerator = await ai.prompt<
    typeof ItineraryGeneratorPromptInput,
    typeof Destination,
    z.ZodTypeAny
  >('itineraryGen');
  const response = await itineraryGenerator({
    request,
    place: place.name,
    placeDescription: place.knownFor,
    activities,
  });

  const destination = response.output;
  if (!destination) {
    return null;
  }
  destination.itineraryImageUrl = place.imageUrl;
  destination.placeRef = place.ref;
  return destination;
};

export const itineraryFlow = ai.defineFlow(
  {
    name: 'itineraryFlow',
    inputSchema: ItineraryFlowInput,
    outputSchema: ItineraryFlowOutput,
  },

  async (tripDetails) => {
    const imgDescription = `Imagine waking up to the sight of a sparkling river flowing through a bustling city, the iconic tower standing tall in the distance. As you stroll along the cobblestone streets,
    you'll be greeted by charming cafes with outdoor seating, where you can savor a cup of coffee and people - watch. You'll be captivated by the history and architecture that surrounds you, from grand palaces to charming boutiques. And when the sun sets, the city transforms into a magical wonderland, with twinkling lights illuminating the river and the tower glowing brightly. This is a place where you can lose yourself in the beauty of the moment, where romance and adventure are just around the corner. `;
    // TODO: 2. Replace the line above with this:
    // const imgDescription = await run('imgDescription', async () => {
    //   if (!tripDetails.imageUrls?.length) {
    //     return '';
    //   }
    //   const imgDescription = await ai.prompt('imgDescription');
    //   const result = await imgDescription({
    //     input: { imageUrls: tripDetails.imageUrls },
    //   });
    //   return result.text;
    // });

    const places = await run(
      'Retrieve matching places',
      { imgDescription, request: tripDetails.request },
      async () => {
        const docs = await ai.retrieve({
          retriever: placesRetriever,
          query: `${tripDetails.request}\n${imgDescription}`,
          options: {
            limit: 3,
          },
        });
        return docs.map((doc) => {
          const data = doc.toJSON();
          const place: Place = {
            continent: '',
            country: '',
            imageUrl: '',
            knownFor: '',
            name: '',
            ref: '',
            tags: [],
            ...data.metadata,
          };
          if (data.content[0].text) {
            place.knownFor = data.content[0].text;
          }
          delete place.embedding;
          return place;
        });
      },
    );

    const itineraries = await Promise.all(
      places.map((place, i) =>
        run(`Generate itinerary #${i + 1}`, () =>
          generateItinerary(tripDetails.request, place),
        ),
      ),
    );
    return itineraries.filter((itinerary) => itinerary !== null);
  },
);
