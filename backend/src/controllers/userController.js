import User from '../models/User.js';

// Get current user's profile
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Auto-generate slug for existing users who don't have one
        if (!user.storeSlug) {
            await user.save();
        }

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            businessName: user.businessName || '',
            storeSlug: user.storeSlug || '',
            storeDescription: user.storeDescription || '',
            whatsappNumber: user.whatsappNumber || '',
            storeActive: user.storeActive !== false,
            themeColor: user.themeColor || '#6366f1',
            showWhatsapp: user.showWhatsapp !== false,
            storeLogo: user.storeLogo || '',
            createdAt: user.createdAt
        });
    } catch (error) {
        console.error('getProfile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update profile
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, businessName, storeDescription, whatsappNumber, storeActive, themeColor, showWhatsapp, storeLogo } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();
        if (businessName !== undefined) user.businessName = businessName.trim();
        if (storeDescription !== undefined) user.storeDescription = storeDescription.trim();
        if (whatsappNumber !== undefined) user.whatsappNumber = whatsappNumber.trim();
        if (storeActive !== undefined) user.storeActive = storeActive;
        if (themeColor !== undefined) user.themeColor = themeColor.trim();
        if (showWhatsapp !== undefined) user.showWhatsapp = showWhatsapp;
        if (storeLogo !== undefined) user.storeLogo = storeLogo;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                businessName: user.businessName || '',
                storeSlug: user.storeSlug || '',
                storeDescription: user.storeDescription || '',
                whatsappNumber: user.whatsappNumber || '',
                storeActive: user.storeActive !== false,
                themeColor: user.themeColor || '#6366f1',
                showWhatsapp: user.showWhatsapp !== false,
                storeLogo: user.storeLogo || ''
            }
        });
    } catch (error) {
        console.error('updateProfile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Change password
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Both current and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('changePassword error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
