import React from "react";
import { GrPrevious, GrNext } from "react-icons/gr";

export const Pagination = ({ componentsNumber, componentsPerPage, currentPage, setCurrentPage }) => {
    let pages = [];
    for (let i = 1; i <= Math.ceil(componentsNumber / componentsPerPage); i++) {
        pages.push(
            <li key={i} className="page-item">
                <button key={i} onClick={() => setCurrentPage(i)} className="page-link">
                    {i}
                </button>
            </li>
        );
    }

    return (
        <div className="pagination">
            <div className="prev-page">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="page-link"
                    >
                        <GrPrevious />
                    </button>
                </li>
            </div>
            <ul className="pagination">
                {pages}
            </ul>
            <div className="next-page">
                <li className={`page-item ${currentPage === pages.length ? 'disabled' : ''}`}>
                    <button onClick={() => setCurrentPage(currentPage + 1)} className="page-link">
                        <GrNext />
                    </button>
                </li>
            </div>
        </div>
    );
};
