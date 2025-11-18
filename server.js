import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

const MONGODB_URI =
  'mongodb+srv://Nikola_MGDBadmin:ZuDskRn1DRaQOYkP@resumenikola.204ku01.mongodb.net/?appName=ResumeNikola'
const DB_NAME = 'resume_db'
const COLLECTION_NAME = 'content'

let db

// Middleware
app.use(cors())
app.use(express.json())

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    db = client.db(DB_NAME)
    console.log('Connected to MongoDB')
  } catch (error) {
    console.error('MongoDB connection error:', error)
  }
}

connectDB()

// API Routes
app.get('/api/content', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME)
    const content = await collection.find({}).toArray()
    // Convert ObjectId to string for JSON serialization
    const formattedContent = content.map((item) => ({
      ...item,
      _id: item._id.toString(),
    }))
    console.log(`Fetched ${formattedContent.length} content items`)
    res.json(formattedContent)
  } catch (error) {
    console.error('Error fetching content:', error)
    res.status(500).json({ error: 'Failed to fetch content' })
  }
})

app.post('/api/content', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME)
    const result = await collection.insertOne(req.body)
    res.json({ ...req.body, _id: result.insertedId })
  } catch (error) {
    console.error('Error creating content:', error)
    res.status(500).json({ error: 'Failed to create content' })
  }
})

app.put('/api/content', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME)
    const { _id, ...updateData } = req.body
    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    )
    res.json({ success: result.modifiedCount > 0 })
  } catch (error) {
    console.error('Error updating content:', error)
    res.status(500).json({ error: 'Failed to update content' })
  }
})

app.delete('/api/content/:id', async (req, res) => {
  try {
    const collection = db.collection(COLLECTION_NAME)
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id),
    })
    res.json({ success: result.deletedCount > 0 })
  } catch (error) {
    console.error('Error deleting content:', error)
    res.status(500).json({ error: 'Failed to delete content' })
  }
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

