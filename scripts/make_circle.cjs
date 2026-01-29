
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function createCircularIcon() {
    const inputPath = path.resolve('public/icon-512.png');
    const outputPath = path.resolve('public/icon-512-circle.png');
    const outputPath192 = path.resolve('public/icon-192-circle.png');

    try {
        const image = await loadImage(inputPath);
        const size = 512;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Create circular path
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        // Draw image
        ctx.drawImage(image, 0, 0, size, size);

        // Save 512x512
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(outputPath, buffer);
        console.log('Created public/icon-512-circle.png');

        // Resize for 192x192
        const canvas192 = createCanvas(192, 192);
        const ctx192 = canvas192.getContext('2d');
        ctx192.drawImage(canvas, 0, 0, 192, 192);
        const buffer192 = canvas192.toBuffer('image/png');
        fs.writeFileSync(outputPath192, buffer192);
        console.log('Created public/icon-192-circle.png');

    } catch (err) {
        console.error('Error processing image:', err);
    }
}

createCircularIcon();
