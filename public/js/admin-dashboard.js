let studentsData = [];
        let currentId = null;

        // Fetch Data from Backend
        async function loadStudents() {
            try {
                const res = await fetch('/api/admin/students');
                studentsData = await res.json();
                
                const activeTbody = document.getElementById('studentTableBody');
                const rejectedTbody = document.getElementById('rejectedTableBody');
                
                activeTbody.innerHTML = '';
                rejectedTbody.innerHTML = '';

                // Stats Counters
                const HARDCODED_STUDENTS = 2418;
                let confirmedCount = 0, pendingCount = 0, feePaidCount = 0, activeCount = 0;

                studentsData.forEach(s => {
                    // Update stats counters (only for active states)
                    if(s.status === 'Confirmed') confirmedCount++;
                    if(s.status === 'Pending') pendingCount++;
                    if(s.status === 'FeePaid') feePaidCount++;
                    if(s.status !== 'Confirmed' && s.status !== 'Rejected') activeCount++;

                    // --- REJECTED TABLE LOGIC ---
                    if (s.status === 'Rejected') {
                        const rejectedRow = `
                            <tr>
                                <td class="ps-4">
                                    <div class="fw-bold">${s.fullName}</div>
                                    <div class="small text-muted">${s.email}</div>
                                </td>
                                <td>${s.classApplying}</td>
                                <td><span class="text-danger small fw-bold">${s.rejectionReason || 'No reason provided'}</span></td>
                                <td>${s.dob || 'N/A'}</td> 
                                <td class="text-end pe-4">
                                    <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent('${s._id}')">
                                        <i class="fas fa-trash-alt me-1"></i> Delete
                                    </button>
                                </td>
                            </tr>
                        `;
                        rejectedTbody.innerHTML += rejectedRow;
                        return; // Skip adding to active table
                    }

                    // --- ACTIVE TABLE LOGIC ---
                    let badgeClass = 'bg-secondary';
                    if(s.status === 'Pending') badgeClass = 'bg-warning text-dark';
                    if(s.status === 'Verified') badgeClass = 'bg-info text-dark';
                    if(s.status === 'FeePaid') badgeClass = 'bg-primary';
                    if(s.status === 'Confirmed') badgeClass = 'bg-success';
                    if(s.status === 'Objected') badgeClass = 'bg-danger text-white';

                    let actions = '';
                    // Inside loadStudents() -> active table logic
if(s.status === 'Pending' || s.status === 'Objected') {
    actions = `
        <div class="btn-group">
            <button class="btn btn-sm btn-outline-primary" onclick="viewDocuments('${s._id}')">Docs</button>
            <button type="button" class="btn btn-sm btn-outline-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown"></button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" onclick="openVerifyModal('${s._id}', '${s.fullName}')">Verify</a></li>
                <li><a class="dropdown-item text-danger" onclick="openRejectModal('${s._id}', '${s.fullName}')">Reject</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger fw-bold" onclick="deleteStudent('${s._id}')">DELETE USER</a></li>
            </ul>
        </div>
    `;
} else if (s.status === 'Verified') {
                        actions = `<span class="text-muted small fst-italic">Waiting for Payment...</span>`;
                    } else if (s.status === 'FeePaid') {
                        actions = `
                            <button class="btn btn-sm btn-outline-primary me-1" onclick="viewDocuments('${s._id}')"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-sm btn-success" onclick="openConfirmModal('${s._id}', '${s.fullName}')">Confirm</button>
                        `;
                    } else if (s.status === 'Confirmed') {
                        actions = `<span class="fw-bold text-success">GR: ${s.grNumber}</span>`;
                    }

                    const activeRow = `
                        <tr>
                            <td class="ps-4 fw-bold">${s.fullName}</td>
                            <td>${s.fatherName || 'N/A'}</td>
                            <td><span class="badge bg-light text-dark border">${s.classApplying}</span></td>
                            <td><span class="badge ${badgeClass} rounded-pill px-3">${s.status}</span></td>
                            <td>${actions}</td>
                        </tr>
                    `;
                    activeTbody.innerHTML += activeRow;
                });

                // Update Stats
                document.getElementById('stat-total-students').innerText = HARDCODED_STUDENTS + confirmedCount;
                document.getElementById('stat-new-admissions').innerText = pendingCount;
                
                const feeCard = document.getElementById('stat-fee-paid');
                if (activeCount === 0) {
                    feeCard.innerText = "No admission";
                    feeCard.style.fontSize = "0.9rem";
                    feeCard.classList.add("text-muted");
                } else {
                    feeCard.innerText = feePaidCount;
                    feeCard.style.fontSize = "1.75rem";
                    feeCard.classList.remove("text-muted");
                }

            } catch (err) { console.error(err); }
        }

        // --- View Documents Function ---
        function viewDocuments(id) {
            const student = studentsData.find(s => s._id === id);
            if(!student) return;

            document.getElementById('modalStudentName').innerText = student.fullName;
            const photoPath = student.docs && student.docs.studentPhoto ? '/' + student.docs.studentPhoto : 'https://via.placeholder.com/80';
            document.getElementById('modalStudentPhoto').src = photoPath;

            // Simple helper to set links (assuming simple object structure)
            const setLink = (elId, path) => {
                const el = document.getElementById(elId);
                if(el) el.href = path ? '/' + path : '#';
            };
            
            if(student.docs) {
                setLink('link-form', student.docs.admissionForm);
        setLink('link-cnicF', student.docs.cnicFront);
        setLink('link-cnicB', student.docs.cnicBack);
        setLink('link-domicile', student.docs.domicileDoc);
        setLink('link-prc', student.docs.prcDoc);
        setLink('link-leaving', student.docs.leavingCert);
            }
            
            new bootstrap.Modal(document.getElementById('docsModal')).show();
        }

        // --- Modals Logic ---
        function openVerifyModal(id, name) { currentId = id; document.getElementById('verifyStudentName').innerText = name; new bootstrap.Modal(document.getElementById('verifyModal')).show(); }
        
        async function submitVerification() {
            const file = document.getElementById('challanFile').files[0];
            if(!file) return alert("Upload Challan");
            const formData = new FormData(); formData.append('studentId', currentId); formData.append('feeChallan', file);
            await fetch('/api/admin/verify', { method: 'POST', body: formData });
            bootstrap.Modal.getInstance(document.getElementById('verifyModal')).hide(); loadStudents();
        }

        function openConfirmModal(id, name) { currentId = id; document.getElementById('confirmStudentName').innerText = name; new bootstrap.Modal(document.getElementById('confirmModal')).show(); }
        
        async function submitConfirmation() {
            const gr = document.getElementById('grNumberInput').value;
            await fetch('/api/admin/confirm', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ studentId: currentId, grNumber: gr }) });
            bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide(); loadStudents();
        }

        function openObjectModal(id, name) { currentId = id; document.getElementById('objectStudentName').innerText = name; new bootstrap.Modal(document.getElementById('objectModal')).show(); }
        
        async function submitObjection() {
            const reason = document.getElementById('objectReason').value;
            await fetch('/api/admin/object', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ studentId: currentId, reason }) });
            bootstrap.Modal.getInstance(document.getElementById('objectModal')).hide(); loadStudents();
        }

        function openRejectModal(id, name) { currentId = id; document.getElementById('rejectStudentName').innerText = name; new bootstrap.Modal(document.getElementById('rejectModal')).show(); }
        
        async function submitRejection() {
            const reason = document.getElementById('rejectReason').value;
            await fetch('/api/admin/reject', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ studentId: currentId, reason }) });
            bootstrap.Modal.getInstance(document.getElementById('rejectModal')).hide(); loadStudents();
        }

        // --- DELETE FUNCTION ---
        async function deleteStudent(id) {
            if(!confirm("Are you sure you want to permanently delete this application? This cannot be undone.")) return;
            
            try {
                const res = await fetch(`/api/admin/student/${id}`, { method: 'DELETE' });
                const data = await res.json();
                if(data.success) {
                    alert("Application Deleted.");
                    loadStudents();
                } else {
                    alert("Error deleting application.");
                }
            } catch(e) { console.error(e); }
        }

        loadStudents();