const mongoose= require('mongoose')

const userSchema= new mongoose.Schema({

    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true, 
        index: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['owner', 'admin','member', 'guest'],
        default: 'member'
    },
    profile: {
        firstname: String,
        lastname: String,
        avatarurl: String
    },
    status: {
        type: String,
        enum: ['active', 'invited', 'suspended'],
        default: 'active'
    },
    lastLoginAt: Date,
    metaData: {
        loginCount: {type: Number, default: 0},
        timezone: String
    }
}, {
    timestamps: true
});

userSchema.index({tenantId: 1, email: 1}, {unique: true});

userSchema.index({tenantId: 1, status: 1});
userSchema.index({tenantId: 1, role: 1});
userSchema.index({tenantId: 1, createdAt: -1});
userSchema.index({email: 1});

module.exports= mongoose.model('User', userSchema);