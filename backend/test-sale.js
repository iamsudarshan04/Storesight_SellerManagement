import axios from 'axios';

// Test creating a sale on your deployed backend
async function testSale() {
    const BACKEND_URL = 'https://storesight-sellermanagement.onrender.com/api';

    try {
        // First, login to get a token
        console.log('1️⃣ Logging in...');
        const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
            email: 'your-email@example.com', // CHANGE THIS to your actual email
            password: 'your-password' // CHANGE THIS to your actual password
        });

        const token = loginResponse.data.token;
        console.log('✅ Login successful, token:', token.substring(0, 20) + '...');

        // Get products
        console.log('\n2️⃣ Fetching products...');
        const productsResponse = await axios.get(`${BACKEND_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const products = productsResponse.data.products;
        console.log(`✅ Found ${products.length} products`);

        if (products.length === 0) {
            console.log('❌ No products found. Create a product first!');
            return;
        }

        const firstProduct = products[0];
        console.log('Using product:', firstProduct.productName, 'ID:', firstProduct._id);

        // Create a sale
        console.log('\n3️⃣ Creating sale...');
        const saleData = {
            productId: firstProduct._id,
            quantitySold: 1,
            customerName: 'Test Customer',
            phoneNumber: '1234567890',
            paymentMethod: 'UPI',
            paymentStatus: 'Paid'
        };

        console.log('Sale data:', saleData);

        const saleResponse = await axios.post(`${BACKEND_URL}/sales`, saleData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Sale created successfully!');
        console.log('Response:', saleResponse.data);

    } catch (error) {
        console.error('\n❌ Error:', error.response?.status, error.response?.statusText);
        console.error('Error message:', error.response?.data?.message);
        console.error('Error details:', error.response?.data?.error);
        console.error('Validation errors:', error.response?.data?.details);

        if (error.response?.status === 500) {
            console.log('\n🔍 This is a server error. Check Render logs for details.');
        }
    }
}

testSale();
