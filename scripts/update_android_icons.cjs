
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

const projectRoot = path.resolve(__dirname, '..');
const androidRes = path.join(projectRoot, 'android-twa/app/src/main/res');
const sourceIcon = path.join(projectRoot, 'public/icon-512-circle.png');

const config = [
    { folder: 'drawable-mdpi', size: 128 }, // Approx for splash centering
    { folder: 'drawable-hdpi', size: 192 },
    { folder: 'drawable-xhdpi', size: 256 },
    { folder: 'drawable-xxhdpi', size: 384 },
    { folder: 'drawable-xxxhdpi', size: 512 },
];

async function updateIcons() {
    try {
        const image = await loadImage(sourceIcon);

        for (const item of config) {
            const destPath = path.join(androidRes, item.folder, 'splash.png');

            // Ensure directory exists
            if (!fs.existsSync(path.dirname(destPath))) {
                console.warn(`Directory not found, skipping: ${path.dirname(destPath)}`);
                continue;
            }

            const canvas = createCanvas(item.size, item.size);
            const ctx = canvas.getContext('2d');

            // Draw resized image
            ctx.drawImage(image, 0, 0, item.size, item.size);

            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(destPath, buffer);
            console.log(`Updated ${item.folder}/splash.png (${item.size}x${item.size})`);
        }
        console.log('All splash icons updated successfully.');
    } catch (err) {
        console.error('Error updating icons:', err);
        process.exit(1);
    }
}

updateIcons();
