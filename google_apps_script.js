/**
 * ==============================================================================
 * HƯỚNG DẪN CÀI ĐẶT GOOGLE APPS SCRIPT ĐỂ NHẬN LINK REPO TỪ GIT UPLOAD
 * ==============================================================================
 * 
 * 1. Tạo một bảng tính Google Sheets mới.
 * 2. Trên thanh menu, chọn Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa nội dung cũ và dán toàn bộ đoạn mã bên dưới vào.
 * 4. Bấm Lưu (Save - biểu tượng đĩa mềm).
 * 5. Bấm Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment).
 * 6. Chọn loại (Select type) là Ứng dụng Web (Web app).
 * 7. Cấu hình:
 *    - Mô tả: "Git Upload Webhook" (hoặc gì tùy ý).
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 8. Bấm Triển khai (Deploy) và Cấp quyền truy cập (Authorize Access) nếu được hỏi.
 * 9. Copy địa chỉ URL Web app (URL ứng dụng web) và dán vào ô cấu hình trong trang web Git Upload.
 */

function doGet(e) {
  // Lấy các tham số truyền qua URL từ web tĩnh
  var repoName = e.parameter.repo_name || "Unknown Repo";
  var repoUrl = e.parameter.repo_url || "";
  
  if (repoUrl !== "") {
    try {
      // Mở Google Sheet hiện tại đang gắn với script này
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      
      // Nếu là sheet trống, thêm dòng tiêu đề (tùy chọn)
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Thời gian", "Tên Repository", "Link Repository"]);
        sheet.getRange("A1:C1").setFontWeight("bold");
      }
      
      // Thêm dữ liệu mới vào dòng tiếp theo
      var timestamp = new Date();
      sheet.appendRow([timestamp, repoName, repoUrl]);
      
      return ContentService.createTextOutput(JSON.stringify({"status": "success", "message": "Đã lưu vào Sheets"}))
        .setMimeType(ContentService.MimeType.JSON);
        
    } catch (error) {
      return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": error.toString()}))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    return ContentService.createTextOutput(JSON.stringify({"status": "error", "message": "Thiếu tham số repo_url"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Hỗ trợ cả method POST (nếu trong tương lai web tĩnh đổi sang dùng POST)
function doPost(e) {
  return doGet(e);
}
