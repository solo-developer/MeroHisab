using MeroHisab.Core.Dto;
using MeroHisab.Core.Entities;

namespace LE.Account.Service.Services.Interface
{
    public interface ITransactionDetailService
    {
        Task AddTransactionDetail(TransactionDetail transaction_detail);
        Task AddTransactionDetail(TransactionDto transaction_dto, int transaction_id);
        Task<decimal> GetOldBalance(long ledger_id, DateTime last_date);
        Task<decimal> GetEndBalance(long ledger_id);
    }
}
