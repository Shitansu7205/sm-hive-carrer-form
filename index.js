
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const cors = require('cors');

const app = express();

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(cors()); // Enable CORS to allow frontend to communicate with backend
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To handle URL-encoded form data

// Handle form submission
app.post('/submit', upload.single('cv'), async (req, res) => {
  try {
    const { first, last, email, job_role, address, city, pin, date } = req.body;

    console.log('Received form data:', req.body);
    console.log('Uploaded file:', req.file);

    // Process the uploaded file (CV)
    let cvFile = null;
    if (req.file) {
      const content = await readFileAsync(req.file.path);
      cvFile = {
        filename: req.file.originalname,
        content: content
      };
      
      // Optionally delete the file after reading it
      fs.unlinkSync(req.file.path);
    }

    // Configure the email transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL, // Replace with your actual email
        pass: process.env.EMAIL_PASSWORD // Replace with your actual email password
      }
    });

    // Construct the email body with the form data
    const emailBody = `
      <h1 style="color:#260D88">*****Application Details*****</h1>
      <p><strong>First Name:</strong> ${first}</p>
      <p><strong>Last Name:</strong> ${last}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Job Role:</strong> ${job_role}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>City:</strong> ${city}</p>
      <p><strong>Pincode:</strong> ${pin}</p>
      <p><strong>Date:</strong> ${date}</p>
    `;

    // Send the email with the form data and the CV attachment
    const mailOptions = {
      from: email, // Use the contact email from the form
      to: 'shitansu.gochhayat@bookingjini.co', // The recipient email address
      subject: `Application from ${first} ${last} - ${job_role}`,
      html: emailBody,
      attachments: cvFile ? [cvFile] : []
    };

    await transporter.sendMail(mailOptions);

    res.send('Submission successful!');
  } catch (error) {
    console.error('Error processing form submission:', error);
    res.status(500).send('Error submitting form');
  }
});

// Serve the frontend static files (optional)
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
