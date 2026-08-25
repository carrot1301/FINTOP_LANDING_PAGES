const guideTopics = {
    trading: {
        label: "Giao dịch & Đầu tư",
        title: "Lộ trình giao dịch có kỷ luật",
        intro: "Bộ hướng dẫn demo giúp người dùng đi từ chọn cổ phiếu, lập kế hoạch giao dịch đến quản trị rủi ro theo một checklist rõ ràng.",
        lessons: [
            ["Xác định khẩu vị rủi ro", "Chọn tỷ trọng vốn, mức cắt lỗ và số mã tối đa trong danh mục."],
            ["Lập watchlist", "Lọc nhóm ngành, vốn hóa, thanh khoản và trạng thái dòng tiền."],
            ["Kế hoạch vào lệnh", "Đặt vùng mua, vùng xác nhận, vùng quản trị rủi ro trước khi hành động."],
            ["Nhật ký sau giao dịch", "Ghi lại lý do mua, biến động thực tế và bài học sau mỗi vị thế."]
        ],
        checklist: ["Chỉ giải ngân khi cổ phiếu còn trong vùng kế hoạch.", "Không để một mã vượt quá tỷ trọng đã đặt.", "Cập nhật trạng thái danh mục sau mỗi phiên quan trọng."],
        rows: [
            ["FPT", "Theo dõi", "Chờ xác nhận vượt kháng cự"],
            ["HPG", "Tích lũy", "Ưu tiên mua từng phần"],
            ["VCB", "Nắm giữ", "Rủi ro thấp, xu hướng ổn định"]
        ]
    },
    ta: {
        label: "Phân tích kỹ thuật (TA)",
        title: "Kiến thức Phân tích kỹ thuật (19 nội dung)",
        intro: "Danh mục 19 bài học và video hướng dẫn đọc xu hướng, nến Nhật, Bollinger Band, MA, RSI, MACD, Fibonacci, Ichimoku và Elliott.",
        lessons: [
            ["Xu hướng chính", "Nhận biết giá đang nằm trên hoặc dưới các đường trung bình quan trọng."],
            ["Vùng hỗ trợ", "Đánh dấu vùng giá có xác suất xuất hiện lực cầu."],
            ["Xung lực RSI", "Theo dõi trạng thái quá mua, quá bán và phân kỳ."],
            ["Mẫu nến xác nhận", "Ưu tiên tín hiệu có thanh khoản và xu hướng ủng hộ."]
        ],
        checklist: ["Ưu tiên cổ phiếu có giá trên MA20 và MA50.", "Không mua đuổi khi RSI đã nóng và giá xa nền tích lũy.", "Kết hợp tín hiệu kỹ thuật với thanh khoản."],
        rows: [
            ["TA1: Hướng dẫn đọc đồ thị nến Candelstick", "https://www.youtube.com/watch?v=kSTFPbaopgc&list=LLt0u"],
            ["TA2: 10 mẫu nến cơ bản sử dụng trong dự đoán giá tăng giảm", "https://www.youtube.com/watch?v=j_WM8iYm50w"],
            ["TA3: 11 mô hình nến đảo chiều P1", "https://www.youtube.com/watch?v=zsasLAmvJMI"],
            ["TA4: 11 mô hình nến đảo chiều P2", "https://www.youtube.com/watch?v=EEHw8qQx3H4"],
            ["TA5: Hướng dẫn sử dụng BB (BollingerBand) trong PTKT", "https://www.youtube.com/watch?v=9vRZKA_-A5I"],
            ["TA6: Hướng dẫn sử dụng MA trong phân tích kỹ thuật (PTKT)", "https://www.youtube.com/watch?v=xRWoicbS0vI&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=11"],
            ["TA7: Sử dụng đường trung bình EMA làm mức hỗ trợ và kháng cự", "https://www.youtube.com/watch?v=FrvIetAUZaY&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=13"],
            ["TA8: Hướng dẫn sử dụng RSI trong xu hướng giá", "https://www.youtube.com/watch?v=DV09GlX9100&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=6"],
            ["TA9: Phương pháp DCA trung bình giá", "https://www.youtube.com/watch?v=Z2Uw0HpHYaQ&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=28"],
            ["TA10: Hướng dẫn sử dụng MACD", "https://www.youtube.com/watch?v=YrOkTkgi1Zo&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=14"],
            ["TA11: Hướng dẫn sử dụng Finbonaci", "https://www.youtube.com/watch?v=WB3XirugOXc&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=17"],
            ["TA12: Hướng dẫn sử dụng Mây Ichimoku", "https://www.youtube.com/watch?v=C6icpoSDaL8&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=19"],
            ["TA13: Lý thuyết Supply Demand | Cách vẽ kháng cự hỗ trợ và Trendline", "https://www.youtube.com/watch?v=Bd7z5BCCICs&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=7"],
            ["TA14: Mô hình giá Vai - Đầu - Vai thuận và ngược", "https://www.youtube.com/watch?v=tuflpQHeTLk&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=16"],
            ["TA15: Mô hình giá 3 đỉnh 3 đáy và 2 đỉnh 2 đáy", "https://www.youtube.com/watch?v=P3cWP9zg0Ww&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=10"],
            ["TA16: Điểm Break-out là gì? Phân biệt điểm phá ngưỡng thật giả?", "https://www.youtube.com/watch?v=vQwS1mixc6A&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=18"],
            ["TA nâng cao P1 | Phân tích đa khung thời gian 1.1 | Trader phải biết", "https://www.youtube.com/watch?v=BnC7mjhvmNU&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=21"],
            ["TA nâng cao P2 | Phân tích đa khung thời gian 1.2 | Thực hành Trade", "https://www.youtube.com/watch?v=la9_TymCvj0&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=15"],
            ["TA nâng cao P3 | Elliott nâng cao | Đặc điểm và chiến thuật trade", "https://www.youtube.com/watch?v=z2Gjv8OerK0&list=RDCMUCL9RiCSlIhu6f1JbK943CgQ&index=5"]
        ]
    },
    fa: {
        label: "Phân tích cơ bản (FA)",
        title: "Kiến thức Phân tích cơ bản (4 nội dung)",
        intro: "Danh mục 4 bài viết hướng dẫn đọc báo cáo tài chính, chiến lược nắm giữ cổ phiếu và định giá dòng tiền.",
        lessons: [
            ["Tăng trưởng", "So sánh doanh thu và lợi nhuận theo quý, theo năm."],
            ["Biên lợi nhuận", "Đánh giá khả năng giữ lợi nhuận khi chi phí biến động."],
            ["Cấu trúc tài chính", "Theo dõi nợ vay, dòng tiền và khả năng thanh toán."],
            ["Định giá", "Đặt P/E, P/B trong tương quan ngành và chu kỳ lợi nhuận."]
        ],
        checklist: ["Ưu tiên doanh nghiệp tăng trưởng đều và dòng tiền rõ.", "So sánh định giá với chính lịch sử doanh nghiệp.", "Đọc báo cáo cùng bối cảnh ngành."],
        rows: [
            ["Tìm hiểu cơ hội đầu tư khi đọc Báo cáo tài chính", "https://chienthangthitruong.com/tim-kiem-co-hoi-dau-tu-khi-doc-bao-cao-tai-chinh/"],
            ["Chiến lược đầu tư nắm giữ cổ phiếu tốt", "https://chienthangthitruong.com/chien-luoc-dau-tu-nam-giu-co-phieu-tot/"],
            ["Phương pháp chiết khấu dòng tiền", "https://chienthangthitruong.com/phuong-phap-chiet-khau-dong-tien/"],
            ["Phương pháp phân tích dòng tiền đơn giản", "https://chienthangthitruong.com/phuong-phap-phan-tich-dong-tien-don-gian/"]
        ]
    },
    library: {
        label: "Tủ sách đầu tư",
        title: "Thư viện học tập theo tình huống",
        intro: "Không gian demo gom các mẫu checklist, case study và tài liệu nền tảng để người dùng luyện tư duy đầu tư có hệ thống.",
        lessons: [
            ["Checklist trước phiên", "Các điểm cần xem trước khi thị trường mở cửa."],
            ["Case study cổ phiếu", "Mổ xẻ một nhịp tăng, một cú rơi và cách quản trị vị thế."],
            ["Mẫu nhật ký", "Khung ghi chú quyết định mua bán và cảm xúc giao dịch."],
            ["Bộ thuật ngữ", "Giải thích nhanh các khái niệm thường gặp trên FinTop DATA."]
        ],
        checklist: ["Đọc tài liệu theo chủ đề đang dùng trong sản phẩm.", "Lưu lại checklist phù hợp phong cách giao dịch.", "Ôn lại case study sau mỗi giai đoạn thị trường."],
        rows: [
            ["Checklist PRO", "Mẫu thực hành", "Dùng cho lọc cổ phiếu"],
            ["Case dòng tiền", "Bài đọc", "Dùng cho nhóm dẫn dắt"],
            ["Sổ tay QTRR", "Tài liệu", "Dùng cho quản trị danh mục"]
        ]
    }
};

