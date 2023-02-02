using MeroHisab.Core.BaseRepository.Interface;
using MeroHisab.Core.Entities;
using System.Threading.Tasks;

namespace MeroHisab.Core.Repository.Interface
{
    public interface ILedgerSetupRepository:IBaseRepository<LedgerSetup>
    {
        Task<LedgerSetup> GetByKey(string key);
    }
}
