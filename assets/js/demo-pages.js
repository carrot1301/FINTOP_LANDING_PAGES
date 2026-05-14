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
        title: "Đọc xu hướng bằng tín hiệu kỹ thuật",
        intro: "Demo mô phỏng cách FinTop gom MA, RSI, Bollinger Band và mẫu nến thành trạng thái dễ đọc cho nhà đầu tư.",
        lessons: [
            ["Xu hướng chính", "Nhận biết giá đang nằm trên hoặc dưới các đường trung bình quan trọng."],
            ["Vùng hỗ trợ", "Đánh dấu vùng giá có xác suất xuất hiện lực cầu."],
            ["Xung lực RSI", "Theo dõi trạng thái quá mua, quá bán và phân kỳ."],
            ["Mẫu nến xác nhận", "Ưu tiên tín hiệu có thanh khoản và xu hướng ủng hộ."]
        ],
        checklist: ["Ưu tiên cổ phiếu có giá trên MA20 và MA50.", "Không mua đuổi khi RSI đã nóng và giá xa nền tích lũy.", "Kết hợp tín hiệu kỹ thuật với thanh khoản."],
        rows: [
            ["MWG", "RSI cải thiện", "Chờ thêm thanh khoản"],
            ["SSI", "Trên MA20", "Tín hiệu tích cực"],
            ["VHM", "Chạm hỗ trợ", "Theo dõi phản ứng giá"]
        ]
    },
    fa: {
        label: "Phân tích cơ bản (FA)",
        title: "Tóm tắt sức khỏe doanh nghiệp",
        intro: "Bộ demo tập trung vào doanh thu, lợi nhuận, biên lợi nhuận, đòn bẩy và định giá để người dùng có góc nhìn nền tảng.",
        lessons: [
            ["Tăng trưởng", "So sánh doanh thu và lợi nhuận theo quý, theo năm."],
            ["Biên lợi nhuận", "Đánh giá khả năng giữ lợi nhuận khi chi phí biến động."],
            ["Cấu trúc tài chính", "Theo dõi nợ vay, dòng tiền và khả năng thanh toán."],
            ["Định giá", "Đặt P/E, P/B trong tương quan ngành và chu kỳ lợi nhuận."]
        ],
        checklist: ["Ưu tiên doanh nghiệp tăng trưởng đều và dòng tiền rõ.", "So sánh định giá với chính lịch sử doanh nghiệp.", "Đọc báo cáo cùng bối cảnh ngành."],
        rows: [
            ["VNM", "Biên LN ổn định", "Phù hợp danh mục phòng thủ"],
            ["DGW", "Chu kỳ hồi phục", "Cần theo dõi hàng tồn kho"],
            ["MSN", "Tái cấu trúc", "Chờ cải thiện biên lợi nhuận"]
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

const stockDemoData = {
    FPT: {
        company: "FPT Corporation",
        price: "132.40",
        change: "+1.85%",
        status: "Tích cực",
        score: 86,
        metrics: [["Vốn hóa", "190.2K tỷ"], ["P/E", "24.8"], ["ROE", "27.4%"], ["Beta", "0.92"]],
        bars: [["Động lượng", 88], ["Chất lượng", 91], ["Định giá", 64], ["Dòng tiền", 83]],
        rows: [
            ["Doanh thu TTM", "64.1K tỷ", "+18.2%", "Tăng trưởng tốt"],
            ["Lợi nhuận TTM", "9.4K tỷ", "+20.5%", "Biên lợi nhuận cải thiện"],
            ["Thanh khoản 20 phiên", "4.8 triệu CP", "Ổn định", "Phù hợp tổ chức"]
        ]
    },
    HPG: {
        company: "Hoa Phat Group",
        price: "31.25",
        change: "+0.65%",
        status: "Theo dõi",
        score: 74,
        metrics: [["Vốn hóa", "181.6K tỷ"], ["P/E", "17.3"], ["ROE", "15.8%"], ["Beta", "1.16"]],
        bars: [["Động lượng", 71], ["Chất lượng", 76], ["Định giá", 78], ["Dòng tiền", 70]],
        rows: [
            ["Sản lượng thép", "Tăng theo quý", "+9.8%", "Chu kỳ hồi phục"],
            ["Biên gộp", "Cải thiện", "+2.1 điểm", "Nhạy giá đầu vào"],
            ["Thanh khoản 20 phiên", "18.2 triệu CP", "Cao", "Phù hợp giao dịch ngắn hạn"]
        ]
    },
    VCB: {
        company: "Vietcombank",
        price: "92.10",
        change: "-0.20%",
        status: "Ổn định",
        score: 79,
        metrics: [["Vốn hóa", "515.8K tỷ"], ["P/B", "2.8"], ["ROE", "20.2%"], ["NIM", "3.1%"]],
        bars: [["Động lượng", 62], ["Chất lượng", 90], ["Định giá", 66], ["Dòng tiền", 72]],
        rows: [
            ["CASA", "Cao", "Ổn định", "Lợi thế chi phí vốn"],
            ["Nợ xấu", "Thấp", "Kiểm soát", "Chất lượng tài sản tốt"],
            ["Thanh khoản 20 phiên", "2.1 triệu CP", "Vừa phải", "Phù hợp nắm giữ"]
        ]
    }
};

function toggleDropdownPin(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const menu = dropdown.querySelector(".dropdown-content");
    if (!menu) return;

    document.querySelectorAll(".dropdown-content.pinned").forEach((item) => {
        if (item !== menu) item.classList.remove("pinned");
    });

    menu.classList.toggle("pinned");
}

function setGuideTopic(topic) {
    const data = guideTopics[topic] || guideTopics.trading;
    document.querySelectorAll("[data-guide-topic]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.guideTopic === topic);
    });

    const title = document.getElementById("guideTopicTitle");
    const intro = document.getElementById("guideTopicIntro");
    const lessons = document.getElementById("guideLessons");
    const checklist = document.getElementById("guideChecklist");
    const table = document.getElementById("guideTableBody");

    if (!title || !intro || !lessons || !checklist || !table) return;

    title.textContent = data.title;
    intro.textContent = data.intro;
    lessons.innerHTML = data.lessons.map(([lessonTitle, lessonText]) => `
        <article class="guide-card">
            <h3>${lessonTitle}</h3>
            <p>${lessonText}</p>
        </article>
    `).join("");
    checklist.innerHTML = data.checklist.map((item) => `
        <div class="check-item"><span>✓</span><div>${item}</div></div>
    `).join("");
    table.innerHTML = data.rows.map(([ticker, signal, action]) => `
        <tr><td>${ticker}</td><td>${signal}</td><td>${action}</td></tr>
    `).join("");
}

function setStockTab(tab) {
    document.querySelectorAll("[data-stock-tab]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.stockTab === tab);
    });
    document.querySelectorAll("[data-stock-panel]").forEach((panel) => {
        panel.classList.toggle("is-active", panel.dataset.stockPanel === tab);
    });
}

