import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const run = async () => {
    try {
        console.log("1. Connecting to DB...");
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from .env");
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB.");

        const testEmail = "debug_test_" + Date.now() + "@example.com";
        const testPass = "password123";

        console.log(`\n2. Creating test user:`);
        console.log(`   Email: ${testEmail}`);
        console.log(`   Password: ${testPass}`);

        const user = new User({ name: "Debug User", email: testEmail, password: testPass });
        await user.save();
        console.log("✅ User saved to database.");

        // Fetch the user back
        console.log("\n3. Fetching user back from DB...");
        const savedUser = await User.findOne({ email: testEmail });

        if (!savedUser) {
            console.error("❌ ERROR: User could not be found after saving!");
            return;
        }

        console.log(`   Stored Password Hash: ${savedUser.password}`);

        if (savedUser.password === testPass) {
            console.error("❌ ERROR: Password was NOT hashed! It is stored in plain text.");
        } else {
            console.log("✅ Password appears to be hashed.");
        }

        console.log("\n4. Testing password comparison...");
        const isMatch = await savedUser.comparePassword(testPass);
        console.log(`   comparePassword('${testPass}') returned: ${isMatch}`);

        if (isMatch) {
            console.log("\n✅ SUCCESS: Authentication logic is WORKING correctly in the backend model.");
        } else {
            console.error("\n❌ FAILURE: Password comparison failed.");
        }

        // Cleanup
        await User.deleteOne({ email: testEmail });
        console.log("\n5. Cleanup: Test user deleted.");

    } catch (e) {
        console.error("\n❌ EXCEPTION:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
};

run();
