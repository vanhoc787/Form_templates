import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUsers, faUserTie, faUser, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { PageHeader } from '../../components'; // Giữ nguyên theo project của bạn
import './SelectionPage.css';
import { orgData } from '../../data/orgData';
import { getTemplate, makeKey } from '../../services/formTemplates';
import { TemplatesAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import { API_ENDPOINTS } from '../../config/api';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons'; // Lấy thêm icon Excel

const data = orgData;

const EvaluationForm = () => {
  const [user, setUser] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(false);
  
  const [template, setTemplate] = useState(null); 
  const navigate = useNavigate();
  
  // STATE MỚI: Quản lý lưới dữ liệu và độ rộng cột
  const [gridData, setGridData] = useState([]);
  const [colWidths, setColWidths] = useState([]);

  //State quản lý trạng thái loading khi submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBranchChange = (e) => {
    const branchId = e.target.value;
    setSelectedBranch(branchId);
    setSelectedDepartment('');
    setSelectedPosition('');
    setPositions([]);
    setIsTableVisible(false);
    if (branchId) setDepartments(data.departments[branchId] || []);
    else setDepartments([]);
  };

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    setSelectedPosition('');
    setIsTableVisible(false);
    if (departmentId) setPositions(data.positions[departmentId] || []);
    else setPositions([]);
  };

  const handlePositionChange = (e) => {
    const positionId = e.target.value;
    setSelectedPosition(positionId);
  };

  useEffect(() => {
    let canceled = false;
    async function load() {
      if (selectedBranch && selectedDepartment && selectedPosition) {
        const key = makeKey(selectedBranch, selectedDepartment, selectedPosition);
        try {
          const res = await TemplatesAPI.get(key);
          if (!canceled) setTemplate(res || null);
        } catch {
          const tpl = getTemplate(key);
          if (!canceled) setTemplate(tpl || null);
        }
      } else {
        setTemplate(null);
      }
    }
    load();
    return () => { canceled = true; };
  }, [selectedBranch, selectedDepartment, selectedPosition]);

  useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Lỗi: Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
            window.location.replace('/login');
            navigate('/login');
        }
        const decodedUser = jwtDecode(token);

        if (decodedUser) {
            setUser({
                name: decodedUser.fullname || 'Cán bộ',
                // human friendly role for display
                role: decodedUser.role === 'employee' ? 'Nhân viên'
                    : decodedUser.role === 'administrator' ? 'Quản trị viên'
                        : decodedUser.role === 'manager' ? 'Trưởng phòng'
                            : 'Người dùng',
                // keep the raw role code for permission checks
                role_code: decodedUser.role,
                employee_code: decodedUser.sub,
                dept: decodedUser.dept,
            });
        }
    }, [navigate]);


  console.log('User Info:', user);
  useEffect(() => {
    const allFieldsFilled = selectedBranch && selectedDepartment && selectedPosition;
    setIsTableVisible(allFieldsFilled);
  }, [selectedBranch, selectedDepartment, selectedPosition]);

  // EFFECT MỚI: Khởi tạo dữ liệu bảng khi nhận được template từ API
  useEffect(() => {
    if (template && template.grid) {
      let initialGrid = template.grid.map(row => row.map(cell => ({ ...cell })));
      
      // Tính toán ngay lần đầu để hiện các số 0 và chốt các ô read-only
      initialGrid = applyCalculations(initialGrid); 
      
      setGridData(initialGrid);
      setColWidths(template.columnWidths || []);
    } else {
      setGridData([]);
      setColWidths([]);
    }
  }, [template]);

 // Hàm chuyển đổi an toàn sang số
const parseNum = (val) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

