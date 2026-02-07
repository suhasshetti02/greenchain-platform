const http = require('http');

function request(path, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let buffer = '';
            res.on('data', (d) => buffer += d);
            res.on('end', () => resolve(JSON.parse(buffer)));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        console.log("1. Triggering Forgot Password for sam22@email.com...");
        const resetRes = await request('/api/auth/forgot-password', { email: 'sam22@email.com' });
        console.log("   Response:", resetRes);

        console.log("\n2. Attempting Login with '123456'...");
        const loginRes = await request('/api/auth/login', { email: 'sam22@email.com', password: '123456' });

        if (loginRes.token) {
            console.log("   ✅ SUCCESS! Login successful. Token received.");
        } else {
            console.log("   ❌ FAILED! Login response:", loginRes);
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

run();
