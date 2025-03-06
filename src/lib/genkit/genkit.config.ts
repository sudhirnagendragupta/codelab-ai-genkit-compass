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

import { genkit } from 'genkit';
import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
import { vertexAI } from '@genkit-ai/vertexai';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6VpHbBD47Xbv02j0-NYbRZeGYn7p2wGo",
  authDomain: "compass-codelab-7ce2f.firebaseapp.com",
  projectId: "compass-codelab-7ce2f",
  storageBucket: "compass-codelab-7ce2f.firebasestorage.app",
  messagingSenderId: "866563797303",
  appId: "1:866563797303:web:ceac0bf408a4bafaa56ab2"
};

export const getProjectId = () => firebaseConfig.projectId;

enableFirebaseTelemetry({ projectId: getProjectId() });

export const ai = genkit({
  plugins: [
    vertexAI({
      projectId: getProjectId(),
      location: 'us-central1',
    }),
  ],
});
