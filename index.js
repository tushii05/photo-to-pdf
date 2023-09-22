const express = require('express');
const multer = require('multer');
const { PDFDocument, rgb } = require('pdf-lib');
const fs = require('fs').promises;

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/convert', upload.array('photos', 10), async (req, res) => {
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
        await fs.writeFile('output.pdf', pdfBytes);
        res.status(200).download('output.pdf', 'output.pdf', (err) => {
            if (err) {
                res.status(500).send('Error downloading the PDF');
            } else {
                fs.unlink('output.pdf');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error converting photos to PDF');
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
