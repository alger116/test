// server.js - tehniliste kirjelduste generaator
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const { OpenAI } = require("openai");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Konfiguratsioon
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "techspec-secret-key";

// Kasutame keskkonna muutujaid OpenAI API võtme jaoks
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Failide üleslaadimise seadistamine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Ainult PDF ja Word dokumendid on lubatud!"));
    }
  },
});

// Lihtsustatud kasutajabaas (reaalsuses oleks andmebaas)
let users = [
  {
    id: "1",
    email: "admin@techspec.ee",
    password: "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // "admin123" hashitud
    isAdmin: true,
  },
  {
    id: "2",
    email: "user@techspec.ee",
    password: "$2b$10$YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY", // "user123" hashitud
    isAdmin: false,
  },
];

// Lihtsustatud dokumentide "andmebaas" (reaalsuses oleks andmebaas)
let documents = [];

// Autentimise middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Autentimise token puudub" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Vigane või aegunud token" });
    }
    req.user = user;
    next();
  });
};

// Admini õiguste kontroll
const checkAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ error: "Puuduvad õigused selle toimingu jaoks" });
  }
  next();
};

// API marsruudid

// Sisselogimine
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Vale e-post või parool" });
  }

  try {
    if (await bcrypt.compare(password, user.password)) {
      // Loome JWT tokeni
      const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      return res.json({
        message: "Edukalt sisse logitud",
        token,
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      return res.status(401).json({ error: "Vale e-post või parool" });
    }
  } catch (err) {
    console.error("Sisselogimise viga:", err);
    return res.status(500).json({ error: "Serveri viga" });
  }
});

