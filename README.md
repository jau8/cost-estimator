# Cost Estimator

This project is a Cost Estimator application built with React for the frontend and Firebase for the backend. The application allows users to input labor, materials, and equipment details to estimate the cost and price of a paving project.

Deployed UI: https://jau8.github.io/cost-estimator/

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [Testing](#testing)
- [Assumptions](#assumptions)
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

## Testing

### Backend Tests
1. Start Firebase emulators: `firebase emulators:start`
2. In another terminal, navigate to the backend directory: `cd backend`
3. Run the script: `node simple_test.js`

## Assumptions

1. **Customer Information:**
   - **Customer Structure**: Each customer has a name and address.
   - **Customer ID Generation**: Customer IDs are auto-generated by Firestore when adding a new customer.

2. **Estimates:**
   - **Association**: Each saved estimate has to be associated with a customer.
   - **Estimate ID**: Estimate ID is auto-generated and not passed from the frontend.
   - **Detailed Items**: Each estimate contains detailed items categorized into labor, materials, and equipment.

3. **Database:**
   - **NoSQL Database**: Firestore, a NoSQL document-based database, is used for storing customers and estimates.

4. **Data Structure:**
   - **Customers Collection**: Customers are stored in a collection named `customers`.
   - **Estimates Sub-Collection**: Each customer document has a sub-collection named `estimates` that stores estimates associated with that customer.

5. **Frontend:**
   - **Customer Management**: The frontend includes functionalities to add, update, and delete customers.
   - **Estimate Management**: The frontend allows submitting estimates, which are then saved and associated with customers.
   - **Expandable Customer List**: The customer list in the frontend is expandable, showing associated estimates for each customer.

6. **API Endpoints:**
   - **Add Customer**: Adds a new customer with name and address.
   - **Update Customer**: Updates the details of an existing customer.
   - **Delete Customer**: Deletes a customer and all associated estimates.
   - **Get Customers**: Retrieves a list of all customers.
   - **Add Estimate**: Adds a new estimate associated with a specific customer.
   - **Update Estimate**: Updates an existing estimate.
   - **Delete Estimate**: Deletes an estimate.
   - **Get Estimates**: Retrieves all estimates associated with a specific customer.

7. **Testing:**
   - **Simple Test Script**: Used a simple Node.js script to test the API endpoints without using any test libraries.

8. **Error Handling:**
   - **Console Logging**: Added console logs for various operations such as adding, updating, and deleting customers and estimates, and for any errors encountered.

## License
This project is licensed under the MIT License.