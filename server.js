const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const Contact = require("./models/Contact");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  "https://sid-client.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // Important: respond to OPTIONS directly
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SID Server is running successfully 🚀"
  });
});
app.post("/api/contact", async (req, res) => {
  try {
    const { fullName, email, mobile, message } = req.body;

    const contact = new Contact({
      fullName,
      email,
      mobile,
      message,
    });

    await contact.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: process.env.EMAIL,
      subject: "New Enquiry From SID ENTERPRISES",
      html: `
      <h2>New Contact Form Enquiry</h2>

      <table border="1" cellpadding="10">

      <tr>
      <td><b>Name</b></td>
      <td>${fullName}</td>
      </tr>

      <tr>
      <td><b>Email</b></td>
      <td>${email}</td>
      </tr>

      <tr>
      <td><b>Mobile</b></td>
      <td>${mobile}</td>
      </tr>

      <tr>
      <td><b>Message</b></td>
      <td>${message}</td>
      </tr>

      </table>
      `,
    });

    res.json({
      success: true,
      message: "Enquiry Sent Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});