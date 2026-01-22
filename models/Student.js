const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    fullName: String,
    fatherName: String, // New Field
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: String,
    domicile: String,
    classApplying: String,
    
    status: { 
        type: String, 
        default: 'Pending', 
        enum: ['Pending', 'Verified', 'FeePaid', 'Confirmed', 'Objected', 'Rejected'] 
    },
    
    // Status Reasons
    objectionReason: { type: String, default: null },
    rejectionReason: { type: String, default: null },

    // Document Paths
    docs: {
        admissionForm: String,
        cnicFront: String,
        cnicBack: String,
        domicileDoc: String,
        prcDoc: String,
        leavingCert: String,
        studentPhoto: String
    },
    
    // Challans
    feeChallanPath: String,
    paidChallanPath: String,
    grNumber: { type: String, default: 'Not Assigned' }
});

module.exports = mongoose.model('Student', StudentSchema);