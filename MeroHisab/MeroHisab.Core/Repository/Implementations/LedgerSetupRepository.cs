using MeroHisab.Core.BaseRepository.Implementations;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using SQLite;

namespace MeroHisab.Core.Repository.Implementations
{
    public class LedgerSetupRepository : BaseRepository<LedgerSetup>, ILedgerSetupRepository
    {
        private SQLiteAsyncConnection db;
        public LedgerSetupRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }

        public async Task<LedgerSetup> GetByKey(string key)
        {
            return await db.Table<LedgerSetup>().Where(a => a.Key == key).FirstOrDefaultAsync();
        }
    }
}
