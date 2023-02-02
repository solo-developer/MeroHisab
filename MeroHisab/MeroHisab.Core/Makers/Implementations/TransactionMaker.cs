using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Makers.Interface;
using MeroHisab.Core.Repository.Interface;
using System;
using System.Threading.Tasks;

namespace MeroHisab.Core.Makers.Implementations
{
    public class TransactionMaker : ITransactionMaker
    {
        private IAccountSettingsRepository _transactionSequenceRepo;
        public TransactionMaker(IAccountSettingsRepository transactionSequenceRepo)
        {
            _transactionSequenceRepo = transactionSequenceRepo;
        }
        public async Task Copy(TransactionSummary transaction, TransactionDto transaction_dto)
        {
            transaction.EntryDate = DateTime.Now;
            transaction.TransactionDate = transaction_dto.TransactionDate;
            transaction.Remarks = transaction_dto.Remarks;
            transaction.VoucherNo = transaction_dto.VoucherNo;
            transaction.VoucherType = transaction_dto.VoucherType;
        }
    }
}
