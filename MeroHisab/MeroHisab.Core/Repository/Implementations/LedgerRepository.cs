using MeroHisab.Core.BaseRepository.Implementations;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Enums;
using MeroHisab.Core.Repository.Interface;
using SQLite;

namespace MeroHisab.Core.Repository.Implementations
{
    public class LedgerRepository : BaseRepository<Ledger>, ILedgerRepository
    {
        private SQLiteAsyncConnection db;
        public LedgerRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }

        public async Task<Ledger> GetByName(string name)
        {
            return await db.Table<Ledger>().Where(a => a.Name == name).FirstOrDefaultAsync();
        }

        //public async Task<List<Ledger>> getLedgersByLedgerGroup(long ledger_group_id)
        //{
        //    return db.Table<Ledger>().Where(a => a.ledger_group_id == ledger_group_id).ToList();
        //}


        public async Task<List<Ledger>> GetLedgersUnderAssetsGroup()
        {
            var assetsGroup =await db.Table<Ledger>().Where(a => a.Type == LedgerGroupType.Asset).ToListAsync();
            return assetsGroup;
        }

        public async Task<List<Ledger>> GetLedgersUnderIncomeGroup()
        {
            var incomeLedgers =await db.Table<Ledger>().Where(a => a.Type == LedgerGroupType.Income).ToListAsync();
            return incomeLedgers;
        }

        public async Task<List<Ledger>> GetLedgersUnderExpensesGroup()
        {
            var expenseLedgers =await db.Table<Ledger>().Where(a => a.Type == LedgerGroupType.Expense).ToListAsync();
            return expenseLedgers;
        }
        public async Task<List<Ledger>> GetLedgersUnderLiabilitiesGroup()
        {
            var liabilityLedgers = await db.Table<Ledger>().Where(a => a.Type == LedgerGroupType.Liability).ToListAsync();
            return liabilityLedgers;
        }

        public AsyncTableQuery<Ledger> GetQueryable()
        {
            return db.Table<Ledger>();
        }
    }
}
