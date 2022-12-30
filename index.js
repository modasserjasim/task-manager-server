const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
require('colors');


const app = express();
const port = process.env.PORT || 4000;

//Middle wares
app.use(cors());
app.use(express.json());

// configure MongoDB

const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const allTasksCollection = client.db('taskManager').collection('AllTasks');

async function run() {
    try {
        await client.connect();
        console.log('Database Connected'.yellow);
    } catch (error) {
        console.log(error.name.bgRed, error.message.bold, error.stack);
    }
}
run();

//Insert the task using post method
app.post('/add-task', async (req, res) => {
    try {
        const task = await allTasksCollection.insertOne(req.body);
        console.log(task);
        res.send({
            status: true,
            message: `You have successfully added ${req.body.taskName}!`
        })
    } catch (error) {
        res.send({
            status: false,
            error: error.message
        })
    }

})

//get the tasks for specific user
app.get('/my-tasks', async (req, res) => {
    try {
        const tasks = await allTasksCollection.find({ userEmail: req.query.email }).toArray();
        res.send({
            status: true,
            tasks
        })
    } catch (error) {
        console.log(error.name, error.message);
        res.send({
            status: false,
            error: error.message
        })
    }

})

//get the advertised products and make sure the product is available
app.get('/completed-tasks', async (req, res) => {
    try {
        const query = {
            $and: [
                {
                    userEmail: req.query.email
                },
                {
                    isTaskCompleted: true
                },

            ]
        };
        const completedTasks = await allTasksCollection.find(query).toArray();
        res.send({
            status: true,
            completedTasks
        })
    } catch (error) {
        res.send({
            status: false,
            error: error.message
        })
    }
})

//Mark the task as completed
app.patch('/my-task/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const status = req.body.status;
        const query = { _id: ObjectId(id) };
        const updatedDoc = {
            $set: {
                isTaskCompleted: status
            }
        }
        const result = await allTasksCollection.updateOne(query, updatedDoc);
        console.log(result);

        res.send({
            status: true,
            message: `The task is marked as ${status ? 'Completed' : 'Available'}`
        });
    } catch (error) {
        res.send({
            status: false,
            error: error.message
        })
    }
})

// remove the task
app.delete('/my-task/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await allTasksCollection.deleteOne(query);
    res.send({
        status: true,
        message: 'The task has been deleted'
    });
})

//uPDATE THE TASK
app.patch('/my-task/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const taskName = req.body.taskName;
        const taskDescription = req.body.taskDescription;
        const taskImg = req.body.taskImg;
        const query = { _id: ObjectId(id) };
        const updatedDoc = {
            $set: {
                taskName,
                taskDescription,
                taskImg

            }
        }
        const result = await allTasksCollection.updateOne(query, updatedDoc);
        console.log(result);

        res.send({
            status: true,
            message: `The task has been updated'}`
        });
    } catch (error) {
        res.send({
            status: false,
            error: error.message
        })
    }
})

app.get('/', (req, res) => {
    res.send("Task Manager Server is Running");
})

app.listen(port, () => {
    console.log(`Task Manager is running on port ${port}`.cyan.bold);
})