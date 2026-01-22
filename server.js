require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// --- CONFIGURATION ---
app.use(cors());
app.use(express.json());
app.use(express.static('public')); 
app.use('/uploads', express.static('uploads')); 

// Ensure 'uploads' folder exists
if (!fs.existsSync('./uploads')){
    fs.mkdirSync('./uploads');
}

// --- MONGODB ATLAS CONNECTION ---
// TODO: Replace with your actual connection string
const uri = process.env.MONGO_URI;

mongoose.connect(uri)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// --- DATA MODEL ---
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

const Student = mongoose.model('Student', StudentSchema);

// --- MULTER STORAGE ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- MULTER CONFIG FOR MULTIPLE FILES ---
// This tells the backend exactly which files to accept
const uploadFields = upload.fields([
    { name: 'admissionForm', maxCount: 1 },
    { name: 'cnicFront', maxCount: 1 },
    { name: 'cnicBack', maxCount: 1 },
    { name: 'domicileDoc', maxCount: 1 },
    { name: 'prcDoc', maxCount: 1 },
    { name: 'leavingCert', maxCount: 1 },
    { name: 'studentPhoto', maxCount: 1 }
]);

// --- ROUTES ---

// 1. Register (Submit Admission Application)
app.post('/api/register', uploadFields, async (req, res) => {
    try {
        console.log("Received Registration Request");
        console.log("Body:", req.body);
        console.log("Files:", req.files); // This helps debug if files are arriving

        const { fullName, fatherName, email, password, dob, domicile, studentClass } = req.body;
        
        // Helper function to get file path safely
        const getPath = (fieldName) => {
            return (req.files && req.files[fieldName]) ? req.files[fieldName][0].path : null;
        };

        const newStudent = new Student({
            fullName,
            fatherName,
            email,
            password,
            dob,
            domicile,
            classApplying: studentClass,
            docs: {
                admissionForm: getPath('admissionForm'),
                cnicFront: getPath('cnicFront'),
                cnicBack: getPath('cnicBack'),
                domicileDoc: getPath('domicileDoc'),
                prcDoc: getPath('prcDoc'),
                leavingCert: getPath('leavingCert'),
                studentPhoto: getPath('studentPhoto')
            }
        });

        await newStudent.save();
        res.json({ success: true, message: "Application Submitted!" });
    } catch (err) {
        console.error("Register Error:", err);
        // Handle duplicate email error specifically
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already exists." });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// 2. Login
// 2. Login Route (Updated)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    // 1. Check Admin
    if(email === 'admin@muhsps.edu.pk' && password === 'admin123') {
        return res.json({ success: true, role: 'admin' });
    }

    // 2. Check Teacher (NEW)
    if(email === 'teacher@muhsps.edu.pk' && password === 'teacher123') {
        return res.json({ success: true, role: 'teacher' });
    }

    // 3. Check Student (Database)
    const student = await Student.findOne({ email, password });
    if(student) {
        return res.json({ success: true, role: 'student', id: student._id });
    }

    res.json({ success: false, message: "Invalid Credentials" });
});

// 3. Get Student Data
app.get('/api/student/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        res.json(student);
    } catch(err) { res.status(404).json({error: "Student not found"}); }
});

// 4. Student Pay
app.post('/api/student/pay', upload.single('paidChallan'), async (req, res) => {
    try {
        const { studentId } = req.body;
        await Student.findByIdAndUpdate(studentId, {
            status: 'FeePaid',
            paidChallanPath: req.file.path
        });
        res.json({ success: true });
    } catch(err) { res.status(500).json({ success: false }); }
});

// 5. Admin: Get Students
app.get('/api/admin/students', async (req, res) => {
    const students = await Student.find();
    res.json(students);
});

// 6. Admin: Verify
app.post('/api/admin/verify', upload.single('feeChallan'), async (req, res) => {
    try {
        const { studentId } = req.body;
        await Student.findByIdAndUpdate(studentId, {
            status: 'Verified',
            feeChallanPath: req.file.path
        });
        res.json({ success: true });
    } catch(err) { res.status(500).json({ success: false }); }
});

// 7. Admin: Confirm
app.post('/api/admin/confirm', async (req, res) => {
    try {
        const { studentId, grNumber } = req.body;
        await Student.findByIdAndUpdate(studentId, {
            status: 'Confirmed',
            grNumber: grNumber
        });
        res.json({ success: true });
    } catch(err) { res.status(500).json({ success: false }); }
});

// 8. Admin: Delete
app.delete('/api/admin/student/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 9. Admin: Object
app.post('/api/admin/object', async (req, res) => {
    try {
        const { studentId, reason } = req.body;
        await Student.findByIdAndUpdate(studentId, {
            status: 'Objected',
            objectionReason: reason
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// 10. Admin: Reject
app.post('/api/admin/reject', async (req, res) => {
    try {
        const { studentId, reason } = req.body;
        await Student.findByIdAndUpdate(studentId, {
            status: 'Rejected',
            rejectionReason: reason
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));