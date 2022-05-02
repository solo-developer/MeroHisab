using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Entities;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ITransactionDetailRepository : IBaseRepository<TransactionDetail>
    {
        Task<decimal> GetOldBalance(long ledger, DateTime last_date);
        Task<decimal> GetEndBalance(long ledger_id);
        Task<decimal> GetLedgerBalanceAmountBetweenDates(long ledger_id, DateTime start_date, DateTime last_date);
        Task<bool> IsBackDateEntryMade(long ledger_id, DateTime new_date);
        Task<List<TransactionDetail>> GetAllTransactionDetailOfLedgerLaterThanDate(long ledger_id, DateTime new_date);
        Task UpdateLedgerBalances(List<TransactionDetail> listOfUpdatedData);
        Task<List<TransactionDetail>> GetTransactionDetailsWithInDate(DateTime date);
    }
}
