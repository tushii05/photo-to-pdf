### Node.js Photo to PDF Converter

**Objective:** Create a Node.js web application that converts multiple uploaded images into a single PDF
document and provides a download link for the PDF.

**Technologies Used:**

- Node.js
- Express.js
- Multer (for handling file uploads)
- pdf-lib (for generating PDFs)
- fs.promises (for file system operations)

**Code Explanation:**

1. Import necessary modules and create an Express.js application:

```javascript
const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs").promises;

const app = express();
const port = 3000;
```

2. Set up Multer for handling file uploads with in-memory storage:

```javascript
const storage = multer.memoryStorage();
const upload = multer({ storage });
```

3. Configure Express middleware to serve static files and handle JSON requests:

```javascript
app.use(express.static("public"));
app.use(express.json());
```

4. Define a route that serves an HTML form for uploading images:

```javascript
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
```

5. Define a POST route `/convert` to handle the image uploads and PDF generation:

```javascript
app.post("/convert", upload.array("photos", 10), async (req, res) => {
  try {
    const photoBuffers = req.files.map((file) => file.buffer);
    const pdfDoc = await PDFDocument.create();

    for (const photoBuffer of photoBuffers) {
      const page = pdfDoc.addPage([400, 400]);
      page.drawImage(await pdfDoc.embedPng(photoBuffer), {
        x: 50,
        y: 50,
        width: 300,
        height: 300,
      });
    }

    const pdfBytes = await pdfDoc.save();

    await fs.writeFile("output.pdf", pdfBytes);

    res.status(200).download("output.pdf", "output.pdf", (err) => {
      if (err) {
        res.status(500).send("Error downloading the PDF");
      } else {
        fs.unlink("output.pdf");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error converting photos to PDF");
  }
});
```

6. Start the Express.js server and listen on port 3000:

```javascript
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
```

7. Create an HTML form (index.html) to allow users to select and submit multiple image files.

**Important Note:** This code assumes that you have a folder named 'public' in the same directory as your
Node.js script, and you have an HTML file named 'index.html' in the 'public' folder. This HTML file
contains the form for uploading images.
