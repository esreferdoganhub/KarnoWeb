// Karno Haritası Web Uygulaması JavaScript

// Global uygulama değişkeni
let karnoApp;

class KarnoMap {
    constructor() {
        this.variableCount = 4;
        this.variables = ['A', 'B', 'C', 'D'];
        this.truthTable = [];
        this.karnoValues = [];
        this.groups = [];
        this.currentMethod = 'truthTable';
        
        this.initializeEventListeners();
        this.generateTruthTable();
        this.generateKarnoMap();
        this.initParallax();
        this.initializeZoomPan();
    }

    initializeEventListeners() {
        // Variable count change
        document.getElementById('variableCount').addEventListener('change', (e) => {
            this.variableCount = parseInt(e.target.value);
            this.variables = ['A', 'B', 'C', 'D'].slice(0, this.variableCount);
            this.generateTruthTable();
            this.generateKarnoMap();
            this.clearResults();
        });

        // Input method switching
        document.getElementById('truthTableBtn').addEventListener('click', () => {
            this.switchInputMethod('truthTable');
        });

        document.getElementById('mintermsBtn').addEventListener('click', () => {
        document.getElementById('mintermsBtn').addEventListener('click', () => {
            this.switchInputMethod('minterms');
        });

        // Action buttons
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAll();
        });

        document.getElementById('randomBtn').addEventListener('click', () => {
            this.generateRandom();
        });

        // Minterm input
        document.getElementById('applyMinterms').addEventListener('click', () => {
            this.applyMinterms();
        });

        // Map controls
        document.getElementById('findGroupsBtn').addEventListener('click', () => {
            this.findGroups();
        });

        document.getElementById('showSolutionBtn').addEventListener('click', () => {
            this.showSolution();
        });
    }

