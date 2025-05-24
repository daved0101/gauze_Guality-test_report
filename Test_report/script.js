function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    let drawing = false;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch support for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    });
    canvas.addEventListener('touchend', stopDrawing);

    function startDrawing(e) {
        drawing = true;
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
        if (!drawing) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    }

    function stopDrawing() {
        drawing = false;
        ctx.closePath();
    }
}

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function uploadSignature(canvasId, input) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Initialize canvases
setupCanvas('preparedCanvas');
setupCanvas('checkedCanvas');
setupCanvas('approvedCanvas');

// Export functions
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;

    // Header
    doc.setFontSize(16);
    doc.text('ADAMA DEVELOPMENT PLC - Nazmed Medical Textiles', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(14);
    doc.text('GAUZE BANDAGE LAB TEST RESULTS REPORT FORM', 105, y, { align: 'center' });
    y += 10;

    // Header Table
    doc.setFontSize(10);
    doc.text('Document No: ADPLC-OF-166', 10, y);
    doc.text('Revision No: 00', 100, y);
    doc.text('Page: 1 of 1', 180, y);
    y += 10;

    // Test Report Section
    y += 10;
    doc.setFontSize(12);
    doc.text('Test Report', 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Sample Name: ${formData.sampleName || 'Gauze Fabric Bleached & Dried'}`, 10, y);
    y += 7;
    doc.text(`Batch Number: ${formData.batchNumber}`, 10, y);
    y += 7;
    doc.text(`Batch Size: ${formData.batchSize || '105000'}`, 10, y);
    y += 7;
    doc.text(`Shift: ${formData.shift}`, 10, y);
    y += 7;
    doc.text(`Test Method: ${formData.testMethod || 'ES 6734:2021, EN 14079'}`, 10, y);
    y += 7;
    doc.text(`Testing Date: ${formData.testingDate}`, 10, y);
    y += 10;

    // Test Results Table
    y += 10;
    doc.setFontSize(12);
    doc.text('Test Results', 10, y);
    y += 10;
    doc.setFontSize(10);
    const tableData = [
        ['Item', 'Unit', 'Standard', 'Results', 'Conclusion'],
        ['Width', 'Cm', '90±2', formData.width, formData.widthConclusion],
        ['Fiber Identification', '%', '100% cotton', formData.fiber, formData.fiberConclusion],
        ['Fluorescence', '', 'With the exception of that shown by a few isolated fibers no intense blue fluorescence shall be displayed', formData.fluorescence, formData.fluorescenceConclusion],
        ['Mass per square meter', 'g/m2', '≥13', formData.mass, formData.massConclusion],
        ['Thread Count', 'Threads/cm2', '≥12', formData.threadCount, formData.threadCountConclusion],
        ['Absorbency', 'Second', '≤10', formData.absorbency, formData.absorbencyConclusion],
        ['Whiteness', 'oA', '≥72', formData.whiteness, formData.whitenessConclusion],
        ['Water-soluble substances', '%', '≤0.50', formData.waterSoluble, formData.waterSolubleConclusion],
        ['Sulphated Ash', '%', '≤0.75', formData.sulphatedAsh, formData.sulphatedAshConclusion],
        ['Loss on drying', '%', '≤8', formData.lossOnDrying, formData.lossOnDryingConclusion],
        ['Starch and Dextrin', '', 'No red, violet, or blue color develops', formData.starch, formData.starchConclusion],
        ['Extractable coloring matter', '', 'Liquid obtained shall not be more than blue colored solution', formData.coloringMatter, formData.coloringMatterConclusion],
        ['Acidity and alkalinity', '', 'No pink color develops in either portion after addition of phenolphthalein and Methyl orange solution', formData.acidity, formData.acidityConclusion]
    ];
    doc.autoTable({
        startY: y,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 50 }, 2: { cellWidth: 60 } }
    });
    y = doc.lastAutoTable.finalY + 10;

    // Conclusion Remark
    doc.setFontSize(10);
    doc.text('Conclusion Remark:', 10, y);
    y += 5;
    doc.text(formData.conclusionRemark || '', 10, y, { maxWidth: 190 });
    y += 20;

    // Signature Section
    doc.setFontSize(12);
    doc.text('Signatures', 10, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Prepared by: ${formData.preparedBy}`, 10, y);
    doc.addImage(canvasData.preparedCanvas, 'PNG', 60, y - 5, 40, 20);
    doc.text(`Date: ${formData.preparedDate}`, 110, y);
    y += 25;
    doc.text('Checked by: Amanuel Melese', 10, y);
    doc.addImage(canvasData.checkedCanvas, 'PNG', 60, y - 5, 40, 20);
    doc.text(`Date: ${formData.checkedDate}`, 110, y);
    y += 25;
    doc.text('Approved by: Tambizot Getachew', 10, y);
    doc.addImage(canvasData.approvedCanvas, 'PNG', 60, y - 5, 40, 20);
    doc.text(`Date: ${formData.approvedDate}`, 110, y);

    // Save PDF
    doc.save('Gauze_Bandage_Test_Report.pdf');
}

