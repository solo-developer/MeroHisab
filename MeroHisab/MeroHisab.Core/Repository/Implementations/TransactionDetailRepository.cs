using MeroHisab.Core.BaseRepository.Implementations;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using SQLite;
using System.Transactions;

namespace MeroHisab.Core.Repository.Implementations
{
    public class TransactionDetailRepository : BaseRepository<TransactionDetail>, ITransactionDetailRepository
    {
        private SQLiteAsyncConnection db;
        public TransactionDetailRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }

        public async Task<decimal> GetOldBalance(long ledger_id, DateTime last_date)
        {
            var yesterday = last_date.AddDays(0);
            decimal bal = 0;
            var totalPostBefore = await db.Table<TransactionDetail>().Where(a => a.LedgerId == ledger_id && a.TransactionDate <= yesterday).OrderBy(a => a.TransactionDate).ToListAsync();

            if (totalPostBefore.Count != 0)
            {
                bal = totalPostBefore[totalPostBefore.Count - 1].Balance;
            }
            return bal;
        }

        public async Task<decimal> GetLedgerBalanceAmountBetweenDates(long ledger_id, DateTime start_date, DateTime last_date)
        {
            decimal drBal = 0;
            decimal crBal = 0;
            var totalPostBefore = await db.Table<TransactionDetail>().Where(a => a.LedgerId == ledger_id && a.TransactionDate.Date >= start_date.Date && a.TransactionDate.Date <= last_date.Date).OrderBy(a => a.TransactionDate).ToListAsync();
            foreach (var result in totalPostBefore)
            {
                drBal += result.DrAmount;
                crBal += result.CrAmount;
            }
            return (drBal - crBal);
        }

        public async Task<decimal> GetEndBalance(long ledger_id)
        {
            decimal bal = 0;
            var totalPostBefore = await db.Table<TransactionDetail>().Where(a => a.LedgerId == ledger_id).OrderBy(a => a.Id).ToListAsync();
            if (totalPostBefore.Count != 0)
            {
                bal = totalPostBefore[totalPostBefore.Count - 1].Balance;
            }
            return bal;
        }
        public async Task<bool> IsBackDateEntryMade(long ledger_id, DateTime new_date)
        {
            int count = await db.Table<TransactionDetail>().Where(a => a.TransactionDate > new_date && a.LedgerId == ledger_id).CountAsync();
            return count > 0 ? true : false;
        }
        public async Task<List<TransactionDetail>> GetTransactionDetailsWithInDate(DateTime date)
        {
            return await db.Table<TransactionDetail>().Where(a => a.TransactionDate.Date == date.Date).ToListAsync();
        }
        public async Task<List<TransactionDetail>> GetAllTransactionDetailOfLedgerLaterThanDate(long ledger_id, DateTime new_date)
        {
            var data = await db.Table<TransactionDetail>().Where(a => a.TransactionDate > new_date && a.LedgerId == ledger_id).OrderBy(a => a.Id).ToListAsync();
            return data;
        }

        public async Task UpdateLedgerBalances(List<TransactionDetail> transaction_details)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.Required))
            {
                foreach (var result in transaction_details)
                {
                   await this.Update(result);
                }
                tx.Complete();
            }
        }


    }
}
