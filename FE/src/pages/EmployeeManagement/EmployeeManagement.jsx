import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './EmployeeManagement.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { API_ENDPOINTS } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);
const ITEMS_PER_PAGE = 8;

// --- COMPONENT MỚI: MODAL SỬA NGƯỜI DÙNG ---
const EditUserModal = ({ isOpen, onClose, onSave, user }) => {
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('employee');
    const [dept, setDept] = useState('');
    const [branch_code, setBranchCode] = useState('');

    useEffect(() => {
        if (user) {
            setFullname(user.fullname);
            setRole(user.role);
            setDept(user.dept);
            setBranchCode(user.branch_code);
        }
    }, [user]);

    if (!isOpen) {
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.employee_code, { fullname, role, dept, branch_code });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Chỉnh sửa Người dùng</h2>
                    <button onClick={onClose} className={styles.closeButton}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Mã Nhân viên</label>
                            <input type="text" value={user.employee_code} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên đăng nhập</label>
                            <input type="text" value={user.username} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-fullname">Họ và Tên</label>
                            <input id="edit-fullname" type="text" value={fullname} onChange={e => setFullname(e.target.value)} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-branch">Chi nhánh</label>
                            <select id="edit-branch" value={branch_code} onChange={e => setBranchCode(e.target.value)}>
                                <option value="6421">Hội sở</option>
                                <option value="6221">Chi nhánh Nam Hoa</option>
                                <option value="1605">Chi nhánh 6</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-dept">Phòng ban</label>
                            <select id="edit-dept" className={branch_code === ''? styles.disabled_div : ""} value={dept}  onChange={e => setDept(e.target.value)}>
                                <option value="">Chọn phòng ban</option>
                                <option value="BGĐ">Ban Giám đốc</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="TH">Tổng hợp</option>
                                <option value="KT&NQ">Kế toán ngân quỹ</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KSNB">Kiểm tra giám sát nội bộ</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KHCN">Khách hàng cá nhân</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KHDN">Khách hàng doanh nghiệp</option>
                                <option className={branch_code !== '6421'&&branch_code !== '' ? "" : styles.display_option} value="KH">Khách hàng</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="PGD">PGD Bình Tây</option>
                                <option className={branch_code === '6421'? "" : styles.display_option} value="KH&QLRR">Kế hoạch & quản lý rủi ro</option>
                                <option value="VT">Văn thư</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="edit-role">Chức vụ</label>
                            <select id="edit-role" value={role} onChange={e => setRole(e.target.value)}>
                                <option value="employee">Nhân viên</option>
                                <option value="deputy_manager">Phó phòng</option>
                                <option value="manager">Trưởng phòng</option>
                                <option value="deputy_director">Phó giám đốc</option>
                                <option value="director">Giám đốc</option>
                                <option value="administrator">Administrator</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button type="button" className={styles.cancelButton} onClick={onClose}>Hủy</button>
                        <button type="submit" className={styles.saveButton}>Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Component SortableHeader
const SortableHeader = ({ field, currentSortField, sortDirection, onSort, children }) => {
    const getSortIcon = () => {
        if (currentSortField !== field) {
            // Icon mặc định khi chưa sort - Both arrows (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 6L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 14L12 18L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
        
        if (sortDirection === 'asc') {
            // Icon sort tăng dần - Up arrow (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 14L12 10L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        } else {
            // Icon sort giảm dần - Down arrow (outlined)
            return (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 10L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        }
    };

    return (
        <th 
            className={`${styles.sortableHeader} ${currentSortField === field ? styles.sorted : ''}`}
            onClick={() => onSort(field)}
        >
            <div className={styles.headerContent}>
                <span>{children}</span>
                <span className={styles.sortIcon}>{getSortIcon()}</span>
            </div>
        </th>
    );
};

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortField, setSortField] = useState('');
    const [sortDirection, setSortDirection] = useState('asc');
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });
    const navigate = useNavigate();

       // --- THÊM MỚI: State cho modal sửa ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Giả lập việc fetch dữ liệu từ API
    useEffect(() => {
        const fetchCases = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                // Nếu không có token, người dùng chưa đăng nhập, chuyển về trang login
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(API_ENDPOINTS.USERS.LIST, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu người dùng.');
                }

                const data = await response.json();
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [navigate]);

    // Hàm xử lý sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Hàm sort dữ liệu
    const sortUsers = (users) => {
        if (!sortField) return users;
        
        return [...users].sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            
            // Xử lý các trường hợp đặc biệt
            if (sortField === 'dept') {
                const deptMap = {
                    'BGĐ': 'Ban Giám đốc',
                    'TH': 'Tổng hợp',
                    'KT&NQ': 'Kế toán ngân quỹ',
                    'KSNB': 'Kiểm tra giám sát nội bộ',
                    'KHCN': 'Khách hàng cá nhân',
                    'KHDN': 'Khách hàng doanh nghiệp',
                    'KH': 'Khách hàng',
                    'KH&QLRR': 'Kế hoạch & quản lý rủi ro',
                    'PGD': 'Phòng Giao dịch Bình Tây',
                    'VT': 'Văn thư'
                };
                aVal = deptMap[aVal] || 'Chưa xác định';
                bVal = deptMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'role') {
                const roleMap = {
                    'employee': 'Nhân viên',
                    'manager': 'Trưởng phòng',
                    'deputy_manager': 'Phó phòng',
                    'director': 'Giám đốc',
                    'deputy_director': 'Phó giám đốc',
                    'administrator': 'Administrator'
                };
                aVal = roleMap[aVal] || 'Chưa xác định';
                bVal = roleMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'branch_code') {
                const branchMap = {
                    '6421': 'Hội sở',
                    '6221': 'Chi nhánh Nam Hoa',
                    '1605': 'Chi nhánh 6'
                };
                aVal = branchMap[aVal] || 'Chưa xác định';
                bVal = branchMap[bVal] || 'Chưa xác định';
            }
            
            if (sortField === 'status') {
                aVal = aVal === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
                bVal = bVal === 'active' ? 'Hoạt động' : 'Vô hiệu hóa';
            }
            
            // Chuyển về string để so sánh
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
            
            if (sortDirection === 'asc') {
                return aVal.localeCompare(bVal);
            } else {
                return bVal.localeCompare(aVal);
            }
        });
    };

    const filteredUsers = useMemo(() => {
        setCurrentPage(1);
        let filtered = users;
        
        if (searchTerm) {
            filtered = users.filter(user =>
                user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return sortUsers(filtered);
    }, [users, searchTerm, sortField, sortDirection]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

    // --- THÊM MỚI: Logic mở modal sửa ---
    const openEditModal = (user) => {
        setCurrentUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditUser = async (userId, updatedData) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(API_ENDPOINTS.USERS.UPDATE(userId), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Cập nhật user trong state
                setUsers(users.map(u => 
                    u.employee_code === userId ? { ...u, ...result.user } : u
                ));
                setIsEditModalOpen(false);
                toast.success('Cập nhật người dùng thành công!');
            } else {
                toast.error(result.message || 'Cập nhật thất bại!');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Đã có lỗi xảy ra khi cập nhật!');
        }
    };

    if (isLoading) {
        return <div className={styles.message}>Đang tải danh sách người dùng...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <>
            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditUser}
                user={currentUser}
            />

            <div className={styles.pageHeader}>
                <div>
                    <h1>Quản lý Nhân sự</h1>
                </div>
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Mã NV, Tên, Tên đăng nhập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className={styles.tableWrapper}>  
                <div className={styles.tableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <SortableHeader 
                                    field="employee_code" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Mã Nhân viên
                                </SortableHeader>
                                <SortableHeader 
                                    field="fullname" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Họ và Tên
                                </SortableHeader>
                                <SortableHeader 
                                    field="username" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Tên đăng nhập
                                </SortableHeader>
                                <SortableHeader 
                                    field="dept" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Phòng ban
                                </SortableHeader>
                                <SortableHeader 
                                    field="role" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Chức vụ
                                </SortableHeader>
                                <SortableHeader 
                                    field="branch_code" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Chi nhánh
                                </SortableHeader>
                                <SortableHeader 
                                    field="status" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Trạng thái
                                </SortableHeader>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user.employee_code}>
                                    <td>{user.employee_code}</td>
                                    <td>{user.fullname}</td>
                                    <td>{user.username}</td>
                                    <td>{
                                        user.dept === 'KHCN' ? "Khách hàng cá nhân"
                                            : user.dept === "KHDN" ? "Khách hàng doanh nghiệp"
                                                : user.dept === "KH" ? "Khách hàng"
                                                    : user.dept === "PGD" ? "PGD Bình Tây"
                                                        : user.dept === "KH&QLRR" ? "Kế hoạch & quản lý rủi ro"
                                                            : user.dept === "BGĐ" ? "Ban Giám đốc"
                                                                : user.dept === "TH" ? "Tổng hợp"
                                                                    : user.dept === "KT&NQ" ? "Kế toán ngân quỹ"
                                                                        : user.dept === "KSNB" ? "Kiểm tra giám sát nội bộ"
                                                                            :user.dept === "VT" ? "Văn thư"
                                                                                : "Chưa xác định"

                                    }</td>
                                    <td>{
                                        user.role === 'employee' ? "Nhân viên"
                                            : user.role === "manager" ? "Trưởng phòng"
                                                : user.role === "deputy_manager" ? "Phó phòng"
                                                    : user.role === "director" ? "Giám đốc"
                                                        : user.role === "deputy_director" ? "Phó giám đốc"
                                                            : user.role === "administrator" ? "Administrator" : "Chưa xác định"
                                    }</td>
                                    <td>{
                                        user.branch_code === '6421' ? "Hội sở"
                                            : user.branch_code === "6221" ? "Chi nhánh Nam Hoa"
                                                : user.branch_code === "1605" ? "Chi nhánh 6"
                                                    : "Chưa xác định"
                                    }</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[user.status]}`}>
                                            {user.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionCell}>
                                            <button className={styles.actionButton} onClick={() => openEditModal(user)} aria-label="Sửa">
                                            <SvgIcon path="m21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.93.93 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4z" />
                                            </button>
                                            <button className={`${styles.actionButton} ${styles.changepassword}`} onClick={() => openEditModal(user)} aria-label="Xem chi tiết">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                                    <path d="M0 0h24v24H0z" fill="none" />
                                                    <g fill="#3b82f6">
                                                        <path d="M12 15a3 3 0 1 0 0-6a3 3 0 0 0 0 6" />
                                                        <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69c.12.362.12.752 0 1.113c-1.487 4.471-5.705 7.697-10.677 7.697c-4.97 0-9.186-3.223-10.675-7.69a1.76 1.76 0 0 1 0-1.113M17.25 12a5.25 5.25 0 1 1-10.5 0a5.25 5.25 0 0 1 10.5 0" clip-rule="evenodd" />
                                                    </g>
                                                </svg>
                                            </button>
                                        </div>
                                        
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                    
                <div className={styles.paginationContainer}>
                    <div className={styles.rowsPerPageSelector}>
                        <span>Hiển thị:</span>
                        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                            <option value={5}>5 dòng</option>
                            <option value={10}>10 dòng</option>
                            <option value={15}>15 dòng</option>
                        </select>
                    </div>
                    <div className={styles.pageInfo}>
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} trên tổng số {filteredUsers.length} người dùng
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />
        </>
    );
}export default UserManagement;