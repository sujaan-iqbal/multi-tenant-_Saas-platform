const mongoose= require('mongoose');

const documentSchema= new mongoose.Schema({
    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    title:{
        type: String,
        required: true,
        trim: true  
    },
    content:{
        type: String,   
        default: '', 
        trim: true
    },
    parentId:{
        type: Boolean,
        default: false
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required: true
    },
    lastEditedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    aiMetadata:{
        summary: String,
        tags: [String],
        sentiment: String,
        wordCount:Number,
        lastAnalyzed: Date,

    },
    isArchived:{
        type: Boolean,
        default: false
    },
    isStarred: {
        type: Boolean,
        default: false
    },
    lastOpened: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    }
},{
    timestamps: true
});

documentSchema.index({tenantId:1, parentId:1});
documentSchema.index({tenantId:1, createdBy:1});
documentSchema.index({tenantId:1, isArchived:1});
documentSchema.index({tenantId:1, updatedAt:-1});
documentSchema.index({'aiMetadata.tags':1});

module.exports= mongoose.model('Document', documentSchema); 