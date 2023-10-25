const TransAPI_1 = 'https://script.google.com/macros/s/AKfycbwKRluuk2Mm4gmjbwfUs_-Ea8vlZYbtn_6K9iaFurr1g5ABwxKgRkStW2DRvkwcPbkVRA/exec'
const TransAPI_2 = 'https://script.google.com/macros/s/AKfycbyUieM-BphcXt9yy7BdoFx8aoysaq7tR-vjTMpxUXW3g-kkKIo70tGdzbGYfrVtt-7R/exec'
const TransAPI_3 = 'https://script.google.com/macros/s/AKfycbzlUFyiK_7Mwi1zuaoy3MTCLy88wlGOUyb9qX61Ew62YEc-2WbLSO3RG-ytlXsBs94/exec'

// đặt giá trị mặt định cho textarea là một chuỗi json
const jsonString = {
    "itemGroup.minecolonies": "MineColonies",
    "com.minecolonies.configgui.title": "MineColonies Config",
    "minecolonies.config.gameplay": "Gameplay Settings",
    "minecolonies.config.gameplay.comment": "All configuration items related to the core gameplay",
    "minecolonies.config.claims": "Claim Settings",
    "minecolonies.config.claims.comment": "All configuration related to colony claims",
    "minecolonies.config.combat": "Combat Settings",
    "minecolonies.config.combat.comment": "All configuration items related to the combat elements of MineColonies",
    "minecolonies.config.permissions": "Permission Settings",
    "minecolonies.config.permissions.comment": "All permission configuration options",
    "minecolonies.config.compatibility": "Mod Compatibility Settings",
    "minecolonies.config.compatibility.comment": "All configuration related to mod compatibility",
    "minecolonies.config.pathfinding": "Pathfinding Settings",
    "minecolonies.config.pathfinding.comment": "All configurations related to pathfinding",
    "minecolonies.config.requestsystem": "Request System Settings",
    "minecolonies.config.requestsystem.comment": "All configurations related to the request system",
    "minecolonies.config.commands": "Command Settings",
    "minecolonies.config.commands.comment": "All configurations related to the MineColonies commands",
    "minecolonies.config.research": "Research Settings",
    "minecolonies.config.research.comment": "All configurations related to the research system",
    "minecolonies.config.disablecitizenvoices": "Citizen Sounds",
    "minecolonies.config.disablecitizenvoices.comment": "Disable citizen voices.",
    "minecolonies.config.neighborbuildingrendering": "Neighbor Building Rendering"
}
$('#source_text').val(JSON.stringify(jsonString, null, 4));
$('#countSource').text('23');

// đếm số lượng object và đưa lên thẻ span
function countSource() {
    const typeTrans = $('#typeTrans');

    if (typeTrans.val() == 'text') {
        const words = $('#source_text').val().split("");
        const wordCount = words.length;
        $("#countSource").text(wordCount);
    } else if (typeTrans.val() == 'json') {
        const jsonString = $('#source_text').val();

        try {
            const obj = JSON.parse(jsonString);
            const objCount = Object.entries(obj).length;
            $("#countSource").text(objCount);
        } catch (error) {
            // console.error("Invalid JSON:", error);
        }
    }
}
// gọi sự kiện trong thẻ textarea
$('#source_text').on('keyup', function () {
    countSource();
});

// Khởi tạo kết quả cộng dồn
var cumulativeResult = {};