function exportCSV() {
    let csv = 'Item,Unit,Standard,Results,Conclusion\n';
    const tableData = [
        ['Width', 'Cm', '90±2', formData.width, formData.widthConclusion],
        ['Fiber Identification', '%', '100% cotton', formData.fiber, formData.fiberConclusion],
        ['Fluorescence', '', 'With the exception of that shown by a few isolated fibers no intense blue fluorescence shall be displayed', formData.fluorescence, formData.fluorescenceConclusion],
        ['Mass per square meter', 'g/m2', '≥13', formData.mass, formData.massConclusion],
        ['Thread Count', 'Threads/cm2', '≥12', formData.threadCount, formData.threadCountConclusion],
        ['Absorbency', 'Second', '≤10', formData.absorbency, formData.absorbencyConclusion],
        ['Whiteness', 'oA', '≥72', formData.whiteness, formData.whitenessConclusion],
        ['Water-soluble substances', '%', '≤0.50', formData.waterSoluble, formData.waterSolubleConclusion],
        ['Sulphated Ash', '%', '≤0.75', formData.sulphatedAsh, formData.sulphatedAshConclusion],
        ['Loss on drying', '%', '≤8', formData.lossOnDrying, formData.lossOnDryingConclusion],
        ['Starch and Dextrin', '', 'No red, violet, or blue color develops', formData.starch, formData.starchConclusion],
        ['Extractable coloring matter', '', 'Liquid obtained shall not be more than blue colored solution', formData.coloringMatter, formData.coloringMatterConclusion],
        ['Acidity and alkalinity', '', 'No pink color develops in either portion after addition of phenolphthalein and Methyl orange solution', formData.acidity, formData.acidityConclusion]
    ];
    tableData.forEach(row => {
        csv += row.map(field => `"${field || ''}"`).join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gauze_Bandage_Test_Report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

function exportJSON() {
    const jsonData = {
        SampleName: formData.sampleName || 'Gauze Fabric Bleached & Dried',
        BatchNumber: formData.batchNumber,
        BatchSize: formData.batchSize || '105000',
        Shift: formData.shift,
        TestMethod: formData.testMethod || 'ES 6734:2021, EN 14079',
        TestingDate: formData.testingDate,
        TestResults: {
            Width: { Unit: 'Cm', Standard: '90±2', Result: formData.width, Conclusion: formData.widthConclusion },
            FiberIdentification: { Unit: '%', Standard: '100% cotton', Result: formData.fiber, Conclusion: formData.fiberConclusion },
            Fluorescence: { Unit: '', Standard: 'With the exception of that shown by a few isolated fibers no intense blue fluorescence shall be displayed', Result: formData.fluorescence, Conclusion: formData.fluorescenceConclusion },
            MassPerSquareMeter: { Unit: 'g/m2', Standard: '≥13', Result: formData.mass, Conclusion: formData.massConclusion },
            ThreadCount: { Unit: 'Threads/cm2', Standard: '≥12', Result: formData.threadCount, Conclusion: formData.threadCountConclusion },
            Absorbency: { Unit: 'Second', Standard: '≤10', Result: formData.absorbency, Conclusion: formData.absorbencyConclusion },
            Whiteness: { Unit: 'oA', Standard: '≥72', Result: formData.whiteness, Conclusion: formData.whitenessConclusion },
            WaterSolubleSubstances: { Unit: '%', Standard: '≤0.50', Result: formData.waterSoluble, Conclusion: formData.waterSolubleConclusion },
            SulphatedAsh: { Unit: '%', Standard: '≤0.75', Result: formData.sulphatedAsh, Conclusion: formData.sulphatedAshConclusion },
            LossOnDrying: { Unit: '%', Standard: '≤8', Result: formData.lossOnDrying, Conclusion: formData.lossOnDryingConclusion },
            StarchAndDextrin: { Unit: '', Standard: 'No red, violet, or blue color develops', Result: formData.starch, Conclusion: formData.starchConclusion },
            ExtractableColoringMatter: { Unit: '', Standard: 'Liquid obtained shall not be more than blue colored solution', Result: formData.coloringMatter, Conclusion: formData.coloringMatterConclusion },
            AcidityAndAlkalinity: { Unit: '', Standard: 'No pink color develops in either portion after addition of phenolphthalein and Methyl orange solution', Result: formData.acidity, Conclusion: formData.acidityConclusion }
        },
        ConclusionRemark: formData.conclusionRemark,
        PreparedBy: { Name: formData.preparedBy, Date: formData.preparedDate },
        CheckedBy: { Name: 'Amanuel Melese', Date: formData.checkedDate },
        ApprovedBy: { Name: 'Tambizot Getachew', Date: formData.approvedDate }
    };
    const jsonStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Gauze_Bandage_Test_Report.json';
    a.click();
    window.URL.revokeObjectURL(url);
}

let formData = {};
let canvasData = {};

document.getElementById('testReportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const output = document.getElementById('output');
    const exportSection = document.getElementById('exportSection');
    output.innerHTML = '';
    output.style.display = 'none';
    exportSection.style.display = 'none';

    // Basic validation
    let errors = [];
    const batchNumber = form.batchNumber.value.trim();
    const shift = form.shift.value.trim();
    const testingDate = form.testingDate.value;
    const preparedBy = form.preparedBy.value.trim();

    if (!batchNumber) errors.push('Batch Number is required.');
    if (!shift) errors.push('Shift is required.');
    if (!testingDate) errors.push('Testing Date is required.');
    if (!preparedBy) errors.push('Prepared by name is required.');

    // Validate numeric inputs
    const numericFields = [
        { name: 'width', min: 88, max: 92, label: 'Width' },
        { name: 'mass', min: 13, label: 'Mass per square meter' },
        { name: 'threadCount', min: 12, label: 'Thread Count' },
        { name: 'absorbency', max: 10, label: 'Absorbency' },
        { name: 'whiteness', min: 72, label: 'Whiteness' },
        { name: 'waterSoluble', max: 0.5, label: 'Water-soluble substances' },
        { name: 'sulphatedAsh', max: 0.75, label: 'Sulphated Ash' },
        { name: 'lossOnDrying', max: 8, label: 'Loss on drying' }
    ];

    numericFields.forEach(field => {
        const value = parseFloat(form[field.name].value);
        if (isNaN(value)) {
            errors.push(`${field.label} must be a number.`);
        } else {
            if ('min' in field && value < field.min) {
                errors.push(`${field.label} must be ≥ ${field.min}.`);
            }
            if ('max' in field && value > field.max) {
                errors.push(`${field.label} must be ≤ ${field.max}.`);
            }
        }
    });

    // Validate signatures
    const canvases = ['preparedCanvas', 'checkedCanvas', 'approvedCanvas'];
    canvases.forEach(canvasId => {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const isEmpty = !Array.from(imageData).some(value => value !== 0);
        if (isEmpty) {
            errors.push(`${canvasId.replace('Canvas', '')} signature is required.`);
        }
    });

    if (errors.length > 0) {
        output.innerHTML = '<p class="error">' + errors.join('<br>') + '</p>';
        output.style.display = 'block';
        return;
    }

    // Collect form data
    const formDataObj = new FormData(form);
    formData = {};
    formDataObj.forEach((value, key) => {
        formData[key] = value || '';
    });

    // Collect canvas data
    canvasData = {};
    canvases.forEach(canvasId => {
        canvasData[canvasId] = document.getElementById(canvasId).toDataURL('image/png');
    });

    // Display success message and show export section
    output.innerHTML = '<p>Form submitted successfully! Choose an export format below.</p>';
    output.style.display = 'block';
    exportSection.style.display = 'block';
});