// Generalpdf - Interactive Client-side Document Generator Engine

document.addEventListener("DOMContentLoaded", () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // DOM Elements
    const templateInvoice = document.getElementById("templateInvoice");
    const templateResume = document.getElementById("templateResume");
    const templateLetter = document.getElementById("templateLetter");
    const dynamicFieldsContainer = document.getElementById("dynamicFields");
    const primaryColorInput = document.getElementById("primaryColor");
    const layoutSelect = document.getElementById("layout");
    const refreshPreviewBtn = document.getElementById("refreshPreviewBtn");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");
    const previewContainer = document.getElementById("previewContainer");

    // State
    let currentTemplate = "invoice"; // default
    let timeoutId = null;

    // Default template data values
    const templateData = {
        invoice: {
            title: "INVOICE",
            companyName: "Acme Corporation",
            companyEmail: "billing@acme.com",
            clientName: "Generalpdf Technologies Inc.",
            clientEmail: "accounts@generalpdf.com",
            invoiceNumber: "INV-2026-0042",
            invoiceDate: "2026-06-24",
            itemName1: "Enterprise Web App Licensing",
            itemQty1: 1,
            itemRate1: 1200,
            itemName2: "Consultancy & System Migration Services",
            itemQty2: 4,
            itemRate2: 150,
            terms: "Payment is due within 30 days. Thank you for your business!"
        },
        resume: {
            fullName: "Alex Rivera",
            jobTitle: "Senior Frontend Developer & Designer",
            email: "alex.rivera@example.com",
            phone: "+1 (555) 019-2834",
            website: "https://github.com/alexrivera",
            summary: "Passionate engineer with 6+ years of experience crafting ultra-polished, responsive user experiences. Specializes in React, Tailwind CSS, TypeScript, and modern design systems.",
            experience: "Senior Frontend Engineer | Acme Corp (2024-Present)\n- Led migration of legacy codebases into responsive React and Vite apps.\n- Architected core UI components, improving page speeds by 35%.\n\nSoftware Developer | PixelCraft Studio (2021-2023)\n- Implemented interactive dashboards and canvas-based reports.",
            education: "B.S. Computer Science | Stanford University (2017 - 2021)",
            skills: "React, Tailwind CSS, TypeScript, Node.js, D3.js, UX Design, Git, PDF Compilation"
        },
        letter: {
            senderName: "Diana Prince",
            senderTitle: "Chief Operations Officer",
            senderCompany: "Generalpdf Inc.",
            recipientName: "John Doe",
            recipientCompany: "Enterprise Holdings Ltd.",
            recipientAddress: "456 Corporate Blvd, suite 300, New York, NY",
            date: "2026-06-24",
            subject: "RE: System Migration and Workspace Configuration",
            body: "I am writing to formally confirm that your Generalpdf workspace has been fully configured and is ready for production. Your source files, including raw HTML, CSS, and JS components, have been securely loaded and configured to render high-performance, client-side documents on the fly.\n\nYou can now seamlessly preview all layouts in real-time, modify content fields side-by-side, and push the entire workspace to your GitHub repository to maintain persistence.\n\nPlease let us know if your team requires further customized templates or layout updates.",
            signoff: "Sincerely yours,"
        }
    };

    // Render Form Fields Based on Selected Template
    function renderFields() {
        if (currentTemplate === "invoice") {
            const data = templateData.invoice;
            dynamicFieldsContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Company Name</label>
                        <input type="text" id="companyName" value="${data.companyName}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Company Email</label>
                        <input type="email" id="companyEmail" value="${data.companyEmail}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Client Name</label>
                        <input type="text" id="clientName" value="${data.clientName}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Client Email</label>
                        <input type="email" id="clientEmail" value="${data.clientEmail}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Invoice Number</label>
                        <input type="text" id="invoiceNumber" value="${data.invoiceNumber}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Invoice Date</label>
                        <input type="date" id="invoiceDate" value="${data.invoiceDate}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div class="border-t border-slate-100 pt-3">
                    <h3 class="text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1">
                        <i data-lucide="list" class="w-3.5 h-3.5 text-slate-500"></i>
                        <span>Line Item 1</span>
                    </h3>
                    <div class="grid grid-cols-12 gap-3">
                        <div class="col-span-6">
                            <input type="text" id="itemName1" value="${data.itemName1}" placeholder="Item Description" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                        </div>
                        <div class="col-span-2">
                            <input type="number" id="itemQty1" value="${data.itemQty1}" placeholder="Qty" class="w-full h-9 px-2 text-center rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                        </div>
                        <div class="col-span-4">
                            <input type="number" id="itemRate1" value="${data.itemRate1}" placeholder="Rate ($)" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                        </div>
                    </div>
                </div>
                <div>
                    <h3 class="text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1">
                        <i data-lucide="list" class="w-3.5 h-3.5 text-slate-500"></i>
                        <span>Line Item 2</span>
                    </h3>
                    <div class="grid grid-cols-12 gap-3">
                        <div class="col-span-6">
                            <input type="text" id="itemName2" value="${data.itemName2}" placeholder="Item Description" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                        </div>
                        <div class="col-span-2">
                            <input type="number" id="itemQty2" value="${data.itemQty2}" placeholder="Qty" class="w-full h-9 px-2 text-center rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                        </div>
                        <div class="col-span-4">
                            <input type="number" id="itemRate2" value="${data.itemRate2}" placeholder="Rate ($)" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                        </div>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Notes / Terms</label>
                    <textarea id="terms" rows="2" class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">${data.terms}</textarea>
                </div>
            `;
        } else if (currentTemplate === "resume") {
            const data = templateData.resume;
            dynamicFieldsContainer.innerHTML = `
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                        <input type="text" id="fullName" value="${data.fullName}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Professional Title</label>
                        <input type="text" id="jobTitle" value="${data.jobTitle}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                        <input type="email" id="email" value="${data.email}" class="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Phone</label>
                        <input type="text" id="phone" value="${data.phone}" class="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Website</label>
                        <input type="text" id="website" value="${data.website}" class="w-full h-9 px-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Professional Summary</label>
                    <textarea id="summary" rows="3" class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">${data.summary}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Work History</label>
                    <textarea id="experience" rows="4" class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-xs input-trigger">${data.experience}</textarea>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Education</label>
                        <textarea id="education" rows="2" class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">${data.education}</textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Key Skills</label>
                        <textarea id="skills" rows="2" class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">${data.skills}</textarea>
                    </div>
                </div>
            `;
        } else if (currentTemplate === "letter") {
            const data = templateData.letter;
            dynamicFieldsContainer.innerHTML = `
                <div class="grid grid-cols-3 gap-2">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Sender Name</label>
                        <input type="text" id="senderName" value="${data.senderName}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Sender Title</label>
                        <input type="text" id="senderTitle" value="${data.senderTitle}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Sender Org</label>
                        <input type="text" id="senderCompany" value="${data.senderCompany}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Recipient Name</label>
                        <input type="text" id="recipientName" value="${data.recipientName}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Recipient Org</label>
                        <input type="text" id="recipientCompany" value="${data.recipientCompany}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Recipient Address</label>
                        <input type="text" id="recipientAddress" value="${data.recipientAddress}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-500 mb-1">Letter Date</label>
                        <input type="date" id="date" value="${data.date}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Subject</label>
                    <input type="text" id="subject" value="${data.subject}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Letter Body</label>
                    <textarea id="body" rows="6" class="w-full p-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">${data.body}</textarea>
                </div>
                <div>
                    <label class="block text-xs font-semibold text-slate-500 mb-1">Sign-off Greeting</label>
                    <input type="text" id="signoff" value="${data.signoff}" class="w-full h-9 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 input-trigger">
                </div>
            `;
        }
        
        lucide.createIcons();
        attachFormListeners();
        triggerPDFRebuild();
    }

    // Attach listeners to newly generated form inputs
    function attachFormListeners() {
        const triggers = document.querySelectorAll(".input-trigger");
        triggers.forEach(trigger => {
            trigger.addEventListener("input", () => {
                // Save field state to templateData state object
                saveState(trigger.id, trigger.value);
                // Debounce rebuild
                debounceRebuild();
            });
        });
    }

    function saveState(id, value) {
        if (templateData[currentTemplate][id] !== undefined) {
            templateData[currentTemplate][id] = value;
        }
    }

    function debounceRebuild() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            triggerPDFRebuild();
        }, 400);
    }

    // Helper: Hex to RGB Converter
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 225, g: 29, b: 72 }; // Default rose
    }

    // Core PDF compilation and render
    function generatePDFDocument(isDownload = false) {
        const { jsPDF } = window.jspdf;
        const layout = layoutSelect.value;
        const orientation = layout === "portrait" ? "p" : "l";
        
        const doc = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: "a4"
        });

        const primaryHex = primaryColorInput.value;
        const brandColor = hexToRgb(primaryHex);

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // 1. INVOICE GENERATOR
        if (currentTemplate === "invoice") {
            const data = templateData.invoice;

            // Brand Header Block
            doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
            doc.rect(0, 0, pageWidth, 35, 'F');

            // Header Text
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text(data.title.toUpperCase(), 15, 22);

            // Invoice Metadata (Right Aligned in Header Block)
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Number: ${data.invoiceNumber}`, pageWidth - 15, 17, { align: 'right' });
            doc.text(`Date: ${data.invoiceDate}`, pageWidth - 15, 25, { align: 'right' });

            // Body Area
            doc.setTextColor(50, 50, 50);

            // Billed From & Billed To columns
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("BILLED BY:", 15, 50);
            doc.text("BILLED TO:", pageWidth / 2 + 10, 50);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42); // deep dark blue text
            doc.text(data.companyName, 15, 56);
            doc.text(data.clientName, pageWidth / 2 + 10, 56);

            doc.setFontSize(9.5);
            doc.setTextColor(100, 116, 139); // slate text
            doc.text(data.companyEmail, 15, 62);
            doc.text(data.clientEmail, pageWidth / 2 + 10, 62);

            // Divider Line
            doc.setDrawColor(226, 232, 240); // slate-200 border
            doc.setLineWidth(0.4);
            doc.line(15, 72, pageWidth - 15, 72);

            // Line Items Table Header
            doc.setFillColor(248, 250, 252); // slate-50 background
            doc.rect(15, 80, pageWidth - 30, 10, 'F');

            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105); // slate-600
            doc.text("Description", 18, 86);
            doc.text("Qty", pageWidth - 65, 86, { align: 'right' });
            doc.text("Rate", pageWidth - 40, 86, { align: 'right' });
            doc.text("Amount", pageWidth - 18, 86, { align: 'right' });

            // Calculate amounts
            const qty1 = parseFloat(data.itemQty1) || 0;
            const rate1 = parseFloat(data.itemRate1) || 0;
            const amt1 = qty1 * rate1;

            const qty2 = parseFloat(data.itemQty2) || 0;
            const rate2 = parseFloat(data.itemRate2) || 0;
            const amt2 = qty2 * rate2;

            const subtotal = amt1 + amt2;
            const total = subtotal;

            // Line Item 1
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42);
            doc.text(data.itemName1 || "Item 1", 18, 100);
            doc.text(qty1.toString(), pageWidth - 65, 100, { align: 'right' });
            doc.text(`$${rate1.toFixed(2)}`, pageWidth - 40, 100, { align: 'right' });
            doc.text(`$${amt1.toFixed(2)}`, pageWidth - 18, 100, { align: 'right' });

            // Line Item 2
            doc.text(data.itemName2 || "Item 2", 18, 112);
            doc.text(qty2.toString(), pageWidth - 65, 112, { align: 'right' });
            doc.text(`$${rate2.toFixed(2)}`, pageWidth - 40, 112, { align: 'right' });
            doc.text(`$${amt2.toFixed(2)}`, pageWidth - 18, 112, { align: 'right' });

            // Table Border / Accent Line under items
            doc.line(15, 122, pageWidth - 15, 122);

            // Summary Totals
            doc.setFont("helvetica", "bold");
            doc.text("Total Amount Due:", pageWidth - 80, 134);
            doc.setFontSize(14);
            doc.setTextColor(brandColor.r, brandColor.g, brandColor.b);
            doc.text(`$${total.toFixed(2)}`, pageWidth - 18, 134, { align: 'right' });

            // Footer notes
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(148, 163, 184); // slate-400
            doc.text("Notes & Terms:", 15, pageHeight - 35);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            
            // Auto wrap terms
            const splitNotes = doc.splitTextToSize(data.terms, pageWidth - 30);
            doc.text(splitNotes, 15, pageHeight - 29);

            // Signature area
            doc.line(pageWidth - 65, pageHeight - 35, pageWidth - 15, pageHeight - 35);
            doc.setFontSize(8.5);
            doc.setTextColor(148, 163, 184);
            doc.text("Authorized Signature", pageWidth - 40, pageHeight - 30, { align: 'center' });

        }
        // 2. RESUME GENERATOR
        else if (currentTemplate === "resume") {
            const data = templateData.resume;

            // Name & Title Banner
            doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
            doc.rect(0, 0, pageWidth, 38, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.text(data.fullName, 15, 16);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text(data.jobTitle, 15, 23);

            // Contact Info line
            doc.setFontSize(9);
            doc.text(`Email: ${data.email}   |   Phone: ${data.phone}   |   Portfolio: ${data.website}`, 15, 31);

            // Body Columns Setup
            const colWidth = (pageWidth - 38) / 3; // 3 column ratios

            // 1. Column - Summary & Experience (Left, wider)
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("PROFESSIONAL SUMMARY", 15, 52);
            doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b);
            doc.setLineWidth(1);
            doc.line(15, 55, 65, 55);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(71, 85, 105);
            const splitSummary = doc.splitTextToSize(data.summary, pageWidth - 30);
            doc.text(splitSummary, 15, 61);

            // Experience Block
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("PROFESSIONAL EXPERIENCE", 15, 84);
            doc.line(15, 87, 72, 87);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            
            const splitExperience = doc.splitTextToSize(data.experience, pageWidth - 30);
            doc.text(splitExperience, 15, 93);

            // 2. Education & Skills in bottom section or second page
            // Education
            const baselineEducationY = 160;
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("EDUCATION", 15, baselineEducationY);
            doc.line(15, baselineEducationY + 3, 45, baselineEducationY + 3);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(71, 85, 105);
            const splitEducation = doc.splitTextToSize(data.education, pageWidth - 30);
            doc.text(splitEducation, 15, baselineEducationY + 9);

            // Skills
            const baselineSkillsY = 195;
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text("KEY SKILLS", 15, baselineSkillsY);
            doc.line(15, baselineSkillsY + 3, 45, baselineSkillsY + 3);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(71, 85, 105);
            const splitSkills = doc.splitTextToSize(data.skills, pageWidth - 30);
            doc.text(splitSkills, 15, baselineSkillsY + 9);

        }
        // 3. BUSINESS LETTER GENERATOR
        else if (currentTemplate === "letter") {
            const data = templateData.letter;

            // Simple elegant header bar (top margin line)
            doc.setFillColor(brandColor.r, brandColor.g, brandColor.b);
            doc.rect(15, 15, pageWidth - 30, 2, 'F');

            // Sender Information (Top Right)
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(data.senderName, pageWidth - 15, 28, { align: 'right' });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`${data.senderTitle} | ${data.senderCompany}`, pageWidth - 15, 33, { align: 'right' });

            // Recipient Information (Top Left)
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.text("TO:", 15, 48);
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            doc.text(data.recipientName, 15, 54);
            doc.text(data.recipientCompany, 15, 59);
            doc.text(data.recipientAddress, 15, 64);

            // Date
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9.5);
            doc.setTextColor(100, 116, 139);
            doc.text(`Date: ${data.date}`, 15, 78);

            // Subject Line
            doc.setTextColor(15, 23, 42);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(data.subject, 15, 88);
            doc.setDrawColor(241, 245, 249); // slate-100 line under subject
            doc.setLineWidth(0.5);
            doc.line(15, 91, pageWidth - 15, 91);

            // Body
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            doc.setTextColor(51, 65, 85); // slate-700
            
            const splitBody = doc.splitTextToSize(data.body, pageWidth - 30);
            doc.text(splitBody, 15, 102);

            // Sign-off
            const signoffY = 102 + (splitBody.length * 5.2) + 12;
            doc.text(data.signoff, 15, signoffY);
            
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 23, 42);
            doc.text(data.senderName, 15, signoffY + 12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 116, 139);
            doc.text(data.senderTitle, 15, signoffY + 17);
        }

        // Output logic
        if (isDownload) {
            doc.save(`${currentTemplate}_document.pdf`);
        } else {
            // Generate PDF as blob URL and update iframe source
            const blob = doc.output('bloburl');
            previewContainer.innerHTML = `<iframe src="${blob}" class="w-full h-[600px] pdf-preview" id="pdfPreviewFrame"></iframe>`;
        }
    }

    // Trigger Rebuild Utility
    function triggerPDFRebuild() {
        try {
            generatePDFDocument(false);
        } catch (e) {
            console.error("PDF preview compilation error:", e);
            previewContainer.innerHTML = `
                <div class="text-center p-8 text-rose-500 bg-rose-50 border border-rose-200 rounded-xl max-w-sm">
                    <i data-lucide="alert-triangle" class="w-10 h-10 mx-auto mb-3 text-rose-500"></i>
                    <p class="text-sm font-semibold">Preview Render Failed</p>
                    <p class="text-xs mt-1 text-rose-400">Ensure the PDF generator inputs are properly completed.</p>
                </div>
            `;
            lucide.createIcons();
        }
    }

    // Tab switcher events
    templateInvoice.addEventListener("click", () => {
        switchTemplate("invoice", templateInvoice);
    });

    templateResume.addEventListener("click", () => {
        switchTemplate("resume", templateResume);
    });

    templateLetter.addEventListener("click", () => {
        switchTemplate("letter", templateLetter);
    });

    function switchTemplate(templateKey, buttonElement) {
        if (currentTemplate === templateKey) return;
        
        currentTemplate = templateKey;
        
        // Update styling of buttons
        document.querySelectorAll(".template-tab").forEach(btn => {
            btn.classList.remove("active", "border-rose-600", "bg-rose-50/50", "text-rose-600");
            btn.classList.add("border-slate-200", "text-slate-600", "hover:bg-slate-50");
        });

        buttonElement.classList.add("active", "border-rose-600", "bg-rose-50/50", "text-rose-600");
        buttonElement.classList.remove("border-slate-200", "text-slate-600", "hover:bg-slate-50");

        // Re-render
        renderFields();
    }

    // General inputs
    primaryColorInput.addEventListener("input", () => {
        debounceRebuild();
    });

    layoutSelect.addEventListener("change", () => {
        triggerPDFRebuild();
    });

    refreshPreviewBtn.addEventListener("click", () => {
        triggerPDFRebuild();
    });

    downloadPdfBtn.addEventListener("click", () => {
        generatePDFDocument(true);
    });

    // Bootstrapping
    renderFields();
});