// nút dịch
$('#translateButton').click(async () => {
    // tạm thời vô hiệu hoá nút
    $('#translateButton').attr('disabled', true);
    //đặt một text mới
    $('#translateButton').text('Đang dịch ...');



    // nhận giá trị json từ textarea
    const source_text = $('#source_text').val();

    // thử chuyển đổi thành một chuỗi object
    var objSource;
    try {
        objSource = JSON.parse(source_text);
    } catch (error) {
        showErrorToast('Giá trị nhập vào không phải là Json')
        return;
    }

    // Tạo một đối tượng mới để chứa các cặp key-value với Id
    var objWithId = {};

    // Lặp qua mỗi cặp key-value trong đối tượng gốc và thêm Id vào chúng
    let Id = 1;
    for (const key in objSource) {
        if (objSource.hasOwnProperty(key)) {
            objWithId[`[${Id}]${key}`] = `[${Id}]${objSource[key]}`;
            Id++;
        }
    }

    // chia obj này thành các obj con nhỏ hơn
    const batchSize = parseInt($('#countObjTrans').val());
    const keys = Object.keys(objWithId);

    for (let i = 0; i < keys.length; i += batchSize) {
        const start = i;
        // Tìm chỉ mục cuối của object con (không vượt quá số lượng cặp giá trị)
        const end = Math.min(i + batchSize, keys.length);
        const subObject = {};

        // Duyệt qua các khóa và sao chép cặp giá trị vào object con
        for (let j = start; j < end; j++) {
            const key = keys[j];
            subObject[key] = objWithId[key];
        }

        // khai báo 2 mảng để lưu giá trị
        var keysArray = []; var valuesArray = [];
        // Duyệt qua subOjbect để lấy giá trị đưa vào 2 mảng
        for (const key in subObject) {
            if (subObject.hasOwnProperty(key)) {
                keysArray.push(key);
                valuesArray.push(subObject[key]);
            }
        }

        // chuyển đổi valuesArray thành một chuỗi string
        const valuesString = valuesArray.join(' ');

        // Gửi valuesString đến API Translate
        const params = {
            text: valuesString,
            source_lang: $('#source_lang').val(),
            target_lang: $('#target_lang').val(),
        }
        const queryString = new URLSearchParams(params).toString();
        var apiUrlTranslate;
        // kiểm tra loại api đang được chọn
        if ($('#transAPIServer').val() == 'api1') {
            apiUrlTranslate = TransAPI_1 + '?' + queryString
        } else if ($('#transAPIServer').val() == 'api2') {
            apiUrlTranslate = TransAPI_2 + '?' + queryString
        } else if ($('#transAPIServer').val() == 'api3') {
            apiUrlTranslate = TransAPI_3 + '?' + queryString
        }

        try {
            const response = await fetch(apiUrlTranslate, {
                redirect: "follow",
                method: 'GET',
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            });

            // Chuyển đổi phản hồi thành dạng JSON và lấy ra văn bản đã dịch
            const data = JSON.parse(await response.json());
            const textTrans = data.translateText

            // Kiểm tra và sửa lỗi trong văn bản dịch
            var regex = /\[\s*(\d+)\]/g;
            const textTransFinal = textTrans.replace(regex, '[$1]');

            // console.log(valuesString)
            // console.log(textTrans);
            // console.log(textTransFinal);

            // Tách chuỗi thành mảng bằng các chuỗi '[x]'
            regex = /\[\d+\]/;
            const valuesArrayFromString = textTransFinal.split(regex).filter(Boolean);

            // Tách chuỗi keysArray thành mảng bằng các chuỗi '[x]'
            const keysArrayFromString = keysArray.join('').split(regex).filter(Boolean);

            // Tạo đối tượng mới từ keysArrayFromString và valuesArrayFromString
            var newObj = {};
            for (let k = 0; k < keysArrayFromString.length; k++) {
                newObj[keysArrayFromString[k]] = valuesArrayFromString[k];
            }

            // Tích hợp kết quả mới vào kết quả cộng dồn
            cumulativeResult = { ...cumulativeResult, ...newObj };

        } catch (err) {
            console.log(err);
        }

        // đưa kết quả cộng dồn ra textarea
        $('#trans_text').val(JSON.stringify(cumulativeResult, null, 4));

        // tự động cuộn văn bản xuống
        const textareaTranslated = $('#trans_text')[0];
        textareaTranslated.scrollTop = textareaTranslated.scrollHeight;

        // đếm số lượng cặp trong object
        const objCount = Object.entries(cumulativeResult).length;
        $("#countTranslated").text(objCount);

        // nếu 2 thẻ đếm = nhau thì gọi function so sánh giá trị
        if ($('#countSource').text() == $('#countTranslated').text()) {
            compareTranslated();
            $('#compareTranslated').removeClass('d-none');
            $('#translateButton').attr('disabled', false);
            $('#translateButton').text('Bắt đầu dịch');
            showSuccessToast('Đã dịch hoàn tất');
            var targetElement = $('#compareTranslated');

            // Sử dụng .scrollTop() để cuộn trang đến phần tử đó
            $('html, body').scrollTop(targetElement.offset().top);

        }
    }
});