localStorage.setItem('fintop_handbook_topics', JSON.stringify(guideTopics));


// Dynamic styling for flashes and stale indications
(function injectLiveStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .flash-up {
            background-color: rgba(16, 185, 129, 0.25) !important;
            color: #10b981 !important;
            transition: all 0.3s ease;
        }
        .flash-down {
            background-color: rgba(239, 68, 68, 0.25) !important;
            color: #ef4444 !important;
            transition: all 0.3s ease;
        }
        .flash-neutral {
            background-color: rgba(167, 139, 250, 0.25) !important;
            color: #a78bfa !important;
            transition: all 0.3s ease;
        }
        .stale-indicator {
            opacity: 0.6;
        }
    `;
    document.head.appendChild(style);
})();

let currentStockUnsubscribe = null;
let fallbackPollInterval = null;

// Recommended Expert Portfolio and Reports Tab Variables
let activePortfolioUnsubscribes = [];
let activePortfolioHoldings = [];
let activePortfolioCash = 0;
let activePortfolioInitial = 0;


function renderStock(ticker = "FPT") {
    const code = ticker.toUpperCase();
    const infra = window.FintopInfra;
    if (!infra) {
        console.warn("[Stock Terminal] FintopInfra not loaded yet.");
        return;
    }

    const tickerEl = document.getElementById("stockTicker");
    const companyEl = document.getElementById("stockCompany");
    const priceEl = document.getElementById("stockPrice");
    const changeEl = document.getElementById("stockChange");
    const statusEl = document.getElementById("stockStatus");
    const scoreEl = document.getElementById("stockScore");
    const metricsEl = document.getElementById("stockMetrics");
    const barsEl = document.getElementById("stockBars");
    const tableEl = document.getElementById("stockDataRows");

    if (!tickerEl) return;

    // Clean up previous subscription
    if (typeof currentStockUnsubscribe === 'function') {
        currentStockUnsubscribe();
        currentStockUnsubscribe = null;
    }
    if (fallbackPollInterval) {
        clearInterval(fallbackPollInterval);
        fallbackPollInterval = null;
    }

    // Set loading indicator states
    tickerEl.textContent = code;
    companyEl.textContent = "Đang tải dữ liệu...";

    // Fetch initial master quote via REST Api
    infra.ApiClient.get(`/market/stocks/${code}`)
        .then(response => {
            const stockData = response.data;
            if (!stockData) {
                alert(`Không tìm thấy mã cổ phiếu ${code}`);
                return;
            }

            companyEl.textContent = stockData.companyName || 'FinTop Corporation';

            // Extract quote details
            const quote = stockData.realtimeQuote || {
                open: 100.0,
                close: 100.0,
                high: 100.0,
                low: 100.0,
                volume: 500000
            };

            // Update UI initial values
            updateStockUIFields(code, quote, stockData, false);

            // Establish real WebSocket quote subscription
            infra.SocketManager.subscribeMarketQuote(code, (updatedQuote) => {
                updateStockUIFields(code, updatedQuote, stockData, true);
            }).then(unsub => {
                currentStockUnsubscribe = unsub;
            }).catch(wsErr => {
                console.warn("[Stock Terminal] WebSocket subscription failed, using REST fallback:", wsErr.message);
            });

            // Set up fallback polling loop
            startFallbackPolling(code, stockData);
        })
        .catch(err => {
            console.error('[Stock Terminal] API Error:', err);
            companyEl.textContent = "Lỗi tải thông tin doanh nghiệp";
            priceEl.textContent = "—";
            changeEl.textContent = "—";
            statusEl.textContent = "—";
        });
}

function updateStockUIFields(code, quote, stockData, shouldFlash = false, isStale = false) {
    const priceEl = document.getElementById("stockPrice");
    const changeEl = document.getElementById("stockChange");
    const statusEl = document.getElementById("stockStatus");
    const scoreEl = document.getElementById("stockScore");
    const metricsEl = document.getElementById("stockMetrics");
    const barsEl = document.getElementById("stockBars");
    const tableEl = document.getElementById("stockDataRows");
    const infra = window.FintopInfra;

    if (!priceEl || !infra) return;

    const openVal = parseFloat(quote.open) || parseFloat(quote.close) || 100.0;
    const closeVal = parseFloat(quote.close) || 100.0;
    const diff = closeVal - openVal;
    const pct = openVal > 0 ? (diff / openVal * 100) : 0;

    // Apply stale indicators
    priceEl.classList.toggle('stale-indicator', isStale);

    // Surgical DOM text updates
    priceEl.textContent = infra.Formatter.price(closeVal);
    changeEl.textContent = infra.Formatter.percent(pct);

    if (diff > 0) {
        statusEl.textContent = "Tích cực";
        changeEl.className = "status-badge good";
        statusEl.className = "status-badge good";
    } else if (diff < 0) {
        statusEl.textContent = "Theo dõi";
        changeEl.className = "status-badge risk";
        statusEl.className = "status-badge risk";
    } else {
        statusEl.textContent = "Ổn định";
        changeEl.className = "status-badge info";
        statusEl.className = "status-badge info";
    }

    // Dynamic flashing sequence
    if (shouldFlash) {
        const flashClass = diff > 0 ? 'flash-up' : diff < 0 ? 'flash-down' : 'flash-neutral';
        priceEl.classList.add(flashClass);
        changeEl.classList.add(flashClass);
        setTimeout(() => {
            priceEl.classList.remove('flash-up', 'flash-down', 'flash-neutral');
            changeEl.classList.remove('flash-up', 'flash-down', 'flash-neutral');
        }, 500);
    }

    // Generate responsive scores and metrics
    const score = 65 + Math.floor((closeVal * 7) % 30);
    scoreEl.textContent = score;

    metricsEl.innerHTML = `
        <article class="metric-card">
            <div class="metric-label">Vốn hóa</div>
            <div class="metric-value">${infra.Formatter.marketCap(closeVal * 1.3)}</div>
        </article>
        <article class="metric-card">
            <div class="metric-label">P/E</div>
            <div class="metric-value">${infra.Formatter.decimal(12 + (closeVal % 15), 1)}</div>
        </article>
        <article class="metric-card">
            <div class="metric-label">ROE</div>
            <div class="metric-value">${infra.Formatter.percent(15 + (closeVal % 12))}</div>
        </article>
        <article class="metric-card">
            <div class="metric-label">Thanh khoản</div>
            <div class="metric-value">${infra.Formatter.volume(quote.volume)}</div>
        </article>
    `;

    barsEl.innerHTML = `
        <div class="bar-row">
            <span>Động lượng</span>
            <div class="bar-track"><div class="bar-fill" style="--value:${score + 5}%"></div></div>
            <strong>${score + 5}</strong>
        </div>
        <div class="bar-row">
            <span>Chất lượng</span>
            <div class="bar-track"><div class="bar-fill" style="--value:${score - 2}%"></div></div>
            <strong>${score - 2}</strong>
        </div>
        <div class="bar-row">
            <span>Định giá</span>
            <div class="bar-track"><div class="bar-fill" style="--value:${100 - score}%"></div></div>
            <strong>${100 - score}</strong>
        </div>
        <div class="bar-row">
            <span>Dòng tiền</span>
            <div class="bar-track"><div class="bar-fill" style="--value:${score + 2}%"></div></div>
            <strong>${score + 2}</strong>
        </div>
    `;

    tableEl.innerHTML = `
        <tr>
            <td>Giá trị cao nhất</td>
            <td>${infra.Formatter.price(quote.high)}</td>
            <td>—</td>
            <td>Đỉnh cao giao dịch phiên</td>
        </tr>
        <tr>
            <td>Giá trị thấp nhất</td>
            <td>${infra.Formatter.price(quote.low)}</td>
            <td>—</td>
            <td>Đáy thấp giao dịch phiên</td>
        </tr>
        <tr>
            <td>Giá mở cửa</td>
            <td>${infra.Formatter.price(quote.open)}</td>
            <td>—</td>
            <td>Mở cửa giao dịch sàn</td>
        </tr>
    `;
}

function startFallbackPolling(code, stockData) {
    if (fallbackPollInterval) clearInterval(fallbackPollInterval);
    fallbackPollInterval = setInterval(() => {
        const infra = window.FintopInfra;
        if (infra && infra.AppState.getState('socketStatus')?.market !== 'connected') {
            infra.ApiClient.get(`/market/stocks/${code}`)
                .then(res => {
                    if (res.data && res.data.realtimeQuote) {
                        updateStockUIFields(code, res.data.realtimeQuote, stockData, true, true);
                    }
                })
                .catch(err => console.warn('[Stock Terminal] Fallback polling check failed:', err.message));
        }
    }, 6000);
}

function searchDemoStock() {
    const input = document.getElementById("stockSearchInput");
    renderStock((input && input.value) || "FPT");
}

function setStockTab(tabId) {
    document.querySelectorAll("[data-stock-tab]").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.stockTab === tabId);
    });
    document.querySelectorAll("[data-stock-panel]").forEach(panel => {
        panel.classList.toggle("is-active", panel.dataset.stockPanel === tabId);
    });

    sessionStorage.setItem("fintop_active_stock_tab", tabId);
    if (window.location.hash !== '#' + tabId) {
        history.replaceState(null, '', '#' + tabId);
    }

    if (tabId !== 'portfolio') {
        cleanupPortfolioSubscriptions();
    }

    if (tabId === 'sector') {
        renderSectorsTab();
    } else if (tabId === 'pro-data') {
        checkProDataAccess();
    } else if (tabId === 'reports') {
        renderReportsTab();
    } else if (tabId === 'portfolio') {
        renderPortfolioTab();
    }
}

function applyDemoHash(shouldScroll = true) {
    const hash = window.location.hash.replace("#", "");
    const savedTab = sessionStorage.getItem("fintop_active_stock_tab");
    const validTabs = ["quant", "pro-data", "sector", "reports", "portfolio"];
    const targetTab = validTabs.includes(hash) ? hash : (validTabs.includes(savedTab) ? savedTab : "quant");

    if (document.getElementById("guideTopicTitle")) {
        setGuideTopic(guideTopics[hash] ? hash : "trading");
        if (shouldScroll && guideTopics[hash] && hash !== "library") {
            setTimeout(() => document.getElementById("guide-workspace")?.scrollIntoView({ block: "start" }), 0);
        }
    }

    if (document.getElementById("stockTicker")) {
        setStockTab(targetTab);
        if (shouldScroll && validTabs.includes(hash)) {
            setTimeout(() => document.getElementById("stock-workspace")?.scrollIntoView({ block: "start" }), 0);
        }
    }
}

function setGuideTopic(topicId) {
    const topic = guideTopics[topicId];
    if (!topic) return;

    const titleEl = document.getElementById("guideTopicTitle");
    const introEl = document.getElementById("guideTopicIntro");
    const lessonsEl = document.getElementById("guideTopicLessons");
    const checklistEl = document.getElementById("guideTopicChecklist");
    const tableEl = document.getElementById("guideTopicTableRows");

    if (titleEl) titleEl.textContent = topic.title;
    if (introEl) introEl.textContent = topic.intro;

    if (lessonsEl) {
        lessonsEl.innerHTML = topic.lessons.map(l => `
            <li>
                <strong>${l[0]}:</strong> ${l[1]}
            </li>
        `).join("");
    }

    if (checklistEl) {
        checklistEl.innerHTML = topic.checklist.map(c => `
            <li>${c}</li>
        `).join("");
    }

    if (tableEl) {
        tableEl.innerHTML = topic.rows.map((r, idx) => {
            if (r[1] && (r[1].startsWith('http://') || r[1].startsWith('https://'))) {
                return `
                    <tr>
                        <td class="stt-cell">${idx + 1}</td>
                        <td class="content-cell">${r[0]}</td>
                        <td><a class="library-detail-link" href="${r[1]}" target="_blank" rel="noopener">Chi tiết</a></td>
                    </tr>
                `;
            }
            return `
                <tr>
                    <td>${r[0]}</td>
                    <td><span class="status-badge ${r[1] === 'Nắm giữ' ? 'good' : r[1] === 'Tích lũy' ? 'watch' : 'info'}">${r[1]}</span></td>
                    <td>${r[2] || ''}</td>
                </tr>
            `;
        }).join("");
    }

    document.querySelectorAll("[data-guide-topic]").forEach(btn => {
        btn.classList.toggle("is-active", btn.dataset.guideTopic === topicId);
    });
}

function renderSectorsTab() {
    const infra = window.FintopInfra;
    if (!infra) return;

    const tbody = document.querySelector('[data-stock-panel="sector"] tbody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Đang tải dữ liệu ngành từ hệ thống...</td></tr>';

    infra.ApiClient.get('/market/sectors')
        .then(response => {
            const sectors = response.data;
            if (!sectors || sectors.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Không có dữ liệu ngành</td></tr>';
                return;
            }

            tbody.innerHTML = sectors.map(sec => {
                const representation = sec.industries && sec.industries.length > 0
                    ? sec.industries.map(ind => ind.name).join(", ")
                    : "—";
                const breadth = 50 + (sec.id * 7) % 45;
                const status = breadth > 70 ? "good" : breadth > 50 ? "info" : "watch";
                const statusText = breadth > 70 ? "Dẫn dắt" : breadth > 50 ? "Hồi phục" : "Theo dõi";

                return `
                    <tr>
                        <td><strong>${sec.name}</strong></td>
                        <td>${breadth}%</td>
                        <td>${breadth > 65 ? 'Cao' : breadth > 50 ? 'Trung bình' : 'Phân hóa'}</td>
                        <td>${representation}</td>
                        <td><span class="status-badge ${status}">${statusText}</span></td>
                    </tr>
                `;
            }).join("");
        })
        .catch(err => {
            console.error('[Stock Terminal] Error fetching sectors:', err);
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#ef4444;">Lỗi tải dữ liệu ngành từ máy chủ</td></tr>';
        });
}

function checkProDataAccess() {
    const infra = window.FintopInfra;
    if (!infra) return;

    const panel = document.querySelector('[data-stock-panel="pro-data"]');
    if (!panel) return;

    let lockOverlay = panel.querySelector('.pro-lock-overlay');
    const isGold = infra.RbacEvaluator.hasTier('GOLD');

    if (isGold) {
        if (lockOverlay) lockOverlay.remove();
        return;
    }

    if (!lockOverlay) {
        lockOverlay = document.createElement('div');
        lockOverlay.className = 'pro-lock-overlay';
        lockOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(8px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 8px;
            padding: 24px;
            text-align: center;
            border: 1px solid rgba(251, 191, 36, 0.2);
        lockOverlay.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 16px; text-shadow: 0 0 15px rgba(251, 191, 36, 0.5);">★</div>
            <h3 style="color: #fbbf24; margin-bottom: 8px; font-size: 1.5rem; font-weight: bold;">Đặc quyền Hội viên PRO</h3>
            <p style="color: #94a3b8; max-width: 400px; margin-bottom: 20px; font-size: 0.95rem;">
                Tính năng PRO Data bao gồm Bộ chỉ báo nâng cao, trạng thái Model và vùng giá quản trị rủi ro chỉ dành riêng cho hội viên GOLD trở lên.
            </p>
            <button class="btn-tv-blue" style="background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; font-weight: bold; border: none; padding: 10px 20px;" onclick="window.location.href='../index.html#pricing'">
                Nâng cấp Hội viên ngay
            </button>
        `;
        panel.style.position = 'relative';
        panel.appendChild(lockOverlay);
    }
}

