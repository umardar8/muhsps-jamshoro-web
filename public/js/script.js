AOS.init();

        function handlePortalClick(e) {
            e.preventDefault();
            const sid = localStorage.getItem('studentId');
            window.location.href = sid ? 'student-dashboard.html' : 'login.html';
        }

        function nextStep() {
            if(!document.getElementById('studentClass').value) return alert("Select Class");
            document.getElementById('form-step-1').style.display = 'none';
            document.getElementById('form-step-2').style.display = 'block';
            document.getElementById('step1-indicator').classList.remove('active');
            document.getElementById('step2-indicator').classList.add('active');
        }

        function prevStep() {
            document.getElementById('form-step-2').style.display = 'none';
            document.getElementById('form-step-1').style.display = 'block';
            document.getElementById('step2-indicator').classList.remove('active');
            document.getElementById('step1-indicator').classList.add('active');
        }

        // --- THE FORM SUBMISSION LOGIC ---
        document.getElementById('admissionForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Uploading...';
            btn.disabled = true;

            const formData = new FormData();
            formData.append('studentClass', document.getElementById('studentClass').value);
            formData.append('fullName', document.getElementById('fullName').value);
            formData.append('fatherName', document.getElementById('fatherName').value);
            formData.append('dob', document.getElementById('dob').value);
            formData.append('domicile', document.getElementById('domicile').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('password', document.getElementById('password').value);

            // Files
            formData.append('admissionForm', document.getElementById('admissionFormFile').files[0]);
            formData.append('cnicFront', document.getElementById('cnicFront').files[0]);
            formData.append('cnicBack', document.getElementById('cnicBack').files[0]);
            formData.append('domicileDoc', document.getElementById('domicileDoc').files[0]);
            formData.append('prcDoc', document.getElementById('prcDoc').files[0]);
            formData.append('leavingCert', document.getElementById('leavingCert').files[0]);
            formData.append('studentPhoto', document.getElementById('studentPhoto').files[0]);

            try {
                const response = await fetch('/api/register', { method: 'POST', body: formData });
                const result = await response.json();
                
                if(result.success) {
                    alert("Application Submitted!");
                    window.location.href = "login.html";
                } else {
                    alert("Error: " + result.message);
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                alert("Upload Failed. Check console.");
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });