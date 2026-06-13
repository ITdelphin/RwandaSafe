import axios from 'axios';

const API_URL = 'http://localhost:4000/v1';
const TEST_PHONE = '250780000000';

async function testCitizenSignIn() {
    console.log('--- Testing Citizen Sign-in Flow ---');

    try {
        // 1. Request OTP
        console.log(`1. Requesting OTP for ${TEST_PHONE}...`);
        const otpRes = await axios.post(`${API_URL}/auth/otp/request`, { phone: TEST_PHONE });
        console.log('OTP Request Success:', otpRes.data);

        // In dev, OTP is logged to console. Since we can't read it easily from here, 
        // we'll assume it's created and try to "guess" it or just verify the endpoint exists.
        // Actually, I can check the DB if I wanted to, but let's see if the request fails first.

        console.log('2. Verifying OTP (Simulating verification endpoint)...');
        // Note: The apiClient in web-citizen uses /auth/verify, but the router has /otp/verify and /verify alias.
        // authRouter.post('/verify', validate(verifyOtpSchema), authController.verifyOtp);

        // We can't verify without the actual code unless we bypass it or read it from DB.
        // Let's just check if /auth/verify exists and responds.
        try {
            await axios.post(`${API_URL}/auth/verify`, { phone: TEST_PHONE, code: '000000' });
        } catch (err: any) {
            if (err.response?.status === 401) {
                console.log('Step 2: /auth/verify endpoint exists and correctly rejected invalid code 000000.');
            } else {
                console.error('Step 2: /auth/verify failed with unexpected error:', err.response?.status, err.response?.data);
            }
        }
    } catch (err: any) {
        console.error('Test Failed:', err.response?.data || err.message);
    }
}

testCitizenSignIn();
