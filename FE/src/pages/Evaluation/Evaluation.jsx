import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";
import toast from 'react-hot-toast';
import styles from './Evaluation.module.css';
import Pagination from '../../components/Pagination/Pagination';
import { API_ENDPOINTS } from '../../config/api';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';

const SvgIcon = ({ path }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
    </svg>
);
const ITEMS_PER_PAGE = 8;


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

function Evaluation() {
    const [evaluations, setEvaluations] = useState([]);
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

    const getEvaluationListUrl = useCallback(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            return API_ENDPOINTS.EVALUATION.LIST;
        }

        const decodedUser = jwtDecode(token);
        const params = new URLSearchParams();

        if (decodedUser.role) params.set('role', decodedUser.role);
        if (decodedUser.dept) params.set('department', decodedUser.dept);
        if (decodedUser.branch_code) params.set('branch', decodedUser.branch_code);
        const queryString = params.toString();
        return queryString ? `${API_ENDPOINTS.EVALUATION.LIST}?${queryString}` : API_ENDPOINTS.EVALUATION.LIST;
    }, []);

    useEffect(() => {
        const fetchCases = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(getEvaluationListUrl(), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Không thể tải dữ liệu đánh giá.');
                }

                const data = await response.json();
                setEvaluations(data.evaluations);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCases();
    }, [getEvaluationListUrl, navigate]);

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
    const sortUsers = useCallback((users) => {
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
    }, [sortField, sortDirection]);

    const filteredEvaluations = useMemo(() => {
        setCurrentPage(1);
        let filtered = evaluations;
        
        if (searchTerm) {
            filtered = evaluations.filter(evaluation =>
                evaluation.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return sortUsers(filtered);
    }, [evaluations, searchTerm, sortUsers]);

    const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvaluations = filteredEvaluations.slice(indexOfFirstItem, indexOfLastItem);

    const handleDeleteEvaluation = async (evaluationId) => {
        const evaluationToDelete = evaluations.find(evaluation => evaluation.employee_id === evaluationId);
        
        setConfirmModal({
            isOpen: true,
            title: 'Xóa Đánh giá',
            message: `Bạn có chắc chắn muốn xóa đánh giá "${evaluationToDelete?.fullname || evaluationId}"? Hành động này không thể hoàn tác.`,
            type: 'danger',
            onConfirm: async () => {
                // gọi API để xóa người dùng
                fetch(API_ENDPOINTS.EVALUATION.DELETE(evaluationId), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Không thể xóa đánh giá.');
                        }
                        return response.json();
                    })
                    .then(async () => {
                        // gọi lại api để cập nhật danh sách đánh giá
                        const updatedResponse = await fetch(getEvaluationListUrl(), {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            }
                        });
                        const updatedData = await updatedResponse.json();
                        setEvaluations(updatedData.evaluations);
                        toast.success('Xóa đánh giá thành công!');
                    })
                    .catch(error => {
                        // console.error('Lỗi khi xóa đánh giá:', error);
                        toast.error(`Đã xảy ra lỗi: ${error.message}`);
                    })
            }
        });
    };

    if (isLoading) {
        return <div className={styles.message}>Đang tải danh sách phiếu giao việc...</div>;
    }

    if (error) {
        return <div className={`${styles.message} ${styles.error}`}>Lỗi: {error}</div>;
    }

    return (
        <>
            <div className={styles.pageHeader}>
                <div>
                    <h1>Quản lý Phiếu giao việc</h1>
                </div>
                <button className={styles.addButton} onClick={() => {try { navigate(`/formManagement`); } catch { /* ignore */ }}}>
                    + Thêm Phiếu giao việc
                </button>
            </div>

            <div className={styles.filterBar}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Tìm theo Tên phiếu..."
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
                                    field="name" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Tên phiếu giao việc
                                </SortableHeader>
                                <SortableHeader 
                                    field="employee_name" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Tên nhân viên
                                </SortableHeader>
                                <SortableHeader 
                                    field="status" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Trạng thái
                                </SortableHeader>
                                <SortableHeader 
                                    field="createdAt" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Ngày tạo
                                </SortableHeader>
                                <SortableHeader 
                                    field="updatedAt" 
                                    currentSortField={sortField} 
                                    sortDirection={sortDirection} 
                                    onSort={handleSort}
                                >
                                    Ngày cập nhật
                                </SortableHeader>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEvaluations.map(evaluation => (
                                <tr key={evaluation.id}>
                                    <td>{evaluation.name}</td>
                                    <td>{evaluation.employee_name}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[evaluation.status]}`}>
                                            {evaluation.status === 'created' ? 'Tạo mới' 
                                              : evaluation.status === 'pendingApproval' ? 'Chờ duyệt'
                                              : evaluation.status === 'finished' ? 'Hoàn thành'
                                              : evaluation.status === 'rejected' ? 'Bị từ chối'
                                              : 'Không xác định'}
                                        </span>
                                    </td>
                                    <td>{evaluation.createdAt}</td>
                                    <td>{evaluation.updatedAt}</td>
                                    <td>
                                        <div className={styles.actionCell}>
                                            <button
                                                className={styles.actionButton}
                                                aria-label="Sửa"
                                                onClick={() => {
                                                    try {
                                                        navigate(`/evaluations/edit/${evaluation.id}`);
                                                    } catch {
                                                        /* ignore */
                                                    }
                                                }}
                                            >
                                                <SvgIcon path="m21.289.98l.59.59c.813.814.69 2.257-.277 3.223L9.435 16.96l-3.942 1.442c-.495.182-.977-.054-1.075-.525a.93.93 0 0 1 .045-.51l1.47-3.976L18.066 1.257c.967-.966 2.41-1.09 3.223-.276zM8.904 2.19a1 1 0 1 1 0 2h-4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a1 1 0 0 1 2 0v4a4 4 0 0 1-4 4h-12a4 4 0 0 1-4-4v-12a4 4 0 0 1 4-4z" />
                                            </button>
                                            <button className={`${styles.actionButton} ${styles.delete}`} onClick={() => handleDeleteEvaluation(evaluation.id)} aria-label="Xóa">
                                                <SvgIcon path="m18.412 6.5l-.801 13.617A2 2 0 0 1 15.614 22H8.386a2 2 0 0 1-1.997-1.883L5.59 6.5H3.5v-1A.5.5 0 0 1 4 5h16a.5.5 0 0 1 .5.5v1zM10 2.5h4a.5.5 0 0 1 .5.5v1h-5V3a.5.5 0 0 1 .5-.5M9 9l.5 9H11l-.4-9zm4.5 0l-.5 9h1.5l.5-9z" />
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
                        Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredEvaluations.length)} trên tổng số {filteredEvaluations.length} đánh giá
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
}export default Evaluation;