// ============================================================
// REPORTS & expert PORTFOLIO TAB FUNCTIONS
// ============================================================

function renderReportsTab() {
    const contentEl = document.querySelector('[data-stock-panel="reports"]');
    if (!contentEl) return;

    contentEl.innerHTML = `
        <div class="fintop-report-header-section" style="margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
                <div style="display: flex; align-items: center; gap: 28px; flex-wrap: wrap;">
                    <h2 style="color: #fff; font-size: 1.5rem; font-weight: 700; margin: 0;">BÁO CÁO TỔNG HỢP</h2>
                    <!-- Segmented Glassmorphism Capsule Switcher -->
                    <div class="fintop-segmented-switcher" style="display: inline-flex; align-items: center; background: rgba(15, 23, 42, 0.85); padding: 4px; border-radius: 14px; border: 1px solid rgba(168, 85, 247, 0.35); backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);">
                        <button class="fintop-tab-item active" id="btn-demo-report-dn" type="button" style="background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%); color: #ffffff; border: none; font-weight: 700; font-size: 0.88rem; padding: 8px 18px; border-radius: 10px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25); white-space: nowrap;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f0abfc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" id="icon-demo-report-dn"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                            <span>Phân tích Doanh nghiệp</span>
                        </button>
                        <button class="fintop-tab-item" id="btn-demo-report-nganh-vimo" type="button" style="background: transparent; color: #94a3b8; border: none; font-weight: 600; font-size: 0.88rem; padding: 8px 18px; border-radius: 10px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" id="icon-demo-report-nganh-vimo"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                            <span>Ngành & Vĩ mô</span>
                        </button>
                    </div>
                </div>
            </div>
            <p style="margin-top: 12px; margin-bottom: 16px; color: #94a3b8; font-size: 0.85rem; line-height: 1.5;">
                Kho báo cáo phân tích tiêu biểu, nguồn tổng hợp từ các Công ty chứng khoán và các Trang/Báo uy tín. Các báo cáo được tổng hợp là tài sản thông tin, dữ liệu thuộc quyền sở hữu trí tuệ của các Đơn vị Chủ sở hữu. <strong style="color: #cbd5e1; font-weight: 600;">Tài liệu chỉ sử dụng cho mục đích tham khảo, FinTop DATA không chịu bất cứ các trách nhiệm nào liên quan!</strong>
            </p>
        </div>

        <div class="fintop-report-table-wrapper" style="border-radius: 10px; overflow: hidden; border: 1px solid rgba(168, 85, 247, 0.35); background: #0f172a; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
            <div style="overflow-x: auto;">
                <table class="fintop-report-table" style="width: 100%; border-collapse: collapse; text-align: center; color: #f8fafc; font-size: 0.95rem;">
                    <thead id="fintopReportTableHead">
                        <tr style="background: #4c1d95; color: #ffffff; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; border-bottom: 2px solid #6b21a8;">
                            <th style="padding: 12px 10px; width: 60px; border-right: 1px solid rgba(255,255,255,0.1);">STT</th>
                            <th style="padding: 12px 14px; width: 120px; border-right: 1px solid rgba(255,255,255,0.1);">Mã cổ phiếu</th>
                            <th style="padding: 12px 16px; border-right: 1px solid rgba(255,255,255,0.1); text-align: center;">Nội dung</th>
                            <th style="padding: 12px 14px; width: 140px; border-right: 1px solid rgba(255,255,255,0.1);">Ngày phát hành</th>
                            <th style="padding: 12px 14px; width: 120px; border-right: 1px solid rgba(255,255,255,0.1);">Nguồn</th>
                            <th style="padding: 12px 16px; width: 130px;">Đường dẫn</th>
                        </tr>
                    </thead>
                    <tbody id="fintopReportTableBody">
                        <tr><td colspan="6" style="padding: 24px; color: #94a3b8;">Đang tải danh sách báo cáo phân tích...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const SAMPLE_DOANH_NGHIEP = [
        { id: 1, ticker: 'QNS', title: 'Báo cáo phân tích doanh nghiệp QNS Q2/2026', publishedAt: '2026-05-29', source: 'FINTOP', fileUrl: '#' },
        { id: 2, ticker: 'FPT', title: 'Cập nhật kết quả kinh doanh FPT & Triển vọng AI', publishedAt: '2026-05-22', source: 'FINTOP', fileUrl: '#' },
        { id: 3, ticker: 'SAB', title: 'Phân tích hoạt động kinh doanh & Biên lợi nhuận SAB', publishedAt: '2026-05-15', source: 'FINTOP', fileUrl: '#' },
        { id: 4, ticker: 'VNM', title: 'Đánh giá sức mua ngành sữa & Chiến lược VNM', publishedAt: '2026-05-10', source: 'FINTOP', fileUrl: '#' },
        { id: 5, ticker: 'VIB', title: 'Báo cáo cập nhật tình hình tăng trưởng tín dụng VIB', publishedAt: '2026-04-17', source: 'FINTOP', fileUrl: '#' },
        { id: 6, ticker: 'DCM', title: 'Phân tích tác động giá phân bón Ure tới DCM', publishedAt: '2020-11-18', source: 'FPTS', fileUrl: '#' },
        { id: 7, ticker: 'VCB', title: 'Cập nhật chất lượng tài sản & Nợ xấu VCB', publishedAt: '2020-11-12', source: 'Mirae', fileUrl: '#' },
        { id: 8, ticker: 'POW', title: 'Phân tích sản lượng điện & Tiến độ nhà máy POW', publishedAt: '2020-11-05', source: 'Mirae', fileUrl: '#' },
        { id: 9, ticker: 'STK', title: 'Đánh giá đơn hàng dệt may & Phục hồi sản xuất STK', publishedAt: '2020-11-05', source: 'Mirae', fileUrl: '#' },
        { id: 10, ticker: 'FMC', title: 'Cập nhật kim ngạch xuất khẩu tôm FMC', publishedAt: '2020-10-30', source: 'PHS', fileUrl: '#' },
        { id: 11, ticker: 'PLC', title: 'Triển vọng đầu tư công & Tiêu thụ nhựa đường PLC', publishedAt: '2020-10-30', source: 'Mirae', fileUrl: '#' },
        { id: 12, ticker: 'DXG', title: 'Cập nhật tiến độ mở bán các dự án BĐS DXG', publishedAt: '2020-10-27', source: 'KBSV', fileUrl: '#' },
        { id: 13, ticker: 'VCB', title: 'Báo cáo phân tích chuyên sâu vị thế ngân hàng VCB', publishedAt: '2020-10-27', source: 'VNDIRECT', fileUrl: '#' },
        { id: 14, ticker: 'PVT', title: 'Phân tích cước vận tải biển & Đội tàu PVT', publishedAt: '2020-10-22', source: 'FPTS', fileUrl: '#' }
    ];

    const SAMPLE_NGANH_VIMO = [
        { id: 101, industry: 'Vĩ mô', title: 'Báo cáo chiến lược kinh tế vĩ mô Q2/2026', publishedAt: '2026-05-28', source: 'FINTOP', fileUrl: '#' },
        { id: 102, industry: 'Ngân hàng', title: 'Báo cáo triển vọng nhóm Ngân hàng 2026', publishedAt: '2026-05-20', source: 'FINTOP', fileUrl: '#' },
        { id: 103, industry: 'Thép', title: 'Phân tích chu kỳ nhóm Thép & Thép XD', publishedAt: '2026-05-14', source: 'FINTOP', fileUrl: '#' },
        { id: 104, industry: 'Vĩ mô', title: 'Tác động lạm phát & chính sách lãi suất NHNN', publishedAt: '2026-05-08', source: 'FINTOP', fileUrl: '#' },
        { id: 105, industry: 'Công nghệ', title: 'Báo cáo chuỗi giá trị Công nghệ & Bán dẫn', publishedAt: '2026-04-12', source: 'FINTOP', fileUrl: '#' },
        { id: 106, industry: 'Bất động sản', title: 'Bất động sản KCN: Làn sóng FDI thế hệ mới', publishedAt: '2020-11-15', source: 'SSI', fileUrl: '#' },
        { id: 107, industry: 'Tài chính', title: 'Báo cáo xu hướng tỷ giá USD/VND & Dòng tiền ngoại', publishedAt: '2020-11-10', source: 'VNDIRECT', fileUrl: '#' },
        { id: 108, industry: 'Bán lẻ', title: 'Báo cáo tổng quan ngành Bán lẻ & Tiêu dùng', publishedAt: '2020-11-02', source: 'Mirae', fileUrl: '#' },
        { id: 109, industry: 'Dầu khí', title: 'Dầu khí: Cập nhật tiến độ dự án Lô B Ô Môn', publishedAt: '2020-10-28', source: 'KBSV', fileUrl: '#' },
        { id: 110, industry: 'Thị trường', title: 'Báo cáo chiến lược dòng tiền & Thanh khoản thị trường', publishedAt: '2020-10-25', source: 'FPTS', fileUrl: '#' }
    ];

    let currentCategory = 'doanh-nghiep';
    let allReports = [];

    const btnDn = document.getElementById('btn-demo-report-dn');
    const btnNganh = document.getElementById('btn-demo-report-nganh-vimo');

    const updateActiveTabStyles = (cat) => {
        if (cat === 'doanh-nghiep') {
            if (btnDn) {
                btnDn.style.background = 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)';
                btnDn.style.color = '#ffffff';
                btnDn.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)';
                const icon = document.getElementById('icon-demo-report-dn');
                if (icon) icon.setAttribute('stroke', '#f0abfc');
            }
            if (btnNganh) {
                btnNganh.style.background = 'transparent';
                btnNganh.style.color = '#94a3b8';
                btnNganh.style.boxShadow = 'none';
                const icon = document.getElementById('icon-demo-report-nganh-vimo');
                if (icon) icon.setAttribute('stroke', '#64748b');
            }
        } else {
            if (btnNganh) {
                btnNganh.style.background = 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)';
                btnNganh.style.color = '#ffffff';
                btnNganh.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.25)';
                const icon = document.getElementById('icon-demo-report-nganh-vimo');
                if (icon) icon.setAttribute('stroke', '#f0abfc');
            }
            if (btnDn) {
                btnDn.style.background = 'transparent';
                btnDn.style.color = '#94a3b8';
                btnDn.style.boxShadow = 'none';
                const icon = document.getElementById('icon-demo-report-dn');
                if (icon) icon.setAttribute('stroke', '#64748b');
            }
        }
    };

    const renderFiltered = (cat) => {
        currentCategory = cat;
        updateActiveTabStyles(cat);
        renderReportTableHead(cat);

        let filtered = [];
        if (allReports.length > 0) {
            if (cat === 'doanh-nghiep') {
                filtered = allReports.filter(r => r.reportType === 'MARKET_SUMMARY' || !r.reportType || (r.title && r.title.length <= 6));
                if (filtered.length === 0) filtered = SAMPLE_DOANH_NGHIEP;
            } else {
                filtered = allReports.filter(r => r.reportType === 'MACRO_ANALYSIS' || r.reportType === 'VIP_RECOMMENDATION' || (r.title && r.title.length > 6));
                if (filtered.length === 0) filtered = SAMPLE_NGANH_VIMO;
            }
        } else {
            filtered = (cat === 'doanh-nghiep') ? SAMPLE_DOANH_NGHIEP : SAMPLE_NGANH_VIMO;
        }

        renderReportTableRows(filtered, cat);
    };

    if (btnDn) btnDn.addEventListener('click', () => renderFiltered('doanh-nghiep'));
    if (btnNganh) btnNganh.addEventListener('click', () => renderFiltered('nganh-vimo'));

    const infra = window.FintopInfra;
    if (infra && infra.ApiClient) {
        infra.ApiClient.get('/cms/reports?limit=50')
            .then(response => {
                allReports = response?.data?.data || response?.data || [];
                renderFiltered(currentCategory);
            })
            .catch(err => {
                console.warn('[Reports Tab] API fetch failed, rendering reference sample dataset:', err.message);
                renderFiltered(currentCategory);
            });
    } else {
        renderFiltered(currentCategory);
    }
}

function renderReportTableHead(cat) {
    const thead = document.getElementById('fintopReportTableHead');
    if (!thead) return;

    if (cat === 'doanh-nghiep') {
        thead.innerHTML = `
            <tr style="background: #4c1d95; color: #ffffff; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; border-bottom: 2px solid #6b21a8;">
                <th style="padding: 12px 10px; width: 60px; border-right: 1px solid rgba(255,255,255,0.1);">STT</th>
                <th style="padding: 12px 14px; width: 160px; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.1);">Mã cổ phiếu</th>
                <th style="padding: 12px 16px; border-right: 1px solid rgba(255,255,255,0.1); text-align: center;">Nội dung</th>
                <th style="padding: 12px 14px; width: 175px; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.1);">Ngày phát hành</th>
                <th style="padding: 12px 14px; width: 120px; border-right: 1px solid rgba(255,255,255,0.1);">Nguồn</th>
                <th style="padding: 12px 16px; width: 130px; color: #ffffff;">Link</th>
            </tr>
        `;
    } else {
        thead.innerHTML = `
            <tr style="background: #4c1d95; color: #ffffff; font-weight: 700; font-size: 0.88rem; text-transform: uppercase; border-bottom: 2px solid #6b21a8;">
                <th style="padding: 12px 10px; width: 60px; border-right: 1px solid rgba(255,255,255,0.1);">STT</th>
                <th style="padding: 12px 14px; width: 140px; border-right: 1px solid rgba(255,255,255,0.1);">Ngành</th>
                <th style="padding: 12px 16px; border-right: 1px solid rgba(255,255,255,0.1); text-align: center;">Nội dung</th>
                <th style="padding: 12px 14px; width: 175px; white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.1);">Ngày phát hành</th>
                <th style="padding: 12px 14px; width: 120px; border-right: 1px solid rgba(255,255,255,0.1);">Nguồn</th>
                <th style="padding: 12px 16px; width: 130px; color: #ffffff;">Link</th>
            </tr>
        `;
    }
}

function renderReportTableRows(reports, cat = 'doanh-nghiep') {
    const tbody = document.getElementById('fintopReportTableBody');
    if (!tbody) return;

    if (!reports || reports.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="padding: 24px; color: #94a3b8;">Chưa có báo cáo nào trong hệ thống.</td></tr>`;
        return;
    }

    tbody.innerHTML = reports.map((r, idx) => {
        const stt = idx + 1;
        const isFintopSource = (r.source || '').toUpperCase() === 'FINTOP';
        
        let dateStr = '—';
        if (r.publishedAt || r.createdAt) {
            const d = new Date(r.publishedAt || r.createdAt);
            if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                dateStr = `${day}/${month}/${year}`;
            } else if (typeof r.publishedAt === 'string') {
                dateStr = r.publishedAt;
            }
        }

        const sourceStyle = 'color: #f8fafc; font-weight: 700; font-size: 0.95rem; font-family: sans-serif;';

        const rowBg = idx % 2 === 0 ? 'rgba(30, 41, 59, 0.4)' : 'rgba(15, 23, 42, 0.6)';
        const isLocked = !!r.locked;

        const actionBtnHtml = isLocked
            ? `<button class="btn-tv-blue" style="background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; font-weight: bold; border: none; padding: 4px 10px; font-size: 0.75rem; border-radius: 4px;" onclick="window.location.href='../index.html#panel-hoivien'">🔒 Nâng cấp</button>`
            : `<a href="${r.fileUrl || 'javascript:void(0)'}" style="display: inline-flex; align-items: center; justify-content: center; padding: 5px 15px; background: rgba(168, 85, 247, 0.1); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.45); border-radius: 8px; font-weight: 700; font-size: 0.85rem; text-decoration: none; transition: all 0.2s ease;" ${r.fileUrl && r.fileUrl !== '#' ? `target="_blank" onclick="downloadCmsReport(${r.id})"` : `onclick="downloadCmsReport(${r.id})"`} onmouseover="this.style.background='rgba(168, 85, 247, 0.25)'; this.style.borderColor='#c084fc'; this.style.boxShadow='0 0 10px rgba(168,85,247,0.3)'" onmouseout="this.style.background='rgba(168, 85, 247, 0.1)'; this.style.borderColor='rgba(168, 85, 247, 0.45)'; this.style.boxShadow='none'">Chi tiết</a>`;

        if (cat === 'doanh-nghiep') {
            const tickerStr = r.ticker || r.symbol || r.code || (r.title && r.title.length <= 6 ? r.title : 'QNS');
            const contentStr = r.content || r.title || 'Báo cáo phân tích doanh nghiệp';
            return `
                <tr style="background: ${rowBg}; border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s ease;" onmouseover="this.style.background='rgba(107, 33, 168, 0.25)'" onmouseout="this.style.background='${rowBg}'">
                    <td style="padding: 12px 10px; font-weight: 800; color: #f8fafc; border-right: 1px solid rgba(255,255,255,0.05);">${stt}</td>
                    <td style="padding: 12px 14px; color: #c084fc; font-weight: 800; font-size: 1.05rem; font-family: sans-serif; border-right: 1px solid rgba(255,255,255,0.05);">${tickerStr}</td>
                    <td style="padding: 12px 16px; font-weight: 600; color: #f8fafc; text-align: left; border-right: 1px solid rgba(255,255,255,0.05);">${contentStr}</td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #f1f5f9; border-right: 1px solid rgba(255,255,255,0.05);">${dateStr}</td>
                    <td style="padding: 12px 14px; ${sourceStyle} border-right: 1px solid rgba(255,255,255,0.05);">${r.source || 'FINTOP'}</td>
                    <td style="padding: 12px 16px;">${actionBtnHtml}</td>
                </tr>
            `;
        } else {
            const industryStr = r.industry || r.sector || 'Vĩ mô';
            const contentStr = r.content || r.title || 'Báo cáo chiến lược ngành, vĩ mô';
            return `
                <tr style="background: ${rowBg}; border-bottom: 1px solid rgba(255,255,255,0.06); transition: background 0.2s ease;" onmouseover="this.style.background='rgba(107, 33, 168, 0.25)'" onmouseout="this.style.background='${rowBg}'">
                    <td style="padding: 12px 10px; font-weight: 800; color: #f8fafc; border-right: 1px solid rgba(255,255,255,0.05);">${stt}</td>
                    <td style="padding: 12px 14px; color: #c084fc; font-weight: 800; font-size: 0.95rem; font-family: sans-serif; border-right: 1px solid rgba(255,255,255,0.05);">${industryStr}</td>
                    <td style="padding: 12px 16px; font-weight: 600; color: #f8fafc; text-align: left; border-right: 1px solid rgba(255,255,255,0.05);">${contentStr}</td>
                    <td style="padding: 12px 14px; font-weight: 700; color: #f1f5f9; border-right: 1px solid rgba(255,255,255,0.05);">${dateStr}</td>
                    <td style="padding: 12px 14px; ${sourceStyle} border-right: 1px solid rgba(255,255,255,0.05);">${r.source || 'FINTOP'}</td>
                    <td style="padding: 12px 16px;">${actionBtnHtml}</td>
                </tr>
            `;
        }
    }).join('');
}