// Hàm chuẩn hóa chuỗi
const normalizeString = (str) => String(str || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .replace(/đ/g, 'd') 
  .replace(/[\n\r\s]+/g, ' ')
  .trim();

const applyCalculations = (grid) => {
  const newGrid = grid.map(row => row.map(cell => ({ ...cell })));

  let activeGroups = []; 
  let verticalSums = [];
  let grandTotals = [];

  for (let r = 0; r < newGrid.length; r++) {
    const row = newGrid[r];
    const rowText = row.map(c => normalizeString(c.value)).join(' | ');

    // KỊCH BẢN 1: GẶP DÒNG TIÊU ĐỀ -> CẬP NHẬT TỌA ĐỘ CỘT
    const isHeader = rowText.includes('diem dat duoc') && rowText.includes('tong so diem');
    if (isHeader && !rowText.includes('cong diem') && !rowText.includes('tong cong')) {
      
      let rowDat = [], rowCong = [], rowTru = [], rowTong = [];
      
      for (let c = 0; c < row.length; c++) {
        const val = normalizeString(row[c].value);
        if (val === 'diem dat duoc' || val.includes('dat duoc')) rowDat.push(c);
        if (val === 'diem cong' || val.includes('diem cong')) rowCong.push(c);
        if (val === 'diem tru' || val.includes('diem tru')) rowTru.push(c);
        if (val === 'tong so diem' || val.includes('tong so diem')) rowTong.push(c);
      }

      rowDat.sort((a,b) => a-b);
      rowCong.sort((a,b) => a-b);
      rowTru.sort((a,b) => a-b);
      rowTong.sort((a,b) => a-b);

      activeGroups = [];
      for (let i = 0; i < rowTong.length; i++) {
        activeGroups.push({
          dat: rowDat[i],
          cong: rowCong[i],
          tru: rowTru[i],
          tong: rowTong[i]
        });
      }

      if (verticalSums.length !== activeGroups.length) {
        verticalSums = activeGroups.map(() => ({ dat: 0, cong: 0, tru: 0, tong: 0 }));
      }
      if (grandTotals.length !== activeGroups.length) {
        grandTotals = activeGroups.map(() => ({ dat: 0, cong: 0, tru: 0, tong: 0 }));
      }
      continue; 
    }

    if (activeGroups.length === 0) continue;

    for (let c = 0; c < row.length; c++) {
      if (row[c] && row[c].isInput) {
        // Nằm bên trái cột Tổng đầu tiên -> Của Cán bộ
        if (c <= activeGroups[0].tong) {
          row[c].allowedRole = 'employee';
        } 
        // Còn lại -> Của Lãnh đạo
        else {
          row[c].allowedRole = 'manager';
        }
      }
    }

    // KỊCH BẢN 2: DÒNG CHỐT TỔNG VÙNG
    const isSummaryRegion = rowText.includes('cong diem') && (rowText.includes('dinh tinh') || rowText.includes('dinh luong') || rowText.includes('chi tieu'));
    if (isSummaryRegion) {
      activeGroups.forEach((g, idx) => {
        if (g.dat !== undefined && row[g.dat] && !row[g.dat].isMergedHidden) { row[g.dat].value = verticalSums[idx].dat; row[g.dat].isInput = false; }
        if (g.cong !== undefined && row[g.cong] && !row[g.cong].isMergedHidden) { row[g.cong].value = verticalSums[idx].cong; row[g.cong].isInput = false; }
        if (g.tru !== undefined && row[g.tru] && !row[g.tru].isMergedHidden) { row[g.tru].value = verticalSums[idx].tru; row[g.tru].isInput = false; }
        if (g.tong !== undefined && row[g.tong] && !row[g.tong].isMergedHidden) { row[g.tong].value = verticalSums[idx].tong; row[g.tong].isInput = false; }

        grandTotals[idx].dat += verticalSums[idx].dat;
        grandTotals[idx].cong += verticalSums[idx].cong;
        grandTotals[idx].tru += verticalSums[idx].tru;
        grandTotals[idx].tong += verticalSums[idx].tong;
      });
      verticalSums = activeGroups.map(() => ({ dat: 0, cong: 0, tru: 0, tong: 0 }));
      continue;
    }

    // KỊCH BẢN 3: DÒNG TỔNG CỘNG CUỐI CÙNG
    const isGrandTotal = rowText.includes('tong cong') || rowText.includes('i+ii');
    if (isGrandTotal) {
      activeGroups.forEach((g, idx) => {
        if (g.dat !== undefined && row[g.dat] && !row[g.dat].isMergedHidden) { row[g.dat].value = grandTotals[idx].dat; row[g.dat].isInput = false; }
        if (g.cong !== undefined && row[g.cong] && !row[g.cong].isMergedHidden) { row[g.cong].value = grandTotals[idx].cong; row[g.cong].isInput = false; }
        if (g.tru !== undefined && row[g.tru] && !row[g.tru].isMergedHidden) { row[g.tru].value = grandTotals[idx].tru; row[g.tru].isInput = false; }
        if (g.tong !== undefined && row[g.tong] && !row[g.tong].isMergedHidden) { row[g.tong].value = grandTotals[idx].tong; row[g.tong].isInput = false; }
      });
      continue;
    }

    // KỊCH BẢN 4: DÒNG CHẤM ĐIỂM (PHÂN QUYỀN + TÍNH TOÁN)
    if (!isHeader && !isSummaryRegion && !isGrandTotal) {
      
      // BƯỚC A: Phân quyền ĐỘNG cho toàn bộ ô nhập liệu
      // Quét qua mọi ô trên dòng này, nếu là ô Input thì gán Role ngay lập tức
      for (let c = 0; c < row.length; c++) {
        if (row[c] && row[c].isInput) {
          // Nếu nằm bên trái (hoặc bằng) cột Tổng số 1 -> Là khu vực của Cán bộ (Employee)
          if (activeGroups.length > 0 && c <= activeGroups[0].tong) {
            row[c].allowedRole = 'employee';
          } 
          // Còn lại nằm tít bên phải -> Khu vực của Lãnh đạo (Manager)
          else {
            row[c].allowedRole = 'manager';
          }
        }
      }

      // BƯỚC B: Tính toán số liệu ngang/dọc
      activeGroups.forEach((g, idx) => {
        if (g.dat !== undefined && g.tong !== undefined && g.cong !== undefined && g.tru !== undefined) {
          
          const isActualRow = 
            (row[g.dat] && row[g.dat].isInput) || 
            (row[g.cong] && row[g.cong].isInput) || 
            (row[g.tru] && row[g.tru].isInput) ||
            (row[g.dat] && String(row[g.dat].value).trim() !== '' && !isNaN(parseFloat(row[g.dat].value)));

          if (isActualRow) {
            const dat = parseNum(row[g.dat].value);
            const cong = parseNum(row[g.cong].value);
            const tru = parseNum(row[g.tru].value);

            const tongNgang = dat + cong - tru;

            if (row[g.tong] && !row[g.tong].isMergedHidden) {
              row[g.tong].value = tongNgang;
              row[g.tong].isInput = false; 
            }

            verticalSums[idx].dat += dat;
            verticalSums[idx].cong += cong;
            verticalSums[idx].tru += tru;
            verticalSums[idx].tong += tongNgang;
          }
        }
      });
    }
  }

  return newGrid;
};

  // HÀM MỚI: Xử lý khi user gõ vào ô input
  // const handleCellChange = (rIndex, cIndex, newValue) => {
  //   setGridData(prevGrid => {
  //     // 1. Cập nhật giá trị ô mà người dùng vừa gõ
  //     const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
  //     newGrid[rIndex][cIndex] = { ...newGrid[rIndex][cIndex], value: newValue };
      
  //     // 2. Chạy hàm tính toán lại TOÀN BỘ lưới ngay lập tức
  //     return applyCalculations(newGrid);
  //   });
  // };

  // HÀM MỚI: Xử lý khi user gõ vào ô input (Đã thêm ràng buộc Validation)
  const handleCellChange = (rIndex, cIndex, newValue) => {
    // 1. Nếu người dùng xóa trắng ô, cho phép cập nhật để họ nhập lại
    if (newValue === '') {
      setGridData(prevGrid => {
        const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
        newGrid[rIndex][cIndex] = { ...newGrid[rIndex][cIndex], value: '' };
        return applyCalculations(newGrid);
      });
      return;
    }

    // 2. Ràng buộc 1: Chỉ cho phép nhập số hợp lệ và phải >= 0
    const numericValue = Number(newValue);
    if (isNaN(numericValue) || numericValue < 0) {
      toast.error('Lỗi: Vui lòng chỉ nhập số lớn hơn hoặc bằng 0!');
      return; // Dừng lại, không cập nhật state
    }

    // Tiến hành kiểm tra ràng buộc Thang điểm
    setGridData(prevGrid => {
      const currentRow = prevGrid[rIndex];
      
      // 3. Ràng buộc 2: Thuật toán "Quét ngược" tìm Thang điểm
      // Quét từ vị trí ô đang nhập sang trái để tìm cột Thang điểm gần nhất
      let maxScore = Infinity; 
      for (let i = cIndex - 1; i >= 0; i--) {
        const cell = currentRow[i];
        // Tìm ô KHÔNG phải là ô nhập liệu (isInput = false) và có giá trị là số
        if (!cell.isInput && cell.value !== '' && !isNaN(parseFloat(cell.value))) {
          maxScore = parseFloat(cell.value);
          break; // Đã tìm thấy thang điểm, thoát vòng lặp
        }
      }

      // Kiểm tra giá trị nhập vào so với Thang điểm
      if (numericValue > maxScore) {
        toast.error(`Lỗi: Điểm nhập vào (${numericValue}) không được vượt quá thang điểm (${maxScore})!`);
        return prevGrid; // Hoàn tác, trả về lưới cũ
      }

      // 4. Nếu vượt qua mọi ràng buộc, tiến hành cập nhật và tính toán lại
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      newGrid[rIndex][cIndex] = { ...newGrid[rIndex][cIndex], value: newValue };
      
      return applyCalculations(newGrid);
    });
  };

  // ==========================================
  // HÀM MỚI: Tự động điền điểm tối đa
  // ==========================================
  const handleAutoFillMaxScores = () => {
    setGridData(prevGrid => {
      // 1. Clone lại lưới dữ liệu
      let newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      
      // 2. Tìm toạ độ (index) của tất cả các cột mang ý nghĩa "Điểm đạt được"
      let datColIndices = [];
      newGrid.forEach(row => {
        row.forEach((cell, cIndex) => {
          // Chuẩn hoá text tiêu đề để so sánh an toàn
          const text = String(cell.value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/đ/g, 'd')
            .replace(/[\n\r\s]+/g, ' ')
            .trim();
            
          if (text === 'diem dat duoc' || text.includes('dat duoc')) {
            if (!datColIndices.includes(cIndex)) datColIndices.push(cIndex);
          }
        });
      });

      // 3. Duyệt qua từng dòng để tiến hành điền điểm
      for (let rIndex = 0; rIndex < newGrid.length; rIndex++) {
        let currentRow = newGrid[rIndex];
        
        let maxScore = 0;
        let foundMaxScore = false;
        
        // Quét từ trái sang phải để tìm Thang điểm (nằm trước khu vực input)
        for (let i = 0; i < currentRow.length; i++) {
            const cell = currentRow[i];
            if (cell.isInput) break; // Dừng quét khi chạm tới ranh giới ô nhập liệu
            
            // Nếu là số hợp lệ -> Ghi nhận đây là thang điểm của dòng
            if (cell.value !== '' && cell.value !== null && !isNaN(parseFloat(cell.value))) {
                maxScore = parseFloat(cell.value);
                foundMaxScore = true;
            }
        }

        // 4. Nếu dòng này có Thang điểm, tiến hành "bơm" điểm vào cột Đạt được
        if (foundMaxScore) {
          datColIndices.forEach(cIndex => {
            let targetCell = currentRow[cIndex];
            
            // Chỉ điền nếu ô đó là Input và User hiện tại có quyền chỉnh sửa
            if (targetCell && targetCell.isInput) {
              const isEditableByCurrentUser = user && (targetCell.allowedRole === user.role_code || user.role_code === 'administrator');
              
              if (isEditableByCurrentUser) {
                targetCell.value = maxScore;
              }
            }
          });
        }
      }

      // 5. Chạy lại hàm tính toán tổng (applyCalculations) để cập nhật hàng ngang/dọc lập tức
      return applyCalculations(newGrid);
    });
    
    toast.success('Đã tự động điền điểm tối đa thành công!');
  };

  // ==========================================
  // HÀM XUẤT EXCEL (CÓ HEADER ĐỘNG THEO MẪU)
  // ==========================================
  const handleExportExcel = async () => {
    const toastId = toast.loading('Đang khởi tạo file Excel...');
    try {
      setIsSubmitting(true);

      // --- 1. LẤY CÁC THÔNG TIN ĐỘNG ---
      // Tìm tên Chi nhánh, Phòng ban, Chức vụ từ orgData dựa trên ID đã chọn
      //const branchName = data.branches.find(b => b.id === selectedBranch)?.name || '...';
      const deptName = departments.find(d => d.id === selectedDepartment)?.name || '...';
      const posName = positions.find(p => p.id === selectedPosition)?.name || '...';
      
      // Lấy thời gian hiện tại cho Phiếu giao việc
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();

      // Giả định managerName (Bạn có thể lấy từ API hoặc user info sau này)
      //const managerName = template?.managerName || ''; 

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Phieu_Giao_Viec');

      // Thiết lập độ rộng cột từ template
      const totalCols = colWidths.length > 0 ? colWidths.length : 15;
      if (colWidths && colWidths.length > 0) {
        worksheet.columns = colWidths.map((w) => ({ 
          width: w / 7,
          style: { 
            // Cài đặt font mặc định cho toàn bộ ô trong cột này
            font: { name: 'Times New Roman', size: 10 } 
          },

        }));
      }else {
        // Trường hợp fallback nếu không có colWidths
        for(let i = 1; i <= 15; i++) {
           worksheet.getColumn(i).font = { name: 'Times New Roman', size: 10};
        }
      }

      // --- 2. VẼ PHẦN HEADER (TỪ DÒNG 1 ĐẾN DÒNG 12) ---

      //Thiết lập độ rộng của các cột
      worksheet.getColumn('A').width = 4;
      worksheet.getColumn('B').width = 30;
      worksheet.getColumn('C').width = 9;
      worksheet.getColumn('D').width = 15;
      worksheet.getColumn('E').width = 7;
      worksheet.getColumn('F').width = 9;
      worksheet.getColumn('G').width = 8;
      worksheet.getColumn('H').width = 8;
      worksheet.getColumn('I').width = 8;
      worksheet.getColumn('J').width = 9;
      worksheet.getColumn('K').width = 8;
      worksheet.getColumn('L').width = 8;
      worksheet.getColumn('M').width = 7;
      worksheet.getColumn('N').width = 7;
      worksheet.getColumn('O').width = 9;

      worksheet.getRow(13).font = { name: 'Times New Roman', bold: true, size: 9 };
      worksheet.getRow(13).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(14).font = { name: 'Times New Roman', bold: true, size: 9 };
      worksheet.getRow(14).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(15).font = { name: 'Times New Roman', bold: true, size: 9 };
      worksheet.getRow(15).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(20).font = { name: 'Times New Roman', bold: true, size: 9 };
      worksheet.getRow(20).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(21).font = { name: 'Times New Roman', bold: true, size: 9 };
      worksheet.getRow(21).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(22).font = { name: 'Times New Roman', bold: true, size: 9 };
      worksheet.getRow(22).alignment = { horizontal: 'center', vertical: 'middle' };

      // Dòng 1 & 2: Tiêu ngữ
      worksheet.mergeCells(1, 1, 1, 3);  //gộp từ dòng 1 cột 1 đến dòng 1 cột 3
      worksheet.getCell(1, 1).value = 'NGÂN HÀNG NÔNG NGHIỆP';
      worksheet.getCell(1, 1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(2, 1, 2, 3);
      worksheet.getCell(2, 1).value = 'VÀ PHÁT TRIỂN NÔNG THÔN VIỆT NAM';
      worksheet.getCell(2, 1).alignment = { horizontal: 'center', vertical: 'middle' };
      // Merge cột cho phần Cộng hòa xã hội... (từ cột 6 đến cột cuối)
      worksheet.mergeCells(1, 8, 1, 14);
      worksheet.getCell(1, 8).value = 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM';
      worksheet.getCell(1, 8).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(1, 8).font = { name: 'Times New Roman', bold: true }
      worksheet.mergeCells(2, 8, 2, 14);
      worksheet.getCell(2, 8).value = 'Độc lập - Tự do - Hạnh phúc';
      worksheet.getCell(2, 8).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getCell(2, 8).font = { name: 'Times New Roman', bold: true }
      
      // Căn giữa và in đậm Quốc hiệu
      worksheet.getCell(1, 6).alignment = { horizontal: 'center' };
      worksheet.getCell(1, 6).font = { name: 'Times New Roman', bold: true };
      worksheet.getCell(2, 6).alignment = { horizontal: 'center' };
      worksheet.getCell(2, 6).font = { name: 'Times New Roman', bold: true };

      // Dòng 3 & 4: Chi nhánh và Phòng ban (In đậm)
      worksheet.mergeCells(3, 1, 3, 3);
      worksheet.getCell(3, 1).value = `CHI NHÁNH BẮC LONG AN`;
      worksheet.getCell(3, 1).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(4, 1, 4, 3);
      worksheet.getCell(4, 1).value = `PHÒNG ${deptName.toUpperCase()}`;
      worksheet.getCell(4, 1).font = { name: 'Times New Roman', bold: true };
      worksheet.getCell(4, 1).alignment = { horizontal: 'center', vertical: 'middle' };

      // Dòng 5: Tiêu đề Phiếu giao việc (Merge toàn bộ các cột, in đậm, size lớn)
      worksheet.mergeCells(5, 1, 5, totalCols);
      const titleCell = worksheet.getCell('A5');
      titleCell.value = `PHIẾU GIAO VIỆC THÁNG ${month} NĂM ${year}`;
      titleCell.font = { name: 'Times New Roman', bold: true, size: 20 };
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(5).height = 30; // Tăng chiều cao dòng tiêu đề

      // Dòng 7, 8, 9: Các căn cứ
      worksheet.getCell('B7').value = `- Căn cứ thông báo chỉ tiêu kế hoạch Quý I/${year} của Ban Lãnh đạo Agribank Chi nhánh Bắc Long An giao cho ${deptName}.`;
      worksheet.getCell('B8').value = `- Căn cứ tình hình hoạt động thực tế của ${deptName} và vị trí công tác của cán bộ nhận khoán.`;
      worksheet.getCell('B9').value = `- Trưởng ${deptName.toLowerCase()} Agribank Chi nhánh Bắc Long An giao khoán chỉ tiêu đến cán bộ nhận khoán trong phòng như sau:`;

      // Dòng 10, 11, 12: Thông tin nhân sự (In đậm)
      worksheet.getCell('B10').value = `Người giao việc: Trưởng phòng ${deptName.toLowerCase()}`;
      worksheet.getCell('B10').font = { name: 'Times New Roman', bold: true, size: 12 };

      worksheet.getCell('B11').value = `Người nhận việc: ${user.name}`;
      worksheet.getCell('B11').font = { name: 'Times New Roman', bold: true, size: 12 };

      worksheet.getCell('B12').value = `Vị trí công tác: ${posName}`;
      worksheet.getCell('B12').font = { name: 'Times New Roman', bold: true, size: 12 };

      // --- 3. ĐỔ DỮ LIỆU LƯỚI (BẮT ĐẦU TỪ DÒNG 13) ---
      const START_ROW_OFFSET = 12; // Do Header chiếm 12 dòng

      gridData.forEach((row, rIndex) => {
        // Cộng thêm Offset vào rIndex
        const currentRowIndex = rIndex + 1 + START_ROW_OFFSET; 
        const excelRow = worksheet.getRow(currentRowIndex);
        
        row.slice(0, gridData[0].length - 1).map((cell, cIndex) => {
          if (cell.isMergedHidden) return;

          const currentColIndex = cIndex + 1;
          const excelCell = excelRow.getCell(currentColIndex);
          
          excelCell.value = cell.value !== undefined && cell.value !== null ? cell.value : '';

          // Xử lý Merge Cells (Nhớ cộng thêm Offset cho dòng bắt đầu và kết thúc)
          const rSpan = cell.rowSpan || 1;
          const cSpan = cell.colSpan || 1;
          if (rSpan > 1 || cSpan > 1) {
            const startRow = currentRowIndex;
            const startCol = currentColIndex;
            const endRow = currentRowIndex + rSpan - 1; // Sửa lại logic endRow cho chính xác
            const endCol = currentColIndex + cSpan - 1;
            worksheet.mergeCells(startRow, startCol, endRow, endCol);
          }

          // Format bảng lưới
          excelCell.alignment = {
            vertical: 'middle',
            horizontal: cell.isInput ? 'center' : 'left',
            wrapText: true
          };
          
          excelCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };

          // Tô màu vàng cho ô Input giống như trong hình ảnh (image_94bac4.png)
          if (cell.isInput) {
             excelCell.fill = {
               type: 'pattern',
               pattern: 'solid',
               fgColor: { argb: 'FFFFFF00' } // Màu vàng (Yellow)
             };
          } else {
             // In đậm cho tiêu đề bảng
             //if (rIndex < 2) excelCell.font = { name: 'Times New Roman', bold: true };
          }
        });
      });

      // --- 5. VẼ PHẦN FOOTER (CAM KẾT VÀ CHỮ KÝ) ---
      // Tính toán dòng bắt đầu vẽ Footer (Ngay dưới dòng cuối cùng của bảng Grid)
      let currentRow = START_ROW_OFFSET + gridData.length + 1;
      
      // Chia đôi bảng thành 2 nửa (Trái và Phải)
      const midCol = 5; // Thường là cột thứ 6 nếu bảng có 12 cột

      // Định nghĩa nhanh border chuẩn để đóng khung
      const defaultBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      // 5.1. VẼ DÒNG TIÊU ĐỀ "PHẦN CAM KẾT..." VÀ "TỔNG HỢP..."
      worksheet.mergeCells(currentRow, 1, currentRow, midCol);
      const titleLeft = worksheet.getCell(currentRow, 1);
      titleLeft.value = 'PHẦN CAM KẾT THỰC HIỆN CÔNG VIỆC';
      titleLeft.font = { name: 'Times New Roman', size: 11, bold: true };
      titleLeft.alignment = { horizontal: 'center', vertical: 'middle' };

      worksheet.mergeCells(currentRow, midCol + 1, currentRow, totalCols);
      const titleRight = worksheet.getCell(currentRow, midCol + 1);
      titleRight.value = 'TỔNG HỢP PHẦN ĐÁNH GIÁ THỰC HIỆN CÔNG VIỆC';
      titleRight.font = { name: 'Times New Roman', size: 11, bold: true };
      titleRight.alignment = { horizontal: 'center', vertical: 'middle' };

      // Kẻ khung cho dòng tiêu đề
      for (let i = 1; i <= totalCols; i++) worksheet.getCell(currentRow, i).border = defaultBorder;
      currentRow++;

      // 5.2. VẼ KHỐI NỘI DUNG (Gộp 4 dòng để chữ tự động rớt dòng)
      const textStartRow = currentRow;
      const textEndRow = currentRow + 6;

      // Nửa Trái (Cam kết)
      worksheet.mergeCells(textStartRow, 1, textEndRow, midCol);
      const textLeft = worksheet.getCell(textStartRow, 1);
      textLeft.value = `Tôi là: ${user.name}, CB ${deptName.toLowerCase()} Agribank Chi nhánh Bắc Long An đã đọc, hiểu rõ và đồng ý thực hiện các chỉ tiêu giao khoán do lãnh đạo phòng giao.\n* ý kiến đề xuất(nếu có) ...............................................................................\n...................................................................................................................\n...................................................................................................................\n...................................................................................................................`;
      textLeft.font = { name: 'Times New Roman', size: 11 };
      textLeft.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

      // Nửa Phải (Tổng hợp - Sử dụng Rich Text để in đậm chữ "Tổng cộng:")
      worksheet.mergeCells(textStartRow, midCol + 1, textEndRow, totalCols);
      const textRight = worksheet.getCell(textStartRow, midCol + 1);
      textRight.value = {
        richText: [
          { font: { name: 'Times New Roman', size: 11 }, text: `Căn cứ phiếu giao việc và kết quả thực hiện công việc của cán bộ trong tháng ${month}/${year}. Trưởng phòng đánh giá tổng hợp các chỉ tiêu như sau:\n1/ Các chỉ tiêu định tính đạt .....................điểm.\n2/ Các chỉ tiêu định lượng đạt .....................điểm.\n` },
          { font: { name: 'Times New Roman', size: 11, bold: true }, text: `Tổng cộng:.................................điểm\n` }, // Dòng này in đậm
          { font: { name: 'Times New Roman', size: 11 }, text: `Trưởng ${deptName.toLowerCase()} đồng ý xếp loại lao động tháng ${month}/${year} đối với cán bộ nhận khoán là loại:...............` }
        ]
      };
      textRight.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };

      // Kẻ khung cho khối nội dung
      for (let r = textStartRow; r <= textEndRow; r++) {
        for (let c = 1; c <= totalCols; c++) {
          worksheet.getCell(r, c).border = defaultBorder;
        }
      }
      currentRow = textEndRow + 1; // Nhảy xuống phần Chữ ký

      // 5.3. VẼ KHU VỰC NGÀY THÁNG VÀ CHỮ KÝ
      // Chia 4 cột để bố trí chữ ký (Q1, Q2, Q3, Q4)
      const q1 = Math.floor(midCol / 2);
      const q2 = midCol;
      const q3 = midCol + Math.floor((totalCols - midCol) / 2);
      const q4 = totalCols;

      // Dòng Ngày tháng (In nghiêng đậm, canh phải/giữa của mỗi khối)
      worksheet.mergeCells(currentRow, q1, currentRow, q2);
      const dateLeft = worksheet.getCell(currentRow, q1 + 1);
      dateLeft.value = `Hậu Nghĩa, ngày       tháng       năm ${year}`;
      dateLeft.font = { name: 'Times New Roman', size: 11, bold: true, italic: true };
      dateLeft.alignment = { horizontal: 'right', vertical: 'middle' };

      worksheet.mergeCells(currentRow, q3, currentRow, q4);
      const dateRight = worksheet.getCell(currentRow, q3 + 1);
      dateRight.value = `Hậu Nghĩa, ngày       tháng       năm ${year}`;
      dateRight.font = { name: 'Times New Roman', size: 11, bold: true, italic: true };
      dateRight.alignment = { horizontal: 'right', vertical: 'middle' };
      currentRow++;

      // Dòng Tiêu đề chữ ký
      const signatures = [
        { start: 1, end: q1, text: 'Người nhận việc' },
        { start: q1 + 1, end: q2, text: 'Người giao việc' },
        { start: q2 + 1, end: q3, text: 'Người nhận việc' },
        { start: q3 + 1, end: q4, text: 'Người giao việc' }
      ];

      signatures.forEach(sig => {
        worksheet.mergeCells(currentRow, sig.start, currentRow, sig.end);
        const sigCell = worksheet.getCell(currentRow, sig.start);
        sigCell.value = sig.text;
        sigCell.font = { name: 'Times New Roman', size: 11, bold: true };
        sigCell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      // 5.4. KẺ KHUNG CHO TOÀN BỘ KHU VỰC CHỮ KÝ (Kéo dài xuống khoảng 5-6 dòng)
      const sigEndRow = currentRow + 5; 
      for (let r = currentRow - 1; r <= sigEndRow; r++) { // -1 để bao gồm cả dòng Ngày tháng
        for (let c = 1; c <= totalCols; c++) {
          
          // THAY ĐỔI TẠI ĐÂY: Loại bỏ q1 và q3 để xóa bỏ 2 đường vách ngăn bên trong
          const isLeftBorder = (c === 1 || c === q2 + 1);
          const isRightBorder = (c === q2 || c === q4);
          
          worksheet.getCell(r, c).border = {
            left: isLeftBorder ? { style: 'thin', color: { argb: 'FF000000' } } : undefined,
            right: isRightBorder ? { style: 'thin', color: { argb: 'FF000000' } } : undefined,
            bottom: (r === sigEndRow) ? { style: 'thin', color: { argb: 'FF000000' } } : undefined
          };
        }
      }

      // --- 4. XUẤT FILE ---
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const fileName = `Phieu_Giao_Viec_${user?.name?.replace(/\s+/g, '_')}_${month}_${year}.xlsx`;
      saveAs(blob, fileName);

      toast.success('Xuất file Excel thành công!', { id: toastId });
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      toast.error('Đã có lỗi xảy ra khi xuất file Excel.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // THÊM MỚI: Hàm xử lý submit dữ liệu
  // ==========================================
  const handleSubmit = async (statusValue) => {
    const branchName = data.branches.find(b => b.id === selectedBranch)?.name || '';
    const deptName = departments.find(d => d.id === selectedDepartment)?.name || '';
    const posName = positions.find(p => p.id === selectedPosition)?.name || '';
    const managerName = template?.managerName || user?.name || '';

    // 2. Chuẩn bị Payload khớp với DB schema
    const payload = {
      name: `Đánh giá KPI - ${user.name} - ${new Date().toLocaleDateString('vi-VN')}`, 
      employee_id: user.employee_code,
      employee_name: user.name,
      manager_id: null,
      context_info: {
        branch_id: selectedBranch,
        branch_name: branchName,
        dept_id: selectedDepartment,
        department_name: deptName,
        position_id: selectedPosition,
        position_name: posName,
        manager_name: managerName,
      },
      grid_data: gridData,
      status: statusValue 
    };

    try {
      setIsSubmitting(true);
      
      // Tùy chỉnh URL '/api/evaluations' thành endpoint thực tế của BE bạn
      const response = await fetch(API_ENDPOINTS.EVALUATION.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Lỗi server khi lưu đánh giá');
      }

      // Xử lý thông báo thành công
      if (statusValue === 'draft') {
        toast.success('Đã lưu nháp thành công!');
      } else {
        toast.success('Nộp đánh giá thành công!');
        // Tùy chọn: Chuyển hướng người dùng về trang danh sách hoặc làm trống form
        // navigate('/danh-sach-danh-gia'); 
      }

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Đã xảy ra lỗi khi lưu dữ liệu. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="page-container">
      <div className="evaluation-card">
        <div className="selection-grid">
          <h3>Thông tin vị trí công việc</h3>
          <div className="select-group">
            <label htmlFor="branch-select"><FontAwesomeIcon icon={faBuilding} className="icon" /> Chọn Chi Nhánh</label>
            <select id="branch-select" value={selectedBranch} onChange={handleBranchChange} className="custom-select">
              <option value="">-- Vui lòng chọn --</option>
              {data.branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="select-group">
            <label htmlFor="department-select"><FontAwesomeIcon icon={faUsers} className="icon" /> Chọn Phòng Ban</label>
            <select id="department-select" value={selectedDepartment} onChange={handleDepartmentChange} disabled={!selectedBranch} className="custom-select">
              <option value="">-- Vui lòng chọn --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="select-group">
            <label htmlFor="position-select"><FontAwesomeIcon icon={faUserTie} className="icon" /> Chọn Chức Vụ</label>
            <select id="position-select" value={selectedPosition} onChange={handlePositionChange} disabled={!selectedDepartment} className="custom-select">
              <option value="">-- Vui lòng chọn --</option>
              {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
        {/* --- KẾT THÚC KHU VỰC THÔNG TIN --- */}

        <div className="evaluation-table-container">
          <h2>Nội dung đánh giá</h2>
          
          {!isTableVisible && (
            <p style={{ color: '#6b7280', marginBottom: 12 }}>Vui lòng điền đầy đủ thông tin cá nhân và vị trí để hiển thị biểu mẫu.</p>
          )}
          
          {isTableVisible && !template && (
            <p style={{ color: '#6b7280', marginBottom: 12 }}>Chưa có mẫu form cho lựa chọn này. Vui lòng liên hệ Admin.</p>
          )}
          
          {/* RENDER BẢNG EXCEL */}
          {isTableVisible && gridData.length > 0 && (
            <>
              <div className="div_auto_fill" >
                <button 
                  className="btn btn-primary btn_auto_fill" 
                  onClick={handleAutoFillMaxScores} 
                  disabled={isSubmitting}
                >
                  Điền Tự động
                </button>
              </div>
              
              <div className="table-wrapper">
                {/* Tính tổng độ rộng để ép bảng không được phình to hơn */}
                <table 
                  className="excel-table" 
                  style={{ 
                    width: colWidths.length > 0 ? `${colWidths.reduce((a, b) => a + b, 0)}px` : '100%' 
                  }}
                >
                  
                  {/* Render độ rộng cột - Bổ sung maxWidth */}
                  {colWidths.length > 0 && (
                    <colgroup>
                      {colWidths.map((width, index) => (
                        <col 
                          key={index} 
                          style={{ 
                            width: `${width}px`, 
                            minWidth: `${width}px`, 
                            maxWidth: `${width}px` /* Bắt buộc thêm dòng này */
                          }} 
                        />
                      ))}
                    </colgroup>
                  )}

                  <tbody>
                    {gridData.map((row, rIndex) => (
                      <tr key={`row-${rIndex}`}>
                         {/* CHỈ RENDER DỮ LIỆU CÓ ĐỘ DÀI BẰNG - 1 */}
                         {row.slice(0, gridData[0].length - 1).map((cell, cIndex) => {
                          
                          // Bỏ qua không render nếu ô này nằm dưới một ô đã được gộp
                          if (cell.isMergedHidden) return null;

                          return (
                            <td 
                              key={`cell-${rIndex}-${cIndex}`}
                              rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                              colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                              className={cell.isInput ? 'cell-input-wrapper' : 'cell-text'}
                            >
                              {cell.isInput ? (
                                <input
                                    className="custom-input"
                                    value={cell.value ?? ''}
                                    onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                                    placeholder="..."
                                    disabled={cell.allowedRole && cell.allowedRole !== user.role_code}

                                    style={{
                                      cursor: cell.allowedRole && cell.allowedRole !== user.role_code ? 'not-allowed' : 'text',
                                      opacity: cell.allowedRole && cell.allowedRole !== user.role_code ? 0.7 : 1
                                    }}
                                  />
                                ) : (
                                  cell.value ?? ''
                                )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="action-buttons">
                <button 
                  type="button" 
                  className="btn btn-save" 
                  onClick={() => handleSubmit('created')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => handleSubmit('pendingApproval')}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Nộp Đánh Giá'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-outline-success" // Bạn có thể thêm class CSS cho màu xanh lá đặc trưng của Excel
                  onClick={handleExportExcel}
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#107c41', color: '#fff' }} // Tùy chỉnh nhanh style
                >
                  <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: '5px' }} />
                  {isSubmitting ? 'Đang xử lý...' : 'Xuất Excel'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EvaluationForm;