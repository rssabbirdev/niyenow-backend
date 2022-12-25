const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('NiyeNow server is running');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z9hjm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const run = async () => {
	try {
		const database = client.db('niyenowDB');
		const productCollection = database.collection('products');
		const userCollection = database.collection('users');

        //GET JWT TOKEN
        app.get('/jwt', (req, res) => {
            const uid = req.query.uid;
            const token = jwt.sign({ uid }, process.env.JWT_SECRET_TOKEN);
            res.send(token)
            console.log(token);
        })
		//product operation
		app.get('/products', async (req, res) => {
			const query = {};
			const products = await productCollection.find(query).toArray();
			res.send(products);
		});
		app.get('/product/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const product = await productCollection.findOne(query);
			res.send(product);
		});
		app.post('/product', async (req, res) => {
			const product = req.body;
			const result = await productCollection.insertOne(product);
			res.send(result);
			console.log(result);
		});

		//users
		app.post('/users', async (req, res) => {
			const user = req.body;
			const query = { uid: user.uid };
			const exit = await userCollection.findOne(query);
			if (exit) {
                return;
            }
            const result = await userCollection.insertOne(user);
            res.send(result)
		});

		//Admin
		app.get('/admin', async (req, res) => {
			const uid = req.query.uid;
			const query = { uid: uid };
			const user = await userCollection.findOne(query);
            res.send({ role: user.role });
        });
        app.get('/admin-products/:uid', async (req, res) => {
            const uid = req.params.uid;
            const query = { 'seller_info.seller_uid': uid };
            const products = await productCollection.find(query).toArray()
            res.send(products)
        })
	} finally {
	}
};
run().catch((err) => console.log(err));

app.listen(port, () => {
	console.log(`Niyenow server is running on ${port}`);
});