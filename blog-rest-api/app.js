const express = require('express');
const bodyParser = require('body-parser');
const mariadb = require('mariadb');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Create a pool of database connections
const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

app.listen(PORT, () => {
    console.log("Listening on port " + PORT);
});

app.use(bodyParser.json());

// Create a Blog Entry
app.post('/blog-entries', async (request, response) => {
    const { title, content, author } = request.body;

    // Validation
    if (!title || !content || !author) {
        return response.status(400).json({ error: "Please provide title, content, and author for the blog entry." });
    }

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("INSERT INTO blog_entries (title, content, author, created_at) VALUES (?, ?, ?, NOW())", [title, content, author]);
        conn.release();

       response.status(201).json({ id: result.insertId, title, content, author, created_at: new Date().toISOString() });
    } catch (error) {
        console.error("Error inserting blog entry:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Retrieve All Blog Entries
app.get('/blog-entries', async (request, response) => {
    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM blog_entries");
        conn.release();
        response.status(200).json(rows);
    } catch (error) {
        console.error("Error retrieving blog entries:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Retrieve a Blog Entry
app.get('/blog-entries/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const conn = await pool.getConnection();
        const rows = await conn.query("SELECT * FROM blog_entries WHERE id = ?", [id]);
        conn.release();

        if (rows.length === 0) {
            return response.status(404).json({ error: "Blog entry not found." });
        }

        response.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error retrieving blog entry:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Update a Blog Entry
app.put('/blog-entries/:id', async (request, response) => {
    const { id } = request.params;
    const { title, content, author } = request.body;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("UPDATE blog_entries SET title = ?, content = ?, author = ? WHERE id = ?", [title, content, author, id]);
        conn.release();

        if (result.affectedRows === 0) {
            return response.status(404).json({ error: "Blog entry not found." });
        }

        response.status(200).json({ id, title, content, author });
    } catch (error) {
        console.error("Error updating blog entry:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

// Delete a Blog Entry
app.delete('/blog-entries/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const conn = await pool.getConnection();
        const result = await conn.query("DELETE FROM blog_entries WHERE id = ?", [id]);
        conn.release();

        if (result.affectedRows === 0) {
            return response.status(404).json({ error: "Blog entry not found." });
        }

        response.sendStatus(204);
    } catch (error) {
        console.error("Error deleting blog entry:", error);
        response.status(500).json({ error: "Internal server error" });
    }
});

app.get("/status", (request, response) => {
    const status = {
        "Status": "Running"
    };
    response.send(status);
});
