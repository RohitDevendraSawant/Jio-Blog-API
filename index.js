import express from "express";
import jwt from "jsonwebtoken";

import fs from "fs";

import { Blog } from "./models/blog.js";
import { User } from "./models/user.js";
import authenticateUser from "./middleware/authenticateUser.js";

const app = express();
const PORT = 3000;
const JWT_SECRET = 'AuthenticationSuccessfull';

app.use(express.json());


function getData() {
    let content = fs.readFileSync("./data/db.json", 'utf-8');
    if (content === '') {
        return [];
    }
    let jsonData = JSON.parse(content);
    let result = jsonData.list;
    return result;
}

function getUser() {
    let content = fs.readFileSync("./data/user.json", 'utf-8');
    if (content === '') {
        return [];
    }
    let jsonData = JSON.parse(content);
    let result = jsonData.users;
    return result;
}

// Route 1 : Home page route for greeting user
app.get("/", (req, res) => {

    res.json({ "Greetings": "Welcome to MyBlog.in" });

});

// Route 2 : Create new user using POST request and /createUser endpoint
app.post("/createUser", (req, res) => {
    const { email, password } = req.body;

    const user = new User(email, password);
    user.saveUser();
    res.json({ "Message": "Account created" });
});

// Route 3 : Authenticate a User using: POST "/api/auth/login". No login required
app.post("/login",
     (req, res) => {
        const { email, password } = req.body;
        try {
            const users = getUser();
            let user = users.find((data) => data.email === email);
            if (!user) {
                return res.status(400).json({ error: "please try to login with valid credentils." });
            }

            if (user.password !== password) {
                return res.status(400).json({ error: "please try to login with valid credentils." });

            }

            const data = {
                user: {
                    id: user.email
                }
            }
            const authToken = jwt.sign(data, JWT_SECRET)
            res.json({ authToken });

        } catch (error) {
            console.error(error.message);
        }

    });

// Route 4 : Fetch all the blogs using Get request and /getBlogs endpoint
app.get("/getBlogs", (req, res) => {

    try {

        const blogs = getData();
        if (blogs.length == 0 || blogs === undefined) {
            return res.json({ "Message": "No blogs created yet." });
        }
        return res.json(blogs);

    } catch (error) {

        res.status(404).json({ "Message": "Some internal server occured." });
        console.log(error.message);

    }

});

// Route 5 : Fetch perticular blog with requested id  using GET request and /getBlog/id endpoint
app.get("/getBlog/:id", (req, res) => {

    try {

        const id = parseInt(req.params.id);
        const blogs = getData();

        if (blogs.length == 0) {
            return res.json({ "Message": "No blogs created yet." });
        }

        const result = blogs.find((blog) => blog.id === id);

        if (result === undefined || result === '') {
            res.status(404).json(({ "Message": "Blog with these details doesn't exist." }))
        }

        res.json(result);

    } catch (error) {

        res.status(404).json({ "Message": "Some internal server occured." });
        console.log(error.message);
    }

});

// Route 6 : Add new blog using POST request and /addBlog endpoint
app.post("/addBlog", authenticateUser, (req, res) => {

    try {

        const data = req.body;

        if (data.title === undefined || data.author === undefined || data.content === undefined || data.title.trim() === '' || data.author.trim() === '' || data.content.trim() === '') {
            return res.status(400).json({ "Message": "Insufficient data provided" });
        }

        const blogs = getData();
        let id;
        if (blogs.length === 0) {
            id = 1;
        }
        else {
            id = blogs.slice(-1)[0].id + 1;
        }
        const newBlog = new Blog(id, data.title, data.author, data.content, req.user.id);
        newBlog.saveData();
        return res.json({ "Message": "New blog saved.", "data": newBlog });

    } catch (error) {

        res.status(404).json({ "Message": "Some internal server occured." });
        console.log(error.message);

    }
});

// Route 7 : Update existing blog using PATCH request and /updateBlog endpoint
app.patch("/updateBlog/:id", authenticateUser, (req, res) => {

    try {

        const id = parseInt(req.params.id);
        const blogs = getData();
        const existingBlogIndex = blogs.findIndex((blog) => blog.id === id);


        if (existingBlogIndex != -1) {
            let existingBlog = blogs[existingBlogIndex];

            if (existingBlog.userId != req.user.id) {
                return res.status(401).send("You are not an authorised user to perform this operation.")
            }

            existingBlog.id = id;
            existingBlog.title = req.body.title || existingBlog.title;
            existingBlog.author = req.body.author || existingBlog.author;
            existingBlog.content = req.body.content || existingBlog.content;
            existingBlog.timestamp = new Date();

            var obj = {
                'list': []
            }

            obj.list = blogs;
            let json = JSON.stringify(obj);

            fs.writeFile("./data/db.json", json, (err) => {
                if (err) {
                    console.log(err);
                }
            });

            res.json({ "Message": "Blog updated succesfully", "data": existingBlog });

        }
        else {
            res.status(404).json({ "Message": "Blog with such details does not exists." });
        }
    } catch (error) {

        res.status(404).json({ "Message": "Some internal server occured." });
        console.log(error.message);
    }
});

// Route 8 : Delete  blog using DELETE request and /deleteBlog endpoint
app.delete("/deleteBlog/:id", authenticateUser, (req, res) => {

    try {

        const id = parseInt(req.params.id);
        let blogs = getData();
        const existingBlogIndex = blogs.findIndex((blog) => blog.id === id);

        if (existingBlogIndex != -1) {
            const existingBlog = blogs[existingBlogIndex];
            if (existingBlog.userId != req.user.id) {
                return res.status(401).send("You are not an authorised user to perform this operation.")
            };
            blogs.splice(existingBlogIndex, 1);
            var obj = {
                'list': []
            }

            obj.list = blogs;
            let json = JSON.stringify(obj);


            fs.writeFile("./data/db.json", json, (err) => {
                if (err) {
                    console.log(err);
                }
            });
            return res.json({ "Message": "Blog deleted succesfully" });
        }
        else {
            return res.status(404).json({ "Message": "Blog with such details does not exists." });
        }

    } catch (error) {

        console.log(error.message);
        return res.status(404).json({ "Message": "Some internal server occured." });

    }
});


app.listen(PORT, (req, res) => {
    console.log("Server is running at http://localhost:" + PORT);
});




