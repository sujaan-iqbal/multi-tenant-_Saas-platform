const mongoose= require('mongoose');

const  tenantSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free'
        },
        status: {
            type: String,
            enum: ['active', 'cancelled', 'past_due'],
            default: 'active'
        },
        currentPeriodEnd: Date,
        stripeCustomerId: String
    },
    settings: {
        timezone:{type: String, default:'UTC'},
        locale: {type: String, default: 'en-US'},
        featureFlags: Map
    },
    limits: {
        maxusers: {type: Number, default: 10},
        maxStorageGb: {type: Number, default:1},
        maxAPIcallsPerMonth: {type: Number, default: 1000}
    }
}, {timestamps: true});

tenantSchema.index({slug: 1}, {unique: true});
tenantSchema.index({'subscription.status': 1});
tenantSchema.index({createdAt: -1});

module.exports= mongoose.model('Tenant', tenantSchema);