const tesseract = require('tesseract.js');
const cloudinary = require('../config/cloudinary');

exports.extractData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image uploaded' });
        }

        // Upload to cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
        const cldRes = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'visiting_cards',
        });

        const imageUrl = cldRes.secure_url;

        // Create an enhanced version of the image for better OCR (Removes background gradients/shadows)
        const enhancedImageUrl = imageUrl.replace('/upload/', '/upload/e_improve,e_grayscale,e_contrast:20/');

        // Run Tesseract on both Normal and Enhanced (Supporting English + Gujarati)
        const [normalResult, enhancedResult] = await Promise.all([
            tesseract.recognize(imageUrl, 'eng+guj', { logger: m => { } }),
            tesseract.recognize(enhancedImageUrl, 'eng+guj', { logger: m => { } })
        ]);

        const combinedText = normalResult.data.text + "\n" + enhancedResult.data.text;

        // 1. Email detection via regex
        let emailMatch = combinedText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi);
        let email = emailMatch ? emailMatch.sort((a, b) => b.length - a.length)[0] : ''; // Longest match prevents clipping

        // 2. Phone detection (+91 normalization & dup removal)
        let phoneMatch = combinedText.match(/(?:\+?91|0)?[ -]*\d{5}[ -]*\d{5}|\b\d{10}\b/g) || [];
        let cleanPhones = phoneMatch.map(p => {
            const num = p.replace(/\D/g, '');
            return num.length > 10 ? num.slice(-10) : num;
        }).filter(n => n.length === 10);
        let phone = [...new Set(cleanPhones)].map(p => `+91 ${p}`).join(', ');

        // 3. Website detection
        let websiteMatch = combinedText.match(/(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/gi) || [];
        let cleanWebsites = websiteMatch.filter(w => !w.includes('@')); // Prevent email collision
        let website = cleanWebsites.length > 0 ? cleanWebsites[0].toLowerCase() : '';

        // Clean unwanted characters
        const cleanedText = combinedText.replace(/[^\w\s@\.\+&,-]/gi, ' ');
        const lines = cleanedText.split('\n').map(l => l.trim()).filter(l => l.length > 3);
        const uniqueLines = [...new Set(lines)]; // Remove duplicate strings

        let name = '';
        let designation = '';
        let company = '';
        let address = '';

        if (uniqueLines.length > 0) {
            // 4. Company detection (Pvt Ltd, LLP, Inc, Technologies, etc.)
            const companyRegex = /(pvt\s*ltd|llp|inc|technologies|corporation|group|solutions|services|ltd|agency|enterprises|co\.)/i;
            company = uniqueLines.find(l => companyRegex.test(l)) || '';

            // 5. Designation detection
            const designationRegex = /(ceo|cto|manager|director|developer|engineer|founder|owner|executive)/i;
            designation = uniqueLines.find(l => designationRegex.test(l) && l !== company) || '';

            // Guess Name (fallback to first line if no typical company/designation hit)
            const remainingLines = uniqueLines.filter(l => l !== company && l !== designation && !l.includes(email) && !phone.includes(l.replace(/\D/g, '')));
            name = remainingLines[0] || '';
        }

        // 6. Address grouping (multi-line merge logic)
        const addressLines = uniqueLines.filter(l => /(shop|street|road|floor|building|nagar|block|city|plot|complex|state|gujarat|surat|ahmedabad|mumbai|delhi|india)/i.test(l));
        if (addressLines.length > 0) {
            address = [...new Set(addressLines)].join(', ');
        }

        res.json({
            imageUrl,
            extractedData: {
                rawText: combinedText,
                email,
                phone,
                website,
                name,
                designation,
                company,
                address
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error during OCR' });
    }
};
