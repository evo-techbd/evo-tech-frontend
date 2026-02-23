"use client";

import { format } from "date-fns";
import { currencyFormatBDT } from "@/lib/all_utils";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/evo_dialog";
import { FinanceTransactionType } from "@/app/(admins)/control/finance/finance-columns";
import { CalendarDays, User, FileText, DollarSign, Tag } from "lucide-react";

interface TransactionDetailsModalProps {
  transaction: FinanceTransactionType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal = ({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const getTypeVariant = (type: string) => {
    if (type === "investment") return "success";
    if (type === "withdraw") return "failed";
    if (type === "expense") return "warning";
    return "default";
  };

  const getTypeColor = (type: string) => {
    if (type === "investment") return "text-green-600";
    if (type === "withdraw") return "text-red-600";
    if (type === "expense") return "text-amber-600";
    return "text-stone-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-stone-900">
            Transaction Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Transaction Type */}
          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <Tag className="h-5 w-5 text-stone-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Transaction Type
              </p>
              <Badge 
                variant={getTypeVariant(transaction.type) as any} 
                className="capitalize text-sm"
              >
                {transaction.type}
              </Badge>
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <DollarSign className="h-5 w-5 text-stone-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Amount
              </p>
              <p className={`text-2xl font-bold ${getTypeColor(transaction.type)}`}>
                {currencyFormatBDT(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <FileText className="h-5 w-5 text-stone-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-stone-700 leading-relaxed">
                {transaction.description || "No description provided"}
              </p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <CalendarDays className="h-5 w-5 text-stone-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Transaction Date
              </p>
              <p className="text-sm font-medium text-stone-900">
                {format(new Date(transaction.date), "EEEE, dd MMMM yyyy")}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {format(new Date(transaction.date), "hh:mm a")}
              </p>
            </div>
          </div>

          {/* Created By */}
          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <User className="h-5 w-5 text-stone-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Created By
              </p>
              <p className="text-sm font-medium text-stone-900">
                {transaction.createdBy 
                  ? `${transaction.createdBy.firstName} ${transaction.createdBy.lastName}`
                  : "Unknown"}
              </p>
              {transaction.createdBy?.email && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {transaction.createdBy.email}
                </p>
              )}
            </div>
          </div>

          {/* Transaction ID */}
          <div className="flex items-start gap-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
            <div className="flex-1">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                Transaction ID
              </p>
              <p className="text-xs font-mono text-stone-600 break-all">
                {transaction._id}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
