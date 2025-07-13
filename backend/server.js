// server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ اتصال به پایگاه‌داده برقرار شد"));

// مدل کاربر
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, unique: true },
  password: String
}));

// مدل پیام
const Message = mongoose.model('Message', new mongoose.Schema({
  sender: String,
  receiver: String,
  encryptedText: String,
  timestamp: { type: Date, default: Date.now }
}));

// توکن JWT
const createToken = (user) => jwt.sign(
  { id: user._id, username: user.username },
  process.env.JWT_SECRET,
  { expiresIn: '12h' }
);

// ثبت‌نام
app.post('/api/register', async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashed });
    await user.save();
    res.status(201).json({ message: 'کاربر ثبت شد' });
  } catch {
    res.status(400).json({ error: 'خطا در ثبت‌نام' });
  }
});

// ورود
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user || !(await bcrypt.compare(req.body.password, user.password)))
    return res.status(403).json({ error: 'اطلاعات نادرست' });

  const token = createToken(user);
  res.json({ token });
});

// ارسال پیام
app.post('/api/send', async (req, res) => {
  try {
    const { token, receiver, encryptedText } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await Message.create({ sender: decoded.username, receiver, encryptedText });
    res.json({ message: 'پیام ارسال شد' });
  } catch {
    res.status(401).json({ error: 'توکن نامعتبر' });
  }
});

// دریافت پیام
app.post('/api/inbox', async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const inbox = await Message.find({ receiver: decoded.username });
    res.json({ inbox });
  } catch {
    res.status(401).json({ error: 'توکن نامعتبر' });
  }
});

app.listen(5000, () => console.log('🚀 Server started on port 5000'));
