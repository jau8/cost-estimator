# Cost Estimator

This project is a Cost Estimator application built with React for the frontend and Firebase for the backend. The application allows users to input labor, materials, and equipment details to estimate the cost and price of a paving project.

Deployed UI: https://jau8.github.io/cost-estimator/

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [License](#license)

## Project Structure
```
.
cost-estimator/
├── backend/
│   ├── functions/
│   │   ├── .eslintrc.js
│   │   ├── .gitignore
│   │   ├── index.js
│   │   ├── package-lock.json
│   │   ├── package.json
│   ├── .env (not pushed to GitHub)
│   ├── .firebaserc
│   ├── firebase.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EstimateForm.js
│   │   │   ├── EstimateList.js
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   ├── index.js
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
└── README.md
```


## Setup

### Prerequisites

- Node.js (version 14.x or later)
- npm (version 6.x or later)
- Firebase CLI

### Install Dependencies
#### Backend
1. `cd backend/functions`
2. `npm install`
3. Install Firebase CLI: `npm install -g firebase-tools`
4. Login to Firebase: `firebase login`
5. Initialize Firebase: `firebase init`
6. Deploy Functions: `firebase deploy --only functions`


#### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run deploy`

### Environment Variables
Create a `.env` file in the `backend/functions` directory and add your Firebase credentials path:
```
FIREBASE_CREDENTIALS=/path/to/your/firebase/credentials/key.json
```

## License
This project is licensed under the MIT License.