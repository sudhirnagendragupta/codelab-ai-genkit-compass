# Build gen AI features powered by your data with Firebase Genkit

## ⚠️ Important: Secure Environment Configuration

The original codelab asks you to update `src/lib/genkit/genkit.config.js` directly with your Firebase project ID and other credentials. **This is not a secure practice**, especially if you plan to push your code to GitHub (whether public or private). Hard-coding API keys and credentials directly into source files poses significant security risks.

### Recommended Approach for Securing Configuration

Before proceeding with the codelab, set up secure environment configuration:

1. **Create a `.env` file** in your project root with your configuration values:
   ```
   FIREBASE_API_KEY=your-api-key
   FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
   FIREBASE_APP_ID=your-app-id
   VERTEXAI_LOCATION=us-central1
   ```

2. **Add `.env` to your `.gitignore`** file immediately:
   ```bash
   echo ".env" >> .gitignore
   ```

3. **Modify `src/lib/genkit/genkit.config.ts`** to use environment variables:
   ```typescript
   import { genkit } from 'genkit';
   import { enableFirebaseTelemetry } from '@genkit-ai/firebase';
   import { vertexAI } from '@genkit-ai/vertexai';
   import 'dotenv/config';

   // Read from environment variables instead of hardcoding
   const firebaseConfig = {
     apiKey: process.env.FIREBASE_API_KEY,
     authDomain: process.env.FIREBASE_AUTH_DOMAIN,
     projectId: process.env.FIREBASE_PROJECT_ID,
     storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
     messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
     appId: process.env.FIREBASE_APP_ID,
   };

   export const getProjectId = () => firebaseConfig.projectId || '';

   enableFirebaseTelemetry({ projectId: getProjectId() });

   export const ai = genkit({
     plugins: [
       vertexAI({
         projectId: getProjectId(),
         location: process.env.VERTEXAI_LOCATION || 'us-central1',
       }),
     ],
   });
   ```

### For Production Deployment with Firebase App Hosting

When deploying with Firebase App Hosting, you'll need to securely manage your environment variables and secrets:

1. **Initialize App Hosting configuration** to create the `apphosting.yaml` file:
   ```bash
   firebase init apphosting
   ```
Note that the GitHub repo you fork for this codelab may already have this `.yaml` file.

2. **Configure your `apphosting.yaml`** with environment variables and secrets:
   ```yaml
   # Settings for Cloud Run
   runConfig:
     minInstances: 0
     maxInstances: 2

   # Environment variables and secrets
   env:
     # Non-sensitive configuration
     - variable: FIREBASE_PROJECT_ID
       value: your-project-id
       availability:
         - BUILD
         - RUNTIME

     # Other non-sensitive variables here...
     
     # Sensitive information from Secret Manager
     - variable: FIREBASE_API_KEY
       secret: firebase-api-key
     
     # Other sensitive variables here...
   ```

3. **Create secrets in Google Cloud Secret Manager** for sensitive values:
   ```bash
   gcloud secrets create firebase-api-key --data-file=- <<< "your-api-key"
   # Create other secrets for sensitive values
   ```
    Make sure that these secrets are created in the right Google Cloud project i.e. the one associated with the Firebase project.

4. **Grant Secret Manager access to your App Hosting service account** using Firebase's dedicated command:
   ```bash
   firebase apphosting:secrets:grantaccess <secret-name> --backend <backend-name>
   ```
   
   You can find the backend name from the App Hosting tab of your Firebase project.

### Troubleshooting Secret Access

If you encounter a "Misconfigured secret" error, ensure you've:

1. Created all the secrets referenced in your `apphosting.yaml` file in Google Cloud Secret Manager in the appropriate project.
2. Run the `firebase apphosting:secrets:grantaccess` command with the backend parameter.
3. Deployed your application again

If the `firebase apphosting:secrets:grantaccess` command doesn't work, you can try a manual approach:

1. **Identify your Firebase App Hosting service account name**. You can find this in the Firebase console under Project Settings > Service accounts, or it typically follows this pattern:
   ```
   firebase-app-hosting-compute@your-project-id.iam.gserviceaccount.com
   ```

2. **Use Cloud Secret Manager's IAM controls** to grant access directly:
   ```bash
   gcloud secrets add-iam-policy-binding firebase-api-key \
     --member="serviceAccount:firebase-app-hosting-compute@your-project-id.iam.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor" \
     --condition=None
   ```

   You can find the service account associated with your actual Firebase project in the service account tab of project settings in Firebase console.

3. **Repeat this command** for each secret referenced in your `apphosting.yaml` file.

For more details on configuring secrets, see the [Firebase App Hosting documentation](https://firebase.google.com/docs/app-hosting/configure#secret-parameters).

## Original Documentation

This is the code for [Build gen AI features powered by your data with Firebase Genkit](https://firebase.google.com/codelabs/ai-genkit-rag) codelab.

## Getting Started

First, update `src/lib/genkit/genkit.config.js` with your own Firebase project id and login using `gcloud auth application-default login`.
See [Genkit documentation](https://firebase.google.com/docs/genkit/plugins/vertex-ai) for more information.

Then install the dependencies:

```bash
npm install
```

Then run Genkit UI standalone sandbox:

```bash
npm run start:genkit
```

Alternatively, run Genkit UI alongside the Next.js development server:

```bash
npm run start
```

Open [http://localhost:4000](http://localhost:4000) with your browser to lauch Genkit UI.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the Next.js app.

You can start editing the app by modifying `genkit-functions/src/lib/itineraryFlow.ts`, `src/app/gemini/page.tsx`. The page auto-updates as you edit the file.