window.downloadCmsReport = function(id) {
    const infra = window.FintopInfra;
    if (!infra) return;

    infra.ApiClient.get(`/cms/reports/${id}/download`)
        .then(response => {
            const fileUrl = response?.fileUrl || response?.data?.fileUrl;
            if (fileUrl) {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.setAttribute('download', '');
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert('Không thể tìm thấy liên kết tải file.');
            }
        })
        .catch(err => {
            console.error('[Reports Tab] Download failed:', err);
            alert('Không thể tải file báo cáo này. Vui lòng kiểm tra lại quyền truy cập hội viên.');
        });
};

function cleanupPortfolioSubscriptions() {
    if (activePortfolioUnsubscribes && activePortfolioUnsubscribes.length > 0) {
        activePortfolioUnsubscribes.forEach(unsub => {
            try { unsub(); } catch(e) { console.error('[Portfolio] Unsubscribe error:', e); }
        });
    }
    activePortfolioUnsubscribes = [];
}

function renderPortfolioTab() {
    const infra = window.FintopInfra;
    if (!infra) return;

    const select = document.getElementById('portfolioSelect');
    if (!select) return;

    if (!infra.AppState.get('auth', 'isAuthenticated')) {
        select.innerHTML = '<option value="">Vui lòng đăng nhập...</option>';
        document.getElementById('portNav').textContent = '—';
        document.getElementById('portCash').textContent = '—';
        document.getElementById('portPl').innerHTML = '—';
        document.getElementById('portDesc').textContent = '';
        const tbody = document.querySelector('#portfolioTable tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Vui lòng đăng nhập để xem danh mục đầu tư khuyến nghị.</td></tr>';
        return;
    }

    select.innerHTML = '<option value="">Đang tải danh mục...</option>';

    infra.ApiClient.get('/portfolios')
        .then(response => {
            const list = response?.data || [];
            if (list.length === 0) {
                select.innerHTML = '<option value="">Chưa có danh mục nào</option>';
                return;
            }

            select.innerHTML = '<option value="">-- Chọn danh mục khuyến nghị --</option>' +
                list.map(p => {
                    const lockSuffix = p.locked ? ` 🔒 [Yêu cầu ${p.minTierAccess}]` : '';
                    return `<option value="${p.id}" ${p.locked ? 'disabled style="color:#64748b;"' : ''}>${p.name}${lockSuffix}</option>`;
                }).join('');

            select.onchange = function() {
                const id = select.value;
                if (id) {
                    loadPortfolioDetail(id);
                } else {
                    cleanupPortfolioSubscriptions();
                    document.getElementById('portNav').textContent = '—';
                    document.getElementById('portCash').textContent = '—';
                    document.getElementById('portPl').innerHTML = '—';
                    document.getElementById('portDesc').textContent = '';
                    const tbody = document.querySelector('#portfolioTable tbody');
                    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Vui lòng chọn danh mục để xem chi tiết.</td></tr>';
                }
            };
        })
        .catch(err => {
            console.error('[Portfolio Tab] Error loading portfolios:', err);
            select.innerHTML = '<option value="">Lỗi tải danh sách</option>';
        });
}

function loadPortfolioDetail(id) {
    const infra = window.FintopInfra;
    if (!infra) return;

    cleanupPortfolioSubscriptions();

    const tbody = document.querySelector('#portfolioTable tbody');
    if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Đang tải chi tiết danh mục...</td></tr>';

    infra.ApiClient.get(`/portfolios/${id}`)
        .then(response => {
            const data = response?.data || response;
            if (!data) return;

            document.getElementById('portDesc').textContent = data.description || 'Không có mô tả chi tiết.';
            
            if (data.locked) {
                if (tbody) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="6" style="padding: 40px 20px; text-align: center; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);">
                                <div style="font-size: 2rem; margin-bottom: 12px;">🔒</div>
                                <h4 style="color: #fbbf24; font-weight: bold; margin-bottom: 6px;">Đặc quyền Danh mục Hội viên</h4>
                                <p style="color: #94a3b8; font-size: 0.8rem; max-width: 380px; margin: 0 auto 16px;">
                                    Danh mục khuyến nghị chuyên gia này yêu cầu gói tài khoản ${data.minTierAccess} trở lên để xem đầy đủ chi tiết mã, khối lượng và tỷ trọng phân bổ.
                                </p>
                                <button class="btn-tv-blue" style="background: linear-gradient(135deg, #fbbf24, #d97706); color: #000; font-weight: bold; border: none; padding: 6px 16px; font-size: 0.8rem;" onclick="window.location.href='../index.html#panel-hoivien'">
                                    Nâng cấp ngay
                                </button>
                            </td>
                        </tr>
                    `;
                }
                document.getElementById('portNav').textContent = '—';
                document.getElementById('portCash').textContent = '—';
                document.getElementById('portPl').innerHTML = '—';
                return;
            }

            activePortfolioCash = data.cashBalance || 0;
            activePortfolioInitial = data.initialCapital || 0;
            activePortfolioHoldings = data.holdings || [];

            updatePortfolioOverviewUI(infra);
            renderPortfolioTable(infra);

            if (activePortfolioHoldings.length > 0) {
                activePortfolioHoldings.forEach((h, index) => {
                    infra.SocketManager.subscribeMarketQuote(h.symbol, (quote) => {
                        if (quote && quote.close) {
                            const newPrice = parseFloat(quote.close);
                            const prevPrice = activePortfolioHoldings[index].currentPrice;
                            
                            if (newPrice !== prevPrice) {
                                const diff = newPrice - prevPrice;
                                activePortfolioHoldings[index].currentPrice = newPrice;
                                activePortfolioHoldings[index].value = newPrice * h.quantity;
                                activePortfolioHoldings[index].profitLoss = (newPrice - h.avgEntryPrice) * h.quantity;
                                activePortfolioHoldings[index].profitLossPercent = h.avgEntryPrice > 0 ? ((newPrice - h.avgEntryPrice) / h.avgEntryPrice) * 100 : 0;
                                
                                updatePortfolioOverviewUI(infra);
                                renderPortfolioTable(infra, h.symbol, diff);
                            }
                        }
                    }).then(unsub => {
                        activePortfolioUnsubscribes.push(unsub);
                    }).catch(wsErr => {
                        console.warn(`[Portfolio] Socket subscribe failed for ${h.symbol}:`, wsErr);
                    });
                });
            }
        })
        .catch(err => {
            console.error('[Portfolio Tab] Error loading portfolio detail:', err);
            if (tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#ef4444;">Không thể tải chi tiết danh mục. Vui lòng thử lại.</td></tr>';
        });
}

function updatePortfolioOverviewUI(infra) {
    let stocksValue = 0;
    activePortfolioHoldings.forEach(h => {
        stocksValue += h.currentPrice * h.quantity;
    });

    const currentNav = activePortfolioCash + stocksValue;
    const initial = activePortfolioInitial;
    const plValue = currentNav - initial;
    const plPercent = initial > 0 ? (plValue / initial) * 100 : 0;

    document.getElementById('portNav').textContent = infra.Formatter.price(currentNav);
    document.getElementById('portCash').textContent = infra.Formatter.price(activePortfolioCash);

    const plEl = document.getElementById('portPl');
    if (plEl) {
        plEl.textContent = `${infra.Formatter.percent(plPercent)} (${infra.Formatter.price(plValue)})`;
        if (plValue > 0) {
            plEl.style.color = '#34d399';
        } else if (plValue < 0) {
            plEl.style.color = '#f87171';
        } else {
            plEl.style.color = '#fff';
        }
    }
}

function renderPortfolioTable(infra, flashSymbol = null, priceDiff = 0) {
    const tbody = document.querySelector('#portfolioTable tbody');
    if (!tbody) return;

    let stocksValue = 0;
    activePortfolioHoldings.forEach(h => {
        stocksValue += h.currentPrice * h.quantity;
    });
    const currentNav = activePortfolioCash + stocksValue;

    if (activePortfolioHoldings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">Danh mục trống. Chưa giải ngân vị thế nào.</td></tr>';
        return;
    }

    tbody.innerHTML = activePortfolioHoldings.map(h => {
        const allocation = currentNav > 0 ? (h.currentPrice * h.quantity / currentNav) * 100 : 0;
        let plText = infra.Formatter.percent(h.profitLossPercent);
        let plColorClass = 'info';
        if (h.profitLoss > 0) {
            plColorClass = 'good';
        } else if (h.profitLoss < 0) {
            plColorClass = 'risk';
        }

        let flashClass = '';
        if (flashSymbol === h.symbol) {
            flashClass = priceDiff > 0 ? 'flash-up' : priceDiff < 0 ? 'flash-down' : 'flash-neutral';
        }

        return `
            <tr id="holding-row-${h.symbol}">
                <td><strong>${h.symbol}</strong><br><span style="font-size:0.72rem;color:#64748b;">${h.companyName || ''}</span></td>
                <td>${infra.Formatter.percent(allocation)}</td>
                <td>${h.quantity.toLocaleString('vi-VN')}</td>
                <td>${infra.Formatter.price(h.avgEntryPrice)}</td>
                <td class="${flashClass}">${infra.Formatter.price(h.currentPrice)}</td>
                <td><span class="status-badge ${plColorClass}">${plText}</span></td>
            </tr>
        `;
    }).join('');

    if (flashSymbol) {
        const row = document.getElementById(`holding-row-${flashSymbol}`);
        if (row) {
            const tdPrice = row.querySelector('td:nth-child(5)');
            if (tdPrice) {
                setTimeout(() => {
                    tdPrice.classList.remove('flash-up', 'flash-down', 'flash-neutral');
                }, 500);
            }
        }
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // Wait for FintopInfra to load safely (due to ES module deferred boot)
    const checkInterval = setInterval(() => {
        if (window.FintopInfra) {
            clearInterval(checkInterval);
            if (document.getElementById("stockTicker")) {
                renderStock("FPT");
            }
            applyDemoHash(true);

            // Hook auth state change listener to re-hydrate recommended portfolio or reports on login/logout
            window.FintopInfra.AppState.on(window.FintopInfra.AppState.EVENTS.AUTH_CHANGED, () => {
                if (document.getElementById("stockTicker")) {
                    const activeTabBtn = document.querySelector('[data-stock-tab].is-active');
                    const activeTab = activeTabBtn ? activeTabBtn.dataset.stockTab : 'quant';
                    if (activeTab === 'portfolio') {
                        renderPortfolioTab();
                    } else if (activeTab === 'reports') {
                        renderReportsTab();
                    } else if (activeTab === 'pro-data') {
                        checkProDataAccess();
                    }
                }
            });

            // Clean up subscriptions on beforeunload to prevent duplicate WS rooms or leaks
            window.addEventListener('beforeunload', () => {
                cleanupPortfolioSubscriptions();
            });
        }
    }, 50);

    document.querySelectorAll("[data-guide-topic]").forEach((button) => {
        button.addEventListener("click", () => setGuideTopic(button.dataset.guideTopic));
    });

    document.querySelectorAll("[data-stock-tab]").forEach((button) => {
        button.addEventListener("click", () => setStockTab(button.dataset.stockTab));
    });

    const searchInput = document.getElementById("stockSearchInput");
    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") searchDemoStock();
        });
    }

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".nav-item.dropdown")) {
            document.querySelectorAll(".dropdown-content.pinned").forEach((item) => item.classList.remove("pinned"));
        }
    });

    window.addEventListener("hashchange", () => applyDemoHash(true));
});
