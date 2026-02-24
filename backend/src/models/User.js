import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    businessName: {
        type: String,
        trim: true,
        default: ''
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    // Store front fields
    storeSlug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true
    },
    storeDescription: {
        type: String,
        trim: true,
        default: ''
    },
    whatsappNumber: {
        type: String,
        trim: true,
        default: ''
    },
    storeActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate store slug from name before first save
userSchema.pre('save', async function () {
    try {
        // Generate slug if not set
        if (!this.storeSlug && this.name) {
            let baseSlug = this.name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');

            // Check for uniqueness
            let slug = baseSlug;
            let counter = 1;
            while (await mongoose.model('User').findOne({ storeSlug: slug, _id: { $ne: this._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            this.storeSlug = slug;
        }

        // Hash password
        if (!this.isModified('password')) return;

        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        console.error('User pre-save error:', error);
        throw error;
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
