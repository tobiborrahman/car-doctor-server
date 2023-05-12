const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ytasiev.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection

		const carCollection = client.db('carDoctor').collection('services');
		const bookingsCollection = client
			.db('carDoctor')
			.collection('bookings');

		app.get('/services', async (req, res) => {
			const cursor = carCollection.find();
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };

			const options = {
				projection: { title: 1, price: 1, img: 1, service_id: 1 },
			};
			const result = await carCollection.findOne(query, options);
			res.send(result);
		});

		// Bookings
		app.get('/bookings', async (req, res) => {
			console.log(req.query.email);
			let query = {};
			if (req.query?.email) {
				query = { email: req.query.email };
			}
			const result = await bookingsCollection.find(query).toArray();
			res.send(result);
		});

		app.post('/bookings', async (req, res) => {
			const booking = req.body;
			console.log(booking);
			const result = await bookingsCollection.insertOne(booking);
			res.send(result);
		});

		app.patch('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const filter = { _id: new ObjectId(id) };
			const updateBooking = req.body;
			console.log(updateBooking);
			const updateDoc = {
				$set: {
					status: updateBooking.status,
				},
			};
			const result = await bookingsCollection.updateOne(
				filter,
				updateDoc
			);
			res.send(result);
		});

		app.delete('/bookings/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: new ObjectId(id) };
			const result = await bookingsCollection.deleteOne(query);
			res.send(result);
		});

		await client.db('admin').command({ ping: 1 });
		console.log(
			'Pinged your deployment. You successfully connected to MongoDB!'
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get('/', (req, res) => {
	res.send('Car doctor is running');
});

app.listen(port, () => {
	console.log(`Car doctor is running on port ${port}`);
});