// $('#btnCompareJson').click(() => {
//     compareTranslated();
// })

var textTrans = null;
// function mở bảng so sánh object
function compareTranslated() {
    var sourceTrans = JSON.parse($('#source_text').val());
    textTrans = cumulativeResult;

    console.log(sourceTrans); console.log(textTrans);

    const sourceKeys = Object.keys(sourceTrans);

    // Lặp qua các khóa trong sourceTrans để đổ dữ liệu lên bảng
    sourceKeys.forEach((key, index) => {
        const tableRow = document.createElement("tr");
        const sttCell = document.createElement("th");
        sttCell.setAttribute("scope", "row");
        sttCell.textContent = index + 1;

        const sourceKeyCell = document.createElement("td");
        sourceKeyCell.textContent = key; // Key gốc

        const valueCell = document.createElement("td");
        valueCell.textContent = sourceTrans[key];

        const translateCell = document.createElement("td");
        const translatedValue = textTrans[key];
        const translatedValueParagraph = document.createElement("p");
        translatedValueParagraph.textContent = translatedValue;
        const inputElement = document.createElement("input");
        inputElement.setAttribute("type", "text");
        inputElement.classList.add("form-control", "edit-input", "d-none");

        // Thiết lập giá trị mặc định cho thẻ input
        inputElement.value = translatedValue;

        // Thêm nút "Edit" và xử lý sự kiện click
        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-primary", "btn-sm", "edit-button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            translatedValueParagraph.classList.toggle("d-none");
            inputElement.classList.toggle("d-none");
            editButton.classList.toggle("d-none");
            saveButton.classList.toggle("d-none");
        });
        actionCell.appendChild(editButton);

        // Thêm nút "Lưu" và xử lý sự kiện click
        const saveButton = document.createElement("button");
        saveButton.classList.add("btn", "btn-success", "btn-sm", "save-button", "d-none");
        saveButton.textContent = "Lưu";
        saveButton.addEventListener("click", function () {
            const updatedValue = inputElement.value;
            translatedValueParagraph.textContent = updatedValue;
            textTrans[key] = updatedValue; // Cập nhật giá trị trong biến textTrans
            translatedValueParagraph.classList.toggle("d-none");
            inputElement.classList.toggle("d-none");
            editButton.classList.toggle("d-none");
            saveButton.classList.toggle("d-none");
        });
        actionCell.appendChild(saveButton);

        // Thêm xử lý sự kiện keydown cho input
        inputElement.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                saveValue(inputElement, translatedValueParagraph, editButton, saveButton);
            }
        });

        translateCell.appendChild(translatedValueParagraph);
        translateCell.appendChild(inputElement);

        tableRow.appendChild(sttCell);
        tableRow.appendChild(sourceKeyCell); // Thêm key gốc
        tableRow.appendChild(valueCell);
        tableRow.appendChild(translateCell);
        tableRow.appendChild(actionCell);

        // Thêm hàng vào tbody của bảng
        document.getElementById("tableBody").appendChild(tableRow);

        // Hàm để lưu giá trị từ input
        function saveValue(inputElement, translatedValueParagraph, editButton, saveButton) {
            const updatedValue = inputElement.value;
            translatedValueParagraph.textContent = updatedValue;
            textTrans[key] = updatedValue;
            translatedValueParagraph.classList.toggle("d-none");
            inputElement.classList.toggle("d-none");
            editButton.classList.toggle("d-none");
            saveButton.classList.toggle("d-none");
        }
    });
}


// nút in kết quả đã sửa ra textarea
$('#btnPrint').click(function () {
    $('#outputTextTrans').removeClass('d-none');
    $('#outputTextTrans').text(JSON.stringify(textTrans, null, 4));
});


function copyTextTranslate() {
    $('#outputTextTrans').text(JSON.stringify(textTrans, null, 4));
    // Get the text field
    var copyText = document.getElementById("outputTextTrans");
    // Select the text field
    copyText.select();
    // Copy the text inside the text field
    navigator.clipboard.writeText(copyText.value);
    // Alert the copied text
    showSuccessToast('Đã sao chép')
}

