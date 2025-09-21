// Karno Haritası Web Uygulaması JavaScript

// Global uygulama değişkeni
let karnoApp;

class KarnoMap {
    constructor() {
        console.log('KarnoMap constructor başlatıldı');
        this.variableCount = 4;
        this.variables = ['A', 'B', 'C', 'D'];
        this.truthTable = [];
        this.karnoValues = [];
        this.groups = [];
        this.currentMethod = 'truthTable';
        
        this.initializeEventListeners();
        this.generateTruthTable();
        this.generateKarnoMap();
    }

    initializeEventListeners() {
        console.log('Event listeners başlatılıyor');
        
        // Variable count change
        const variableSelect = document.getElementById('variableCount');
        if (variableSelect) {
            variableSelect.addEventListener('change', (e) => {
                this.variableCount = parseInt(e.target.value);
                this.variables = ['A', 'B', 'C', 'D'].slice(0, this.variableCount);
                this.generateTruthTable();
                this.generateKarnoMap();
                this.clearResults();
            });
        }

        // Input method switching
        const truthTableBtn = document.getElementById('truthTableBtn');
        if (truthTableBtn) {
            truthTableBtn.addEventListener('click', () => {
                this.switchInputMethod('truthTable');
            });
        }

        const mintermsBtn = document.getElementById('mintermsBtn');
        if (mintermsBtn) {
            mintermsBtn.addEventListener('click', () => {
                this.switchInputMethod('minterms');
            });
        }

        // Action buttons
        const clearBtn = document.getElementById('clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAll();
            });
        }

        const randomBtn = document.getElementById('randomBtn');
        if (randomBtn) {
            randomBtn.addEventListener('click', () => {
                this.generateRandom();
            });
        }

        // Minterm input
        const applyMinterms = document.getElementById('applyMinterms');
        if (applyMinterms) {
            applyMinterms.addEventListener('click', () => {
                this.applyMinterms();
            });
        }

        // Map controls
        const findGroupsBtn = document.getElementById('findGroupsBtn');
        if (findGroupsBtn) {
            findGroupsBtn.addEventListener('click', () => {
                this.findGroups();
            });
        }

        const showSolutionBtn = document.getElementById('showSolutionBtn');
        if (showSolutionBtn) {
            showSolutionBtn.addEventListener('click', () => {
                this.showSolution();
            });
        }
    }

    switchInputMethod(method) {
        this.currentMethod = method;
        
        // Update button states
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (method === 'truthTable') {
            const truthTableBtn = document.getElementById('truthTableBtn');
            const truthTablePanel = document.getElementById('truthTablePanel');
            const mintermsPanel = document.getElementById('mintermsPanel');
            
            if (truthTableBtn) truthTableBtn.classList.add('active');
            if (truthTablePanel) truthTablePanel.classList.add('active');
            if (mintermsPanel) mintermsPanel.classList.remove('active');
        } else {
            const mintermsBtn = document.getElementById('mintermsBtn');
            const mintermsPanel = document.getElementById('mintermsPanel');
            const truthTablePanel = document.getElementById('truthTablePanel');
            
            if (mintermsBtn) mintermsBtn.classList.add('active');
            if (mintermsPanel) mintermsPanel.classList.add('active');
            if (truthTablePanel) truthTablePanel.classList.remove('active');
        }
    }

    generateTruthTable() {
        console.log('generateTruthTable çağrıldı');
        const rows = Math.pow(2, this.variableCount);
        this.truthTable = [];
        
        for (let i = 0; i < rows; i++) {
            const row = {};
            for (let j = 0; j < this.variableCount; j++) {
                const varName = this.variables[j];
                row[varName] = (i >> (this.variableCount - 1 - j)) & 1;
            }
            row.output = 0; // Default output
            row.minterm = i;
            this.truthTable.push(row);
        }

        console.log('Doğruluk tablosu oluşturuldu:', this.truthTable);
        this.renderTruthTable();
        this.updateKarnoFromTruthTable();
    }

    renderTruthTable() {
        console.log('renderTruthTable çağrıldı');
        const container = document.getElementById('truthTableContainer');
        console.log('Container bulundu:', container);
        
        if (!container) {
            console.error('truthTableContainer bulunamadı!');
            return;
        }
        
        let html = '<table class="truth-table"><thead><tr>';
        
        // Variable headers
        for (const variable of this.variables) {
            html += `<th>${variable}</th>`;
        }
        html += '<th>F</th></tr></thead><tbody>';

        // Table rows
        for (let i = 0; i < this.truthTable.length; i++) {
            const row = this.truthTable[i];
            html += '<tr>';
            
            for (const variable of this.variables) {
                html += `<td>${row[variable]}</td>`;
            }
            
            const outputClass = row.output === 1 ? 'selected' : 
                               row.output === 'X' ? 'dont-care' : '';
            
            html += `<td class="output-cell ${outputClass}" 
                     data-row="${i}" onclick="karnoApp.toggleOutput(${i})">
                     ${row.output}
                   </td>`;
            html += '</tr>';
        }

        html += '</tbody></table>';
        container.innerHTML = html;
        console.log('Doğruluk tablosu render edildi');
    }

    toggleOutput(rowIndex) {
        console.log('toggleOutput çağrıldı, rowIndex:', rowIndex);
        const currentValue = this.truthTable[rowIndex].output;
        // 0 -> 1 -> X -> 0 döngüsü
        if (currentValue === 0) {
            this.truthTable[rowIndex].output = 1;
        } else if (currentValue === 1) {
            this.truthTable[rowIndex].output = 'X';
        } else {
            this.truthTable[rowIndex].output = 0;
        }
        this.renderTruthTable();
        this.updateKarnoFromTruthTable();
        this.clearResults();
    }

    updateKarnoFromTruthTable() {
        this.karnoValues = this.truthTable.map(row => row.output);
        this.renderKarnoMap();
    }

    generateKarnoMap() {
        console.log('generateKarnoMap çağrıldı');
        const container = document.getElementById('karnoMapContainer');
        console.log('Karno container bulundu:', container);
        
        if (!container) {
            console.error('karnoMapContainer bulunamadı!');
            return;
        }
        
        if (this.variableCount === 2) {
            this.generateKarno2Var(container);
        } else if (this.variableCount === 3) {
            this.generateKarno3Var(container);
        } else if (this.variableCount === 4) {
            this.generateKarno4Var(container);
        }
    }

    generateKarno2Var(container) {
        console.log('2 değişkenli Karno haritası oluşturuluyor');
        let html = `
            <div class="karno-map map-2var">
                <div class="karno-labels">
                    <div class="label-top" style="position: absolute; top: -35px; left: 20px; display: flex; justify-content: space-around; width: 120px;">
                        <span>0</span><span>1</span>
                    </div>
                    <div class="label-top" style="position: absolute; top: -50px; left: 0; right: 0; text-align: center; font-weight: bold;">B</div>
                    <div class="label-left" style="position: absolute; left: -35px; top: 20px; display: flex; flex-direction: column; justify-content: space-around; height: 120px;">
                        <span>0</span><span>1</span>
                    </div>
                    <div class="label-left" style="position: absolute; left: -50px; top: 0; bottom: 0; writing-mode: vertical-lr; display: flex; align-items: center; font-weight: bold;">A</div>
                </div>
        `;

        // 2 değişken Gray code: A\B: 0, 1
        const order = [0, 1, 3, 2]; // A=0,B=0; A=0,B=1; A=1,B=1; A=1,B=0

        for (let i = 0; i < 4; i++) {
            const minterm = order[i];
            html += `<div class="karno-cell" data-minterm="${minterm}">
                       <span>${this.karnoValues[minterm] || 0}</span>
                     </div>`;
        }

        html += '</div>';
        container.innerHTML = html;
        
        // Event listener'ları JavaScript ile ekle
        this.addCellEventListeners();
    }

    generateKarno3Var(container) {
        console.log('3 değişkenli Karno haritası oluşturuluyor');
        let html = `
            <div class="karno-map map-3var">
                <div class="karno-labels">
                    <div class="label-top" style="position: absolute; top: -35px; left: 20px; display: flex; justify-content: space-around; width: 240px;">
                        <span>00</span><span>01</span><span>11</span><span>10</span>
                    </div>
                    <div class="label-top" style="position: absolute; top: -50px; left: 0; right: 0; text-align: center; font-weight: bold;">BC</div>
                    <div class="label-left" style="position: absolute; left: -35px; top: 20px; display: flex; flex-direction: column; justify-content: space-around; height: 120px;">
                        <span>0</span><span>1</span>
                    </div>
                    <div class="label-left" style="position: absolute; left: -50px; top: 0; bottom: 0; writing-mode: vertical-lr; display: flex; align-items: center; font-weight: bold;">A</div>
                </div>
        `;

        // 3 değişken Gray code: A\BC: 00, 01, 11, 10
        const order = [
            0, 1, 3, 2,  // A=0: BC=00,01,11,10
            4, 5, 7, 6   // A=1: BC=00,01,11,10
        ];

        for (let i = 0; i < 8; i++) {
            const minterm = order[i];
            html += `<div class="karno-cell" data-minterm="${minterm}">
                       <span>${this.karnoValues[minterm] || 0}</span>
                     </div>`;
        }

        html += '</div>';
        container.innerHTML = html;
        
        // Event listener'ları JavaScript ile ekle
        this.addCellEventListeners();
    }

    generateKarno4Var(container) {
        console.log('4 değişkenli Karno haritası oluşturuluyor');
        let html = `
            <div class="karno-map map-4var">
                <div class="karno-labels">
                    <div class="label-top" style="position: absolute; top: -35px; left: 20px; display: flex; justify-content: space-around; width: 240px;">
                        <span>00</span><span>01</span><span>11</span><span>10</span>
                    </div>
                    <div class="label-top" style="position: absolute; top: -50px; left: 0; right: 0; text-align: center; font-weight: bold;">CD</div>
                    <div class="label-left" style="position: absolute; left: -35px; top: 20px; display: flex; flex-direction: column; justify-content: space-around; height: 240px;">
                        <span>00</span><span>01</span><span>11</span><span>10</span>
                    </div>
                    <div class="label-left" style="position: absolute; left: -50px; top: 0; bottom: 0; writing-mode: vertical-lr; display: flex; align-items: center; font-weight: bold;">AB</div>
                </div>
        `;

        // Gray code sıralaması: AB\CD: 00, 01, 11, 10
        const order = [
            0,  1,  3,  2,   // AB=00: CD=00,01,11,10
            4,  5,  7,  6,   // AB=01: CD=00,01,11,10
            12, 13, 15, 14,  // AB=11: CD=00,01,11,10
            8,  9,  11, 10   // AB=10: CD=00,01,11,10
        ];

        for (let i = 0; i < 16; i++) {
            const minterm = order[i];
            html += `<div class="karno-cell" data-minterm="${minterm}">
                       <span>${this.karnoValues[minterm] || 0}</span>
                     </div>`;
        }

        html += '</div>';
        container.innerHTML = html;
        
        // Event listener'ları JavaScript ile ekle
        this.addCellEventListeners();
    }

    addCellEventListeners() {
        console.log('addCellEventListeners çağrıldı');
        const cells = document.querySelectorAll('.karno-cell');
        console.log('Bulunan hücre sayısı:', cells.length);
        
        cells.forEach(cell => {
            const minterm = parseInt(cell.dataset.minterm);
            console.log('Event listener ekleniyor, minterm:', minterm);
            
            // Click event
            cell.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Hücre tıklandı, minterm:', minterm);
                this.toggleKarnoCell(minterm);
            });
            
            // Mouse events
            cell.addEventListener('mouseenter', (e) => {
                this.highlightCellGroups(minterm);
            });
            
            cell.addEventListener('mouseleave', (e) => {
                this.removeCellGroupHighlight();
            });
            
            // Hücreyi clickable yap
            cell.style.cursor = 'pointer';
        });
    }

    toggleKarnoCell(minterm) {
        console.log('toggleKarnoCell çağrıldı, minterm:', minterm);
        console.log('Mevcut karnoValues:', this.karnoValues);
        
        const currentValue = this.karnoValues[minterm] || 0;
        console.log('Mevcut değer:', currentValue);
        
        // 0 -> 1 -> X -> 0 döngüsü  
        if (currentValue === 0) {
            this.karnoValues[minterm] = 1;
        } else if (currentValue === 1) {
            this.karnoValues[minterm] = 'X';
        } else {
            this.karnoValues[minterm] = 0;
        }
        
        this.truthTable[minterm].output = this.karnoValues[minterm];
        this.renderTruthTable();
        this.renderKarnoMap();
        this.clearResults();
    }

    renderKarnoMap() {
        const cells = document.querySelectorAll('.karno-cell');
        cells.forEach(cell => {
            const minterm = parseInt(cell.dataset.minterm);
            const value = this.karnoValues[minterm] || 0;
            const span = cell.querySelector('span');
            if (span) {
                span.textContent = value;
            }
            
            // Hücre stillerini güncelle
            cell.classList.remove('filled', 'dont-care');
            if (value === 1) {
                cell.classList.add('filled');
            } else if (value === 'X') {
                cell.classList.add('dont-care');
            }
        });
    }

    highlightCellGroups(minterm) {
        console.log('highlightCellGroups çağrıldı, minterm:', minterm);
    }

    removeCellGroupHighlight() {
        console.log('removeCellGroupHighlight çağrıldı');
    }

    clearResults() {
        this.groups = [];
        const groupsList = document.getElementById('groupsList');
        if (groupsList) {
            groupsList.innerHTML = '<p style="color: #6b7280; font-style: italic;">Henüz grup bulunamadı. "Grupları Bul" butonuna tıklayın.</p>';
        }
        
        const solutionDisplay = document.getElementById('solutionDisplay');
        if (solutionDisplay) {
            solutionDisplay.textContent = '';
        }
        
        const termCount = document.getElementById('termCount');
        if (termCount) {
            termCount.textContent = 'Terim sayısı: 0';
        }
        
        const literalCount = document.getElementById('literalCount');
        if (literalCount) {
            literalCount.textContent = 'Literal sayısı: 0';
        }
        
        // Remove group highlighting
        document.querySelectorAll('.karno-cell').forEach(cell => {
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}`);
            }
        });
    }

    clearAll() {
        // Tüm değerleri sıfırla
        this.karnoValues = [];
        this.truthTable.forEach(row => {
            row.output = 0;
        });
        this.renderTruthTable();
        this.renderKarnoMap();
        this.clearResults();
    }

    generateRandom() {
        // Rastgele değerler ata
        this.truthTable.forEach(row => {
            row.output = Math.random() < 0.3 ? 1 : 0; // %30 şansla 1
        });
        this.updateKarnoFromTruthTable();
        this.clearResults();
    }

    applyMinterms() {
        const mintermsInput = document.getElementById('mintermsInput');
        const dontCareInput = document.getElementById('dontCareInput');
        
        if (!mintermsInput) return;
        
        // Önce tümünü sıfırla
        this.truthTable.forEach(row => {
            row.output = 0;
        });
        
        // Mintermleri uygula
        if (mintermsInput.value.trim()) {
            const minterms = mintermsInput.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            minterms.forEach(minterm => {
                if (minterm >= 0 && minterm < this.truthTable.length) {
                    this.truthTable[minterm].output = 1;
                }
            });
        }
        
        // Don't care'leri uygula
        if (dontCareInput && dontCareInput.value.trim()) {
            const dontCares = dontCareInput.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            dontCares.forEach(minterm => {
                if (minterm >= 0 && minterm < this.truthTable.length) {
                    this.truthTable[minterm].output = 'X';
                }
            });
        }
        
        this.updateKarnoFromTruthTable();
        this.clearResults();
    }

    findGroups() {
        // Basit grup bulma placeholder
        console.log('Grup bulma fonksiyonu çağrıldı');
        alert('Grup bulma özelliği henüz implementlenmedi. Temel harita ve tablo işlemleri çalışıyor.');
    }

    showSolution() {
        // Çözüm gösterme placeholder
        console.log('Çözüm gösterme fonksiyonu çağrıldı');
        alert('Çözüm gösterme özelliği henüz implementlenmedi. Temel harita ve tablo işlemleri çalışıyor.');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event çalıştı');
    karnoApp = new KarnoMap();
    console.log('karnoApp oluşturuldu:', karnoApp);
    window.karnoApp = karnoApp; // Global erişim için
    console.log('Global karnoApp tanımlandı');
});