    switchInputMethod(method) {
        this.currentMethod = method;
        
        // Update button states
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (method === 'truthTable') {
            document.getElementById('truthTableBtn').classList.add('active');
            document.getElementById('truthTablePanel').classList.add('active');
            document.getElementById('mintermsPanel').classList.remove('active');
        } else {
            document.getElementById('mintermsBtn').classList.add('active');
            document.getElementById('mintermsPanel').classList.add('active');
            document.getElementById('truthTablePanel').classList.remove('active');
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
    }

    toggleOutput(rowIndex) {
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
        const container = document.getElementById('karnoMapContainer');
        
        if (this.variableCount === 2) {
            this.generateKarno2Var(container);
        } else if (this.variableCount === 3) {
            this.generateKarno3Var(container);
        } else if (this.variableCount === 4) {
            this.generateKarno4Var(container);
        }
    }

    generateKarno2Var(container) {
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
                
                // Eğer gruplar varsa ve hücre bir grubun parçasıysa, grubu vurgula
                const containingGroups = this.groups.filter(group => 
                    group.minterms.includes(minterm)
                );
                
                if (containingGroups.length > 0) {
                    // Grup vurgulaması yap
                    this.highlightCellGroups(minterm);
                    
                    // 2 saniye sonra normal duruma dön
                    setTimeout(() => {
                        this.removeCellGroupHighlight();
                    }, 2000);
                } else {
                    // Normal toggle işlemi
                    this.toggleKarnoCell(minterm);
                }
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
            cell.querySelector('span').textContent = value;
            
            // Hücre stillerini güncelle
            cell.classList.remove('filled', 'dont-care');
            if (value === 1) {
                cell.classList.add('filled');
            } else if (value === 'X') {
                cell.classList.add('dont-care');
            }
            
            // Remove group classes
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}`);
            }
        });
    }

    applyMinterms() {
        const input = document.getElementById('mintermsInput').value;
        const dontCareInput = document.getElementById('dontCareInput').value;
        
        const minterms = input.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m));
        const dontCareMinterms = dontCareInput.split(',').map(m => parseInt(m.trim())).filter(m => !isNaN(m));
        
        // Clear all values
        this.karnoValues = new Array(Math.pow(2, this.variableCount)).fill(0);
        
        // Set specified minterms to 1
        minterms.forEach(minterm => {
            if (minterm >= 0 && minterm < Math.pow(2, this.variableCount)) {
                this.karnoValues[minterm] = 1;
                this.truthTable[minterm].output = 1;
            }
        });
        
        // Set don't care minterms to X
        dontCareMinterms.forEach(minterm => {
            if (minterm >= 0 && minterm < Math.pow(2, this.variableCount)) {
                this.karnoValues[minterm] = 'X';
                this.truthTable[minterm].output = 'X';
            }
        });

        this.renderTruthTable();
        this.renderKarnoMap();
        this.clearResults();
    }

    clearAll() {
        this.karnoValues = new Array(Math.pow(2, this.variableCount)).fill(0);
        this.truthTable.forEach(row => row.output = 0);
        this.renderTruthTable();
        this.renderKarnoMap();
        this.clearResults();
        document.getElementById('mintermsInput').value = '';
        document.getElementById('dontCareInput').value = '';
    }

    generateRandom() {
        const probability = 0.3; // 30% chance for each cell to be 1
        
        for (let i = 0; i < Math.pow(2, this.variableCount); i++) {
            const value = Math.random() < probability ? 1 : 0;
            this.karnoValues[i] = value;
            this.truthTable[i].output = value;
        }

        this.renderTruthTable();
        this.renderKarnoMap();
        this.clearResults();
        
        // Update minterms input
        const minterms = this.karnoValues.map((val, idx) => val ? idx : null)
                                          .filter(idx => idx !== null);
        document.getElementById('mintermsInput').value = minterms.join(', ');
    }

    findGroups() {
        this.groups = [];
        
        // Aktif mintermleri (1'ler) ve don't care'leri (X'ler) bul
        const activeMinterms = this.karnoValues.map((val, idx) => val === 1 ? idx : null)
                                               .filter(idx => idx !== null);
        const dontCareMinterms = this.karnoValues.map((val, idx) => val === 'X' ? idx : null)
                                                 .filter(idx => idx !== null);
        
        // Grup bulma için hem 1'leri hem de X'leri kullan
        const allMintermsForGrouping = [...activeMinterms, ...dontCareMinterms];
        
        if (activeMinterms.length === 0) {
            this.displayGroups();
            return;
        }

        // Karno haritası kurallarına göre grupları bul (don't care'ler dahil)
        this.findKarnoGroups(allMintermsForGrouping);
        
        // Sadece aktif mintermleri kapsayan optimal grupları seç
        this.selectOptimalGroups(activeMinterms);
        
        this.displayGroups();
        this.highlightGroups();
    }

    findKarnoGroups(minterms) {
        // Karno haritası sadeleştirme kurallarını uygula
        this.allPossibleGroups = [];
        
        if (this.variableCount === 4) {
            this.findAllGroups4Var(minterms);
        } else if (this.variableCount === 3) {
            this.findAllGroups3Var(minterms);
        } else if (this.variableCount === 2) {
            this.findAllGroups2Var(minterms);
        }
        
        // En iyi kapsama kümesini bul (Petrick's method basitleştirilmiş)
        this.findOptimalCovering(minterms);
    }

    // 4 değişkenli harita için tüm geçerli grupları bul
    findAllGroups4Var(minterms) {
        // 16'lık grup (tüm harita)
        if (minterms.length === 16) {
            this.allPossibleGroups.push({
                minterms: [...minterms],
                size: 16,
                term: '1',
                isPrime: true
            });
            return;
        }

        // 8'lik grupları bul
        this.find8Groups4Var(minterms);
        
        // 4'lük grupları bul
        this.find4Groups4Var(minterms);
        
        // 2'lik grupları bul
        this.find2Groups4Var(minterms);
        
        // Tekil hücreleri bul
        this.find1Groups4Var(minterms);
    }

    find8Groups4Var(minterms) {
        const groups8 = [
            // Yatay yarılar
            [0, 1, 2, 3, 4, 5, 6, 7],       // Üst 2 satır (AB=0x)
            [8, 9, 10, 11, 12, 13, 14, 15], // Alt 2 satır (AB=1x)
            
            // Dikey yarılar
            [0, 1, 4, 5, 8, 9, 12, 13],     // Sol 2 sütun (CD=x0)
            [2, 3, 6, 7, 10, 11, 14, 15],   // Sağ 2 sütun (CD=x1)
            
            // Satır çiftleri
            [0, 1, 2, 3, 8, 9, 10, 11],     // 1. ve 3. satır (AB=0x ve AB=10)
            [4, 5, 6, 7, 12, 13, 14, 15],   // 2. ve 4. satır (AB=01 ve AB=11)
            
            // Sütun çiftleri
            [0, 2, 4, 6, 8, 10, 12, 14],    // 1. ve 3. sütun (CD=00 ve CD=10)
            [1, 3, 5, 7, 9, 11, 13, 15],    // 2. ve 4. sütun (CD=01 ve CD=11)
        ];

        for (const group of groups8) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 8,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }

    find4Groups4Var(minterms) {
        const groups4 = [
            // 2x2 kare gruplar (Gray code düzeni: 00,01,11,10)
            [0, 1, 4, 5],    // Sol üst kare (AB=00,01, CD=00,01)
            [1, 3, 5, 7],    // Sağ üst kare (AB=00,01, CD=01,11)  
            [3, 2, 7, 6],    // Sağ orta kare (AB=00,01, CD=11,10)
            [2, 0, 6, 4],    // Sol orta kare - sarma (AB=00,01, CD=10,00)
            
            [4, 5, 12, 13],  // Sol 2. kare (AB=01,11, CD=00,01)
            [5, 7, 13, 15],  // Sağ 2. kare (AB=01,11, CD=01,11)
            [7, 6, 15, 14],  // Sağ 3. kare (AB=01,11, CD=11,10)
            [6, 4, 14, 12],  // Sol 3. kare - sarma (AB=01,11, CD=10,00)
            
            [12, 13, 8, 9],  // Sol alt kare (AB=11,10, CD=00,01)
            [13, 15, 9, 11], // Sağ alt kare (AB=11,10, CD=01,11)
            [15, 14, 11, 10], // Sağ alt orta kare (AB=11,10, CD=11,10)
            [14, 12, 10, 8], // Sol alt orta kare - sarma (AB=11,10, CD=10,00)
            
            // Yatay bandlar (tam satırlar) - Gray code sırasında
            [0, 1, 3, 2],    // 1. satır (AB=00)
            [4, 5, 7, 6],    // 2. satır (AB=01)
            [12, 13, 15, 14], // 3. satır (AB=11)
            [8, 9, 11, 10],   // 4. satır (AB=10)
            
            // Dikey bandlar (tam sütunlar) - Gray code sırasında
            [0, 4, 12, 8],   // 1. sütun (CD=00)
            [1, 5, 13, 9],   // 2. sütun (CD=01)
            [3, 7, 15, 11],  // 3. sütun (CD=11)
            [2, 6, 14, 10],  // 4. sütun (CD=10)
            
            // Üst-alt sarma kareleri
            [0, 1, 8, 9],    // Sol üst-alt sarma
            [1, 3, 9, 11],   // Orta üst-alt sarma
            [3, 2, 11, 10],  // Sağ üst-alt sarma
            [2, 0, 10, 8],   // Sol kenar sarma
            
            // Sol-sağ sarma kareleri
            [0, 2, 4, 6],    // Sol sarma bandı
            [1, 3, 5, 7],    // Sağ sarma bandı
            [8, 10, 12, 14], // Alt sol sarma bandı
            [9, 11, 13, 15], // Alt sağ sarma bandı
            
            // Köşe dört sarma (köşelerden sarma)
            [0, 2, 8, 10],   // Sol köşe sarması
            [1, 3, 9, 11],   // Sağ köşe sarması
        ];

        for (const group of groups4) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 4,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }

    find2Groups4Var(minterms) {
        const groups2 = [];
        
        // Yatay komşular (aynı satırda Gray code sırasına göre)
        const rows = [
            [0, 1, 3, 2],      // 1. satır
            [4, 5, 7, 6],      // 2. satır  
            [12, 13, 15, 14],  // 3. satır
            [8, 9, 11, 10]     // 4. satır
        ];
        
        for (const row of rows) {
            for (let i = 0; i < row.length; i++) {
                const next = (i + 1) % row.length; // Sarmalı komşu
                groups2.push([row[i], row[next]]);
            }
        }
        
        // Dikey komşular (aynı sütunda)
        const cols = [
            [0, 4, 12, 8],     // 1. sütun
            [1, 5, 13, 9],     // 2. sütun
            [3, 7, 15, 11],    // 3. sütun
            [2, 6, 14, 10]     // 4. sütun
        ];
        
        for (const col of cols) {
            for (let i = 0; i < col.length; i++) {
                const next = (i + 1) % col.length; // Sarmalı komşu
                groups2.push([col[i], col[next]]);
            }
        }

        for (const group of groups2) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 2,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }

    find1Groups4Var(minterms) {
        for (const minterm of minterms) {
            this.allPossibleGroups.push({
                minterms: [minterm],
                size: 1,
                term: this.generateOptimalTerm([minterm]),
                isPrime: this.isPrimeImplicant([minterm], minterms)
            });
        }
    }

    // 3 değişkenli harita için tüm geçerli grupları bul
    findAllGroups3Var(minterms) {
        if (minterms.length === 8) {
            this.allPossibleGroups.push({
                minterms: [...minterms],
                size: 8,
                term: '1',
                isPrime: true
            });
            return;
        }

        this.find4Groups3Var(minterms);
        this.find2Groups3Var(minterms);
        this.find1Groups3Var(minterms);
    }

    find4Groups3Var(minterms) {
        const groups4 = [
            // Tam satırlar (Gray code sırasında)
            [0, 1, 3, 2],    // Üst satır (A=0, BC=00,01,11,10)
            [4, 5, 7, 6],    // Alt satır (A=1, BC=00,01,11,10)
            
            // 2x2 kare gruplar (dikey komşu çiftler)
            [0, 1, 4, 5],    // Sol kare (BC=00,01)
            [1, 3, 5, 7],    // Orta kare (BC=01,11)
            [3, 2, 7, 6],    // Sağ kare (BC=11,10)
            [2, 0, 6, 4],    // Sarma kare (BC=10,00) - sol-sağ sarma
            
            // Dikey sütun çiftleri (sarmalı)
            [0, 2, 4, 6],    // 1. ve 3. sütun (BC=00,10)
            [1, 3, 5, 7],    // 2. ve 4. sütun (BC=01,11)
        ];

        for (const group of groups4) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 4,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }

    find2Groups3Var(minterms) {
        const groups2 = [];
        
        // Yatay komşular (Gray code sırasına göre)
        const rows = [
            [0, 1, 3, 2],      // Üst satır (A=0)
            [4, 5, 7, 6]       // Alt satır (A=1)
        ];
        
        for (const row of rows) {
            for (let i = 0; i < row.length; i++) {
                const next = (i + 1) % row.length;
                groups2.push([row[i], row[next]]);
            }
        }
        
        // Dikey komşular
        groups2.push([0, 4], [1, 5], [2, 6], [3, 7]);

        for (const group of groups2) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 2,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }

    find1Groups3Var(minterms) {
        for (const minterm of minterms) {
            this.allPossibleGroups.push({
                minterms: [minterm],
                size: 1,
                term: this.generateOptimalTerm([minterm]),
                isPrime: this.isPrimeImplicant([minterm], minterms)
            });
        }
    }

    // 2 değişkenli harita için tüm geçerli grupları bul
    findAllGroups2Var(minterms) {
        if (minterms.length === 4) {
            this.allPossibleGroups.push({
                minterms: [...minterms],
                size: 4,
                term: '1',
                isPrime: true
            });
            return;
        }

        this.find2Groups2Var(minterms);
        this.find1Groups2Var(minterms);
    }

    find2Groups2Var(minterms) {
        const groups2 = [
            [0, 1], // Üst satır (A=0)
            [2, 3], // Alt satır (A=1)
            [0, 2], // Sol sütun (B=0)
            [1, 3], // Sağ sütun (B=1)
        ];

        for (const group of groups2) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 2,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }

    find1Groups2Var(minterms) {
        for (const minterm of minterms) {
            this.allPossibleGroups.push({
                minterms: [minterm],
                size: 1,
                term: this.generateOptimalTerm([minterm]),
                isPrime: this.isPrimeImplicant([minterm], minterms)
            });
        }
    }

    // Bir grubun geçerli olup olmadığını kontrol et
    isValidGroup(group, minterms) {
        return group.every(minterm => minterms.includes(minterm));
    }

    // Prime implicant kontrolü
    isPrimeImplicant(group, allMinterms) {
        // Bir grup prime implicant'tır eğer daha büyük bir gruba genişletilemiyorsa
        for (const possibleGroup of this.allPossibleGroups) {
            if (possibleGroup.size > group.length && 
                group.every(minterm => possibleGroup.minterms.includes(minterm))) {
                return false;
            }
        }
        return true;
    }

    // Optimal kapsama bulma (Petrick's method basitleştirilmiş)
    findOptimalCovering(minterms) {
        // Sadece prime implicant'ları al
        const primeImplicants = this.allPossibleGroups.filter(group => 
            group.isPrime || group.size === Math.max(...this.allPossibleGroups.map(g => g.size))
        );

        // Essential prime implicant'ları bul
        const essentialPrimes = this.findEssentialPrimeImplicants(minterms, primeImplicants);
        
        // Kalan mintermleri kapsamak için minimal grup kümesi bul
        const remainingMinterms = minterms.filter(m => 
            !essentialPrimes.some(prime => prime.minterms.includes(m))
        );
        
        const additionalGroups = this.findMinimalCovering(remainingMinterms, primeImplicants);
        
        this.groups = [...essentialPrimes, ...additionalGroups];
    }

    // Essential prime implicant'ları bul
    findEssentialPrimeImplicants(minterms, primeImplicants) {
        const essential = [];
        
        for (const minterm of minterms) {
            // Bu mintermi kapsayan prime implicant'ları bul
            const coveringPrimes = primeImplicants.filter(prime => 
                prime.minterms.includes(minterm)
            );
            
            // Eğer sadece bir prime implicant kapsıyorsa, o essential'dır
            if (coveringPrimes.length === 1) {
                const essentialPrime = coveringPrimes[0];
                if (!essential.some(e => e.minterms.join(',') === essentialPrime.minterms.join(','))) {
                    essential.push(essentialPrime);
                }
            }
        }
        
        return essential;
    }

    // Minimal kapsama bulma (greedy approach)
    findMinimalCovering(remainingMinterms, primeImplicants) {
        if (remainingMinterms.length === 0) return [];
        
        const covering = [];
        const uncovered = new Set(remainingMinterms);
        
        // Büyük grupları öncelikle al
        const sortedPrimes = primeImplicants
            .filter(prime => prime.minterms.some(m => uncovered.has(m)))
            .sort((a, b) => {
                // Önce kapsadığı uncovered minterm sayısına göre
                const aUncovered = a.minterms.filter(m => uncovered.has(m)).length;
                const bUncovered = b.minterms.filter(m => uncovered.has(m)).length;
                if (aUncovered !== bUncovered) return bUncovered - aUncovered;
                
                // Sonra grup boyutuna göre
                return b.size - a.size;
            });

        for (const prime of sortedPrimes) {
            if (prime.minterms.some(m => uncovered.has(m))) {
                covering.push(prime);
                prime.minterms.forEach(m => uncovered.delete(m));
                
                if (uncovered.size === 0) break;
            }
        }
        
        return covering;
    }



    // 3 değişkenli harita için 2'lik grup bulma
    find2Groups3Var(minterms) {
        const groups2 = [];
        
        // Yatay komşular (Gray code sırasına göre)
        const rows = [
            [0, 1, 3, 2],      // Üst satır (A=0)
            [4, 5, 7, 6]       // Alt satır (A=1)
        ];
        
        for (const row of rows) {
            for (let i = 0; i < row.length; i++) {
                const next = (i + 1) % row.length;
                groups2.push([row[i], row[next]]);
            }
        }
        
        // Dikey komşular
        groups2.push([0, 4], [1, 5], [3, 7], [2, 6]);

        for (const group of groups2) {
            if (this.isValidGroup(group, minterms)) {
                this.allPossibleGroups.push({
                    minterms: [...group],
                    size: 2,
                    term: this.generateOptimalTerm(group),
                    isPrime: this.isPrimeImplicant(group, minterms)
                });
            }
        }
    }



    find1Groups(minterms) {
        for (const minterm of minterms) {
            this.allPossibleGroups.push({
                minterms: [minterm],
                size: 1,
                term: this.generateOptimalTerm([minterm]),
                isPrime: this.isPrimeImplicant([minterm], minterms)
            });
        }
    }

    generateOptimalTerm(minterms) {
        if (minterms.length === Math.pow(2, this.variableCount)) {
            return '1'; // Tüm harita doluysa
        }

        // Mintermlerden ortak değişkenleri bul
        const binaryTerms = minterms.map(m => m.toString(2).padStart(this.variableCount, '0'));
        let result = [];

        for (let i = 0; i < this.variableCount; i++) {
            const bits = binaryTerms.map(term => term[i]);
            const uniqueBits = [...new Set(bits)];
            
            if (uniqueBits.length === 1) {
                // Bu pozisyonda tüm mintermlerin aynı değeri var
                if (bits[0] === '0') {
                    result.push(this.variables[i] + "'");
                } else {
                    result.push(this.variables[i]);
                }
            }
            // Farklı değerler varsa bu değişken elimine edilir
        }

        return result.length > 0 ? result.join('') : '1';
    }

    selectOptimalGroups(activeMinterms) {
        // Sadece aktif mintermleri (1'leri) kapsayan minimal grup kümesini bul
        // Don't care'ler (X'ler) grup oluşturmaya yardım eder ama kapsanması zorunlu değil
        
        if (activeMinterms.length === 0) {
            this.groups = [];
            return;
        }

        // Grupları boyutlarına göre büyükten küçüğe sırala
        this.groups.sort((a, b) => b.size - a.size || a.minterms.length - b.minterms.length);

        // Greedy seçim algoritması - sadece aktif mintermleri kapsa
        const selectedGroups = [];
        const coveredMinterms = new Set();

        for (const group of this.groups) {
            // Bu grubun yeni aktif mintermleri kapsayıp kapsamadığını kontrol et
            const uncoveredActiveInGroup = group.minterms.filter(m => 
                activeMinterms.includes(m) && !coveredMinterms.has(m)
            );
            
            if (uncoveredActiveInGroup.length > 0) {
                selectedGroups.push(group);
                // Sadece aktif mintermleri kaplandı olarak işaretle
                uncoveredActiveInGroup.forEach(m => coveredMinterms.add(m));
                
                // Tüm aktif mintermler kaplandıysa dur
                if (coveredMinterms.size === activeMinterms.length) {
                    break;
                }
            }
        }

        this.groups = selectedGroups;
    }

    displayGroups() {
        const container = document.getElementById('groupsList');
        
        if (this.groups.length === 0) {
            container.innerHTML = '<p style="color: #6b7280; font-style: italic;">Henüz grup bulunamadı. "Grupları Bul" butonuna tıklayın.</p>';
            return;
        }

        let html = '';
        this.groups.forEach((group, index) => {
            const groupColorClass = `group-color-${(index % 6) + 1}`;
            html += `
                <div class="group-item ${groupColorClass}" 
                     data-group-index="${index}"
                     onmouseenter="karnoApp.highlightGroup(${index})"
                     onmouseleave="karnoApp.removeGroupHighlight()">
                    <strong>Grup ${index + 1}:</strong> ${group.term}
                    <div class="group-cells">Mintermler: ${group.minterms.join(', ')}</div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    highlightGroups() {
        // Remove existing group highlighting
        document.querySelectorAll('.karno-cell').forEach(cell => {
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}`);
            }
        });

        // Add new group highlighting
        this.groups.forEach((group, index) => {
            group.minterms.forEach(minterm => {
                const cell = document.querySelector(`[data-minterm="${minterm}"]`);
                if (cell) {
                    cell.classList.add(`group-${(index % 6) + 1}`);
                }
            });
        });
    }

    highlightGroup(groupIndex) {
        // Tüm highlight'ları ve grup renklerini temizle
        document.querySelectorAll('.karno-cell').forEach(cell => {
            cell.classList.remove('highlight-hover');
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}-hover`);
                cell.classList.remove(`group-${i}`); // Normal grup renklerini de kaldır
            }
        });

        // Belirtilen grubun tüm hücrelerini highlight et
        if (this.groups[groupIndex]) {
            const groupClass = `group-${(groupIndex % 6) + 1}`;
            const currentGroup = this.groups[groupIndex];
            
            // Sadece bu grubun hücrelerini boyayalım (çakışan hücreleri başka renkle boyamayalım)
            currentGroup.minterms.forEach(minterm => {
                const cell = document.querySelector(`[data-minterm="${minterm}"]`);
                if (cell) {
                    cell.classList.add(`${groupClass}-hover`);
                }
            });
        }
    }

    removeGroupHighlight() {
        // Tüm hover highlight'larını kaldır
        document.querySelectorAll('.karno-cell').forEach(cell => {
            cell.classList.remove('highlight-hover');
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}-hover`);
            }
        });
        
        // Normal grup renklerini geri yükle
        this.highlightGroups();
    }

    // Karno hücresine mouse gelince o hücreyi içeren grupları highlight et
    highlightCellGroups(minterm) {
        console.log('highlightCellGroups çağrıldı, minterm:', minterm);
        
        // Bu hücreyi içeren grupları bul
        const containingGroups = this.groups.filter(group => 
            group.minterms.includes(minterm)
        );
        
        if (containingGroups.length === 0) return;
        
        // Tüm hover highlight'larını kaldır
        document.querySelectorAll('.karno-cell').forEach(cell => {
            cell.classList.remove('highlight-hover');
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}-hover`);
            }
        });
        
        // Sadece ilk grubu vurgula (çakışan hücrelerde karışıklığı önlemek için)ex) => {
        const primaryGroup = containingGroups[0];
        const realGroupIndex = this.groups.indexOf(primaryGroup);
        const groupClass = `group-${(realGroupIndex % 6) + 1}`;    const groupClass = `group-${(realGroupIndex % 6) + 1}`;
        
        // Bu grubun tüm hücrelerini vurgulaula
        primaryGroup.minterms.forEach(mt => {
            const cell = document.querySelector(`[data-minterm="${mt}"]`);ell = document.querySelector(`[data-minterm="${mt}"]`);
            if (cell) {
                cell.classList.add(`${groupClass}-hover`);       cell.classList.add(`${groupClass}-hover`);
            }     }
        });       });
    }        });

    removeCellGroupHighlight() {
        console.log('removeCellGroupHighlight çağrıldı');veCellGroupHighlight() {
        t çağrıldı');
        // Tüm hover highlight'larını kaldır
        document.querySelectorAll('.karno-cell').forEach(cell => {
            cell.classList.remove('highlight-hover');cell').forEach(cell => {
            for (let i = 1; i <= 6; i++) {
                cell.classList.remove(`group-${i}-hover`);or (let i = 1; i <= 6; i++) {
            }     cell.classList.remove(`group-${i}-hover`);
        });    }
        
        // Normal grup renklerini geri yükle
        this.highlightGroups();   // Normal grup renklerini geri yükle
    }        this.highlightGroups();

    clearResults() {
        this.groups = [];
        document.getElementById('groupsList').innerHTML = '<p style="color: #6b7280; font-style: italic;">Henüz grup bulunamadı. "Grupları Bul" butonuna tıklayın.</p>';
        document.getElementById('solutionDisplay').textContent = '';6b7280; font-style: italic;">Henüz grup bulunamadı. "Grupları Bul" butonuna tıklayın.</p>';
        document.getElementById('termCount').textContent = 'Terim sayısı: 0';
        document.getElementById('literalCount').textContent = 'Literal sayısı: 0'; sayısı: 0';
        document.getElementById('circuitDisplay').innerHTML = '';document.getElementById('literalCount').textContent = 'Literal sayısı: 0';
        cuitDisplay').innerHTML = '';
        // Remove group highlighting
        document.querySelectorAll('.karno-cell').forEach(cell => {
            for (let i = 1; i <= 6; i++) {Each(cell => {
                cell.classList.remove(`group-${i}`);or (let i = 1; i <= 6; i++) {
            }     cell.classList.remove(`group-${i}`);
        });       }
    }        });

    // Mantıksal kapı şeması oluşturma
    generateCircuitDiagram() {
        if (this.groups.length === 0) {
            document.getElementById('circuitDisplay').innerHTML = 
                '<div style="text-align: center; color: #64748b; padding: 40px;">Önce grupları bulun ve çözümü gösterin</div>';t.getElementById('circuitDisplay').innerHTML = 
            return;       '<div style="text-align: center; color: #64748b; padding: 40px;">Önce grupları bulun ve çözümü gösterin</div>';
        }            return;

        const isAscii = document.getElementById('circuitDisplay').classList.contains('ascii-mode');
        = document.getElementById('circuitDisplay').classList.contains('ascii-mode');
        if (isAscii) {
            this.generateAsciiCircuit();cii) {
        } else {);
            this.generateSvgCircuit(); else {
        }       this.generateSvgCircuit();
    }        }

    // ASCII sanat ile kapı şeması
    generateAsciiCircuit() {kapı şeması
        let ascii = '';
        const variables = this.getVariableNames();let ascii = '';
        
        ascii += '               MANTIKSAL KAPI ŞEMASI\n';
        ascii += '               ═══════════════════════\n\n';ascii += '               MANTIKSAL KAPI ŞEMASI\n';
          ═══════════════════════\n\n';
        ascii += 'GİRİŞLER:\n';
        variables.forEach(variable => {
            ascii += `${variable} ────┐\n`;
            ascii += `${variable}' ───┤\n`; ascii += `${variable} ────┐\n`;
        });${variable}' ───┤\n`;
        ascii += '\n';        });

        ascii += 'AND KAPILARI:\n';
        this.groups.forEach((group, index) => {
            const termName = group.term === '1' ? 'TRUE' : group.term;
            ascii += `Grup${index + 1}: ${termName}\n`;const termName = group.term === '1' ? 'TRUE' : group.term;
            termName}\n`;
            ascii += '     ┌─────────┐\n';
            const literals = this.parseTermLiterals(group.term);
            literals.forEach((literal, i) => {
                ascii += `${literal.padEnd(4)} ┤   AND   ├─── ${termName}\n`;
                if (i < literals.length - 1) ascii += '     │         │\n'; ascii += `${literal.padEnd(4)} ┤   AND   ├─── ${termName}\n`;
            }); ascii += '     │         │\n';
            ascii += '     └─────────┘\n\n'; });
        });            ascii += '     └─────────┘\n\n';

        if (this.groups.length > 1) {
            ascii += 'OR KAPISI:\n';
            ascii += '     ┌─────────┐\n';
            this.groups.forEach((group, index) => {
                const termName = group.term === '1' ? 'TRUE' : group.term;
                ascii += `${termName.padEnd(8)} ┤   OR    ├─── F\n`;
                if (index < this.groups.length - 1) ascii += '     │         │\n'; ascii += `${termName.padEnd(8)} ┤   OR    ├─── F\n`;
            });th - 1) ascii += '     │         │\n';
            ascii += '     └─────────┘\n\n';   });
        }            ascii += '     └─────────┘\n\n';

        ascii += `ÇIKIŞ: F = ${this.groups.map(g => g.term).join(' + ')}\n`;
        
        document.getElementById('circuitDisplay').innerHTML = `<div class="circuit-ascii">${ascii}</div>`;   
    }        document.getElementById('circuitDisplay').innerHTML = `<div class="circuit-ascii">${ascii}</div>`;

    // SVG kapı şeması
    generateSvgCircuit() {
        const variables = this.getVariableNames();
        const groupCount = this.groups.length;const variables = this.getVariableNames();
        
        // Dinamik viewport tabanlı boyutlandırma
        const viewport = {oyutlandırma
            width: window.innerWidth,
            height: window.innerHeight  width: window.innerWidth,
        };    height: window.innerHeight
        
        // Responsive boyutlar
        let baseWidth = Math.min(1200, viewport.width * 0.9);
        let baseHeight = Math.min(700, viewport.height * 0.6);let baseWidth = Math.min(1200, viewport.width * 0.9);
        port.height * 0.6);
        // Mobil cihazlar için özel ayarlar
        if (viewport.width <= 768) {
            baseWidth = Math.min(800, viewport.width * 0.95);
            baseHeight = Math.min(500, viewport.height * 0.5);   baseWidth = Math.min(800, viewport.width * 0.95);
        }    baseHeight = Math.min(500, viewport.height * 0.5);
        
        // Çoklu OR kapısı için ek genişlik hesaplama (max 3 giriş per kapı)
        let maxOrLevels = 1;in ek genişlik hesaplama (max 3 giriş per kapı)
        if (groupCount > 1) {
            let remaining = groupCount; {
            let levels = 0;unt;
            while (remaining > 1) {
                remaining = Math.ceil(remaining / 3); // Her seviyede max 3 girişing > 1) {
                levels++;   remaining = Math.ceil(remaining / 3); // Her seviyede max 3 giriş
            }
            maxOrLevels = levels;   }
        }
        const orLevelWidth = maxOrLevels * 220; // Her seviye için 220px}
        r seviye için 220px
        // İçerik bazlı genişleme (OR kapıları dahil)
        const width = Math.max(baseWidth, groupCount * 120 + 500 + orLevelWidth);
        const height = Math.max(baseHeight, Math.max(variables.length * 60, groupCount * 80) + 250);const width = Math.max(baseWidth, groupCount * 120 + 500 + orLevelWidth);
        
        let svg = `<svg class="circuit-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
        t-svg" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
        // Gelişmiş arka plan ve grid
        svg += `<defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="1" opacity="0.6"/>d="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            </pattern>width="1" opacity="0.6"/>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />"0%" style="stop-color:#f8fafc;stop-opacity:1" />
            </linearGradient>stop offset="100%" style="stop-color:#f1f5f9;stop-opacity:1" />
        </defs>`;
        svg += `<rect width="${width}" height="${height}" fill="url(#grid)"/>`;
        svg += `<rect width="${width}" height="${height}" fill="url(#bgGradient)" stroke="#cbd5e1" stroke-width="3" rx="15"/>`;svg += `<rect width="${width}" height="${height}" fill="url(#grid)"/>`;
        ill="url(#bgGradient)" stroke="#cbd5e1" stroke-width="3" rx="15"/>`;
        // Başlık ve bölüm etiketleri - daha büyük ve güzel
        svg += `<text x="${width/2}" y="40" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="24" font-weight="bold" fill="#1e3a8a">Boolean Fonksiyon Kapı Şeması</text>`;
        svg += `<text x="150" y="75" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#7c3aed">GİRİŞLER</text>`;nksiyon Kapı Şeması</text>`;
        svg += `<text x="${width/2}" y="75" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#059669">İŞLEM KATLARİ</text>`;
        svg += `<text x="${width-150}" y="75" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#dc2626">ÇIKIŞ</text>`;svg += `<text x="${width/2}" y="75" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#059669">İŞLEM KATLARİ</text>`;
        iddle" font-family="Arial" font-size="16" font-weight="bold" fill="#dc2626">ÇIKIŞ</text>`;
        // BÖLÜM 1: GİRİŞLER VE NOT KAPILARI (Sol - 0-250px)
        const inputX = 60;NOT KAPILARI (Sol - 0-250px)
        const inputStartY = 120;
        const inputSpacing = Math.max(80, (height - 350) / Math.max(variables.length, 4));const inputStartY = 120;
        max(variables.length, 4));
        // Tüm çizgilerin hizalanması için sabit Y koordinatları
        const inputYCoords = {};lanması için sabit Y koordinatları
        const notYCoords = {};const inputYCoords = {};
        
        variables.forEach((variable, index) => {
            const baseY = inputStartY + index * inputSpacing; => {
            inputYCoords[variable] = baseY;
            notYCoords[variable] = baseY + 50; // Sabit 50px offset inputYCoords[variable] = baseY;
        });    notYCoords[variable] = baseY + 50; // Sabit 50px offset
        
        variables.forEach((variable, index) => {
            const y = inputYCoords[variable]; {
            const notY = notYCoords[variable];const y = inputYCoords[variable];
            
            // Gelişmiş giriş etiketi (soldaki pin)
            svg += `<circle cx="30" cy="${y}" r="5" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>`;
            svg += `<text x="50" y="${y + 6}" text-anchor="start" font-family="'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#dc2626">${variable}</text>`;svg += `<circle cx="30" cy="${y}" r="5" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>`;
            ="start" font-family="'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#dc2626">${variable}</text>`;
            // Ana giriş hattı (kalın çizgi) - TAM HİZALI
            svg += `<line x1="35" y1="${y}" x2="${inputX + 140}" y2="${y}" stroke="#1e40af" stroke-width="4"/>`;// Ana giriş hattı (kalın çizgi) - TAM HİZALI
            inputX + 140}" y2="${y}" stroke="#1e40af" stroke-width="4"/>`;
            // NOT kapısı için dal - DİK VE HİZALI
            svg += `<line x1="${inputX + 30}" y1="${y}" x2="${inputX + 30}" y2="${notY}" stroke="#1e40af" stroke-width="3"/>`;
            svg += `<line x1="${inputX + 30}" y1="${notY}" x2="${inputX + 60}" y2="${notY}" stroke="#1e40af" stroke-width="3"/>`;svg += `<line x1="${inputX + 30}" y1="${y}" x2="${inputX + 30}" y2="${notY}" stroke="#1e40af" stroke-width="3"/>`;
             x2="${inputX + 60}" y2="${notY}" stroke="#1e40af" stroke-width="3"/>`;
            // NOT kapısı (üçgen + daire) - PERFECT HİZALI
            svg += `<polygon points="${inputX + 60},${notY - 15} ${inputX + 60},${notY + 15} ${inputX + 90},${notY}" 
                     fill="#f8fafc" stroke="#1e40af" stroke-width="3"/>`;
            svg += `<circle cx="${inputX + 98}" cy="${notY}" r="8" fill="#f8fafc" stroke="#1e40af" stroke-width="3"/>`;
            svg += `<text x="${inputX + 75}" y="${notY + 5}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#1e40af">¬</text>`;svg += `<circle cx="${inputX + 98}" cy="${notY}" r="8" fill="#f8fafc" stroke="#1e40af" stroke-width="3"/>`;
            notY + 5}" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#1e40af">¬</text>`;
            // NOT kapısı çıkış hattı - TAM HİZALI
            svg += `<line x1="${inputX + 106}" y1="${notY}" x2="${inputX + 150}" y2="${notY}" stroke="#1e40af" stroke-width="4"/>`;// NOT kapısı çıkış hattı - TAM HİZALI
            y1="${notY}" x2="${inputX + 150}" y2="${notY}" stroke="#1e40af" stroke-width="4"/>`;
            // Gelişmiş etiketler (sağ tarafta)
            svg += `<text x="${inputX + 160}" y="${y + 6}" text-anchor="start" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#059669">${variable}</text>`;
            svg += `<text x="${inputX + 160}" y="${notY + 6}" text-anchor="start" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#059669">${variable}'</text>`;svg += `<text x="${inputX + 160}" y="${y + 6}" text-anchor="start" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#059669">${variable}</text>`;
             text-anchor="start" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#059669">${variable}'</text>`;
            // Bağlantı noktaları (daireler) - PERFECT HİZALI
            svg += `<circle cx="${inputX + 140}" cy="${y}" r="4" fill="#1e40af"/>`;
            svg += `<circle cx="${inputX + 150}" cy="${notY}" r="4" fill="#1e40af"/>`; svg += `<circle cx="${inputX + 140}" cy="${y}" r="4" fill="#1e40af"/>`;
        });    svg += `<circle cx="${inputX + 150}" cy="${notY}" r="4" fill="#1e40af"/>`;
        
        // BÖLÜM 2: AND KAPILARI (Orta - akıllı konumlandırma)
        const andStartX = 350;RI (Orta - akıllı konumlandırma)
        const andStartY = 140;const andStartX = 350;
        
        // Grup karmaşıklığına göre dikey alan hesaplama
        const maxLiteralsInGroup = Math.max(...this.groups.map(g => this.parseTermLiterals(g.term).length));
        const groupComplexity = this.groups.reduce((sum, g) => sum + this.parseTermLiterals(g.term).length, 0);const maxLiteralsInGroup = Math.max(...this.groups.map(g => this.parseTermLiterals(g.term).length));
        groups.reduce((sum, g) => sum + this.parseTermLiterals(g.term).length, 0);
        // Akıllı spacing algoritması
        const baseSpacing = 100;
        const complexityFactor = Math.max(1, groupComplexity / 10);
        const andSpacing = Math.max(baseSpacing, (height - 400) / Math.max(groupCount, 1));const complexityFactor = Math.max(1, groupComplexity / 10);
        ng, (height - 400) / Math.max(groupCount, 1));
        // Dikey alan hesaplaması için analiz
        const groupLiteralCounts = this.groups.map(g => this.parseTermLiterals(g.term).length);
        const sortedGroupIndices = [...Array(this.groups.length).keys()].sort((a, b) => his.parseTermLiterals(g.term).length);
            groupLiteralCounts[b] - groupLiteralCounts[a]nst sortedGroupIndices = [...Array(this.groups.length).keys()].sort((a, b) => 
        );    groupLiteralCounts[b] - groupLiteralCounts[a]
        
        // Optimal gate yerleşimi için akıllı sıralama
        this.groups.forEach((group, originalIndex) => {
            const sortedIndex = sortedGroupIndices.findIndex(i => i === originalIndex); originalIndex) => {
            const andX = andStartX; => i === originalIndex);
            const andY = andStartY + sortedIndex * andSpacing;
            const literals = this.parseTermLiterals(group.term);
            const gateHeight = Math.max(60, literals.length * 25 + 20);const literals = this.parseTermLiterals(group.term);
            als.length * 25 + 20);
            // Grup numarası etiketi - daha büyük
            svg += `<text x="${andX - 40}" y="${andY + gateHeight/2 + 6}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#7c3aed">G${originalIndex + 1}</text>`;// Grup numarası etiketi - daha büyük
            ht/2 + 6}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#7c3aed">G${originalIndex + 1}</text>`;
            // AND kapısı gövdesi (daha büyük ve güzel tasarım)
            const gateWidth = 100;
            svg += `<rect x="${andX}" y="${andY}" width="${gateWidth * 0.6}" height="${gateHeight}" 
                     fill="#f8fafc" stroke="#059669" stroke-width="4" rx="8"/>`;dth * 0.6}" height="${gateHeight}" 
            svg += `<path d="M ${andX + gateWidth * 0.6} ${andY} 
                           A ${gateHeight/2} ${gateHeight/2} 0 0 1 ${andX + gateWidth * 0.6} ${andY + gateHeight} ${andX + gateWidth * 0.6} ${andY} 
                           Z"  + gateWidth * 0.6} ${andY + gateHeight}
                     fill="#f8fafc" stroke="#059669" stroke-width="4"/>`;               Z" 
            oke="#059669" stroke-width="4"/>`;
            // AND etiketi - daha büyük
            svg += `<text x="${andX + gateWidth * 0.3}" y="${andY + gateHeight/2 + 6}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#059669">AND</text>`;// AND etiketi - daha büyük
            gateHeight/2 + 6}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#059669">AND</text>`;
            // AND kapısı girişleri (SİMETRİK ve DÜZGÜN aralıklarla)
            const inputSpacingInGate = Math.min(20, (gateHeight - 20) / Math.max(literals.length - 1, 1));
            const inputStartInGate = andY + (gateHeight - (literals.length - 1) * inputSpacingInGate) / 2;const inputSpacingInGate = Math.min(20, (gateHeight - 20) / Math.max(literals.length - 1, 1));
             (literals.length - 1) * inputSpacingInGate) / 2;
            literals.forEach((literal, literalIndex) => {
                // SİMETRİK giriş konumlandırma
                const inputY = inputStartInGate + literalIndex * inputSpacingInGate;// SİMETRİK giriş konumlandırma
                ex * inputSpacingInGate;
                // Giriş pini ve etiketi - kalın ve simetrik
                svg += `<line x1="${andX - 80}" y1="${inputY}" x2="${andX}" y2="${inputY}" stroke="#7c3aed" stroke-width="3"/>`;
                svg += `<circle cx="${andX - 8}" cy="${inputY}" r="3" fill="#059669"/>`;
                svg += `<text x="${andX - 90}" y="${inputY + 6}" text-anchor="end" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#7c3aed">${literal}</text>`;svg += `<circle cx="${andX - 8}" cy="${inputY}" r="3" fill="#059669"/>`;
                r="end" font-family="'Segoe UI', Arial" font-size="14" font-weight="bold" fill="#7c3aed">${literal}</text>`;
                // Girişten uygun değişken hattına SİMETRİK HİZALI bağlantı
                const varName = literal.replace("'", "");RİK HİZALI bağlantı
                const isNegated = literal.includes("'");const varName = literal.replace("'", "");
                
                if (inputYCoords[varName] !== undefined) {
                    const sourceY = isNegated ? notYCoords[varName] : inputYCoords[varName];
                    const sourceX = inputX + (isNegated ? 150 : 140);const sourceY = isNegated ? notYCoords[varName] : inputYCoords[varName];
                    140);
                    // SİMETRİK routing - grid bazlı positioning
                    const horizontalOffset = 60 + sortedIndex * 25;ning
                    const midX = sourceX + horizontalOffset;const horizontalOffset = 60 + sortedIndex * 25;
                    
                    // PERFECT horizontal ve vertical hizalama
                    svg += `<line x1="${sourceX}" y1="${sourceY}" x2="${midX}" y2="${sourceY}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4,4"/>`;
                    svg += `<line x1="${midX}" y1="${sourceY}" x2="${midX}" y2="${inputY}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4,4"/>`;
                    svg += `<line x1="${midX}" y1="${inputY}" x2="${andX - 80}" y2="${inputY}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4,4"/>`;svg += `<line x1="${midX}" y1="${sourceY}" x2="${midX}" y2="${inputY}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4,4"/>`;
                    utY}" x2="${andX - 80}" y2="${inputY}" stroke="#6366f1" stroke-width="2" stroke-dasharray="4,4"/>`;
                    // PERFECT hizalı bağlantı noktaları
                    svg += `<circle cx="${sourceX}" cy="${sourceY}" r="3" fill="#6366f1"/>`;
                    svg += `<circle cx="${midX}" cy="${sourceY}" r="3" fill="#6366f1"/>`;/>`;
                    svg += `<circle cx="${midX}" cy="${inputY}" r="3" fill="#6366f1"/>`;
                    svg += `<circle cx="${andX - 80}" cy="${inputY}" r="3" fill="#6366f1"/>`;   svg += `<circle cx="${midX}" cy="${inputY}" r="3" fill="#6366f1"/>`;
                }     svg += `<circle cx="${andX - 80}" cy="${inputY}" r="3" fill="#6366f1"/>`;
            });    }
            
            // AND kapısı çıkışı - daha kalın
            const outputX = andX + gateWidth;
            const outputY = andY + gateHeight / 2;
            svg += `<line x1="${outputX}" y1="${outputY}" x2="${outputX + 80}" y2="${outputY}" stroke="#059669" stroke-width="4"/>`;
            svg += `<circle cx="${outputX + 80}" cy="${outputY}" r="5" fill="#059669"/>`;svg += `<line x1="${outputX}" y1="${outputY}" x2="${outputX + 80}" y2="${outputY}" stroke="#059669" stroke-width="4"/>`;
            
            // Terim etiketi - ÇİZGİNİN ALTINA yerleştir (ara bağlantı ile çakışmayı önle)
            const termName = group.term === '1' ? '1' : group.term;
            svg += `<text x="${outputX + 40}" y="${outputY + 25}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#059669">${termName}</text>`; const termName = group.term === '1' ? '1' : group.term;
        });    svg += `<text x="${outputX + 40}" y="${outputY + 25}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#059669">${termName}</text>`;
        
        // BÖLÜM 3: OR KAPILARI VE ÇIKIŞ (Sağ - Akıllı Hiyerarşik Tasarım)
        const orStartX = width - 450;// BÖLÜM 3: OR KAPILARI VE ÇIKIŞ (Sağ - Akıllı Hiyerarşik Tasarım)
        
        if (this.groups.length > 1) {
            // Çoklu OR kapısı stratejisi (max 3 giriş per kapı)
            const maxInputsPerGate = 3;// Çoklu OR kapısı stratejisi (max 3 giriş per kapı)
            
            // OR kapısı hierarşisi hesapla
            const orLevels = [];
            let currentInputs = [...sortedGroupIndices];;
            let levelIndex = 0;let currentInputs = [...sortedGroupIndices];
            
            // Her seviyede kapıları oluştur
            while (currentInputs.length > 1) {luştur
                const levelGates = [];
                for (let i = 0; i < currentInputs.length; i += maxInputsPerGate) {
                    const gateInputs = currentInputs.slice(i, i + maxInputsPerGate);urrentInputs.length; i += maxInputsPerGate) {
                    levelGates.push({entInputs.slice(i, i + maxInputsPerGate);
                        inputs: gateInputs,
                        isFirstLevel: levelIndex === 0,
                        gateIndex: Math.floor(i / maxInputsPerGate) isFirstLevel: levelIndex === 0,
                    });       gateIndex: Math.floor(i / maxInputsPerGate)
                }
                orLevels.push(levelGates);}
                
                // Sonraki seviye için çıkış indekslerini hazırla
                currentInputs = levelGates.map((_, idx) => idx);viye için çıkış indekslerini hazırla
                levelIndex++;   currentInputs = levelGates.map((_, idx) => idx);
            }    levelIndex++;
            
            let previousLevelOutputs = []; // Önceki seviyedeki çıkışları sakla
            Önceki seviyedeki çıkışları sakla
            // Her seviye için OR kapıları çiz
            orLevels.forEach((level, levelIdx) => {
                const levelX = orStartX + levelIdx * 220;
                const totalLevelHeight = level.length * 120 + (level.length - 1) * 30;
                const levelStartY = andStartY + (sortedGroupIndices.length * andSpacing - totalLevelHeight) / 2;const totalLevelHeight = level.length * 120 + (level.length - 1) * 30;
                 (sortedGroupIndices.length * andSpacing - totalLevelHeight) / 2;
                const currentLevelOutputs = [];
                
                level.forEach((gate, gateIdx) => {
                    const numInputs = gate.inputs.length;l.forEach((gate, gateIdx) => {
                    
                    // SİMETRİK OR kapısı boyutları - 2-3 giriş için optimize
                    const orWidth = 120;boyutları - 2-3 giriş için optimize
                    const baseHeight = 80;
                    const extraHeight = Math.max(0, (numInputs - 2) * 20);
                    const orHeight = baseHeight + extraHeight;
                    const gateY = levelStartY + gateIdx * (orHeight + 40);const orHeight = baseHeight + extraHeight;
                    ht + 40);
                    // OR kapısı şekli (IEEE standard - simetrik)
                    svg += `<path d="M ${levelX} ${gateY} 
                                   Q ${levelX + 30} ${gateY + orHeight/2} ${levelX} ${gateY + orHeight}
                                   L ${levelX + orWidth * 0.7} ${gateY + orHeight}
                                   Q ${levelX + orWidth} ${gateY + orHeight * 0.75} ${levelX + orWidth} ${gateY + orHeight/2}
                                   Q ${levelX + orWidth} ${gateY + orHeight * 0.25} ${levelX + orWidth * 0.7} ${gateY}} ${gateY + orHeight * 0.75} ${levelX + orWidth} ${gateY + orHeight/2}
                                   L ${levelX} ${gateY}{levelX + orWidth} ${gateY + orHeight * 0.25} ${levelX + orWidth * 0.7} ${gateY}
                                   Z" 
                             fill="#fef7f7" stroke="#dc2626" stroke-width="3"/>`;               Z" 
                     stroke="#dc2626" stroke-width="3"/>`;
                    // OR etiketi - merkezi
                    svg += `<text x="${levelX + orWidth/2}" y="${gateY + orHeight/2 + 6}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#dc2626">OR</text>`;// OR etiketi - merkezi
                    ight/2 + 6}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#dc2626">OR</text>`;
                    // SİMETRİK girişler - 2-3 giriş için perfect positioning
                    let inputPositions = []; 2-3 giriş için perfect positioning
                    if (numInputs === 2) {
                        // 2 giriş: üst ve alt simetrik
                        inputPositions = [trik
                            gateY + orHeight * 0.3,
                            gateY + orHeight * 0.7  gateY + orHeight * 0.3,
                        ];7
                    } else if (numInputs === 3) {
                        // 3 giriş: üst, orta, alt simetrik== 3) {
                        inputPositions = [imetrik
                            gateY + orHeight * 0.25,
                            gateY + orHeight * 0.5,,
                            gateY + orHeight * 0.75  gateY + orHeight * 0.5,
                        ];gateY + orHeight * 0.75
                    } else {
                        // 4+ giriş: eşit aralıklı
                        for (let i = 0; i < numInputs; i++) {
                            inputPositions.push(gateY + orHeight * 0.2 + (i * orHeight * 0.6) / (numInputs - 1));or (let i = 0; i < numInputs; i++) {
                        }       inputPositions.push(gateY + orHeight * 0.2 + (i * orHeight * 0.6) / (numInputs - 1));
                    }    }
                    
                    gate.inputs.forEach((inputRef, inputIdx) => {
                        const inputY = inputPositions[inputIdx];.inputs.forEach((inputRef, inputIdx) => {
                        = inputPositions[inputIdx];
                        // Giriş pini
                        svg += `<line x1="${levelX - 50}" y1="${inputY}" x2="${levelX}" y2="${inputY}" stroke="#dc2626" stroke-width="3"/>`;
                        svg += `<circle cx="${levelX - 5}" cy="${inputY}" r="3" fill="#dc2626"/>`;svg += `<line x1="${levelX - 50}" y1="${inputY}" x2="${levelX}" y2="${inputY}" stroke="#dc2626" stroke-width="3"/>`;
                        ${levelX - 5}" cy="${inputY}" r="3" fill="#dc2626"/>`;
                        // Kaynak bağlantısı
                        let sourceX, sourceY, connectionColor, termLabel;// Kaynak bağlantısı
                        nnectionColor, termLabel;
                        if (gate.isFirstLevel) {
                            // İlk seviye: AND çıkışlarından
                            const sortedIndex = sortedGroupIndices.indexOf(inputRef);n
                            sourceX = andStartX + 100 + 80;;
                            sourceY = andStartY + sortedIndex * andSpacing + 60 / 2;80;
                            connectionColor = "#f59e0b";Spacing + 60 / 2;
                            termLabel = this.groups[inputRef].term;ectionColor = "#f59e0b";
                        } else {
                            // Sonraki seviyeler: Önceki OR çıkışlarından
                            const prevOutput = previousLevelOutputs[inputRef];nceki OR çıkışlarından
                            sourceX = prevOutput.x;iousLevelOutputs[inputRef];
                            sourceY = prevOutput.y;
                            connectionColor = "#8b5cf6";
                            termLabel = `T${inputRef + 1}`;   connectionColor = "#8b5cf6";
                        }    termLabel = `T${inputRef + 1}`;
                        
                        // Akıllı routing - mükemmel hizalama
                        const routingX = sourceX + 60 + levelIdx * 30;// Akıllı routing - mükemmel hizalama
                        + levelIdx * 30;
                        // Horizontal line from source
                        svg += `<line x1="${sourceX}" y1="${sourceY}" x2="${routingX}" y2="${sourceY}" stroke="${connectionColor}" stroke-width="3" stroke-dasharray="6,4"/>`;
                        svg += `<circle cx="${sourceX}" cy="${sourceY}" r="3" fill="${connectionColor}"/>`;e="${connectionColor}" stroke-width="3" stroke-dasharray="6,4"/>`;
                        svg += `<circle cx="${routingX}" cy="${sourceY}" r="3" fill="${connectionColor}"/>`;svg += `<circle cx="${sourceX}" cy="${sourceY}" r="3" fill="${connectionColor}"/>`;
                        " cy="${sourceY}" r="3" fill="${connectionColor}"/>`;
                        // Vertical line to input level
                        if (sourceY !== inputY) {
                            svg += `<line x1="${routingX}" y1="${sourceY}" x2="${routingX}" y2="${inputY}" stroke="${connectionColor}" stroke-width="3" stroke-dasharray="6,4"/>`;
                            svg += `<circle cx="${routingX}" cy="${inputY}" r="3" fill="${connectionColor}"/>`;   svg += `<line x1="${routingX}" y1="${sourceY}" x2="${routingX}" y2="${inputY}" stroke="${connectionColor}" stroke-width="3" stroke-dasharray="6,4"/>`;
                        }    svg += `<circle cx="${routingX}" cy="${inputY}" r="3" fill="${connectionColor}"/>`;
                        
                        // Final horizontal to gate
                        svg += `<line x1="${routingX}" y1="${inputY}" x2="${levelX - 50}" y2="${inputY}" stroke="${connectionColor}" stroke-width="3" stroke-dasharray="6,4"/>`;
                        svg += `<circle cx="${levelX - 50}" cy="${inputY}" r="3" fill="${connectionColor}"/>`;svg += `<line x1="${routingX}" y1="${inputY}" x2="${levelX - 50}" y2="${inputY}" stroke="${connectionColor}" stroke-width="3" stroke-dasharray="6,4"/>`;
                        cy="${inputY}" r="3" fill="${connectionColor}"/>`;
                        // Bağlantı etiketi - çakışmayı önle
                        const labelX = routingX;
                        const labelY = Math.min(sourceY, inputY) + Math.abs(sourceY - inputY)/2 + (sourceY === inputY ? -15 : 20);
                        svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="11" font-weight="bold" fill="${connectionColor}">${termLabel}</text>`; const labelY = Math.min(sourceY, inputY) + Math.abs(sourceY - inputY)/2 + (sourceY === inputY ? -15 : 20);
                    });    svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="11" font-weight="bold" fill="${connectionColor}">${termLabel}</text>`;
                    
                    // OR çıkışı
                    const outputX = levelX + orWidth;
                    const outputY = gateY + orHeight / 2;
                    svg += `<line x1="${outputX}" y1="${outputY}" x2="${outputX + 80}" y2="${outputY}" stroke="#dc2626" stroke-width="4"/>`;
                    svg += `<circle cx="${outputX + 80}" cy="${outputY}" r="4" fill="#dc2626"/>`;svg += `<line x1="${outputX}" y1="${outputY}" x2="${outputX + 80}" y2="${outputY}" stroke="#dc2626" stroke-width="4"/>`;
                    putX + 80}" cy="${outputY}" r="4" fill="#dc2626"/>`;
                    // Çıkış bilgisini kaydet
                    // Çıkış bilgisini kaydet
                    currentLevelOutputs.push({
                        x: outputX + 80,
                        y: outputY,
                        level: levelIdx,
                        gate: gateIdx
                    });
                });
                
                previousLevelOutputs = currentLevelOutputs;
            });
            
            // Final çıkış (son seviyedeki tek OR'dan)
            const finalOutput = previousLevelOutputs[0]; // Son seviyede tek çıkış
            const finalOutputX = finalOutput.x;
            const finalOutputY = finalOutput.y;
            
            svg += `<line x1="${finalOutputX}" y1="${finalOutputY}" x2="${finalOutputX + 80}" y2="${finalOutputY}" stroke="#dc2626" stroke-width="5"/>`;
            svg += `<circle cx="${finalOutputX + 80}" cy="${finalOutputY}" r="8" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>`;
            svg += `<text x="${finalOutputX + 100}" y="${finalOutputY + 8}" text-anchor="start" font-family="'Segoe UI', Arial" font-size="22" font-weight="bold" fill="#dc2626">F</text>`;
            
            // Final formül kutusu
            const formulaText = `F = ${this.groups.map(g => g.term).join(' + ')}`;
            const boxWidth = Math.max(220, formulaText.length * 9 + 30);
            svg += `<rect x="${finalOutputX + 130}" y="${finalOutputY - 25}" width="${boxWidth}" height="50" 
                     fill="#fef2f2" stroke="#dc2626" stroke-width="3" rx="12"/>`;
            svg += `<text x="${finalOutputX + 130 + boxWidth/2}" y="${finalOutputY + 8}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="15" font-weight="bold" fill="#dc2626">
                     ${formulaText}</text>`;
        } else {
            // Tek grup varsa direkt çıkış - gelişmiş
            const singleOutputX = andStartX + 100 + 80;
            const singleOutputY = andStartY + 60 / 2;
            svg += `<line x1="${singleOutputX}" y1="${singleOutputY}" x2="${singleOutputX + 120}" y2="${singleOutputY}" stroke="#dc2626" stroke-width="5"/>`;
            
            // Tek çıkış pini - daha büyük
            svg += `<circle cx="${singleOutputX + 120}" cy="${singleOutputY}" r="8" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>`;
            svg += `<text x="${singleOutputX + 145}" y="${singleOutputY + 8}" text-anchor="start" font-family="'Segoe UI', Arial" font-size="22" font-weight="bold" fill="#dc2626">F</text>`;
            
            // Tek çıkış kutusu - güzel tasarım
            const formulaText = `F = ${this.groups[0].term}`;
            const boxWidth = Math.max(200, formulaText.length * 10 + 30);
            svg += `<rect x="${singleOutputX + 170}" y="${singleOutputY - 25}" width="${boxWidth}" height="50" 
                     fill="#fef2f2" stroke="#dc2626" stroke-width="3" rx="12"/>`;
            svg += `<text x="${singleOutputX + 170 + boxWidth/2}" y="${singleOutputY + 8}" text-anchor="middle" font-family="'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#dc2626">
                     ${formulaText}</text>`;
        }
        
        // Gelişmiş lejant (alt kısım) - çok detaylı
        const legendY = height - 120;
        svg += `<rect x="40" y="${legendY}" width="400" height="100" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="12"/>`;
        svg += `<text x="50" y="${legendY + 25}" font-family="'Segoe UI', Arial" font-size="16" font-weight="bold" fill="#1e3a8a">Lejant ve Sinyal Türleri:</text>`;
        
        // Lejant öğeleri - gelişmiş
        const legendItems = [
            {color: "#1e40af", text: "Ana Sinyal", width: 4, dash: "none"},
            {color: "#6366f1", text: "Giriş Bağlantısı", width: 2, dash: "4,4"},
            {color: "#f59e0b", text: "Ara Bağlantı", width: 3, dash: "5,5"},
            {color: "#dc2626", text: "Final Çıkış", width: 5, dash: "none"}
        ];
        
        legendItems.forEach((item, index) => {
            const x = 50 + index * 90;
            const y = legendY + 50;
            
            svg += `<line x1="${x}" y1="${y}" x2="${x + 30}" y2="${y}" stroke="${item.color}" stroke-width="${item.width}" stroke-dasharray="${item.dash}"/>`;
            svg += `<text x="${x}" y="${y + 20}" font-family="Arial" font-size="11" font-weight="bold" fill="${item.color}">${item.text}</text>`;
        });
        
        // Bağlantı noktası örneği
        svg += `<circle cx="390" cy="${legendY + 50}" r="4" fill="#059669"/>`;
        svg += `<text x="385" y="${legendY + 75}" font-family="Arial" font-size="11" font-weight="bold" fill="#059669">Bağlantı</text>`;
        
        svg += '</svg>';
        
        document.getElementById('circuitDisplay').innerHTML = svg;
    }

    // Terim literallerini parse etme
    parseTermLiterals(term) {
        if (term === '1') return ['1'];
        if (term === '0') return ['0'];
        
        const literals = [];
        let i = 0;
        while (i < term.length) {
            let literal = term[i];
            if (i + 1 < term.length && term[i + 1] === "'") {
                literal += "'";
                i++;
            }
            literals.push(literal);
            i++;
        }
        return literals;
    }

    // Değişken isimlerini alma
    getVariableNames() {
        if (this.variableCount === 2) return ['A', 'B'];
        if (this.variableCount === 3) return ['A', 'B', 'C'];
        if (this.variableCount === 4) return ['A', 'B', 'C', 'D'];
        return [];
    }

    showSolution() {
        if (this.groups.length === 0) {
            this.findGroups();
        }

        let solution = '';
        let termCount = 0;
        let literalCount = 0;

        if (this.groups.length === 0) {
            solution = 'F = 0';
        } else {
            const terms = this.groups.map(group => {
                termCount++;
                literalCount += group.term.replace(/'/g, '').length;
                return group.term;
            });
            solution = 'F = ' + terms.join(' + ');
        }

        document.getElementById('solutionDisplay').textContent = solution;
        document.getElementById('termCount').textContent = `Terim sayısı: ${termCount}`;
        document.getElementById('literalCount').textContent = `Literal sayısı: ${literalCount}`;
        
        // Kapı şemasını otomatik oluştur
        this.generateCircuitDiagram();
    }

    // Paralaks Efekti
    initParallax() {
        const circuitSection = document.querySelector('.circuit-section');
        const title = document.querySelector('.section-title');
        const description = document.querySelector('.section-description');
        
        // Scroll event listener
        window.addEventListener('scroll', () => {
            if (!circuitSection) return;
            
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            
            // Paralaks efekti
            circuitSection.style.transform = `translate3d(0, ${rate}px, 0)`;
            
            // Görünürlük kontrolü
            const rect = circuitSection.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (rect.top < windowHeight && rect.bottom > 0) {
                // Görünür olduğunda animasyonları başlat
                title.style.animation = 'fadeInUp 0.6s ease-out forwards';
                description.style.animation = 'fadeInUp 0.6s ease-out 0.2s forwards';
            }
        });
        
        // Smooth scroll to circuit section
        document.getElementById('showCircuitBtn').addEventListener('click', (e) => {
            e.preventDefault();
            circuitSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event çalıştı');
    karnoApp = new KarnoMap();
    console.log('karnoApp oluşturuldu:', karnoApp);
    window.karnoApp = karnoApp; // Global erişim için
    console.log('Global karnoApp tanımlandı');
    
    // Kapı şeması butonları
    document.getElementById('showCircuitBtn').addEventListener('click', () => {
        karnoApp.generateCircuitDiagram();
    });
    
    document.getElementById('toggleCircuitStyle').addEventListener('click', () => {
        const display = document.getElementById('circuitDisplay');
        const button = document.getElementById('toggleCircuitStyle');
        display.classList.toggle('ascii-mode');
        
        if (display.classList.contains('ascii-mode')) {
            button.innerHTML = '<i class="fas fa-sitemap"></i> SVG Görünüm';
        } else {
            button.innerHTML = '<i class="fas fa-code"></i> ASCII Görünüm';
        }
        
        karnoApp.generateCircuitDiagram();
    });
    
    // Window resize olayında SVG'yi yeniden çiz (debounce ile)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Eğer circuit gösteriliyorsa ve SVG modundaysa yeniden çiz
            const circuitDisplay = document.getElementById('circuitDisplay');
            if (circuitDisplay.innerHTML.includes('<svg') && karnoApp.groups.length > 0) {
                karnoApp.generateSvgCircuit();
            }
        }, 250); // 250ms debounce
    });

    karnoApp.generateCircuitDiagram();
});

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    karnoApp = new KarnoMap();
});