function renderStock(ticker = "FPT") {
    const code = ticker.toUpperCase();
    const data = stockDemoData[code];
    if (!data) {
        alert("Demo hiện có dữ liệu mẫu cho FPT, HPG, VCB.");
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

    tickerEl.textContent = code;
    companyEl.textContent = data.company;
    priceEl.textContent = data.price;
    changeEl.textContent = data.change;
    statusEl.textContent = data.status;
    changeEl.className = `status-badge ${data.change.startsWith("-") ? "risk" : "good"}`;
    statusEl.className = `status-badge ${data.status === "Tích cực" ? "good" : data.status === "Theo dõi" ? "watch" : "info"}`;
    scoreEl.textContent = data.score;
    metricsEl.innerHTML = data.metrics.map(([label, value]) => `
        <article class="metric-card">
            <div class="metric-label">${label}</div>
            <div class="metric-value">${value}</div>
        </article>
    `).join("");
    barsEl.innerHTML = data.bars.map(([label, value]) => `
        <div class="bar-row">
            <span>${label}</span>
            <div class="bar-track"><div class="bar-fill" style="--value:${value}%"></div></div>
            <strong>${value}</strong>
        </div>
    `).join("");
    tableEl.innerHTML = data.rows.map(([metric, value, trend, note]) => `
        <tr><td>${metric}</td><td>${value}</td><td>${trend}</td><td>${note}</td></tr>
    `).join("");
}

function searchDemoStock() {
    const input = document.getElementById("stockSearchInput");
    renderStock((input && input.value) || "FPT");
}

function applyDemoHash(shouldScroll = true) {
    const hash = window.location.hash.replace("#", "");

    if (document.getElementById("guideTopicTitle")) {
        setGuideTopic(guideTopics[hash] ? hash : "trading");
        if (shouldScroll && guideTopics[hash] && hash !== "library") {
            setTimeout(() => document.getElementById("guide-workspace")?.scrollIntoView({ block: "start" }), 0);
        }
    }

    if (document.getElementById("stockTicker")) {
        setStockTab(["quant", "pro-data", "sector", "reports"].includes(hash) ? hash : "quant");
        if (shouldScroll && ["quant", "pro-data", "sector", "reports"].includes(hash)) {
            setTimeout(() => document.getElementById("stock-workspace")?.scrollIntoView({ block: "start" }), 0);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("stockTicker")) {
        renderStock("FPT");
    }

    applyDemoHash(true);

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
