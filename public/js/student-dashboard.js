const studentId = localStorage.getItem("studentId");
if (!studentId) window.location.href = "login.html";

async function loadData() {
  try {
    const res = await fetch(`/api/student/${studentId}`);
    const data = await res.json();

    // ... existing profile filling code ...

    const status = data.status;
    const badge = document.getElementById("sStatus");
    badge.innerText = status.toUpperCase();

    // Hide all sections first
    const sections = [
      "statePending",
      "stateVerified",
      "stateFeePaid",
      "stateConfirmed",
      "stateObjected",
      "stateRejected",
    ];
    sections.forEach((id) => {
      if (document.getElementById(id))
        document.getElementById(id).style.display = "none";
    });

    // Show specific section based on status
    if (status === "Pending") {
      badge.className = "badge bg-warning text-dark p-3 fs-6 w-100";
      document.getElementById("statePending").style.display = "block";
    } else if (status === "Objected") {
      badge.className = "badge bg-warning text-dark p-3 fs-6 w-100";
      // Inject Objected HTML dynamically or toggle a hidden div
      document.getElementById("dashboardContent").innerHTML += `
                <div id="stateObjected" class="text-center py-4">
                    <div class="alert alert-warning border-2 border-warning shadow-sm text-start">
                        <h5 class="alert-heading fw-bold"><i class="fas fa-exclamation-triangle me-2"></i>Action Required: Objection Raised</h5>
                        <p>The admin has found an issue with your application:</p>
                        <div class="bg-white p-3 rounded border border-warning text-dark">
                            <strong>Reason:</strong> ${data.objectionReason}
                        </div>
                        <hr>
                        <p class="mb-0 small">Please visit the administration office or contact support to rectify your documents.</p>
                    </div>
                </div>
            `;
    } else if (status === "Rejected") {
      badge.className = "badge bg-danger p-3 fs-6 w-100";
      document.getElementById("dashboardContent").innerHTML += `
                <div id="stateRejected" class="text-center py-4">
                    <div class="alert alert-danger border-2 border-danger shadow-sm text-start">
                        <h5 class="alert-heading fw-bold"><i class="fas fa-ban me-2"></i>Application Rejected</h5>
                        <p>We regret to inform you that your admission application has been rejected.</p>
                        <div class="bg-white p-3 rounded border border-danger text-dark">
                            <strong>Reason:</strong> ${data.rejectionReason}
                        </div>
                    </div>
                </div>
            `;
    } else if (status === "Verified") {
      badge.className = "badge bg-info text-white p-3 fs-6 w-100";
      document.getElementById("stateVerified").style.display = "block";
      document.getElementById("btnDownloadChallan").href =
        "/" + data.feeChallanPath;
    } else if (status === "FeePaid") {
      badge.className = "badge bg-primary p-3 fs-6 w-100";
      document.getElementById("stateFeePaid").style.display = "block";
    } else if (status === "Confirmed") {
      badge.className = "badge bg-success p-3 fs-6 w-100";
      document.getElementById("stateConfirmed").style.display = "block";
      document.getElementById("sGR").innerText = data.grNumber;
    }
  } catch (e) {
    console.log(e);
  }
}

// Handle Receipt Upload
document
  .getElementById("uploadReceiptForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("studentId", studentId);
    formData.append(
      "paidChallan",
      document.getElementById("receiptFile").files[0],
    );

    const res = await fetch("/api/student/pay", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      alert("Receipt Uploaded Successfully!");
      loadData();
    }
  });

function logout() {
  localStorage.removeItem("studentId");
  window.location.href = "login.html";
}

loadData();
