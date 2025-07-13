const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

mongoose.connect('mongodb://localhost:27017/websiteDB', { useNewUrlParser: true, useUnifiedTopology: true });

const Project = mongoose.model('Project', new mongoose.Schema({ image: String, name: String, description: String }));
const Client = mongoose.model('Client', new mongoose.Schema({ image: String, name: String, designation: String, description: String }));
const Contact = mongoose.model('Contact', new mongoose.Schema({ name: String, email: String, mobile: String, city: String }));
const Newsletter = mongoose.model('Newsletter', new mongoose.Schema({ email: String }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.set('view engine', 'ejs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.get('/', async (req, res) => {
    const projects = await Project.find();
    const clients = await Client.find();
    res.render('index', { projects, clients });
});

// app.get ('/admin', (req, res) => {
//     res.render('admin');
// });

app.post('/contact', async (req, res) => {
    const { name, email, mobile, city } = req.body;
    await Contact.create({ name, email, mobile, city });
    res.redirect('/');
});

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    await Newsletter.create({ email });
    res.redirect('/');
});

app.get('/admin', async (req, res) => {
    const contacts = await Contact.find();
    const newsletters = await Newsletter.find();
    const projects = await Project.find();
    const clients = await Client.find();
    res.render('admin', { contacts, newsletters, projects, clients });
});

app.post('/admin/project', upload.single('image'), async (req, res) => {
    const { name, description } = req.body;
    const image = req.file.filename;
    await Project.create({ name, description, image });
    res.redirect('/admin');
});

app.post('/admin/client', upload.single('image'), async (req, res) => {
    const { name, designation, description } = req.body;
    const image = req.file.filename;
    await Client.create({ name, designation, description, image });
    res.redirect('/admin');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
