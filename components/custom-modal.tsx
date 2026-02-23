"use client";

import React from 'react';
import ReactDOM from 'react-dom';
import { Loader, Trash } from "lucide-react";
import { IoClose } from 'react-icons/io5';


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    children?: React.ReactNode;
    isDeletePending?: boolean;
}

const CustomModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, children, isDeletePending }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        // Modal overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center font-inter">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 z-[10]"
                onClick={onClose}
            ></div>
            {/* Modal content */}
            <div className="relative z-20 bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                {children ? (
                    children
                ) : (
                    <>
                        <IoClose onClick={onClose} className='absolute top-4 right-4 text-stone-700 size-5 cursor-pointer' />
                        <h2 className="text-lg font-bold text-stone-700 mb-2">Confirm Deletion</h2>
                        <p className="mb-6 text-sm text-stone-500">
                            Are you sure you want to delete this item? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-sm md:text-base"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm md:text-base"
                                onClick={onConfirm}
                            >
                                {isDeletePending && (
                                    <Loader
                                        className="mr-2 size-4 animate-spin"
                                        aria-hidden="true"
                                    />
                                )}
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>,
        document.getElementById('modal-root')!
    );
};

export default CustomModal;