// Registreerimine (ainult admin saab uusi kasutajaid lisada)
app.post("/api/register", authenticateToken, checkAdmin, async (req, res) => {
  const { email, password, isAdmin } = req.body;

  // Kontrollime, kas kasutaja juba eksisteerib
  if (users.find((u) => u.email === email)) {
    return res
      .status(400)
      .json({ error: "Sellise e-postiga kasutaja juba eksisteerib" });
  }

  try {
    // Hashime parooli
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    };

    users.push(newUser);

    res.status(201).json({
      message: "Kasutaja edukalt loodud",
      user: {
        id: newUser.id,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (err) {
    console.error("Registreerimise viga:", err);
    res.status(500).json({ error: "Serveri viga" });
  }
});

// Dokumendi teksti ekstraheerimine
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } else if (ext === ".doc" || ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else {
      throw new Error("Toetamata failitüüp");
    }
  } catch (err) {
    console.error("Teksti ekstraheerimise viga:", err);
    throw err;
  }
}

// OpenAI API funktsioon spetsifikatsiooni genereerimiseks
async function generateTechnicalSpec(text, options = {}) {
  try {
    // Loome sisendi OpenAI-le
    const promptText = `
      Oled tehniliste kirjelduste spetsialist. Loo alloleva dokumendi põhjal täielik tehniline kirjeldus.
      
      Dokumendi tekst:
      ${text}
      
      ${options.format ? `Väljundi formaat: ${options.format}` : ""}
      ${options.language ? `Väljundi keel: ${options.language}` : "Väljundi keel: Eesti"}
      ${options.details ? `Detailsuse tase: ${options.details}` : "Detailsuse tase: Keskmine"}
      ${options.additional ? `Täiendavad nõuded: ${options.additional}` : ""}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Või muu sobiv mudel
      messages: [
        {
          role: "system",
          content: "Oled eksperdist tehniline kirjutaja ja insener.",
        },
        { role: "user", content: promptText },
      ],
      max_tokens: 3000,
      temperature: 0.2,
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("OpenAI API viga:", err);
    throw err;
  }
}

// Dokumendi üleslaadimine ja töötlemine
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("document"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "Puudub fail" });
    }

    try {
      const { originalname, path: filePath, filename } = req.file;
      const { format, language, details, additional } = req.body;

      // Ekstraheerime teksti
      const extractedText = await extractTextFromFile(filePath);

      // Genereerime tehnilise kirjelduse
      const technicalSpec = await generateTechnicalSpec(extractedText, {
        format,
        language,
        details,
        additional,
      });

      // Salvestame dokumendi "andmebaasi"
      const document = {
        id: uuidv4(),
        originalName: originalname,
        fileName: filename,
        filePath,
        uploadedBy: req.user.id,
        uploadedAt: new Date(),
        processedText: technicalSpec,
      };

      documents.push(document);

      res.json({
        message: "Dokument edukalt üles laaditud ja töödeldud",
        document: {
          id: document.id,
          originalName: document.originalName,
          uploadedAt: document.uploadedAt,
          processedText: document.processedText,
        },
      });
    } catch (err) {
      console.error("Dokumendi töötlemise viga:", err);
      res
        .status(500)
        .json({ error: "Viga dokumendi töötlemisel: " + err.message });
    }
  },
);

// Kõigi dokumentide nimekiri (ainult sisseloginud kasutajad)
app.get("/api/documents", authenticateToken, (req, res) => {
  // Admin näeb kõiki, tavaline kasutaja ainult enda omi
  const userDocs = req.user.isAdmin
    ? documents
    : documents.filter((doc) => doc.uploadedBy === req.user.id);

  const simplifiedDocs = userDocs.map((doc) => ({
    id: doc.id,
    originalName: doc.originalName,
    uploadedAt: doc.uploadedAt,
  }));

  res.json(simplifiedDocs);
});

// Konkreetse dokumendi vaatamine
app.get("/api/documents/:id", authenticateToken, (req, res) => {
  const document = documents.find((doc) => doc.id === req.params.id);

  if (!document) {
    return res.status(404).json({ error: "Dokumenti ei leitud" });
  }

  // Kontrollime, kas kasutajal on õigus seda dokumenti näha
  if (!req.user.isAdmin && document.uploadedBy !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Puuduvad õigused selle dokumendi vaatamiseks" });
  }

  res.json({
    id: document.id,
    originalName: document.originalName,
    uploadedAt: document.uploadedAt,
    processedText: document.processedText,
  });
});

// Dokumendi kustutamine
app.delete("/api/documents/:id", authenticateToken, (req, res) => {
  const documentIndex = documents.findIndex((doc) => doc.id === req.params.id);

  if (documentIndex === -1) {
    return res.status(404).json({ error: "Dokumenti ei leitud" });
  }

  // Kontrollime, kas kasutajal on õigus seda dokumenti kustutada
  if (
    !req.user.isAdmin &&
    documents[documentIndex].uploadedBy !== req.user.id
  ) {
    return res
      .status(403)
      .json({ error: "Puuduvad õigused selle dokumendi kustutamiseks" });
  }

  // Kustutame faili kettalt
  try {
    fs.unlinkSync(documents[documentIndex].filePath);
  } catch (err) {
    console.error("Faili kustutamise viga:", err);
    // Jätkame ikkagi, sest andmebaasi kirje on vaja eemaldada
  }

  // Eemaldame dokumendi "andmebaasist"
  const removedDoc = documents.splice(documentIndex, 1)[0];

  res.json({
    message: "Dokument edukalt kustutatud",
    document: {
      id: removedDoc.id,
      originalName: removedDoc.originalName,
    },
  });
});

// Kasutajate nimekiri (ainult admin)
app.get("/api/users", authenticateToken, checkAdmin, (req, res) => {
  const safeUsers = users.map((u) => ({
    id: u.id,
    email: u.email,
    isAdmin: u.isAdmin,
  }));

  res.json(safeUsers);
});

// Kasutaja kustutamine (ainult admin)
app.delete("/api/users/:id", authenticateToken, checkAdmin, (req, res) => {
  const userId = req.params.id;

  // Admin ei saa iseennast kustutada
  if (userId === req.user.id) {
    return res.status(400).json({ error: "Ei saa iseennast kustutada" });
  }

  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: "Kasutajat ei leitud" });
  }

  const removedUser = users.splice(userIndex, 1)[0];

  res.json({
    message: "Kasutaja edukalt kustutatud",
    user: {
      id: removedUser.id,
      email: removedUser.email,
    },
  });
});

// Vearikaste marsruutide käsitlemine
app.use((err, req, res, next) => {
  console.error("Serveri viga:", err.stack);
  res.status(500).json({ error: "Midagi läks valesti: " + err.message });
});

// Käivitame serveri
app.listen(PORT, () => {
  console.log(`Server töötab pordil ${PORT}`);
});

module.exports = app; // Ekspordi rakendus testimiseks
