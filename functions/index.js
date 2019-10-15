// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const firebaseHelper = require('firebase-functions-helper');
const express = require('express');
const bodyParser = require('body-parser');

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
const app = express();
const main = express();
const contactsCollection = 'contacts';

main.use('/api/v1', app);
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({ extended: false }));

const webApi = functions.https.onRequest(main);

/*Routes follow*/

//new contact
app.post('/contacts', async (req, res) => {
  try {
    const contact = {
      firstName: req.body['firstName'],
      lastName: req.body['lastName'],
      email: req.body['email']
    }
    
    const newDoc = await firebaseHelper.firestore.createNewDocument(db, contactsCollection, contact);
    res.status(201).send(`Created a new contact: ${newDoc.id}`);
  } catch (error) {
    res.status(400).send(`Contact should only contains firstName, lastName and email!!! \n ${error}`);
  }
});

//update contact
app.patch('/contacts/:contactId', async (req, res) => {
  const updatedDoc = await firebaseHelper.firestore.updateDocument(db, contactsCollection, req.params.contactId, req.body);
  res.status(204).send(`Update a new contact: ${updatedDoc}`);
});

//view contact
app.get('/contacts/:contactId', (req, res) => {
  firebaseHelper.firestore.getDocument(db, contactsCollection, req.params.contactId)
    .then( doc => res.status(200).send(doc) )
    .catch( error => res.status(400).send(`Cannot get contact: ${error}`) );
});

//view all contacts
app.get('/contacts', (req, res) => {
  firebaseHelper.firestore
    .backup(db, contactsCollection)
    .then(data => res.status(200).send(data))
    .catch (error => res.status(400).send(`Connect get contacts: ${error}`));
});

//delete contact
app.delete('/contacts/:contactId', async (req, res) => {
  const deletedContact = await firebaseHelper.firestore.deleteDocument(db, contactsCollection, req.params.contactId);
  res.status(204).send(`Contact is deleted: ${deletedContact}`);
});

module.exports = { webApi, app };

