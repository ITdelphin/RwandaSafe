import axios from 'axios';

const API_URL = 'http://localhost:4000/v1';
const TEST_PHONE = '250780000000';
const TEST_CODE = '951960'; // Updated from DB

async function testFullSignIn() {
    console.log('--- Testing Full Citizen Sign-in Flow ---');

    try {
        console.log(`Verifying OTP ${TEST_CODE} for ${TEST_PHONE}...`);
        const res = await axios.post(`${API_URL}/auth/verify`, { phone: TEST_PHONE, code: TEST_CODE });
        console.log('Full Sign-in Success!', res.data);

        if (res.data.data.accessToken) {
            console.log('Access Token received successfully.');
        } else {
            console.error('No Access Token in response!');
        }
    } catch (err: any) {
        console.error('Full Sign-in Failed:', err.response?.data || err.message);
    }
}

testFullSignIn();
