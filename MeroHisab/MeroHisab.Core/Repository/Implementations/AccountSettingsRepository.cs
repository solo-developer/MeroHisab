using MeroHisab.Core.BaseRepository.Implementations;
using MeroHisab.Core.Entities;
using MeroHisab.Core.Repository.Interface;
using SQLite;

namespace MeroHisab.Core.Repository.Implementations
{
    public class AccountSettingsRepository : BaseRepository<AccountSettings>, IAccountSettingsRepository
    {
        private SQLiteAsyncConnection db;
        public AccountSettingsRepository(ISqlite sqlite) : base(sqlite)
        {
            db = sqlite.GetConnection();
        }

        public async Task<AccountSettings> getByKey(string key)
        {
            return await db.Table<AccountSettings>().Where(a => a.Key == key).FirstOrDefaultAsync();
        }

        public async Task<long> getTransactionSequence()
        {
            AccountSettings tranactionSequence = new AccountSettings();
            var transactionSequence = await db.Table<AccountSettings>().Where(a => a.Key == "TRANSACTION_SEQUENCE").FirstOrDefaultAsync();
            if (transactionSequence == null)
            {
                transactionSequence.Key = "TRANSACTION_SEQUENCE";
                transactionSequence.Value = 1;
                await this.Insert(transactionSequence);
            }
            else
            {
                transactionSequence.Value += 1;
                await this.Update(transactionSequence);
            }
            return transactionSequence.Value;
        }
    }
}
